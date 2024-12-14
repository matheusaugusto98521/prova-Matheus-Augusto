const cds = require('@sap/cds');
const { message } = require('@sap/cds/lib/log/cds-error');
const { Aeroporto } = cds.entities('sap.cap.infinitfyVoos');

module.exports = (srv) => {
    srv.on("READ", 'GetAeroportos', async (req) => {
        try {
            let filtro = req.data;
            let aeroportosEncontrados = await buscarAeroportos(filtro);
            if (!aeroportosEncontrados || aeroportosEncontrados.length === 0) {
                return { aeroportos: [] };
            }

            console.log("Aeroportos: ", aeroportosEncontrados);
            return { message: "Aeroportos encontrados", data: aeroportosEncontrados };
        } catch (error) {
            console.error("Erro ao buscar aeroportos: ", error);
            return { message: "Erro ao buscar aeroportos", status: 500 };
        }
    });

    srv.on('CadastrarAeroporto', async (req, res) => {
        try {
            const data = req.data?.aeroporto;
            const aeroportoExistente = await buscarAeroportoExistente(data.icao);
            if (aeroportoExistente) {
                req.error(400, `Aeroporto com ICAO ${data.icao} já existente`);
                return;
            }

            let aeroportoInserido = await inserirAeroporto(req, data);

            console.log("Aeroporto cadastrado com sucesso: ", aeroportoInserido);
            return { message: "Aeroporto cadastrado com sucesso", data: aeroportoInserido };
        } catch (error) {
            console.error("Erro ao cadastrar aeroporto: ", error);
            req.error(500, "Erro ao cadastrar aeroporto" + error.message);
        }
    });
};

const buscarAeroportos = async (filtro) => {
    return await SELECT.from(Aeroporto).where(filtro);
};

const buscarAeroportoExistente = async (icao) => {
    return await SELECT.one.from(Aeroporto).where({ icao: icao });
}

const inserirAeroporto = async (req, data) => {
    const tx = cds.transaction(req);
    try {
        const dadosAeroporto = { ...data };
        await tx.run(INSERT.into(Aeroporto).entries(dadosAeroporto));
        await tx.commit();
        return dadosAeroporto;
    } catch (error) {
        console.error("Erro ao cadastrar aeroporto: ", error);
        await tx.rollback();
        throw new Error(error.message);
    }
}