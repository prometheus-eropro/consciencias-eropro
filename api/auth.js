import { google } from 'googleapis';

const SHEET_ID = '12XCdxrGCujD6AIfgOTBF0uz0_mCuocsvnUSvvfVpj70';
const SHEET_NAME = 'Acessos';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  const { emailOuCelular, senha } = req.body;
  if (!emailOuCelular || !senha) return res.status(400).json({ error: 'Dados incompletos' });

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\n/g, '\n')
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const { data } = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: SHEET_NAME
    });

    const linhas = data.values.slice(1);
    const autorizado = linhas.find(([email, senhaPlan, ativo]) =>
      (email === emailOuCelular || email.replace(/\D/g, '') === emailOuCelular.replace(/\D/g, '')) &&
      senhaPlan === senha && ativo.toLowerCase() === 'sim'
    );

    if (!autorizado) return res.status(401).json({ autorizado: false });
    return res.status(200).json({ autorizado: true });

  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ error: 'Erro interno' });
  }
}