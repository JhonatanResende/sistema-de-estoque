// Carrega as variáveis do arquivo .env
require('dotenv').config();

const { Pool } = require('pg');

const pool = new Pool({
    host:     process.env.DB_HOST,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port:     process.env.DB_PORT
});

pool.connect((erro, client, done) => {
    if (erro) {
        console.error('❌ Erro ao conectar ao banco:', erro.message);
        return;
    }
    done();
    console.log('✅ Conectado ao banco de dados PostgreSQL!');
});

module.exports = pool;