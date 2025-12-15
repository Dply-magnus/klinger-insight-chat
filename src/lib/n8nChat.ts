// n8n Webhook URL
const N8N_WEBHOOK_URL = "https://dplymf.app.n8n.cloud/webhook/17f8c6a4-897f-4201-bd1a-6e9374231fec";

export interface ChatImage {
  id: string;
  url: string;
  title: string;
  page?: number;
  pdfUrl?: string;
}

// Generera eller hämta session-ID
export function getOrCreateSessionId(): string {
  let sessionId = sessionStorage.getItem('klinger-chat-session');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem('klinger-chat-session', sessionId);
  }
  return sessionId;
}

// Extrahera sidnummer från text
function extractPageNumber(text: string): number | undefined {
  const match = text.match(/page[_-]?(\d+)|sida[_-]?(\d+)|p(\d+)/i);
  return match ? parseInt(match[1] || match[2] || match[3], 10) : undefined;
}

// Bildextraktion från markdown-svar
export function extractImages(content: string): ChatImage[] {
  const images: ChatImage[] = [];
  
  // Klickbara bilder: [![alt](img-url)](pdf-url)
  const clickableImageRegex = /\[!\[([^\]]*)\]\(([^)]+)\)\]\(([^)]+)\)/g;
  // Vanliga bilder: ![alt](url)
  const simpleImageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  
  let match;
  while ((match = clickableImageRegex.exec(content)) !== null) {
    const [, alt, imgUrl, pdfUrl] = match;
    images.push({ 
      id: `img-${images.length}`, 
      url: imgUrl, 
      title: alt || "Dokumentbild", 
      page: extractPageNumber(alt || pdfUrl), 
      pdfUrl 
    });
  }
  
  const contentWithoutClickable = content.replace(clickableImageRegex, '');
  while ((match = simpleImageRegex.exec(contentWithoutClickable)) !== null) {
    const [, alt, url] = match;
    images.push({ 
      id: `img-${images.length}`, 
      url, 
      title: alt || "Dokumentbild", 
      page: extractPageNumber(alt || url) 
    });
  }
  return images;
}

// Markdown-parsning till HTML
export function parseMarkdown(text: string): string {
  const placeholders: string[] = [];
  const addPlaceholder = (content: string) => { 
    placeholders.push(content); 
    return `§§§PLACEHOLDER_${placeholders.length - 1}§§§`; 
  };

  let html = text;
  
  // Extrahera PDF-länkar från klickbara bilder innan vi tar bort dem
  const pdfLinks: { title: string; url: string }[] = [];
  const clickableImageRegex = /\[!\[([^\]]*)\]\(([^)]+)\)\]\(([^)]+)\)/g;
  let match;
  while ((match = clickableImageRegex.exec(text)) !== null) {
    const [, alt, , pdfUrl] = match;
    // Extrahera filnamn och sida från alt-texten eller URL:en
    const pageMatch = pdfUrl.match(/#page=(\d+)/);
    const filenameMatch = alt.match(/([^/]+\.pdf)/i) || pdfUrl.match(/([^/]+\.pdf)/i);
    if (filenameMatch) {
      const filename = filenameMatch[1];
      const page = pageMatch ? pageMatch[1] : null;
      const title = page ? `${filename} (sida ${page})` : filename;
      pdfLinks.push({ title, url: pdfUrl });
    }
  }
  
  // Ta bort bilder (visas separat i ImagePanel)
  html = html.replace(/\[!\[([^\]]*)\]\(([^)]+)\)\]\(([^)]+)\)\s*/g, '');
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)\s*/g, '');
  html = html.replace(/\n{3,}/g, '\n\n');

  // Skydda markdown-länkar
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, t, u) => {
    // Validera URL-protokoll för säkerhet
    if (!/^https?:\/\//i.test(u)) return t;
    return addPlaceholder(`<a href="${u}" target="_blank" rel="noopener" class="text-primary underline hover:no-underline">${t}</a>`);
  });
  // Skydda råa URLs
  html = html.replace(/https?:\/\/[^\s<>"]+/g, (m) => 
    addPlaceholder(`<a href="${m}" target="_blank" rel="noopener" class="text-primary underline hover:no-underline">${m}</a>`)
  );

  // Escape HTML
  html = html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // Formatering
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/__(.+?)__/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  html = html.replace(/_(.+?)_/g, "<em>$1</em>");
  html = html.replace(/`([^`]+)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-xs">$1</code>');
  html = html.replace(/\n/g, "<br />");

  // Återställ placeholders
  placeholders.forEach((c, i) => { 
    html = html.replace(`§§§PLACEHOLDER_${i}§§§`, c); 
  });
  
  // Lägg till PDF-länkar längst ner om det finns några
  if (pdfLinks.length > 0) {
    const pdfLinksHtml = pdfLinks.map(link => 
      `<a href="${link.url}" target="_blank" rel="noopener" class="text-primary underline hover:no-underline">PDF: ${link.title}</a>`
    ).join('<br />');
    html = html.trim() + `<br /><br /><span class="text-xs opacity-80">${pdfLinksHtml}</span>`;
  }
  
  return html;
}

// Skicka meddelande till n8n
export async function sendMessageToN8n(message: string, sessionId: string): Promise<string> {
  const response = await fetch(N8N_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'sendMessage',
      sessionId,
      chatInput: message,
    }),
  });

  if (!response.ok) {
    throw new Error(`n8n error: ${response.status}`);
  }

  const data = await response.json();
  // Returnera text från prioriterade fält
  return data.output || data.text || data.response || data.message || '';
}
