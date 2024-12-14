const cds = require('@sap/cds');
const { HorarioVoo, Conexao, Aeronave, Companhia } = cds.entities('sap.cap.infinitfyVoos');

module.exports = (srv) => {
    srv.on("READ", 'GetHorarios', async (req) => {
        try {
            let filtro = req.data;
            let horariosEncontrados = await buscarHorarios(filtro);
            if (!horariosEncontrados) {
                return { horarios: [] };
            }

            console.log("Horarios: ", horariosEncontrados);
            return horariosEncontrados;
        } catch (error) {
            console.error("Erro ao buscar horarios: ", error);
            return { message: "Erro ao buscar horarios", status: 500 };
        }
    });

    srv.on('CadastrarVoo', async (req, res) => {
        try {
            const tx = cds.transaction(req);
            const data = req.data;
            const idCompanhia = data.voo.id_companhia;
            const idAeronave = data.voo.id_aeronave;
            const idConexao = data.voo.id_conexao;

            let companhiaEncontrada = await buscarCompanhia(idCompanhia);
            if (!companhiaEncontrada) {
                console.log("Companhia não encontrada para o ID: " + idCompanhia);
                req.error(404, "Companhia não encontrada para o ID: " + idCompanhia);
                return;
            }

            let aeronaveEncontrada = await buscarAeronave(idAeronave);
            if (!aeronaveEncontrada) {
                console.log("Aeronave não encontrada para o ID: " + idAeronave);
                req.error(404, "Aeronave não encontrada para o ID: " + idAeronave);
                return;
            }

            let conexaoEncontrada = await buscarConexao(idConexao);
            if (!conexaoEncontrada) {
                console.log("Conexao não encontrada para o ID: " + idConexao);
                req.error(404, "Conexao não encontrada para o ID: " + idConexao);
                return;
            }

            let capacidadeTotal = parseInt(data.voo.nr_assentos_executivo, 10) + parseInt(data.voo.nr_assentos_economico, 10);

            let dadosInsercaoVoo = {
                id_companhia: idCompanhia,
                id_aeronave: idAeronave,
                id_conexao: idConexao,
                nr_assentos_executivo: data.voo.nr_assentos_executivo,
                nr_assentos_economico: data.voo.nr_assentos_economico,
                capacidade_total: capacidadeTotal,
                partida_prevista: data.voo.partida_prevista,
                chegada_prevista: data.voo.chegada_prevista,
                situacao_voo: "AGUARDANDO"
            };

            let vooInserido = await tx.run(
                INSERT.into(HorarioVoo).entries(dadosInsercaoVoo)
            );

            if (vooInserido === 0) {
                console.log("Erro ao inserir horário de voo");
                await tx.rollback();
                req.error(400, "Erro ao inserir horário de voo");
            }

            console.log("Horário de voo inserido com sucesso");
            await tx.commit();
            return { message: "Horário de voo inserido com sucesso", vooInserido };
        } catch (error) {
            console.log("Erro ao inserir horário de voo: ", error);
            req.error(500, "Erro ao inserir horário de voo: " + error.message);
        }
    });

    srv.on('AlterarVoo', async (req, res) => {
        try {
            const tx = cds.transaction(req);
            const data = req.data;
            const idHorarioVoo = data.idHorarioVoo;
            const idAeronave = data.vooUpdt.id_aeronave;

            let horarioVooEncontrado = await buscarHorarioVoo(idHorarioVoo);
            if (!horarioVooEncontrado) {
                console.log("Horário de voo não encontrado para o ID: " + idHorarioVoo);
                req.error(404, "Horário de voo não encontrado para o ID: " + idHorarioVoo);
                return;
            }

            let aeronaveEncontrada = await buscarAeronave(idAeronave);
            if (!aeronaveEncontrada) {
                console.log("Aeronave não encontrada para o ID: " + idAeronave);
                req.error(404, "Aeronave não encontrada para o ID: " + idAeronave);
                return;
            }

            let dadosAtualizarVoo = {
                id_aeronave: idAeronave,
                partida_prevista: data.vooUpdt.partida_prevista,
                chegada_prevista: data.vooUpdt.chegada_prevista
            }

            let vooAtualizado = await tx.run(
                UPDATE(HorarioVoo).set(dadosAtualizarVoo)
                    .where({ id_horario_voo: idHorarioVoo })
            )

            if (vooAtualizado === 0) {
                console.log("Erro ao atualizar horário de voo");
                await tx.rollback();
                req.error(400, "Erro ao atualizar horário de voo");
            }

            console.log("Voo atualizado com sucesso");
            await tx.commit();
            return { message: "Voo atualizado com sucesso", vooAtualizado };
        } catch (error) {
            console.log("Erro ao atualizar horário de voo: ", error);
            req.error(500, "Erro ao atualizar horário de voo: " + error.message);
        }
    });

    srv.on('AlterarStatusVoo', async (req, res) => {
        try {
            const tx = cds.transaction(req);
            const data = req.data;
            const idHorarioVoo = data.idHorarioVoo;

            let horarioVooEncontrado = await buscarHorarioVoo(idHorarioVoo);
            if (!horarioVooEncontrado) {
                console.log("Horário de voo não encontrado para o ID: " + idHorarioVoo);
                req.error(404, "Horário de voo não encontrado para o ID: " + idHorarioVoo);
                return;
            }

            console.log("Before: ", data.alterarStatus);
            let dadosAtualizarVoo = alterarStatus(horarioVooEncontrado, data.alterarStatus);

            let vooAtualizado = await tx.run(
                UPDATE(HorarioVoo).set(dadosAtualizarVoo).where({ id_horario_voo: idHorarioVoo })
            );

            if (vooAtualizado === 0) {
                console.log("Erro ao atualizar status do voo");
                await tx.rollback();
                req.error(400, "Erro ao atualizar status do voo");
            }

            console.log("Voo atualizado com sucesso");
            await tx.commit();
            return { message: "Voo atualizado com sucesso", vooAtualizado };
        } catch (error) {
            console.log("Erro ao atualizar status do voo: ", error);
            req.error(500, "Erro ao atualizar status do voo: " + error.message);
        }
    })
};

