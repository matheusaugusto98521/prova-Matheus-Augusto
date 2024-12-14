using sap.cap.infinitfyVoos as reserv from '../db/Schema.cds';

service reservasServicos @(path: 'reservas-passagem') {
    @readonly
    entity GetReservas   as projection on reserv.ReservaPassagem;

    @insertonly
    entity InsertReserva as projection on reserv.ReservaPassagem;

    action CancelarReserva(idHorarioVoo : UUID, idReserva : UUID) returns String;
    action DeletarReserva(idReserva : UUID)                       returns String;
}
