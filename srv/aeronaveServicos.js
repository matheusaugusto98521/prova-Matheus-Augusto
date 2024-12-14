const cds = require("@sap/cds");
const { message } = require("@sap/cds/lib/log/cds-error");
const { Aeronave, Companhia } = cds.entities('sap.cap.infinitfyVoos');

module.exports = (srv) => {
    srv.on("READ", 'GetAeronaves', async (req) => {
        try {
            let filtro = req.data;
            let aeronavesEncontradas = await buscarAeronaves(filtro);
            if (!aeronavesEncontradas) {
                return { aeronaves: [] };
            }

            console.log("Aeronaves: ", aeronavesEncontradas);
            return aeronavesEncontradas;
        } catch (error) {
            console.error("Erro ao buscar aeronaves: ", error);
            return { message: "Erro ao buscar aeronaves", status: 500 };
        }
    });

    srv.on('CadastrarAeronave', async (req, res) => {
        try {
            const data = req.data?.aeronave;
            if (!validarDadosObrigatorios(data)) {
                req.error(400, "Dados obrigatórios não fornecidos ou estão em branco");
                return;
            }

            const valoresUnicos = { marca: data.marca, modelo: data.ds_modelo, nr_serie: data.nr_serie };
            console.log("DADOS: ", valoresUnicos);
            let aeronaveEncontrada = await buscarAeronavesPorValoresUnicos(valoresUnicos);
            console.log("Found: ", aeronaveEncontrada);

            if (aeronaveEncontrada.length > 0) {
                console.log("Aeronave ja existente");
                req.error(400, "Aeronave já existente");
                return;
            }

            let aeronaveInserida = await inserirAeronave(req, data);

            console.log("Aeronave inserida com sucesso: ", aeronaveInserida);
            return { message: "Aeronave inserida com sucesso", data: aeronaveInserida };
        } catch (error) {
            console.log("Erro ao inserir aeronave");
            req.error(500, "Erro ao inserir aeronave: " + error.message);
        }
    })
};

const buscarAeronaves = async (filtro) => {
    return await SELECT.from(Aeronave).where(filtro);
};

const buscarAeronavesPorValoresUnicos = (data) => {
    return SELECT.from(Aeronave).where({
        marca: data.marca,
        ds_modelo: data.modelo,
        nr_serie: data.nr_serie
    });
};

const validarDadosObrigatorios = (data) => {
    return data?.marca?.trim() && data?.ds_modelo?.trim() && data?.nr_serie?.trim();
};

const inserirAeronave = async (req, data) => {
    const tx = cds.transaction(req);
    try {
        const assentos_max = parseInt(data.nr_assentos_executivo, 10) + parseInt(data.nr_assentos_economico, 10);
        const dadosNovaAeronave = { ...data, nr_assentos_max: assentos_max };
        await tx.run(INSERT.into(Aeronave).entries(dadosNovaAeronave));
        await tx.commit();
        return dadosNovaAeronave;
    } catch (error) {
        console.log("Erro ao inserir aeronave");
        await tx.rollback();
        throw new Error(error.message);
    }
};

