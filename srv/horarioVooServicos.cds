using sap.cap.infinitfyVoos as hora from '../db/Schema.cds';


service horarioVooServicos {
    @readonly
    entity GetHorarios as projection on hora.HorarioVoo;

    action CadastrarVoo(voo : vooCadastroType)                                      returns String;
    action AlterarVoo(idHorarioVoo : UUID, vooUpdt : vooUpdateType)                 returns String;
    action AlterarStatusVoo(idHorarioVoo : UUID, alterarStatus : alterarStatusType) returns String;
}

type vooCadastroType {
    id_companhia          : UUID;
    id_conexao            : UUID;
    id_aeronave           : UUID;
    nr_assentos_executivo : Integer;
    nr_assentos_economico : Integer;
    partida_prevista      : DateTime;
    chegada_prevista      : DateTime;
}

type vooUpdateType {
    id_aeronave      : UUID;
    partida_prevista : DateTime;
    chegada_prevista : DateTime;
}

type alterarStatusType {
    status           : String;
    partida_real     : String;
    situacao_partida : String;
    chegada_real     : String;
    situacao_chegada : String;
}
