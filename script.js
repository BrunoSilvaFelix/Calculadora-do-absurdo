let dadosEstados = {};

// Carrega o arquivo JSON assim que a página abre
async function carregarDados() {
    try {
        const resposta = await fetch('data.json');
        dadosEstados = await resposta.json();
    } catch (erro) {
        console.error("Erro ao carregar o arquivo JSON de estados:", erro);
        document.getElementById('resultado').innerHTML = "Erro ao carregar banco de dados.";
    }
}

// Algoritmo de Busca Binária
function encontrarCidadeMaisProxima(cidades, alvo) {
    if (!cidades || cidades.length === 0) return null;
    
    let inicio = 0;
    let fim = cidades.length - 1;
    
    if (alvo <= cidades[inicio].populacao) return cidades[inicio];
    if (alvo >= cidades[fim].populacao) return cidades[fim];

    while (inicio <= fim) {
        let meio = Math.floor((inicio + fim) / 2);

        if (cidades[meio].populacao === alvo) return cidades[meio];

        if (alvo < cidades[meio].populacao) {
            fim = meio - 1;
        } else {
            inicio = meio + 1;
        }
    }

    const distFim = Math.abs(cidades[fim].populacao - alvo);
    const distInicio = Math.abs(cidades[inicio].populacao - alvo);

    return distFim < distInicio ? cidades[fim] : cidades[inicio];
}


// Função para formatar números grandes por extenso (Ex: 4.500.000 -> 4,5 milhões)
function formatarNumeroPorExtenso(num, ehDinheiro = false) {
    if (num < 1000) {
        return ehDinheiro ? `R$ ${num.toFixed(2).replace('.', ',')}` : num.toString();
    }
    
    const milhao = 1000000;
    const bilhao = 1000000000;
    const trilhao = 1000000000000;

    // Prefixo para dinheiro (R$) ou vazio para contagem de cestas
    const prefixo = ehDinheiro ? "R$ " : "";

    if (num >= trilhao) {
        const calculo = num / trilhao;
        const valorFormatado = calculo % 1 === 0 ? calculo : calculo.toFixed(1).replace('.', ',');
        return `${prefixo}${valorFormatado} ${calculo >= 2 ? 'trilhões' : 'trilhão'}`;
    }
    if (num >= bilhao) {
        const calculo = num / bilhao;
        const valorFormatado = calculo % 1 === 0 ? calculo : calculo.toFixed(1).replace('.', ',');
        return `${prefixo}${valorFormatado} ${calculo >= 2 ? 'bilhões' : 'bilhão'}`;
    }
    if (num >= milhao) {
        const calculo = num / milhao;
        const valorFormatado = calculo % 1 === 0 ? calculo : calculo.toFixed(1).replace('.', ',');
        return `${prefixo}${valorFormatado} ${calculo >= 2 ? 'milhões' : 'milhão'}`;
    }
    
    // Para milhares comuns (Ex: 932100 -> 932,1 mil)
    const mil = num / 1000;
    const valorFormatado = mil % 1 === 0 ? mil : mil.toFixed(1).replace('.', ',');
    return `${prefixo}${valorFormatado} mil`;
}

