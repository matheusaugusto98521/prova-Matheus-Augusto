const cds = require('@sap/cds');
const { message } = require('@sap/cds/lib/log/cds-error');
const { Passageiro, ReservaPassagem } = cds.entities('sap.cap.infinitfyVoos');

module.exports = (srv) => {
    srv.on("READ", 'GetPassageiros', async (req) => {
        try {
            let filtro = req.data;
            let passageirosEncontrados = await buscarPassageiros(filtro);
            if (!passageirosEncontrados) {
                return { passageiros: [] };
            }

            console.log("Passageiros: ", passageirosEncontrados);
            return passageirosEncontrados;
        } catch (error) {
            console.error("Erro ao buscar passageiros: ", error);
            return { message: "Erro ao buscar passageiros", status: 500 };
        }
    });

    srv.on("CREATE", 'InsertPassageiro', async (req, res) => {
        try {
            const data = req.data;
            if (!validarDadosObrigatorios(data)) {
                console.log("Campos não preenchidos");
                req.error(400, "Preencha todos os campos");
                return;
            }

            let cfpValido = validarCPF(data.cpf);
            if (!cfpValido) {
                console.log("CPF inválido");
                req.error(400, "CPF inválido");
                return;
            }

            let idade = calcularIdade(new Date(data.dataNascimento));
            if (idade < 3) {
                console.log("Idade deve ser superior a 3 anos de idade");
                req.error(400, "Idade deve ser superior a 3 anos de idade");
                return;
            }

            let valoresUnicos = {
                cpf: data.cpf,
                telefone: data.telefone,
                email: data.email
            }

            let passageiroExistente = await buscarPassageiroExistente(valoresUnicos);
            console.log(passageiroExistente);
            if (passageiroExistente) {
                console.log("Passageiro já existe");
                req.error(400, "Passageiro já existe");
                return;
            }

            let passageiroInserido = await inserirPassageiro(req, data);
            console.log("Passageiro inserido com sucesso");
            return { message: "Passageiro inserido com sucesso", passageiroInserido };
        } catch (error) {
            console.log("Erro ao inserir passageiro");
            req.error(500, "Erro ao inserir passageiro");
        }
    });

    srv.on('UpdatePassageiro', async (req, res) => {
        try {
            const tx = cds.transaction(req);
            const data = req.data;
            const idPassageiro = data.idPassageiro;
            let passageiroEncontrado = await buscarPassageiroPeloID(idPassageiro);
            if (!passageiroEncontrado) {
                console.log("Passageiro não encontrado para o ID " + idPassageiro);
                req.error(404, "Passageiro não encontrado para o ID: " + idPassageiro);
                return;
            }

            let dadosUpdatePassageiro = {
                endereco: data.passageiroUpdt.endereco,
                telefone: data.passageiroUpdt.telefone,
                email: data.passageiroUpdt.email
            }

            let resultadoAtualizacaoPassageiro = await tx.run(
                UPDATE(Passageiro).set(dadosUpdatePassageiro).where({ id_passageiro: idPassageiro })
            );

            if (resultadoAtualizacaoPassageiro === 0) {
                console.log("Erro ao atualizar passageiro");
                await tx.rollback();
                req.error(500, "Erro ao atualizar passageiro");
                return;
            }

            await tx.commit();
            console.log("Passageiro atualizado com sucesso");
            return { message: "Passageiro atualizado com sucesso", resultadoAtualizacaoPassageiro };
        } catch (error) {
            console.log("Erro ao atualizar passageiro");
            req.error(500, "Erro ao atualizar passageiro");
        }
    });
};


const buscarPassageiros = async (filtro) => {
    return await SELECT.from(Passageiro).where(filtro);
};

const buscarPassageiroPeloID = async (idPassageiro) => {
    return await SELECT.one.from(Passageiro).where({ id_passageiro: idPassageiro });
};

const validarDadosObrigatorios = (data) => {
    return data?.cpf?.trim() ||
        data?.nome?.trim() ||
        data?.email?.trim() ||
        data?.telefone?.trim() ||
        data?.dataNascimento?.trim() ||
        data?.endereco?.trim();
}



const buscarPassageiroExistente = async (data) => {
    let passageiroPorCPF = await SELECT.one.from(Passageiro).where({ cpf: data.cpf });
    let passageiroPorTelefone = await SELECT.one.from(Passageiro).where({ telefone: data.telefone });
    let passageiroPorEmail = await SELECT.one.from(Passageiro).where({ email: data.email });

    return passageiroPorCPF || passageiroPorTelefone || passageiroPorEmail;
};




const validarCPF = (cpf) => {
    cpf = cpf.replace(/\D/g, '');

    if (cpf.length !== 11) {
        return false;
    }

    if (/^(\d)\1{10}$/.test(cpf)) {
        return false;
    }

    const calcularDigitoVerificador = (cpf, peso) => {
        let soma = 0;
        for (let i = 0; i < peso.length; i++) {
            soma += cpf[i] * peso[i];
        }
        const resto = soma % 11;
        return resto < 2 ? 0 : 11 - resto;
    };

    const primeiroDigito = calcularDigitoVerificador(cpf, [10, 9, 8, 7, 6, 5, 4, 3, 2]);
    if (parseInt(cpf[9]) !== primeiroDigito) {
        return false;
    }

    return parseInt(cpf[10]) === calcularDigitoVerificador(cpf, [11, 10, 9, 8, 7, 6, 5, 4, 3, 2]);
};

const calcularIdade = (dataNascimento) => {
    const hoje = new Date();
    const anoNascimento = dataNascimento.getUTCFullYear();
    const mesNascimento = dataNascimento.getUTCMonth();
    const diaNascimento = dataNascimento.getUTCDate();

    let idade = hoje.getFullYear() - anoNascimento;

    if (hoje.getMonth() < mesNascimento || (hoje.getMonth() === mesNascimento && hoje.getDate() < diaNascimento)) {
        idade--;
    }

    return idade;
};

const inserirPassageiro = async (req, data) => {
    const tx = cds.transaction(req);
    try {
        const dadosPassageiro = { ...data };
        await tx.run(INSERT.into(Passageiro).entries(dadosPassageiro));
        await tx.commit();
        return dadosPassageiro;
    } catch (error) {
        console.log("Erro ao criar passageiro: ", error);
        await tx.rollback();
        throw error;
    }
};



