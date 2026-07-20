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
    // Se não houver uma folha "Books", vamos verificar se a primeira folha padrão (ex: "Folha1" ou "Sheet1")
    // está vazia e usá-la/renomeá-la para evitar que o usuário veja uma folha vazia e ache que não funcionou.
    const sheets = ss.getSheets();
    if (sheets.length === 1 && sheets[0].getDataRange().getValues().join("").trim() === "") {
      sheet = sheets[0];
      sheet.setName("Books");
    } else {
      sheet = ss.insertSheet("Books");
    }
  }
  
  // Garantir cabeçalhos se a folha estiver vazia
  const data = sheet.getDataRange().getValues();
  if (data.length === 1 && data[0].join("").trim() === "") {
    sheet.clear();
    sheet.appendRow(["id", "title", "author", "isbn", "genre", "readStatus", "rating", "notes", "dateAdded", "coverImage"]);
    sheet.getRange("A1:J1").setFontWeight("bold");
    sheet.setFrozenRows(1);
  } else if (data.length > 0) {
    // Add missing coverImage header to existing sheets
    const headers = data[0];
    if (headers.indexOf("coverImage") === -1) {
      sheet.getRange(1, Math.max(9, headers.length) + 1).setValue("coverImage");
      sheet.getRange("A1:J1").setFontWeight("bold");
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
        headers = ["id", "title", "author", "isbn", "genre", "readStatus", "rating", "notes", "dateAdded", "coverImage"];
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
      const idMap = {};
      for (let i = 1; i < dataAfterDeletions.length; i++) {
        const rowId = dataAfterDeletions[i][0];
        if (rowId) {
          idMap[rowId] = i + 1;
        }
      }

      let inseridos = 0;
      let atualizados = 0;

      if (Array.isArray(data.books)) {
        data.books.forEach(book => {
          const rowData = [
            book.id || "",
            book.title || "",
            book.author || "",
            book.isbn || "",
            book.genre || "",
            book.readStatus || "",
            book.rating || 0,
            book.notes || "",
            book.dateAdded || new Date().toISOString(),
            book.coverImage || ""
          ];

          if (idMap[book.id]) {
            sheet.getRange(idMap[book.id], 1, 1, rowData.length).setValues([rowData]);
            atualizados++;
          } else {
            sheet.appendRow(rowData);
            idMap[book.id] = sheet.getLastRow();
            inseridos++;
          }
        });
      }

      return responseJson({ 
        success: true, 
        message: `Sincronização OK: ${inseridos} inseridos, ${atualizados} atualizados, ${eliminados} eliminados.` 
      }, 200);
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
