// server.js completo e revisado para Render.com com CSV dinâmico, logs e API OpenAI GPT-3.5 Turbo

const fs = require('fs');
if (!fs.existsSync('logs')) {
    fs.mkdirSync('logs');
}

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const OpenAI = require('openai');
const csvParser = require('csv-parser');
const axios = require('axios');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 10000;

// ====================== CSV ===========================
let usuarios = [];

function carregarCSV(callback) {
    const resultados = [];
    const filePath = path.join(__dirname, 'public', 'usuarios.csv'); // Corrigido

    fs.createReadStream(filePath)
        .on('error', (err) => {
            console.error('Erro ao ler CSV:', err);
            if (callback) callback(err);
        })
        .pipe(csvParser())
        .on('data', (data) => resultados.push(data))
        .on('end', () => {
            usuarios = resultados;
            console.log('CSV carregado com sucesso!');
            if (callback) callback(null);
        });
}

// Carregar ao iniciar
carregarCSV();

// Atualizar CSV a cada requisição de login ou chat
function atualizarCSV() {
    return new Promise((resolve, reject) => {
        carregarCSV((err) => {
            if (err) return reject(err);
            resolve();
        });
    });
}

// ====================== Logs =========================
function registrarVisita(data) {
    const logLine = `${new Date().toISOString()} - ${data}\n`;
    fs.appendFile('logs/visitas.log', logLine, (err) => {
        if (err) console.error('Erro ao registrar visita:', err);
    });
}

function registrarLog(tipo, mensagem, usuario = 'Sistema') {
    const logData = {
        tipo: tipo,
        usuario: usuario,
        detalhes: mensagem
    };

    axios.post('https://script.google.com/macros/s/AKfycbz2Nz9MdsM-0g5CQWwIglNjyu4oq9Cx1Sc4-VSje4tamQNzxJP7hy61hr2YvugLXs0H/exec', logData)
        .then(response => {
            console.log('Log registrado no Google Sheets com sucesso.');
        })
        .catch(error => {
            console.error('Erro ao registrar log no Google Sheets:', error);
        });
}

// ====================== API ==========================

// Rota raiz obrigatória para o Render
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Login com atualização do CSV
app.post('/api/login', async (req, res) => {
    await atualizarCSV();

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

    registrarLog('login', `Login bem-sucedido para: ${email}`, email);

    return res.status(200).json({
        sucesso: true,
        consciencias: usuario.cons_cias ? usuario.cons_cias.split(',').map(item => item.trim()) : []
    });
});

// Chat com validação e atualização do CSV
app.post('/api/chat', async (req, res) => {
    await atualizarCSV();

    const { email, senha, mensagens, consciencia } = req.body;

    if (!mensagens || !Array.isArray(mensagens)) {
        return res.status(400).json({ error: 'Mensagens inválidas.' });
    }

    const usuario = usuarios.find(u =>
        (u.email_ou_celular === email || u.email === email) &&
        u.senha === senha &&
        u.ativo.toLowerCase() === 'true'
    );

    if (!usuario) {
        registrarLog('chat', `Tentativa de chat sem autorização para: ${email}`);
        return res.status(401).json({ error: 'Acesso não autorizado.' });
    }

    const conscienciasLiberadas = usuario.cons_cias ? usuario.cons_cias.split(',').map(item => item.trim()) : [];

    if (!conscienciasLiberadas.includes(consciencia)) {
        return res.status(403).json({ error: 'Consciência não autorizada para este usuário.' });
    }

    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: mensagens
        });

        const resposta = completion.choices[0].message.content;

        registrarLog('chat', `Usuario: ${email} | Consciência: ${consciencia} | Pergunta: ${mensagens[mensagens.length - 1].content} | Resposta: ${resposta}`);

        return res.status(200).json({ resposta });
    } catch (error) {
        console.error('Erro no chat:', error);
        return res.status(500).json({ error: 'Erro ao processar a resposta.' });
    }
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

// Registro de visitas
app.post('/api/visita', (req, res) => {
    const { visitante } = req.body;

    if (!visitante) {
        return res.status(400).json({ error: 'Dados de visitante inválidos.' });
    }

    registrarVisita(visitante);
    return res.status(200).json({ sucesso: true });
});

// =================== Servidor =========================

// Rota para servir o CSV diretamente
app.get('/usuarios.csv', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'usuarios.csv'));
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
