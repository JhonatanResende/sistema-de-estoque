-- =========================================
-- CRIA O BANCO DE DADOS
-- =========================================

CREATE DATABASE IF NOT EXISTS sistema_estoque;

-- Usa o banco criado
USE sistema_estoque;

-- =========================================
-- TABELA DE PRODUTOS
-- =========================================

CREATE TABLE IF NOT EXISTS produtos (

    -- ID único do produto
    id INT AUTO_INCREMENT PRIMARY KEY,

    -- Nome do produto
    nome VARCHAR(255) NOT NULL,

    -- Descrição do produto
    descricao TEXT,

    -- Quantidade em estoque
    quantidade INT DEFAULT 0,

    -- Preço do produto
    preco DECIMAL(10,2) NOT NULL,

    -- Data automática de cadastro
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);

-- =========================================
-- DADOS DE EXEMPLO
-- =========================================

INSERT INTO produtos (nome, descricao, quantidade, preco)
VALUES
('Mouse Gamer', 'Mouse RGB com 7 botões', 10, 149.90),

('Teclado Mecânico', 'Switch Blue ABNT2', 5, 299.90),

('Monitor 24"', 'Monitor Full HD 144Hz', 3, 899.90);