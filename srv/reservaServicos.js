const cds = require('@sap/cds');
const { message } = require('@sap/cds/lib/log/cds-error');
const { ReservaPassagem, Passageiro, HorarioVoo } = cds.entities('sap.cap.infinitfyVoos');

module.exports = (srv) => {
    srv.on("READ", 'GetReservas', async (req) => {
        try {
            let filtro = req.data;
            let reservasEncontradas = await buscarReservas(filtro);
            if (reservasEncontradas.length === 0) {
                return { reservas: [] };
            }

            console.log("Reservas: ", reservasEncontradas);
            return { message: "Reservas encontradas", data: reservasEncontradas };
        } catch (error) {
            console.error("Erro ao buscar reservas: ", error);
            req.error(500, "Erro ao buscar reservas: " + error.message);
        }
    });

    srv.on("CREATE", 'InsertReserva', async (req, res) => {
        try {
            const tx = cds.transaction(req);
            const data = req.data;
            const idPassageiro = data.id_passageiro;
            const idHorarioVoo = data.id_horario_voo;

            let passageiroEncontrado = await buscarPassageiro(idPassageiro);
            if (!passageiroEncontrado) {
                console.log("Passageiro não encontrado para o ID: " + idPassageiro);
                req.error(404, "Passageiro não encontrado para o ID: " + idPassageiro);
                return;
            }

            let horarioVooEncontrado = await buscarHorarioVoo(idHorarioVoo);
            if (!horarioVooEncontrado) {
                console.log("Horário de voo não encontrado para o ID: " + idHorarioVoo);
                req.error(404, "Horário de voo não encontrado para o ID: " + idHorarioVoo);
                return;
            }

            let dadosInsercaoReserva = {
                id_passageiro: idPassageiro,
                id_horario_voo: idHorarioVoo,
                assento: data.assento,
                classe: data.classe,
                estado: "RESERVADO",
                data_reserva: new Date().toISOString(),
                preco: data.preco
            }

            let dadosValidos = await validarReserva(dadosInsercaoReserva);
            if (!dadosValidos) {
                console.log("Dados de reserva inválidos");
                req.error(400, "Dados de reserva inválidos");
                return;
            }


            let aguardando = isAguardando(horarioVooEncontrado);
            if (aguardando === false) {
                console.log("Impossivel fazer reserva para esse voo");
                req.error(400, "Impossivel fazer reserva para esse voo");
                return;
            }

            let capacidadeTotalAtualizada = await recalcularDisponibilidadeAssentos(horarioVooEncontrado, false);
            let atualizarCapacidadeVoo = await tx.run(
                UPDATE(HorarioVoo).set({ capacidade_total: capacidadeTotalAtualizada })
                    .where({ id_horario_voo: idHorarioVoo })
            );

            if (atualizarCapacidadeVoo === 0) {
                console.log("Erro ao atualizar capacidade de voo");
                await tx.rollback();
                req.error(500, "Erro ao atualizar capacidade de voo");
                return;
            }

            let reservaInserida = await tx.run(
                INSERT.into(ReservaPassagem).entries(dadosInsercaoReserva)
            );

            if (reservaInserida === 0) {
                console.log("Reserva não inserida");
                await tx.rollback();
                req.error(400, "Reserva não inserida");
            }

            await tx.commit();
            console.log("Reserva inserida com sucesso");
            return { message: "Reserva inserida com sucesso", reservaInserida };
        } catch (error) {
            console.log("Erro ao inserir reserva: ", error);
            req.error(500, "Erro ao inserir reserva: " + error.message);
        }
    });

    srv.on('CancelarReserva', async (req, res) => {
        try {
            const tx = cds.transaction(req);
            const data = req.data;
            const idReserva = data.idReserva;
            const idVoo = data.idHorarioVoo;

            let reservaEncontrada = await buscarReserva(idReserva);
            if (!reservaEncontrada) {
                console.log("Reserva não encontrada para o ID: " + idReserva);
                req.error(404, "Reserva não encontrada para o ID: " + idReserva);
                return;
            }

            let vooEncontrado = await buscarHorarioVoo(idVoo);
            if (!vooEncontrado) {
                console.log("Voo não encontrado para o ID: " + idVoo);
                req.error(404, "Voo não encontrado para o ID: " + idVoo);
                return;
            }

            let statusDoVoo = await isAguardando(vooEncontrado);
            if (statusDoVoo === false) {
                console.log("Reserva não pode ser cancelada");
                req.error(400, "Reserva não pode ser cancelada");
                return;
            }

            let cancelarReserva = await tx.run(
                UPDATE(ReservaPassagem).set({
                    estado: "CANCELADA",
                    assento: null
                }).where({ id_reserva: idReserva })
            );

            if (cancelarReserva === 0) {
                console.log("Reserva não cancelada");
                await tx.rollback();
                req.error(400, "Reserva não cancelada");
                return;
            }

            let capacidadeTotalAtualizada = await recalcularDisponibilidadeAssentos(vooEncontrado, true);
            let vooAtualizado = await tx.run(
                UPDATE(HorarioVoo).set({ capacidade_total: capacidadeTotalAtualizada })
                    .where({ id_horario_voo: idVoo })
            );

            if (vooAtualizado === 0) {
                console.log("Voo não atualizado");
                await tx.rollback();
                req.error(400, "Voo não atualizado");
                return;
            }

            console.log("Reserva cancelada com sucesso");
            await tx.commit();
            return { message: "Reserva cancelada com sucesso", cancelarReserva };
        } catch (error) {
            console.log("Erro ao cancelar reserva: ", error);
            req.error(500, "Erro ao cancelar reserva: " + error.message);

        }
    });
};

