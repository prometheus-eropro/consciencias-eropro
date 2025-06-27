// server.js atualizado para Render.com com CSV local, log de visitantes, formulário de interesse e chat com continuidade (versão OpenAI 5.7.0)

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Porta fixa conforme orientação
const PORT = process.env.PORT || 10000;

// Dados dos usuários (CSV local)
let usuarios = [];
function carregarCSV() {
    const resultados = [];
    fs.createReadStream(path.join(__dirname, 'data', 'users.csv'))
        .on('error', (err) => console.error('Erro ao ler CSV:', err))
        .pipe(require('csv-parser')())
        .on('data', (data) => resultados.push(data))
        .on('end', () => {
            usuarios = resultados;
            console.log('CSV carregado com sucesso!');
        });
}
carregarCSV();

// Log de visitantes
function registrarVisita(data) {
    const logLine = `${new Date().toISOString()} - ${data}\n`;
    fs.appendFile('logs/visitas.log', logLine, (err) => {
        if (err) console.error('Erro ao registrar visita:', err);
    });
}

// Log de acessos e GPT
function registrarLog(tipo, mensagem) {
    const logLine = `${new Date().toISOString()} - ${mensagem}\n`;
    fs.appendFile(`logs/${tipo}.log`, logLine, (err) => {
        if (err) console.error('Erro ao registrar log:', err);
    });
}

// Endpoint para login
app.post('/api/login', (req, res) => {
    const { email, senha } = req.body;
    const usuario = usuarios.find(u => (u.email_ou_celular === email) && (u.senha === senha) && (u.ativo.toLowerCase() === 'true'));

    if (!usuario) {
        registrarLog('login', `Tentativa de login falhou para: ${email}`);
        return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    registrarLog('login', `Login bem-sucedido para: ${email}`);

    return res.status(200).json({
        sucesso: true,
        consciencias: usuario.cons_cias ? usuario.cons_cias.split(',').map(item => item.trim()) : []
    });
});

// Endpoint para salvar formulário de interesse
app.p
