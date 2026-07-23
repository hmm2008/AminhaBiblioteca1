export interface DriveFile {
  id: string;
  name: string;
  createdTime?: string;
  size?: string;
  webViewLink?: string;
}

export const DRIVE_FOLDER_NAME = "Biblioteca Backup";

/**
 * Procura ou cria a pasta específica para backups no Google Drive.
 */
export async function getOrCreateBackupFolder(accessToken: string, folderName = DRIVE_FOLDER_NAME): Promise<string> {
  const query = encodeURIComponent(`name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`);
  
  const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!searchRes.ok) {
    const errText = await searchRes.text();
    throw new Error(`Erro ao pesquisar pasta no Google Drive: ${searchRes.statusText} (${errText})`);
  }

  const searchData = await searchRes.json();
  if (searchData.files && searchData.files.length > 0) {
    return searchData.files[0].id;
  }

  // Se não existir, cria a pasta
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder'
    })
  });

  if (!createRes.ok) {
    const errText = await createRes.text();
    throw new Error(`Erro ao criar pasta '${folderName}' no Google Drive: ${createRes.statusText} (${errText})`);
  }

  const createData = await createRes.json();
  return createData.id;
}

/**
 * Envia o ficheiro de backup em formato JSON para a pasta do Google Drive.
 */
export async function uploadBackupToDrive(
  accessToken: string,
  backupContent: string,
  folderName = DRIVE_FOLDER_NAME
): Promise<DriveFile> {
  const folderId = await getOrCreateBackupFolder(accessToken, folderName);

  const now = new Date();
  const dateStr = now.toISOString().replace(/[:.]/g, '-').slice(0, 16);
  const fileName = `biblioteca_backup_${dateStr}.json`;

  const metadata = {
    name: fileName,
    mimeType: 'application/json',
    parents: [folderId]
  };

  const boundary = 'foo_bar_baz_' + Math.random().toString(36).substring(2);
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const body =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    backupContent +
    closeDelimiter;

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,createdTime,size,webViewLink', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`
    },
    body
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Erro ao enviar ficheiro para o Google Drive: ${res.statusText} (${errText})`);
  }

  return await res.json();
}

/**
 * Lista todos os backups armazenados na pasta do Google Drive.
 */
export async function listBackupsFromDrive(
  accessToken: string,
  folderName = DRIVE_FOLDER_NAME
): Promise<DriveFile[]> {
  const folderId = await getOrCreateBackupFolder(accessToken, folderName);

  const query = encodeURIComponent(`'${folderId}' in parents and trashed = false`);
  const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&orderBy=createdTime desc&fields=files(id,name,createdTime,size,webViewLink)`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Erro ao listar backups do Google Drive: ${res.statusText} (${errText})`);
  }

  const data = await res.json();
  return data.files || [];
}

/**
 * Transfere o conteúdo JSON de um ficheiro de backup do Google Drive.
 */
export async function downloadBackupFromDrive(
  accessToken: string,
  fileId: string
): Promise<string> {
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Erro ao descarregar backup do Google Drive: ${res.statusText} (${errText})`);
  }

  return await res.text();
}
