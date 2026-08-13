const express = require('express');
const db      = require('./database');
const router  = express.Router();

// ========================================
// ROTA 1: LISTAR TODOS OS PRODUTOS
// ========================================
router.get('/produtos', async (req, res) => {
    try {
        const resultado = await db.query(
            'SELECT * FROM produtos ORDER BY id DESC'
        );
        res.json(resultado.rows); // No PostgreSQL os dados ficam em .rows

    } catch (erro) {
        res.status(500).json({ erro: 'Erro ao buscar produtos', detalhes: erro.message });
    }
});

// ========================================
// ROTA 2: BUSCAR UM PRODUTO POR ID
// ========================================
router.get('/produtos/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const resultado = await db.query(
            'SELECT * FROM produtos WHERE id = $1', // No PostgreSQL usa $1, $2... no lugar de ?
            [id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({ mensagem: 'Produto não encontrado' });
        }

        res.json(resultado.rows[0]);

    } catch (erro) {
        res.status(500).json({ erro: 'Erro ao buscar produto', detalhes: erro.message });
    }
});

// ========================================
// ROTA 3: CRIAR NOVO PRODUTO
// ========================================
router.post('/produtos', async (req, res) => {
    try {
        const { nome, descricao, quantidade, preco } = req.body;

        if (!nome || quantidade === undefined || !preco) {
            return res.status(400).json({ erro: 'Nome, quantidade e preço são obrigatórios' });
        }

        const resultado = await db.query(
            `INSERT INTO produtos (nome, descricao, quantidade, preco)
             VALUES ($1, $2, $3, $4)
             RETURNING id`, // RETURNING devolve o id gerado — equivalente ao insertId do MySQL
            [nome, descricao || '', quantidade, preco]
        );

        res.status(201).json({
            mensagem: 'Produto cadastrado com sucesso!',
            id: resultado.rows[0].id
        });

    } catch (erro) {
        res.status(500).json({ erro: 'Erro ao cadastrar produto', detalhes: erro.message });
    }
});

// ========================================
// ROTA 4: ATUALIZAR PRODUTO
// ========================================
router.put('/produtos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, descricao, quantidade, preco } = req.body;

        if (!nome || quantidade === undefined || !preco) {
            return res.status(400).json({ erro: 'Nome, quantidade e preço são obrigatórios' });
        }

        const resultado = await db.query(
            `UPDATE produtos
             SET nome = $1, descricao = $2, quantidade = $3, preco = $4
             WHERE id = $5`,
            [nome, descricao || '', quantidade, preco, id]
        );

        if (resultado.rowCount === 0) { // No PostgreSQL usa rowCount no lugar de affectedRows
            return res.status(404).json({ mensagem: 'Produto não encontrado' });
        }

        res.json({ mensagem: 'Produto atualizado com sucesso!' });

    } catch (erro) {
        res.status(500).json({ erro: 'Erro ao atualizar produto', detalhes: erro.message });
    }
});

// ========================================
// ROTA 5: DELETAR PRODUTO
// ========================================
router.delete('/produtos/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const resultado = await db.query(
            'DELETE FROM produtos WHERE id = $1',
            [id]
        );

        if (resultado.rowCount === 0) {
            return res.status(404).json({ mensagem: 'Produto não encontrado' });
        }

        res.json({ mensagem: 'Produto deletado com sucesso!' });

    } catch (erro) {
        res.status(500).json({ erro: 'Erro ao deletar produto', detalhes: erro.message });
    }
});

module.exports = router;
