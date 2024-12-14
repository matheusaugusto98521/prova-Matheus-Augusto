using sap.cap.infinitfyVoos as comp from '../db/Schema.cds';

service companhiaServicos @(path: 'companhia') {
    @readonly
    entity GetCompanhias as projection on comp.Companhia;

    action CadastrarCompanhia(companhia : companhiaType) returns String;
}

type companhiaType {
    icao                  : String;
    razao_social          : String;
    iata                  : String;
    representante_legal   : String;
    pais_sede             : String;
    cnpj                  : String;
    endereco              : String;
    cidade                : String;
    uf                    : String;
    cep                   : String;
    telefone              : String;
    email                 : String;
    decisao_operacional   : String;
    atividades_areas      : String;
    data_decisao_operacao : String;
    validade_operacional  : String;
}
