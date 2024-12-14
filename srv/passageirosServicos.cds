using sap.cap.infinitfyVoos as pass from '../db/Schema.cds';

service passageiroServicos @(path: 'passageiro') {
    @readonly
    entity GetPassageiros   as projection on pass.Passageiro;

    @insertonly
    entity InsertPassageiro as projection on pass.Passageiro;

    action UpdatePassageiro(idPassageiro : UUID, passageiroUpdt : updatePassageiroType) returns String;
}

type updatePassageiroType {
    endereco : String;
    email    : String;
    telefone : String;
}
