// ==================================
// CONFIGURAÇÃO
// ==================================

// Endereço base da API
const API_URL = 'http://localhost:3001/api';

// ==================================
// INICIALIZAÇÃO
// ==================================

// Quando a página terminar de carregar, executa tudo isso
document.addEventListener('DOMContentLoaded', () => {

    // Carrega os produtos assim que a página abre
    carregarProdutos();

    // Inicia o relógio e atualiza a cada 1 segundo (1000ms)
    atualizarDataHora();
    setInterval(atualizarDataHora, 1000);

    // Quando o formulário for enviado, chama a função salvarProduto
    document.getElementById('formProduto')
        .addEventListener('submit', salvarProduto);

    // Quando digitar na busca, filtra em tempo real
    document.getElementById('busca')
        .addEventListener('input', filtrarProdutos);

    // Quando clicar em Cancelar, limpa o formulário
    document.getElementById('btnCancelar')
        .addEventListener('click', cancelarEdicao);
});

// ==================================
// CARREGAR PRODUTOS DA API
// ==================================

async function carregarProdutos() {
    try {
        // Faz a requisição GET para o backend
        const resposta = await fetch(`${API_URL}/produtos`);

        // Verifica se deu erro (ex: servidor fora do ar)
        if (!resposta.ok) throw new Error(`Erro HTTP: ${resposta.status}`);

        // Converte a resposta de texto JSON para objeto JavaScript
        const produtos = await resposta.json();

        // Chama as funções que usam os dados
        exibirProdutos(produtos);
        atualizarEstatisticas(produtos);

    } catch (erro) {
        console.error('Erro ao carregar:', erro);

        // Mostra mensagem de erro na tabela
        document.getElementById('tabelaProdutos').innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-danger py-4">
                    <i class="bi bi-exclamation-triangle fs-3 d-block mb-2"></i>
                    <strong>Não foi possível conectar ao servidor.</strong><br>
                    <small>Verifique se o Node.js está rodando na porta 3001.</small>
                </td>
            </tr>
        `;
    }
}

// ==================================
// EXIBIR PRODUTOS NA TABELA
// ==================================

function exibirProdutos(produtos) {
    const tbody = document.getElementById('tabelaProdutos');

    // Se não tem produtos, mostra mensagem
    if (produtos.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-muted py-5">
                    <i class="bi bi-inbox" style="font-size: 3rem;"></i>
                    <p class="mt-2 mb-0">Nenhum produto cadastrado ainda.</p>
                </td>
            </tr>
        `;
        return; // Para aqui, não executa o resto da função
    }

    // Para cada produto, cria uma linha HTML na tabela
    // O segundo parâmetro "indice" é a posição do item no array (0, 1, 2...)
    tbody.innerHTML = produtos.map((produto, indice) => {

        // Define a cor do badge baseado na quantidade
        let badgeClass = 'bg-success';           // Verde: estoque normal
        if (produto.quantidade === 0)
            badgeClass = 'bg-danger';            // Vermelho: sem estoque
        else if (produto.quantidade <= 5)
            badgeClass = 'bg-warning text-dark'; // Amarelo: estoque baixo

        return `
            <tr>
                <!-- indice + 1 porque o array começa em 0, mas queremos mostrar 1, 2, 3... -->
                <!-- O id real (produto.id) continua sendo usado nos botões de editar/deletar -->
                <td><span class="text-muted">${indice + 1}</span></td>
                <td><strong>${escapeHtml(produto.nome)}</strong></td>
                <td>${escapeHtml(produto.descricao || '-')}</td>
                <td>
                    <span class="badge ${badgeClass}">
                        ${produto.quantidade} un.
                    </span>
                </td>
                <td><strong>${formatarMoeda(produto.preco)}</strong></td>
                <td><small class="text-muted">${formatarData(produto.data_cadastro)}</small></td>
                <td class="text-center">
                    <button class="btn btn-sm btn-warning me-1"
                            onclick="editarProduto(${produto.id})"
                            title="Editar">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-danger"
                            onclick="deletarProduto(${produto.id}, '${escapeHtml(produto.nome)}')"
                            title="Deletar">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join(''); // .join('') une todas as linhas num só texto HTML
}

// ==================================
// SALVAR PRODUTO (CRIAR OU EDITAR)
// ==================================

async function salvarProduto(event) {

    event.preventDefault();

    // Pega o id do campo escondido (só tem valor se estiver editando)
    const id = document.getElementById('produtoId').value;

    // Monta o objeto com os dados do formulário
    const produto = {
        nome:       document.getElementById('nome').value.trim(),
        descricao:  document.getElementById('descricao').value.trim(),
        quantidade: parseInt(document.getElementById('quantidade').value),
        preco:      parseFloat(document.getElementById('preco').value)
    };

    // Validação básica
    if (!produto.nome) {
        mostrarToast('Informe o nome do produto!', 'warning');
        return;
    }

    // Feedback visual: desabilita o botão para evitar cliques duplos
    const btnSalvar = document.getElementById('btnSalvar');
    btnSalvar.disabled = true;
    btnSalvar.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Salvando...';

    try {
        let resposta;

        if (id) {
            // TEM id = está EDITANDO → usa PUT
            resposta = await fetch(`${API_URL}/produtos/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(produto)
            });
        } else {
            // NÃO tem id = está CRIANDO → usa POST
            resposta = await fetch(`${API_URL}/produtos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(produto)
            });
        }

        const resultado = await resposta.json();

        if (resposta.ok) {
            mostrarToast(resultado.mensagem, 'success');
            limparFormulario();
            carregarProdutos(); // Atualiza a tabela
        } else {
            mostrarToast('Erro: ' + resultado.erro, 'danger');
        }

    } catch (erro) {
        mostrarToast('Erro de conexão com o servidor!', 'danger');
    } finally {
        // O finally SEMPRE executa, com erro ou sem erro
        // Reativa o botão independente do resultado
        btnSalvar.disabled = false;
        btnSalvar.innerHTML = '<i class="bi bi-check-circle"></i> Salvar Produto';
    }
}

// ==================================
// EDITAR PRODUTO
// ==================================

async function editarProduto(id) {
    try {
        // Busca os dados atuais do produto no servidor
        const resposta = await fetch(`${API_URL}/produtos/${id}`);
        const produto  = await resposta.json();

        // Preenche o formulário com os dados do produto
        document.getElementById('produtoId').value  = produto.id;
        document.getElementById('nome').value       = produto.nome;
        document.getElementById('descricao').value  = produto.descricao || '';
        document.getElementById('quantidade').value = produto.quantidade;
        document.getElementById('preco').value      = produto.preco;

        // Muda o visual do formulário para modo "edição"
        document.getElementById('tituloForm').textContent    = '✏️ Editando Produto';
        document.getElementById('btnSalvar').innerHTML       = '<i class="bi bi-check-circle"></i> Atualizar Produto';
        document.getElementById('btnCancelar').style.display = 'inline-block';

        // Rola a página suavemente até o formulário
        document.getElementById('formProduto')
            .scrollIntoView({ behavior: 'smooth', block: 'start' });

    } catch (erro) {
        mostrarToast('Erro ao carregar produto!', 'danger');
    }
}

// ==================================
// DELETAR PRODUTO
// ==================================

async function deletarProduto(id, nome) {

    // Pede confirmação antes de deletar
    if (!confirm(`Tem certeza que deseja deletar "${nome}"?\n\nEssa ação não pode ser desfeita.`)) {
        return; // Se clicar em Cancelar, para aqui
    }

    try {
        const resposta = await fetch(`${API_URL}/produtos/${id}`, {
            method: 'DELETE'
        });

        const resultado = await resposta.json();

        if (resposta.ok) {
            mostrarToast(resultado.mensagem, 'success');
            carregarProdutos(); // Atualiza a tabela
        } else {
            mostrarToast('Erro: ' + resultado.mensagem, 'danger');
        }

    } catch (erro) {
        mostrarToast('Erro ao deletar produto!', 'danger');
    }
}

// ==================================
// BUSCA EM TEMPO REAL
// ==================================

function filtrarProdutos() {
    const busca  = document.getElementById('busca').value.toLowerCase();
    const linhas = document.querySelectorAll('#tabelaProdutos tr');

    linhas.forEach(linha => {
        const texto = linha.textContent.toLowerCase();
        // Mostra ou esconde a linha dependendo da busca
        linha.style.display = texto.includes(busca) ? '' : 'none';
    });
}

// ==================================
// LIMPAR FORMULÁRIO
// ==================================

function limparFormulario() {
    document.getElementById('formProduto').reset(); // Limpa todos os campos
    document.getElementById('produtoId').value            = '';
    document.getElementById('tituloForm').textContent     = 'Cadastrar Novo Produto';
    document.getElementById('btnSalvar').innerHTML        = '<i class="bi bi-check-circle"></i> Salvar Produto';
    document.getElementById('btnCancelar').style.display  = 'none';
}

function cancelarEdicao() {
    limparFormulario();
}

// ==================================
// ATUALIZAR ESTATÍSTICAS DOS CARDS
// ==================================

function atualizarEstatisticas(produtos) {
    // Conta quantos produtos existem
    const totalProdutos = produtos.length;

    // Soma todas as quantidades
    const totalEstoque = produtos.reduce((soma, p) => soma + parseInt(p.quantidade), 0);

    // Soma (quantidade × preço) de cada produto
    const valorTotal = produtos.reduce((soma, p) => soma + (parseFloat(p.preco) * parseInt(p.quantidade)), 0);

    // Atualiza os cards na tela
    document.getElementById('totalProdutos').textContent = totalProdutos;
    document.getElementById('totalEstoque').textContent  = totalEstoque;
    document.getElementById('valorTotal').textContent    = formatarMoeda(valorTotal);
}

// ==================================
// NOTIFICAÇÃO (TOAST)
// ==================================

function mostrarToast(mensagem, tipo = 'success') {
    const container = document.getElementById('toastContainer');

    // Ícone muda conforme o tipo
    const icones = {
        success: 'bi-check-circle-fill',
        danger:  'bi-x-circle-fill',
        warning: 'bi-exclamation-triangle-fill'
    };

    const id = 'toast_' + Date.now(); // ID único baseado no tempo

    container.insertAdjacentHTML('beforeend', `
        <div id="${id}" class="toast align-items-center text-white bg-${tipo} border-0 show">
            <div class="d-flex">
                <div class="toast-body">
                    <i class="bi ${icones[tipo]} me-2"></i>
                    ${mensagem}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto"
                        onclick="document.getElementById('${id}').remove()">
                </button>
            </div>
        </div>
    `);

    // Remove automaticamente após 3.5 segundos
    setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.remove();
    }, 3500);
}

// ==================================
// FUNÇÕES DE FORMATAÇÃO
// ==================================

// Formata número para moeda brasileira
function formatarMoeda(valor) {
    return parseFloat(valor).toLocaleString('pt-BR', {
        style:    'currency',
        currency: 'BRL'
    });
}

// Formata data do banco para o formato brasileiro
function formatarData(dataISO) {
    if (!dataISO) return '-';
    const data = new Date(dataISO);
    return data.toLocaleDateString('pt-BR') + ' ' +
        data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

// Atualiza o relógio na navbar
function atualizarDataHora() {
    const agora  = new Date();
    const opcoes = {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    };
    document.getElementById('dataHora').textContent =
        agora.toLocaleDateString('pt-BR', opcoes);
}

// Proteção contra XSS: escapa caracteres especiais do HTML
function escapeHtml(texto) {
    if (!texto) return '';
    return texto
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}