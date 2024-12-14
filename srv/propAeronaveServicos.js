const cds = require('@sap/cds');
const { PropriedadeAeronave, Companhia, Aeronave } = cds.entities('sap.cap.infinitfyVoos');

module.exports = (srv) => {
    srv.on("READ", 'GetPropriedadeAeronave', async (req) => {
        try {
            let filtro = req.data;
            let propsEncontradas = await buscarPropriedadesAeronaves(filtro);
            if (!propsEncontradas) {
                return { propriedades: [] };
            }

            console.log("Propriedades: ", propsEncontradas);
            return propsEncontradas;
        } catch (error) {
            console.error("Erro ao buscar propriedades: ", error);
            return { message: "Erro ao buscar propriedades", status: 500 };
        }
    });

    srv.on('CadastrarPropriedade', async (req, res) => {
        try {
            const data = req.data?.propAeronave;
            let idCompanhia = data.id_companhia;
            let idAeronave = data.id_aeronave;

            let companhiaEncontrada = await buscarCompanhia(idCompanhia);
            if (!companhiaEncontrada) {
                console.log("Companhia não encontrada para o ID: " + idCompanhia);
                req.error(404, "Companhia não encontrada para o ID: " + idCompanhia);
                return;
            }

            let aeronaveEncontrada = await buscarAeronave(idAeronave);
            if (!aeronaveEncontrada) {
                console.log("Aeronave não encontrada para o ID: " + idAeronave);
                req.error(404, "Aeronave não encontrada para o ID: " + id);
                return;
            }

            let propExistente = await buscarPropJaCadastrada(idAeronave, idCompanhia);
            if (propExistente) {
                console.log("Propriedade já cadastrada para a aeronave e companhia");
                req.error(400, "Propriedade já cadastrada para a aeronave e companhia");
                return;
            }


            let propAeronaveInserida = await inserirPropriedadeAeronave(req, data, companhiaEncontrada);

            console.log("Propriedade aeronave inserida com sucesso: ", propAeronaveInserida);
            return { message: "Propriedade aeronave inserida com sucesso", data: propAeronaveInserida };
        } catch (error) {
            console.log("Erro ao cadastrar propriedade aeronave");
            req.error(500, "Erro ao cadastrar propriedade aeronave: " + error.message);
        }
    });
};

const buscarPropriedadesAeronaves = async (filtro) => {
    return await SELECT.from(PropriedadeAeronave).where(filtro);
};

const buscarAeronave = async (idAeronave) => {
    return await SELECT.one.from(Aeronave).where({ id_aeronave: idAeronave });
};

const buscarCompanhia = async (idCompanhia) => {
    return await SELECT.one.from(Companhia).where({ id_companhia: idCompanhia });
};

const buscarPropJaCadastrada = async (idAeronave, idCompanhia) => {
    return !!(await SELECT.one.from(PropriedadeAeronave)
        .where({ id_companhia: idCompanhia, id_aeronave: idAeronave }));
};

const inserirPropriedadeAeronave = async (req, data, companhia) => {
    const tx = cds.transaction(req);
    try {
        const dadosPropAeronave = {
            ...data, proprietário: companhia.razao_social,
            sg_uf: companhia.uf, cpf_cnpj: companhia.cnpj
        };
        await tx.run(INSERT.into(PropriedadeAeronave).entries(dadosPropAeronave));
        await tx.commit();
        return dadosPropAeronave;
    } catch (error) {
        console.log("Erro ao cadastrar propriedade aeronave");
        throw error;
    }
};