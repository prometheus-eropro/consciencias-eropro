// interesse.js
export default async function handler(req, res) {
  res.status(200).json({ sucesso: true, mensagem: 'Interesse registrado com sucesso.' });
}
