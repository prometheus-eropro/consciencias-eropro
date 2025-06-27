// server.js completo e revisado para Render.com com CSV local, logs e API OpenAI GPT-3.5 Turbo

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

const PORT = process.env.PORT || 10000;

// ====================== CSV ===========================
let usuarios = [];
function carregarCSV() {
    const resultados = [];
    const filePath = path.join(__dirname, 'data', 'users.csv');
    fs.createReadStream(filePath)
        .on('error', (err) => console.error('Erro ao ler CSV:', err))
        .pipe(require('csv-parser')())
        .on('data', (data) => resultados.push(data))
        .on('end', () => {
            usuarios = resultados;
            console.log('CSV carregado com sucesso!');
        });
}
carregarCSV();

// ====================== Logs =========================
function registrarVisita(data) {
    const logLine = `${new Date().toISOString()} - ${data}\n`;
    fs.appendFile('logs/visitas.log', logLine, (err) => {
        if (err) console.error('Erro ao registrar visita:', err);
    });
}

function registrarLog(tipo, mensagem) {
    const logLine = `${new Date().toISOString()} - ${mensagem}\n`;
    fs.appendFile(`logs/${tipo}.log`, logLine, (err) => {
        if (err) console.error('Erro ao registrar log:', err);
    });
}

// ====================== API ==========================
// Login
app.post('/api/login', (req, res) => {
    const { email, senha } = req.body;

    const usuario = usuarios.find(u =>
        (u.email_ou_celular === email || u.email === email) &&
        u.senha === senha &&
        u.ativo.toLowerCase() === 'true'
    );

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

// Registro de formulário de interesse
app.post('/api/interesse', (req, res) => {
    const { nome, email, mensagem } = req.body;
    if (!nome || !email || !mensagem) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    registrarLog('interesse', `Nome: ${nome}, Email: ${email}, Mensagem: ${mensagem}`);

    return res.status(200).json({ sucesso: true, mensagem: 'Interesse registrado com sucesso.' });
});

// Chat com continuidade via OpenAI
app.post('/api/chat', async (req, res) => {
    const { mensagens } = req.body;

    if (!mensagens || !Array.isArray(mensagens)) {
        return res.status(400).json({ error: 'Mensagens inválidas.' });
    }

    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: mensagens
        });

        const resposta = completion.choices[0].message.content;

        registrarLog('chat', `Pergunta: ${mensagens[mensagens.length - 1].content} | Resposta: ${resposta}`);

        return res.status(200).json({ resposta });
    } catch (error) {
        console.error('Erro no chat:', error);
        return res.status(500).json({ error: 'Erro ao processar a resposta.' });
    }
});

// Visitas
app.post('/api/visita', (req, res) => {
    const { visitante } = req.body;

    if (!visitante) {
        return res.status(400).json({ error: 'Dados de visitante inválidos.' });
    }

    registrarVisita(visitante);
    return res.status(200).json({ sucesso: true });
});

// =================== Servidor =========================
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
