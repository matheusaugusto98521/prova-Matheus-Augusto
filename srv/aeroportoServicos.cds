using sap.cap.infinitfyVoos as aerop from '../db/Schema.cds';

service aeroportoServicos @(path: 'aeroporto') {
    @readonly
    entity GetAeroportos as projection on aerop.Aeroporto;

    action CadastrarAeroporto(aeroporto : aeroportoType) returns String;
}

type aeroportoType {
    icao   : String;
    nome   : String;
    cidade : String;
    estado : String;
    pais   : String;
}
