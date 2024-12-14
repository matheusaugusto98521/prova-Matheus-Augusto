using sap.cap.infinitfyVoos as conex from '../db/Schema.cds';

service conexaoServicos @(path: 'conexao') {
    @readonly
    entity GetConexoes as projection on conex.Conexao;

    action CadastrarConexao(idAeroportoOrigem : UUID, idAeroportoDestino : UUID) returns String;
}
