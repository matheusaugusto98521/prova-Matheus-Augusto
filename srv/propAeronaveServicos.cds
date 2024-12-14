using sap.cap.infinitfyVoos as prop from '../db/Schema.cds';


service propAeronaveServicos @(path: 'propriedade-aeronave') {
    @readonly
    entity GetPropriedadeAeronave as projection on prop.PropriedadeAeronave;

    action CadastrarPropriedade(propAeronave : propAeronaveType) returns String;
}

type propAeronaveType {
    id_companhia      : UUID;
    id_aeronave       : UUID;
    proprietário      : String;
    sg_uf             : String;
    cpf_cnpj          : String;
    nm_operador       : String;
    nr_cert_matricula : String;
    dt_validade_cva   : String;
    dt_validade_ca    : String;
    dt_canc           : DateTime;
    cd_interdicao     : String;
    ds_gravame        : String;
    dt_matricula      : DateTime;
}
