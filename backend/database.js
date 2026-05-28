// Importa a biblioteca mysql2 para conectar com o banco
const mysql = require('mysql2');

require('dotenv').config();

// Cria a conexão com o banco de dados
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Tenta conectar ao banco
connection.connect((erro) => {
    if (erro) {
        console.error('❌ Erro ao conectar ao banco:', erro.message);
        return;
    }
    console.log('✅ Conectado ao banco de dados MySQL!');
});

// Exporta a conexão para usar em outros arquivos
module.exports = connection;
