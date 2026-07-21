import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import https from "https";
import axios from "axios";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json());

    // API Proxy para BNP (Biblioteca Nacional de Portugal)
  app.get("/api/bnp", async (req, res) => {
    try {
      const query = req.query.query as string;
      if (!query) {
        return res.status(400).json({ error: "Missing query parameter" });
      }

      const agent = new https.Agent({
        rejectUnauthorized: false
      });
      
      const url = `http://porbase.bnportugal.pt/sru/sru?operation=searchRetrieve&version=1.1&query=${encodeURIComponent(query)}`;
      
      const response = await axios.get(url, {
        httpsAgent: agent,
        timeout: 10000,
        validateStatus: () => true, // resolve on any status
      }).catch(e => null);

      if (!response || response.status !== 200) {
        throw new Error(`BNP responded with status: ${response ? response.status : 'Network Error'}`);
      }

      const xml = response.data;
      res.send(xml);
    } catch (error: any) {
      console.error("Error proxying to BNP:", error.message);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  // API para usar o Gemini como fallback de pesquisa de livros!
  app.post("/api/ai-search", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
      }

      const { isbn, title, author } = req.body;
      if (!isbn && !title && !author) {
        return res.status(400).json({ error: "Missing search criteria" });
      }

      const ai = new GoogleGenAI({ apiKey });
      
      let prompt = "Procura a informação detalhada sobre este livro. Retorna APENAS um objeto JSON válido (sem formatação markdown) com os seguintes campos: title, author, isbn (se souberes o de 13 dígitos, senão o de 10), publisher, publishedDate (ano), pageCount (número), language (ex: pt), description, category.\n\nCritérios de pesquisa:\n";
      if (isbn) prompt += `- ISBN/EAN: ${isbn}\n`;
      if (title) prompt += `- Título: ${title}\n`;
      if (author) prompt += `- Autor: ${author}\n`;
      prompt += "\nSe não encontrares o livro ou não tiveres a certeza, retorna um JSON vazio: {}";

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash", // Updated to supported model
        contents: prompt,
        config: {
          temperature: 0.2,
          responseMimeType: "application/json",
        }
      });

      let text = response.text || "{}";
      // Sanitize potential markdown wrap
      text = text.replace(/```json/g, "").replace(/```/g, "").trim();
      
      const bookData = JSON.parse(text);
      res.json(bookData);
    } catch (error: any) {
      console.error("Error with Gemini API:", error.message);
      // Return empty JSON instead of error to allow fallback flow to continue
      res.json({});
    }
  });

  // API Proxy para scraper da Wook (script fornecido pelo utilizador)
  app.get("/api/wook", async (req, res) => {
    try {
      const isbn = req.query.isbn as string;
      if (!isbn) {
        return res.status(400).json({ erro: "ISBN não fornecido." });
      }

      const cleanIsbn = isbn.replace(/[- ]/g, '');
      if (cleanIsbn.length !== 13) {
        return res.status(400).json({ erro: "O ISBN deve conter exatamente 13 dígitos." });
      }

      const url = `https://www.wook.pt/pesquisa/${cleanIsbn}`;
      
      const { default: axios } = await import('axios');
      const cheerio = await import('cheerio');
      
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'pt-PT,pt;q=0.9,en-US;q=0.8,en;q=0.7',
          'Sec-Ch-Ua': '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
          'Sec-Ch-Ua-Mobile': '?0',
          'Sec-Ch-Ua-Platform': '"Windows"',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
          'Upgrade-Insecure-Requests': '1'
        },
        timeout: 10000
      });

      const $ = cheerio.load(response.data);
      
      // Validar se o livro foi encontrado na página de produto
      const titulo = $('.product-title').text().trim();
      if (!titulo) {
        return res.status(404).json({ erro: "Livro não encontrado ou formato de página diferente." });
      }

      const autor = $('.product-authors').text().trim();
      const editora = $('.product-publisher').text().trim();
      const preco = $('.current-price').text().trim();
      const imagem = $('.product-cover img').attr('src');

      // Extração de detalhes adicionais (Páginas, Ano, Idioma)
      let detalhes: any = {};
      $('.product-details-list-item').each((i: number, elem: any) => {
        const chave = $(elem).find('.detail-label').text().trim().replace(':', '');
        const valor = $(elem).find('.detail-value').text().trim();
        if (chave && valor) {
          detalhes[chave.toLowerCase()] = valor;
        }
      });

      res.json({
        isbn: cleanIsbn,
        titulo,
        autor,
        editora,
        preco,
        imagem,
        dimensoes: detalhes['dimensões'] || null,
        paginas: detalhes['páginas'] || null,
        idioma: detalhes['idioma'] || 'Português',
        ano: detalhes['edição ou reimpressão'] || detalhes['ano de edição'] || null,
        fonte: 'WOOK'
      });

    } catch (error: any) {
      console.error("Erro na pesquisa WOOK:", error.message);
      // Return 404 so client can ignore and continue
      res.status(404).json({ erro: `Falha na ligação: ${error.message}` });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

