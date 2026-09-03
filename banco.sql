-- =========================================
-- CRIA O BANCO DE DADOS
-- =========================================

CREATE DATABASE sistema_estoque;

-- Conecta ao banco
\c sistema_estoque;

-- =========================================
-- TABELA DE PRODUTOS
-- =========================================

CREATE TABLE produtos (
    id            SERIAL PRIMARY KEY,
    nome          VARCHAR(255)  NOT NULL,
    descricao     TEXT,
    quantidade    INTEGER       NOT NULL DEFAULT 0,
    preco         DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    data_cadastro TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- DADOS DE EXEMPLO
-- =========================================

INSERT INTO produtos (nome, descricao, quantidade, preco)
VALUES
    ('Mouse Gamer', 'Mouse RGB com 7 botões', 10, 149.90),
    ('Teclado Mecânico', 'Switch Blue ABNT2', 5, 299.90),
    ('Monitor 24"', 'Monitor Full HD 144Hz', 3, 899.90);