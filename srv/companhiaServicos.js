const cds = require('@sap/cds');
const { Companhia } = cds.entities('sap.cap.infinitfyVoos');

module.exports = (srv) => {
    srv.on("READ", 'GetCompanhias', async (req) => {
        try {
            let filtro = req.data;
            let companhiasEncontradas = await buscarCompanhias(filtro);
            if (companhiasEncontradas.length === 0) {
                return { companhias: [] };
            }

            console.log("Companhias cadastradas: ", companhiasEncontradas);
            return companhiasEncontradas;
        } catch (error) {
            console.error("Erro ao buscar companhias: ", error);
            return { message: "Erro ao buscar companhias", status: 500 };

        }
    });

    srv.on('CadastrarCompanhia', async (req, res) => {
        try {
            let data = req.data?.companhia;

            if (!verificarDadosObrigatorios(data)) {
                console.log("Dados obrigatórios não fornecidos ou estão em branco");
                req.error(400, "Dados obrigatórios não fornecidos ou estão em branco");
                return;
            }

            const valoresUnicos = {
                icao: data.icao,
                razao_social: data.razao_social,
                cnpj: data.cnpj,
                telefone: data.telefone,
                email: data.email,
            }
            let companhiaExistente = await buscarCompanhiaPorValoresUnicos(valoresUnicos);
            console.log(companhiaExistente);
            if (companhiaExistente) {
                console.log("Companhia já existente!!!");
                req.error(400, "Companhia já existente");
                return;
            }

            let companhiaInserida = await inserirCompanhia(req, data);

            console.log("Companhia inserida com sucesso: ", companhiaInserida);
            return { message: "Companhia inserida com sucesso", data: companhiaInserida };
        } catch (error) {
            console.error("Erro ao cadastrar companhia: ", error);
            req.error(500, "Erro ao cadastrar companhia: " + error.message);
        }
    });
};

const buscarCompanhias = async (filtro) => {
    return await SELECT.from(Companhia).where(filtro);
};

const buscarCompanhiaPorValoresUnicos = async (data) => {
    return await SELECT.one.from(Companhia)
        .where({
            icao: data.icao,
            razao_social: data.razao_social,
            cnpj: data.cnpj,
            telefone: data.telefone,
            email: data.email
        })
};

const verificarDadosObrigatorios = (data) => {
    return data?.icao?.trim() && data?.razao_social?.trim() && data?.cnpj?.trim() && data?.telefone?.trim() && data?.email?.trim();
}

const inserirCompanhia = async (req, data) => {
    const tx = cds.transaction(req);
    try {
        const dadosCompanhia = { ...data };
        await tx.run(INSERT.into(Companhia).entries(dadosCompanhia));
        await tx.commit();
        return dadosCompanhia;
    } catch (error) {
        console.error("Erro ao cadastrar companhia: ", error);
        await tx.rollback();
        throw error;
    }
}
