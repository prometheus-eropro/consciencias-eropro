require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const csv = require('csv-parser');
const axios = require('axios');
const OpenAI = require('openai');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

// Links das planilhas no Google Drive
const LINK_PLANILHA_ACESSOS = 'https://drive.google.com/uc?export=download&id=12XCdxrGCujD6AIfgOTBF0uz0_mCuocsvnUSvvfVpj70';
const LINK_PLANILHA_CONSCIENCIA = 'https://drive.google.com/uc?export=download&id=1RyOi80PamsOKEomBfW42fGYSP9FBFLYMB4-giQcCK6c';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Históricos separados por visitante
const historicoConversa = {};

// Função para ler CSV online
async function lerPlanilhaCSV(link) {
  try {
    const response = await axios.get(link, { responseType: 'stream' });
    return new Promise((resolve, reject) => {
      const resultados = [];
      response.data
        .pipe(csv())
        .on('data', (data) => resultados.push(data))
        .on('end', () => resolve(resultados))
        .on('error', (err) => reject(err));
    });
  } catch (error) {
    console.error('Erro ao ler planilha:', error);
    throw error;
  }
}

// Rota de login e consulta de consciências
app.post('/api/login', async (req, res) => {
  const { emailOuCelular, senha } = req.body;

  if (!emailOuCelular || !senha) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
  }

  try {
    const acessos = await lerPlanilhaCSV(LINK_PLANILHA_ACESSOS);

    const usuario = acessos.find(u =>
      u.email_ou_celular.trim() === emailOuCelular.trim() &&
      u.senha.trim() === senha.trim() &&
      u.ativo.trim().toLowerCase() === 'sim'
    );

    if (!usuario) {
      return res.status(401).json({ error: 'Credenciais inválidas ou acesso bloqueado.' });
    }

    const conscienciasLiberadas = usuario.cons_cias
      ? usuario.cons_cias.split(',').map(item => item.trim())
      : [];

    return res.status(200).json({ consciencias: conscienciasLiberadas });

  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});

// Rota para conversar com uma consciência
app.post('/api/gpt', async (req, res) => {
  const { visitanteId, consciaId, pergunta } = req.body;

  if (!visitanteId || !consciaId || !pergunta) {
    return res.status(400).json({ error: 'Campos visitanteId, consciaId e pergunta são obrigatórios.' });
  }

  try {
    // Carregar planilha de consciências
    const consciencias = await lerPlanilhaCSV(LINK_PLANILHA_CONSCIENCIA);

    const consciencia = consciencias.find(c => c.id.trim() === consciaId.trim());

    if (!consciencia) {
      return res.status(404).json({ error: 'Consciência não encontrada.' });
    }

    // Configurar histórico
    if (!historicoConversa[visitanteId]) {
      historicoConversa[visitanteId] = [];
    }

    // Adicionar a pergunta ao histórico
    historicoConversa[visitanteId].push({ role: 'user', content: pergunta });

    // Enviar para o GPT-3.5 Turbo
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: consciencia.prompt_base },
        ...historicoConversa[visitanteId],
      ],
    });

    const resposta = completion.choices[0].message.content;

    // Adicionar resposta ao histórico
    historicoConversa[visitanteId].push({ role: 'assistant', content: resposta });

    return res.status(200).json({ resposta });

  } catch (error) {
    console.error('Erro na conversa:', error);
    return res.status(500).json({ error: 'Erro interno ao consultar a consciência.' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