// Evento de clique do botão
document.getElementById('btn-calcular').addEventListener('click', function() {
    const valorInserido = parseFloat(document.getElementById('valor').value);
    const estadoSelecionado = document.getElementById('estado').value;
    const campoResultado = document.getElementById('resultado');

    if (isNaN(valorInserido) || valorInserido <= 0) {
        campoResultado.innerHTML = "<span style='color: red;'>Por favor, insira um valor válido.</span>";
        return;
    }
    if (!estadoSelecionado || !dadosEstados[estadoSelecionado]) {
        campoResultado.innerHTML = "<span style='color: red;'>Por favor, selecione um estado válido.</span>";
        return;
    }

    const infosEstado = dadosEstados[estadoSelecionado];
    const quantidadeCestas = Math.floor(valorInserido / infosEstado.precoCesta);

    if (quantidadeCestas === 0) {
        campoResultado.innerHTML = `Com R$ ${valorInserido.toFixed(2)}, você não compra nenhuma cesta básica inteira no estado de ${infosEstado.nomeEstado}.`;
        return;
    }

    const maiorCidadeEstado = infosEstado.cidades[infosEstado.cidades.length - 1];
    // Se não houver a propriedade no JSON, usamos 0 como segurança
    const populacaoTotalEstado = infosEstado.populacaoEstado || 0; 
    
    let mensagemHTML = `Com <strong style="font-size: 1.1rem;">${formatarNumeroPorExtenso(valorInserido, true)}</strong> você compra aproximadamente <strong style="font-size: 1.4rem;">${formatarNumeroPorExtenso(quantidadeCestas, false)}</strong> de cestas básicas em/no ${infosEstado.nomeEstado}.<br><br>`;
    
    // O número de cestas é maior que a população do ESTADO INTEIRO
    if (populacaoTotalEstado > 0 && quantidadeCestas >= populacaoTotalEstado) {
        const cestasPorHabitanteEstado = Math.floor(quantidadeCestas / populacaoTotalEstado);
        const sobraCestasEstado = quantidadeCestas % populacaoTotalEstado;

        mensagemHTML += `<div style="background-color: #e3f2fd; padding: 15px; border-left: 5px solid #2196f3; margin-top: 10px; text-align: left;">
            Essa quantidade é o suficiente para dar exatamente <strong>${cestasPorHabitanteEstado} cesta${cestasPorHabitanteEstado > 1 ? 's' : ''} básica${cestasPorHabitanteEstado > 1 ? 's' : ''} para CADA HABITANTE de TODO O ESTADO do ${infosEstado.nomeEstado}</strong>.
            ${sobraCestasEstado > 0 ? `<br><br>E ainda sobrariam <strong>${formatarNumeroPorExtenso(sobraCestasEstado, false)}</strong> cestas básicas!` : ''}
        </div>`;

    // O número de cestas é maior que a maior cidade, mas não o estado todo
    } else if (quantidadeCestas > maiorCidadeEstado.populacao) {
        const cestasPorHabitante = Math.floor(quantidadeCestas / maiorCidadeEstado.populacao);
        const sobraCestas = quantidadeCestas % maiorCidadeEstado.populacao;

        mensagemHTML += `<div style="background-color: #f5f5f5; padding: 15px; border-left: 5px solid #000; margin-top: 10px; text-align: left;">
            Essa quantidade é o suficiente para dar exatamente <strong>${cestasPorHabitante} cesta${cestasPorHabitante > 1 ? 's' : ''} básica${cestasPorHabitante > 1 ? 's' : ''} para cada habitante</strong> da cidade de <strong>${maiorCidadeEstado.nome}</strong>.
            ${sobraCestas > 0 ? `<br><br>E ainda sobrariam <strong>${formatarNumeroPorExtenso(sobraCestas, false)}</strong> cestas básicas!` : ''}
        </div>`;
        
    // Valores menores ou aproximados a cidades específicas
    } else {
        const cidadeProxima = encontrarCidadeMaisProxima(infosEstado.cidades, quantidadeCestas);

        if (cidadeProxima) {
            mensagemHTML += `<div style="background-color: #f5f5f5; padding: 15px; border-left: 5px solid #000; margin-top: 10px; text-align: left;">
                Essa quantidade de cestas básicas é o suficiente para dar uma para **cada habitante** da cidade de <strong>${cidadeProxima.nome}</strong> (População: ${formatarNumeroPorExtenso(cidadeProxima.populacao, false)} hab.).
            </div>`;
        }
    }

    campoResultado.innerHTML = mensagemHTML;
});

// Inicializa a carga do JSON
carregarDados();