/**
 * Renderizador de Markdown MÍNIMO e seguro.
 * Escapa HTML primeiro, depois aplica transformações por linha.
 * Suporta: títulos (#..###), negrito, itálico, links [t](u), listas
 * ( -, * ), citação (>), blocos de código ( ``` ), código inline (`),
 * parágrafos e quebra de linha.
 *
 * Ideal para corpo de blog institucional sem depender de libs pesadas.
 */

export function renderMarkdown(md: string): string {
  if (!md) return ''
  const lines = md.replace(/\r\n/g, '\n').split('\n')
  const out: string[] = []
  let inList = false
  let inCode = false
  let para: string[] = []

  const flushPara = () => {
    if (para.length) {
      out.push(`<p>${para.join(' ')}</p>`)
      para = []
    }
  }
  const closeList = () => {
    if (inList) {
      out.push('</ul>')
      inList = false
    }
  }

  for (const raw of lines) {
    const line = raw

    // Bloco de código
    if (line.trim().startsWith('```')) {
      flushPara()
      closeList()
      if (inCode) {
        inCode = false
        out.push('</code></pre>')
      } else {
        inCode = true
        out.push('<pre><code>')
      }
      continue
    }
    if (inCode) {
      out.push(esc(line))
      continue
    }

    if (!line.trim()) {
      flushPara()
      closeList()
      continue
    }

    // Títulos
    const h = line.match(/^(#{1,3})\s+(.*)$/)
    if (h) {
      flushPara()
      closeList()
      const level = h[1].length
      out.push(`<h${level}>${inline(h[2])}</h${level}>`)
      continue
    }

    // Citação
    if (/^>\s?/.test(line)) {
      flushPara()
      closeList()
      out.push(`<blockquote>${inline(line.replace(/^>\s?/, ''))}</blockquote>`)
      continue
    }

    // Lista
    if (/^[-*]\s+/.test(line)) {
      flushPara()
      if (!inList) {
        out.push('<ul>')
        inList = true
      }
      out.push(`<li>${inline(line.replace(/^[-*]\s+/, ''))}</li>`)
      continue
    }

    // Parágrafo
    para.push(inline(line))
  }

  if (inCode) out.push('</code></pre>')
  closeList()
  flushPara()

  return out.join('\n')
}

/** Escapa HTML primeiro (segurança contra XSS). */
function esc(s: string): string {
  return s
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
}

/** Inline: negrito, itálico, código, link — depois de escapar. */
function inline(s: string): string {
  let out = esc(s)
  // código inline
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>')
  // links [texto](url) — só http/https/mailto para evitar javascript:
  out = out.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+|mailto:[^\s)]+)\)/g, (_m, t, u) => {
    return /^https?:|^mailto:/.test(u) ? `<a href="${u}" rel="noopener noreferrer">${t}</a>` : t
  })
  // negrito
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  // itálico
  out = out.replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>')
  return out
}
