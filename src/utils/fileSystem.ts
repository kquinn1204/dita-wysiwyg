// File System Access API utilities with fallback

export async function saveFile(
  content: string,
  suggestedName: string,
  fileExtension: string
): Promise<void> {
  // Check if File System Access API is available
  if ('showSaveFilePicker' in window) {
    try {
      const options = {
        suggestedName,
        types: [
          {
            description: `DITA ${fileExtension.toUpperCase()} File`,
            accept: { 'text/xml': [`.${fileExtension}`] },
          },
        ],
      };

      const handle = await (window as any).showSaveFilePicker(options);
      const writable = await handle.createWritable();
      await writable.write(content);
      await writable.close();
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error('Error saving file:', err);
        throw err;
      }
    }
  } else {
    // Fallback: download as file
    const blob = new Blob([content], { type: 'text/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${suggestedName}.${fileExtension}`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

export async function openFile(accept: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const text = await file.text();
        resolve(text);
      } else {
        reject(new Error('No file selected'));
      }
    };

    input.click();
  });
}
