# 💻 PROVA FINAL - MATHEUS AUGUSTO FERREIRA DA SILVA

### **TELEFONE:** (15)99662-9300

#### 🤓 Este projeto é o desenvolvimento da prova final do processo seletivo da [INFINITFY](https://www.infinitfy.com/)

## 👨‍💻 Exemplos de execução de testes:
- [Clique aqui para acessar os testes](https://github.com/matheusaugusto98521/prova-Matheus-Augusto/tree/main/tests)

**Os testes foram gerados em uma collection do 
insomnia, abaixo mostrarei os endpoints disponiveis, a própria collection ja possui exemplos e 
como o corpo das requisições estão estruturados.**


## ⚙️ Configuração do Projeto

* **Inicie a aplicação(Digite o comando na raíz do projeto)**

```
    cds run
```

### ↘️ Rotas disponíveis da API utilizando Insomnia ou outra ferramenta

### Companhia

* **Mostrar companhias:**
```
    http://localhost:4004/odata/v4/companhia/GetCompanhias

```

* **Função para cadastrar companhia:**
```
    http://localhost:4004/odata/v4/companhia/CadastrarCompanhia

    Corpo da requisição - Formato JSON com os seguintes requisitos(
        "companhia" : {
            "icao": String,
    "razao_social": String,
    "iata": String,
    "representante_legal": String,
    "pais_sede": String,
    "cnpj": String,
    "endereco": String,
    "cidade": String,
    "uf": String,
    "cep": String,
    "telefone": String,
    "email": String,
    "decisao_operacional": String,
    "atividades_areas": String,
    "data_decisao_operacao": Date,
    "validade_operacional": Date
        }
    )    
```


### Aeronave

* **Mostrar Aeronaves**
```
    http://localhost:4004/odata/v4/aeronave/GetAeronaves

```

* **Funcção para Cadastrar Aeronave**
```
    http://localhost:4004/odata/v4/aeronave/CadastrarAeronave

    Corpo da requisição - Formato JSON com os seguintes requisitos(
        "aeronave" : {
		 "marca": String,
  	"ds_modelo": String,
  	"nr_serie": String,
  	"cd_categoria": String,
  	"cd_tipo": String,
  	"nm_fabricante": String,
  	"cd_cls": String,
  	"nr_pmd": String,
  	"cd_tipo_icao": String,
  	"nr_assentos_executivo": Integer,
  	"nr_assentos_economico": Integer,
  	"nr_ano_fabricacao": Integer,
  	"tp_motor": String,
  	"qt_motor": String,
  	"tp_pouso": String
	}
    )
```

### Aeroporto

* **Mostrar Aeroportos**
```
    http://localhost:4004/odata/v4/aeroporto/GetAeroportos

```

* **Função para cadastrar Aeroporto**
```
    http://localhost:4004/odata/v4/aeroporto/CadastrarAeroporto

    Corpo da requisição - Formato JSON com os seguintes requisitos(
        "aeroporto" : {
			"icao":     String,
			"nome":     String,
			"cidade":   String,
			"estado":   String,
			"pais":     String
	}
    )
```

### Conexões

* **Mostrar Conexões**
```
    http://localhost:4004/odata/v4/conexao/GetConexoes

```

* **Cadastrar conexão:**
```
    http://localhost:4004/odata/v4/conexao/CadastrarConexao
    
    Corpo da requisição - Formato JSON com os seguintes requisitos(
        "idAeroportoOrigem" :   String,
	    "idAeroportoDestino" :  String
    )
```

### Propriedade Aeronave

* **Mostrar Propriedades Aeronave**
```
    http://localhost:4004/odata/v4/propriedade-aeronave/GetPropriedadeAeronave
```

* **Função para cadastrar propriedade:**
```
    http://localhost:4004/odata/v4/propriedade-aeronave/CadastrarPropriedade
    
    Corpo da requisição - Formato JSON com os seguintes requisitos(
        "propAeronave": {
		"id_companhia": String,
  	    "id_aeronave": String,
        "nm_operador": String,
        "nr_cert_matricula": String,
        "dt_validade_cva": Date,
        "dt_validade_ca": Date,
        "dt_canc": Date,
        "cd_interdicao": String,
        "ds_gravame": String,
        "dt_matricula": Date
  }
    )
```

### Passageiro

* **Mostrar Passageiros**
```
    http://localhost:4004/odata/v4/passageiro/GetPassageiros
```

* **Função para cadastrar passageiro:**
```
    http://localhost:4004/odata/v4/passageiro/InsertPassageiro
    
    Corpo da requisição - Formato JSON com os seguintes requisitos(
        "cpf": String,
        "nome": String,
        "email": String,
        "telefone": String,
        "dataNascimento": Date,
        "endereco": String
    )
```

* **Função para atualizar passageiro:**
```
    http://localhost:4004/odata/v4/passageiro/UpdatePassageiro
    
    Corpo da requisição - Formato JSON com os seguintes requisitos(
        "idPassageiro" : String,
	    "passageiroUpdt" : {
		    "endereco" : String,
		    "telefone" : String,
		    "email" : String
	}
    )
```

### Reservas

* **Mostrar Reservas**
```
    http://localhost:4004/odata/v4/reservas-passagem/GetReservas
```

* **Função para cadastrar reserva:**
```
    http://localhost:4004/odata/v4/reservas-passagem/InsertReserva
    
    Corpo da requisição - Formato JSON com os seguintes requisitos(
        "id_passageiro" : String,
	    "id_horario_voo" : String,
	    "assento" : String,
	    "classe" : String,
	    "preco" : Double
    )
```

* **Função para cancelar resreva:**
```
    http://localhost:4004/odata/v4/reservas-passagem/CancelarReserva
    
    Corpo da requisição - Formato JSON com os seguintes requisitos(
        "idReserva" : String,
	    "idHorarioVoo" : String
    )
```

### Horário voo

* **Mostrar Horários de voo**
```
    http://localhost:4004/odata/v4/horario-voo-servicos/GetHorarios
```

* **Função para cadastrar horáerio de voo:**
```
    http://localhost:4004/odata/v4/horario-voo-servicos/CadastrarVoo
    
    Corpo da requisição - Formato JSON com os seguintes requisitos(
        "voo" : {
		"id_companhia" : String,
	    "id_conexao" : String,
	    "id_aeronave" : String,
	    "nr_assentos_executivo" : Integer,
	    "nr_assentos_economico" : Integer,
	    "partida_prevista" : DateTime,
	    "chegada_prevista" : DateTime
	}
    )
```

* **Função para atualizar informações de horário de voo:**
```
    http://localhost:4004/odata/v4/horario-voo-servicos/AlterarVoo
    
    Corpo da requisição - Formato JSON com os seguintes requisitos(
        "idHorarioVoo" : String,
	    "vooUpdt" : {
		    "id_aeronave"  :String,
		    "partida_prevista" : DateTime,
		    "chegada_prevista" :DateTime
	}
    )
```

* **Função para atualizar status de horário de voo:**
```
    http://localhost:4004/odata/v4/horario-voo-servicos/AlterarStatusVoo
    
    Corpo da requisição - Formato JSON com os seguintes requisitos(
        "idHorarioVoo" : String,
	"alterarStatus" : {
		"status" : "CONCLUIDO" ou "EM CURSO" ou "AGUARDANDO" ou "CANCELADO"
		"partida_real" : DateTime,
		"situacao_partida" : String,
		"chegada_real" : DateTime,
		"situacao_chegada" : String
	}
    )
```


#### 🤓 Para qualquer outra observação, ficarei feliz em resolver.

## 🤓 APLICAÇÃO DESENVOLVIDA EM SAP CAP.
