const cds = require('@sap/cds');
const { message } = require('@sap/cds/lib/log/cds-error');
const { Conexao, Aeroporto } = cds.entities('sap.cap.infinitfyVoos');

module.exports = (srv) => {
    srv.on("READ", 'GetConexoes', async (req) => {
        try {
            let filtro = req.data;
            let conexoesEncontradas = await buscarConexoes(filtro);
            if (conexoesEncontradas.length === 0) {
                return { conexoes: [] };
            }

            console.log("Conexões encontradas: ", conexoesEncontradas);
            return conexoesEncontradas;
        } catch (error) {
            console.error("Erro ao buscar conexões: ", error);
            return { message: "Erro ao buscar conexões", status: 500 };
        }
    });

    srv.on('CadastrarConexao', async (req, res) => {
        try {
            const data = req.data;
            const idAeroportoOrigem = data.idAeroportoOrigem;
            const idAeroportoDestino = data.idAeroportoDestino;

            let origemEncontrada = await buscarAeroporto(idAeroportoOrigem);
            if (!origemEncontrada) {
                console.log("Aeroporto de origem não encontrado para o ID: " + idAeroportoOrigem);
                req.error(404, "Aeroporto de origem não encontrado para o ID: " + idAeroportoOrigem);
                return;
            }

            let destinoEncontrado = await buscarAeroporto(idAeroportoDestino);
            if (!destinoEncontrado) {
                console.log("Aeroporto de destino não encontrado para o ID: " + idAeroportoDestino);
                req.error(404, "Aeroporto de destino não encontrado para o ID: " + idAeroportoDestino);
                return;
            }


            let conexaoExistente = await buscarConexaoExistente(data);
            if (conexaoExistente) {
                console.log("Conexão já existe entre os aeroportos de origem e destino");
                req.error(400, "Conexão já existe entre os aeroportos de origem e destino");
                return;
            }

            let conexaoInserida = await inserirConexao(req, data);

            console.log("Conexão inserida com sucesso: ", conexaoInserida);
            return { message: "Conexão inserida com sucesso", data: conexaoInserida };
        } catch (error) {
            console.error("Erro ao cadastrar conexão: ", error);
            req.error(500, "Erro ao cadastrar conexão: " + error.message);
        }
    });
};

const buscarConexoes = async (filtro) => {
    return await SELECT.from(Conexao).where(filtro);
};

const buscarAeroporto = async (idAeroporto) => {
    return await SELECT.one.from(Aeroporto).where({ id_aeroporto: idAeroporto });
};

const buscarConexaoExistente = async (data) => {
    return await SELECT.one.from(Conexao).where({
        id_aeroporto_origem: data.idAeroportoOrigem,
        id_aeroporto_destino: data.idAeroportoDestino
    });
};

const inserirConexao = async (req, data) => {
    const tx = cds.transaction(req);
    try {
        const dadosConexao = { ...data };
        await tx.run(INSERT.into(Conexao).entries({
            id_aeroporto_origem: dadosConexao.idAeroportoOrigem,
            id_aeroporto_destino: dadosConexao.idAeroportoDestino
        }));
        await tx.commit();
        return dadosConexao;
    } catch (error) {
        console.error("Erro ao cadastrar conexão: ", error);
        throw error;
    }
};