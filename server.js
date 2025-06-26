// server.js atualizado para Render.com com CSV local, log de visitantes, formulário de interesse e chat com continuidade

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

const PORT = process.env.PORT || 3000;

// Configuração da API OpenAI
const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
const openai = new OpenAIApi(configuration);

// Dados dos usuários (CSV local)
let usuarios = [];
function carregarCSV() {
    const resultados = [];
        fs.createReadStream(path.join(__dirname, 'public', 'users.csv'))
        .on('error', (err) => console.error('Erro ao ler CSV:', err))
        .on('data', (chunk) => console.log('Lendo CSV...'))
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
app.post('/api/interesse', (req, res) => {
    const { nome, contato } = req.body;
    registrarVisita(`Interesse: Nome: ${nome}, Contato: ${contato}`);
    return res.status(200).json({ sucesso: true });
});

// Endpoint para conversar com o GPT com continuidade
const historicoConversa = {};
app.post('/api/gpt', async (req, res) => {
    const { pergunta, consciaId, visitanteId } = req.body;

    if (!pergunta || !consciaId || !visitanteId) {
        return res.status(400).json({ error: 'Dados incompletos.' });
    }

    // Monta histórico
    if (!historicoConversa[visitanteId]) {
        historicoConversa[visitanteId] = [];
    }
    historicoConversa[visitanteId].push({ role: 'user', content: pergunta });

    try {
        const completion = await openai.createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages: historicoConversa[visitanteId]
        });
        const resposta = completion.data.choices[0].message.content;

        historicoConversa[visitanteId].push({ role: 'assistant', content: resposta });
        registrarLog('gpt', `Visitante ${visitanteId} perguntou: ${pergunta}`);

        return res.status(200).json({ resposta });
    } catch (err) {
        console.error('Erro na API GPT:', err);
        return res.status(500).json({ error: 'Falha ao consultar GPT.' });
    }
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
