// Importa o Express e a conexão com o banco
const express = require('express');
const db      = require('./database');
const router  = express.Router();

// GET /api/produtos
router.get('/produtos', (req, res) => {

    // O comando SQL que vamos executar no banco
    const sql = 'SELECT * FROM produtos ORDER BY id DESC';

    // Executa o comando no banco
    db.query(sql, (erro, resultados) => {

        // Se der algum erro, avisa o frontend
        if (erro) {
            return res.status(500).json({
                erro: 'Erro ao buscar produtos',
                detalhes: erro.message
            });
        }

        // Se deu certo, manda a lista de produtos
        res.json(resultados);
    });
});


// GET /api/produtos/1  (o :id pega qualquer número)
router.get('/produtos/:id', (req, res) => {

    // Pega o id que veio na URL  (/api/produtos/5  →  id = 5)
    const { id } = req.params;

    const sql = 'SELECT * FROM produtos WHERE id = ?';

    // O array [id] substitui o ? no SQL (segurança contra SQL Injection)
    db.query(sql, [id], (erro, resultado) => {

        if (erro) {
            return res.status(500).json({ erro: 'Erro ao buscar produto' });
        }

        // Se não achou nenhum produto com esse id
        if (resultado.length === 0) {
            return res.status(404).json({ mensagem: 'Produto não encontrado' });
        }

        // Manda só o primeiro (e único) resultado
        res.json(resultado[0]);
    });
});


// POST /api/produtos
router.post('/produtos', (req, res) => {

    // Pega os dados que vieram no corpo da requisição
    const { nome, descricao, quantidade, preco } = req.body;

    // Validação: checa se os campos obrigatórios foram enviados
    if (!nome || quantidade === undefined || !preco) {
        return res.status(400).json({
            erro: 'Nome, quantidade e preço são obrigatórios'
        });
    }

    const sql = 'INSERT INTO produtos (nome, descricao, quantidade, preco) VALUES (?, ?, ?, ?)';

    db.query(sql, [nome, descricao || '', quantidade, preco], (erro, resultado) => {

        if (erro) {
            return res.status(500).json({ erro: 'Erro ao cadastrar produto' });
        }

        // 201 = "Criado com sucesso" (diferente do 200 = "OK")
        res.status(201).json({
            mensagem: 'Produto cadastrado com sucesso!',
            id: resultado.insertId   // O id que o banco gerou automaticamente
        });
    });
});


// PUT /api/produtos/1
router.put('/produtos/:id', (req, res) => {

    const { id } = req.params;
    const { nome, descricao, quantidade, preco } = req.body;

    if (!nome || quantidade === undefined || !preco) {
        return res.status(400).json({
            erro: 'Nome, quantidade e preço são obrigatórios'
        });
    }

    const sql = `UPDATE produtos 
                SET nome = ?, descricao = ?, quantidade = ?, preco = ? 
                WHERE id = ?`;

    db.query(sql, [nome, descricao || '', quantidade, preco, id], (erro, resultado) => {

        if (erro) {
            return res.status(500).json({ erro: 'Erro ao atualizar produto' });
        }

        // affectedRows = quantas linhas foram alteradas no banco
        if (resultado.affectedRows === 0) {
            return res.status(404).json({ mensagem: 'Produto não encontrado' });
        }

        res.json({ mensagem: 'Produto atualizado com sucesso!' });
    });
});


// DELETE /api/produtos/1
router.delete('/produtos/:id', (req, res) => {

    const { id } = req.params;

    const sql = 'DELETE FROM produtos WHERE id = ?';

    db.query(sql, [id], (erro, resultado) => {

        if (erro) {
            return res.status(500).json({ erro: 'Erro ao deletar produto' });
        }

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ mensagem: 'Produto não encontrado' });
        }

        res.json({ mensagem: 'Produto deletado com sucesso!' });
    });
});

// Exporta todas as rotas para usar no index.js
module.exports = router;