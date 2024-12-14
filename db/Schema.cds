namespace sap.cap.infinitfyVoos;

entity Companhia {
    key id_companhia          : UUID;

        @assert.unique
        icao                  : String(4);

        @assert.unique
        razao_social          : String(255);

        iata                  : String(255);
        representante_legal   : String(255);
        pais_sede             : String(255);

        @assert.unique
        cnpj                  : String(14);

        endereco              : String(255);
        cidade                : String(100);
        uf                    : String(2);
        cep                   : String(255);

        @assert.unique
        telefone              : String(20);

        @assert.unique
        email                 : String(100);

        decisao_operacional   : String(255);
        atividades_areas      : String(255);
        data_decisao_operacao : String(255);
        validade_operacional  : String(255);
};

entity Aeronave {
    key id_aeronave           : UUID;

        @assert.unique
        marca                 : String(200);

        @assert.unique
        ds_modelo             : String(200);

        @assert.unique
        nr_serie              : String(100);
        cd_categoria          : String(255);
        cd_tipo               : String(255);
        nm_fabricante         : String(255);
        cd_cls                : String(255);
        nr_pmd                : String(255);
        cd_tipo_icao          : String(255);
        nr_assentos_executivo : Integer;
        nr_assentos_economico : Integer;
        nr_assentos_max       : Integer;
        nr_ano_fabricacao     : Integer;
        tp_motor              : String(100);
        qt_motor              : String(255);
        tp_pouso              : String(255);

};


entity PropriedadeAeronave {
    key id_propriedade_aeronave : UUID;
        id_companhia            : UUID;
        id_aeronave             : UUID;
        proprietário            : String;
        sg_uf                   : String;
        cpf_cnpj                : String;
        nm_operador             : String;
        nr_cert_matricula       : String;
        dt_validade_cva         : Double;
        dt_validade_ca          : Double;
        dt_canc                 : DateTime;
        cd_interdicao           : String;
        ds_gravame              : String;
        dt_matricula            : DateTime;
}

entity Aeroporto {
    key id_aeroporto : UUID;

        @assert.unique
        icao         : String(4);
        nome         : String(200);
        cidade       : String(100);
        estado       : String(100);
        pais         : String(100);
};

entity Conexao {
    key id_conexao           : UUID;
        id_aeroporto_origem  : UUID;
        id_aeroporto_destino : UUID;
};

entity Passageiro {
    key id_passageiro  : UUID;

        @assert.unique
        cpf            : String(11);

        nome           : String(200);

        @assert.unique
        email          : String(100);

        @assert.unique
        telefone       : String(16);
        dataNascimento : Date;
        endereco       : String(255);
};

entity ReservaPassagem {
    key id_reserva     : UUID;
        id_passageiro  : UUID;
        id_horario_voo : UUID;
        assento        : String(10);
        classe         : String(50);
        estado         : String(100);
        data_reserva   : DateTime;
        preco          : Decimal(10, 2);
};

entity HorarioVoo {
    key id_horario_voo        : UUID;
        id_companhia          : UUID;
        id_conexao            : UUID;
        id_aeronave           : UUID;
        nr_assentos_executivo : Integer;
        nr_assentos_economico : Integer;
        capacidade_total      : Integer;
        dados                 : Date;
        partida_prevista      : DateTime;
        chegada_prevista      : DateTime;
        partida_real          : DateTime;
        chegada_real          : DateTime;
        situacao_voo          : String;
        situacao_partida      : String(255);
        situacao_chegada      : String(255);
}