const buscarHorarios = async (filtro) => {
    return await SELECT.from(HorarioVoo).where(filtro);
};

const buscarHorarioVoo = async (idHorarioVoo) => {
    return await SELECT.one.from(HorarioVoo).where({ id_horario_voo: idHorarioVoo });
}

const buscarAeronave = async (idAeronave) => {
    return await SELECT.one.from(Aeronave).where({ id_aeronave: idAeronave });
};

const buscarConexao = async (idConexao) => {
    return await SELECT.one.from(Conexao).where({ id_conexao: idConexao });
};

const buscarCompanhia = async (idCompanhia) => {
    return await SELECT.one.from(Companhia).where({ id_companhia: idCompanhia });
}

const alterarStatus = (voo, dadosAtualizados) => {
    try {
        let vooAtualizado = { ...voo };
        switch (voo.situacao_voo) {
            case "AGUARDANDO":
                if (dadosAtualizados.status === "EM CURSO") {
                    if (!dadosAtualizados.partida_real || !dadosAtualizados.situacao_partida) {
                        throw new Error("Horário de partida real e situação de partida devem ser fornecidos.");
                    }
                    const partidaReal = dadosAtualizados.partida_real;
                    vooAtualizado.situacao_voo = dadosAtualizados.status;
                    vooAtualizado.partida_real = partidaReal;
                    vooAtualizado.situacao_partida = dadosAtualizados.situacao_partida
                } else if (dadosAtualizados.status === "CANCELADO") {
                    vooAtualizado.situacao_voo = "CANCELADO";
                    vooAtualizado.partida_real = null;
                    vooAtualizado.situacao_partida = null;
                } else {
                    throw new Error(`Não é permitido alterar o status de 'AGUARDANDO' para '${dadosAtualizados.status}'.`);
                }
                break;

            case "EM CURSO":
                if (dadosAtualizados.status === "CONCLUIDO") {
                    if (!dadosAtualizados.chegada_real || !dadosAtualizados.situacao_chegada) {
                        throw new Error("Horário de chegada real e situação de chegada devem ser fornecidos.");
                    }
                    const partidaReal = dadosAtualizados.partida_real;
                    const chegadaReal = dadosAtualizados.chegada_real;
                    vooAtualizado.situacao_voo = dadosAtualizados.status;
                    vooAtualizado.partida_real = partidaReal;
                    vooAtualizado.chegada_real = chegadaReal;
                    vooAtualizado.situacao_chegada = dadosAtualizados.situacao_chegada;
                    vooAtualizado.situacao_partida = dadosAtualizados.situacao_partida;
                } else {
                    throw new Error(`Não é permitido alterar o status de 'EM CURSO' para '${dadosAtualizados.status}'.`);
                }
                break;

            default:
                throw new Error(`Status atual '${voo.situacao_voo}' não permite alterações.`);
        }

        console.log("Status do voo atualizado para: " + dadosAtualizados.status);
        return vooAtualizado;
    } catch (error) {
        console.error("Erro ao alterar status do voo: ", error);
        throw new Error(error.message);
    }
    ;
}