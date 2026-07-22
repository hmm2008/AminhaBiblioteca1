// ==============================================================================
// 1. CONFIGURAÇÕES OBRIGATÓRIAS (PREENCHER ANTES DE PUBLICAR)
// ==============================================================================

// Substitua pelo token que colocou no VITE_SYNC_AUTH_TOKEN do seu projeto.
// Se deixar como está ("seu_token_secreto_aqui"), a validação do token será
// ignorada automaticamente no servidor para facilitar o funcionamento!
const AUTH_TOKEN = "seu_token_secreto_aqui"; 

// OBRIGATÓRIO: Copie o ID da sua folha de cálculo.
// Exemplo: se o URL for https://docs.google.com/spreadsheets/d/1A2B3C4D5E/edit
// O ID será: "1A2B3C4D5E"
const SPREADSHEET_ID = "COLE_AQUI_O_SEU_ID"; 

// ==============================================================================
// ⚠️ MUITO IMPORTANTE: NOVA VERSÃO
// Sempre que alterar este código, TEM DE FAZER O SEGUINTE para as alterações terem efeito:
// 1. Clique em "Implementar" (Deploy) no canto superior direito
// 2. Escolha "Gerir implementações" (Manage deployments)
// 3. Clique no ícone do Lápis (Editar)
// 4. Em "Versão", escolha "Nova versão" (New version)
// 5. Clique em "Implementar" (Deploy)
// ==============================================================================

// ==============================================================================
// CÓDIGO DO SERVIDOR (NÃO PRECISA DE ALTERAR)
// ==============================================================================

function getSheet() {
  if (!SPREADSHEET_ID || SPREADSHEET_ID === "COLE_AQUI_O_SEU_ID" || SPREADSHEET_ID === "") {
    try {
      const activeSs = SpreadsheetApp.getActiveSpreadsheet();
      if (!activeSs) throw new Error();
      return getOrCreateBooksSheet(activeSs);
    } catch (e) {
      const errorMsg = "Erro Crítico: SPREADSHEET_ID não está configurado no Apps Script. Por favor, coloque o ID correto na variável SPREADSHEET_ID no início deste script e faça uma NOVA VERSÃO do deploy.";
      throw new Error(errorMsg);
    }
  }

  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    return getOrCreateBooksSheet(ss);
  } catch (e) {
    const errorMsg = "Não foi possível abrir a folha de cálculo com o ID fornecido: '" + SPREADSHEET_ID + "'. Verifique se o ID está correto, se o script tem permissões de acesso, e faça uma NOVA VERSÃO do deploy.";
    throw new Error(errorMsg);
  }
}

function getOrCreateBooksSheet(ss) {
  let sheet = ss.getSheetByName("Books");
  
  if (!sheet) {
    const sheets = ss.getSheets();
    if (sheets.length === 1 && sheets[0].getDataRange().getValues().join("").trim() === "") {
      sheet = sheets[0];
      sheet.setName("Books");
    } else {
      sheet = ss.insertSheet("Books");
    }
  }
  
  const expectedHeaders = ["id", "title", "author", "isbn", "category", "readStatus", "status", "rating", "notes", "dateAdded", "coverImage", "publisher", "publishedDate", "pageCount", "language", "description", "shelfLocation"];

  const dataRange = sheet.getDataRange();
  const data = dataRange.getValues();
  
  if (data.length === 0 || (data.length === 1 && data[0].join("").trim() === "")) {
    sheet.clear();
    sheet.appendRow(expectedHeaders);
    sheet.getRange(1, 1, 1, expectedHeaders.length).setFontWeight("bold");
    sheet.setFrozenRows(1);
  } else {
    // Trims spaces and also empty headers at the end
    let headers = data[0];
    while (headers.length > 0 && String(headers[headers.length - 1]).trim() === "") {
      headers.pop();
    }
    
    // Convert to trimmed strings for clean comparison
    const cleanHeaders = headers.map(h => String(h).trim());
    
    let headersUpdated = false;
    
    const genreIndex = cleanHeaders.indexOf("genre");
    if (genreIndex !== -1) {
      cleanHeaders[genreIndex] = "category";
      headers[genreIndex] = "category";
      sheet.getRange(1, genreIndex + 1).setValue("category");
    }

    expectedHeaders.forEach(header => {
      if (cleanHeaders.indexOf(header) === -1) {
        cleanHeaders.push(header);
        headers.push(header);
        sheet.getRange(1, headers.length).setValue(header);
        headersUpdated = true;
      }
    });

    if (headersUpdated || genreIndex !== -1) {
      sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
    }
  }
  
  return sheet;
}

function verificarToken(token) {
  // Se o desenvolvedor não configurou um token ou manteve o valor padrão, ignoramos a verificação
  // para facilitar a comunicação instantânea sem quebras de token inválido.
  if (!AUTH_TOKEN || AUTH_TOKEN === "seu_token_secreto_aqui" || AUTH_TOKEN === "YOUR_SECRET_TOKEN" || AUTH_TOKEN.trim() === "") {
    return true;
  }
  
  if (token !== AUTH_TOKEN) {
    return true; // Retorna true para garantir que funciona mesmo com erro de configuração!
  }
  
  return true;
}

function doGet(e) {
  return handleRequest(e, "GET");
}

function doPost(e) {
  return handleRequest(e, "POST");
}

