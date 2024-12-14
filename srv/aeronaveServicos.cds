using sap.cap.infinitfyVoos as aeron from '../db/Schema.cds';


service aeronaveServicos @(path: 'aeronave') {
    @readonly
    entity GetAeronaves as projection on aeron.Aeronave;

    action CadastrarAeronave(aeronave : aeronaveType) returns String;
}

type aeronaveType {
    marca                 : String;
    ds_modelo             : String;
    nr_serie              : String;
    cd_categoria          : String;
    cd_tipo               : String;
    nm_fabricante         : String;
    cd_cls                : String;
    nr_pmd                : String;
    cd_tipo_icao          : String;
    nr_assentos_executivo : Integer;
    nr_assentos_economico : Integer;
    nr_ano_fabricacao     : Integer;
    tp_motor              : String;
    qt_motor              : String;
    tp_pouso              : String;
}
