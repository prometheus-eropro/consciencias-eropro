export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { prompt, pergunta } = req.body;

  if (!prompt || !pergunta) {
    return res.status(400).json({ error: 'Dados incompletos' });
  }

  try {
  const resposta = await fetch("https://api.openai.com/v1/chat/completions", {
   method: "POST",
   headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
  },
  body: JSON.stringify({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: prompt },
      { role: "user", content: pergunta }
    ]
  })
});
      if (!resposta.ok) {
      console.error('Erro ao consultar API OpenAI:', resposta.status, resposta.statusText);
      return res.status(500).json({ resposta: "Erro ao consultar OpenAI" });
    }

    const data = await resposta.json();

    console.log('Resposta completa:', JSON.stringify(data));

    if (!data.choices || data.choices.length === 0) {
      return res.status(500).json({ resposta: "Erro ao gerar resposta" });
    }

    return res.status(200).json({ resposta: data.choices[0].message?.content || data.choices[0].text || "Erro ao gerar resposta" });

  } catch (error) {
    console.error('Erro no processamento:', error);
    return res.status(500).json({ resposta: "Erro no servidor", detalhe: error.message });
  }
}