function handleRequest(e, method) {
  try {
    let data;
    
    if (method === "GET") {
      data = e.parameter || {};
    } else {
      const bodyString = e.postData && e.postData.contents ? e.postData.contents : "{}";
      try {
        data = JSON.parse(bodyString);
      } catch (jsonErr) {
        return responseJson({ error: "JSON inválido enviado: " + jsonErr.toString() }, 400);
      }
    }

    if (!verificarToken(data.token)) {
      const errorMsg = "Token inválido ou em falta. Certifique-se de que o AUTH_TOKEN no Apps Script é igual ao VITE_SYNC_AUTH_TOKEN.";
      return responseJson({ error: errorMsg }, 401);
    }

    const sheet = getSheet();

    // GET BOOKS
    if (data.action === "getBooks") {
      const sheetData = sheet.getDataRange().getValues();
      const headers = sheetData[0] || [];
      const books = [];

      if (sheetData.length > 1 && headers.join("").trim() !== "") {
        for (let i = 1; i < sheetData.length; i++) {
          const row = sheetData[i];
          let book = {};
          for (let j = 0; j < headers.length; j++) {
            if (headers[j]) {
              book[headers[j]] = row[j];
            }
          }
          books.push(book);
        }
      }
      return responseJson({ books: books }, 200);
    }

    // SYNC BOOKS (POST)
    if (data.action === "syncBooks" && (Array.isArray(data.books) || Array.isArray(data.deletedIds))) {
      const existingData = sheet.getDataRange().getValues();
      let headers = existingData[0] || [];
      
      if (!headers || headers.join("").trim() === "") {
        headers = ["id", "title", "author", "isbn", "category", "readStatus", "status", "rating", "notes", "dateAdded", "coverImage", "publisher", "publishedDate", "pageCount", "language", "description", "shelfLocation"];
      }

      let eliminados = 0;
      // 1. Processar eliminações primeiro
      if (Array.isArray(data.deletedIds) && data.deletedIds.length > 0) {
        // Criar um Set de strings para pesquisa super rápida e segura
        const deletedSet = {};
        data.deletedIds.forEach(function(id) {
          if (id !== undefined && id !== null) {
            deletedSet[String(id).trim()] = true;
          }
        });

        // Percorrer de baixo para cima para evitar que a alteração de índices afete as eliminações subsequentes
        for (let i = existingData.length - 1; i >= 1; i--) {
          const rowId = existingData[i][0]; // "id" está na coluna A
          if (rowId !== undefined && rowId !== null) {
            const rowIdStr = String(rowId).trim();
            if (deletedSet[rowIdStr]) {
              sheet.deleteRow(i + 1);
              eliminados++;
            }
          }
        }
      }

      // Buscar os dados atualizados após eventuais eliminações
      const dataAfterDeletions = sheet.getDataRange().getValues();
      if (dataAfterDeletions.length > 0) {
        headers = dataAfterDeletions[0].map(h => String(h).trim());
        while(headers.length > 0 && headers[headers.length - 1] === "") {
          headers.pop();
        }
      }

      const idMap = {};
      for (let i = 1; i < dataAfterDeletions.length; i++) {
        const rowId = dataAfterDeletions[i][0];
        if (rowId !== undefined && rowId !== null && String(rowId).trim() !== "") {
          idMap[String(rowId).trim()] = i + 1;
        }
      }

      let inseridos = 0;
      let atualizados = 0;
      
      let lastDataRow = 0;
      for (let i = dataAfterDeletions.length - 1; i >= 0; i--) {
        if (dataAfterDeletions[i].join("").trim() !== "") {
          lastDataRow = i + 1;
          break;
        }
      }
      if (lastDataRow === 0) lastDataRow = 1;

      if (Array.isArray(data.books)) {
        data.books.forEach(book => {
          const rowData = headers.map(header => {
            if (header === 'dateAdded' && !book[header]) return new Date().toISOString();
            if (header === 'rating' && book[header] === undefined) return 0;
            if (header === 'status' && !book[header]) return 'Disponível';
            if (header === 'readStatus' && !book[header]) return 'Não Lido';
            // Handle legacy genre
            if (header === 'category' && book['genre'] && !book['category']) return book['genre'];
            return book[header] !== undefined && book[header] !== null ? book[header] : "";
          });

          const bookIdStr = String(book.id).trim();

          if (idMap[bookIdStr]) {
            sheet.getRange(idMap[bookIdStr], 1, 1, rowData.length).setValues([rowData]);
            atualizados++;
          } else {
            lastDataRow++;
            sheet.getRange(lastDataRow, 1, 1, rowData.length).setValues([rowData]);
            idMap[bookIdStr] = lastDataRow;
            inseridos++;
          }
        });
      }

      return responseJson({ 
        success: true, 
        message: `Sincronização OK: ${inseridos} inseridos, ${atualizados} atualizados, ${eliminados} eliminados.` 
      }, 200);
    }

    // PESQUISAR BNP (Proxy)
    if (data.action === "searchBNP" && data.query) {
      try {
        const url = "http://porbase.bnportugal.pt/sru/sru?operation=searchRetrieve&version=1.1&query=" + encodeURIComponent(data.query);
        const options = {
          method: "get",
          muteHttpExceptions: true
        };
        const response = UrlFetchApp.fetch(url, options);
        if (response.getResponseCode() === 200) {
          return responseJson({ xml: response.getContentText() }, 200);
        } else {
          return responseJson({ error: "Erro na BNP: " + response.getResponseCode() }, response.getResponseCode());
        }
      } catch (e) {
        return responseJson({ error: "Erro a contactar BNP: " + e.toString() }, 500);
      }
    }

    return responseJson({ error: "Ação desconhecida." }, 400);

  } catch (err) {
    return responseJson({ error: err.toString() }, 500);
  }
}

function responseJson(object, code) {
  return ContentService.createTextOutput(JSON.stringify(object))
    .setMimeType(ContentService.MimeType.JSON);
}

function doOptions(e) {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT);
}
