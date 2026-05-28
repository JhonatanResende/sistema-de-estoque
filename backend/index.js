// Importa as bibliotecas
const express    = require('express');
const cors       = require('cors');
const bodyParser = require('body-parser');
const routes     = require('./routes');

// Cria o servidor
const app = express();

// Define a porta onde o servidor vai escutar
const PORT = 3001;

// ==============================
// MIDDLEWARES
// ==============================

// Permite que o frontend fale com o backend
app.use(cors());

// Ensina o servidor a ler dados em formato JSON
app.use(bodyParser.json());

// Ensina o servidor a ler dados de formulários HTML
app.use(bodyParser.urlencoded({ extended: true }));

// ==============================
// ROTA DE TESTE
// ==============================

app.use('/api', routes);

app.get('/', (req, res) => {
    res.json({ mensagem: '🚀 Servidor funcionando!' });
});

// ==============================
// INICIA O SERVIDOR
// ==============================

app.listen(PORT, () => {
    console.log('========================================');
    console.log('🚀 SERVIDOR RODANDO!');
    console.log(`📍 Acesse: http://localhost:${PORT}`);
    console.log('========================================');
});