const buscarReservas = async (filtro) => {
    return await SELECT.from(ReservaPassagem).where(filtro);
};

const buscarReserva = async (idReserva) => {
    return await SELECT.one.from(ReservaPassagem).where({ id_reserva: idReserva });
}

const buscarPassageiro = async (idPassageiro) => {
    return await SELECT.one.from(Passageiro).where({ id_passageiro: idPassageiro });
};

const buscarHorarioVoo = async (idHorarioVoo) => {
    return await SELECT.one.from(HorarioVoo).where({ id_horario_voo: idHorarioVoo });
};

const verificarAssentoReserva = async (assento) => {
    const reserva = await SELECT.one.from(ReservaPassagem).where({
        assento: assento,
        estado: "RESERVADO"
    });
    console.log("REV: ", reserva);
    return Boolean(reserva);
};


const validarReserva = async (dadosReserva) => {
    console.log("Dados da reserva:", dadosReserva);
    if (!dadosReserva.id_passageiro || !dadosReserva.id_horario_voo || !dadosReserva.assento.trim() ||
        !dadosReserva.classe || !dadosReserva.preco
    ) {
        throw new Error("Todos os campos são obrigatórios");

    }

    let assentoDisponivel = await verificarAssentoReserva(dadosReserva.assento);
    console.log("Boolean: ", assentoDisponivel);
    if (assentoDisponivel === true) {
        throw new Error("O assento escolhido já está reservado");
    }

    let vooEncontrado = await buscarHorarioVoo(dadosReserva.id_horario_voo);
    let assentosDisponiveis = await recalcularDisponibilidadeAssentos(vooEncontrado, false);
    if (assentosDisponiveis <= 0) {
        throw new Error("Não há assentos disponíveis para essa classe");
    }

    const precosPorClasse = {
        "ECONOMICA": 200,
        "EXECUTIVA": 500
    }

    if (dadosReserva.preco < precosPorClasse[dadosReserva.classe]) {
        throw new Error(`O preço da reserva para a clase ${dadosReserva.classe} deve ser de no mínimo R$${precosPorClasse[dadosReserva.classe]}`);
    }

    return true;
};

const recalcularDisponibilidadeAssentos = async (voo, isCancelamento) => {
    const assentosReservados = await SELECT.from(ReservaPassagem).where({
        id_horario_voo: voo.id_horario_voo,
        estado: "RESERVADO"
    });

    let totalReservados = assentosReservados.length;
    let capacidadeTotal = voo.capacidade_total;

    if (isCancelamento) {
        totalReservados--;
    } else {
        totalReservados++;
    }

    if (totalReservados > capacidadeTotal) throw new Error("Não é possível reservar mais assentos do que a capacidade do voo");

    let assentosDisponiveis = capacidadeTotal - totalReservados;

    if (assentosDisponiveis === 0) {
        throw new Error("Não existem mais assentos disponiveis para este voo");

    }

    return assentosDisponiveis;
};

const isAguardando = (voo) => {
    return voo.situacao_voo === "AGUARDANDO";
}

