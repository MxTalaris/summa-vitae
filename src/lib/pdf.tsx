import { renderToStaticMarkup } from 'react-dom/server';
import { toPng } from 'html-to-image';
import cvCss from '../cv/cv.css?raw';
import globalsCss from '../styles/globals.css?raw';
import { CVPaper } from '../cv/CVRenderer';
import { buildATS } from '../cv/ats';
import type { BaseCV, CvStyleId, CvSelection } from '../types';

export const ATS_FRIENDLY_STYLES = new Set<CvStyleId>(['ledger', 'manuscript']);

const BASE_PRINT_CSS = `
@page { size: A4 portrait; margin: 0; }
html, body { margin: 0; padding: 0; background: #fff; position: relative; }
.cvpaper { box-shadow: none !important; margin: 0 !important; }
`;

const ATS_LAYER_CSS = `
.sv-ats {
  position: absolute;
  top: 0; left: 0;
  width: 794px; min-height: 1123px;
  color: transparent;
  font-size: 11px; line-height: 1.5;
  white-space: pre-wrap; overflow: hidden;
  pointer-events: none;
  font-family: Arial, sans-serif;
}
`;

function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function openPrintWindow(html: string): void {
  const win = window.open('', '_blank', 'width=900,height=700');
  if (!win) return;

  win.document.open();
  win.document.write(html);
  win.document.close();

  const doPrint = () => {
    win.print();
    win.addEventListener('afterprint', () => { try { win.close(); } catch { /* ignore */ } });
  };

  if (win.document.readyState === 'complete') {
    void win.document.fonts.ready.then(doPrint).catch(doPrint);
  } else {
    win.addEventListener('load', () => void win.document.fonts.ready.then(doPrint).catch(doPrint));
  }
}

async function rasterizeAndPrint(
  cvHtml: string,
  atsText: string,
  safeTitle: string
): Promise<void> {
  // Inject the pre-rendered CV into the live document so html-to-image can
  // capture it with the app's full CSS (custom properties, loaded fonts, etc.)
  const container = document.createElement('div');
  container.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:794px;';
  container.innerHTML = cvHtml;
  document.body.appendChild(container);

  const node = container.firstElementChild as HTMLElement;
  let dataUrl: string;
  try {
    dataUrl = await toPng(node, {
      pixelRatio: 2,
      width: 794,
      height: node.scrollHeight,
    });
  } finally {
    container.remove();
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>${safeTitle}</title>
<style>
${BASE_PRINT_CSS}
img.cv-render { display: block; width: 210mm; }
${ATS_LAYER_CSS}
</style>
</head>
<body>
<img class="cv-render" src="${dataUrl}" alt="CV" />
<div class="sv-ats">${escHtml(atsText)}</div>
</body>
</html>`;

  openPrintWindow(html);
}

export function downloadCvPdf(
  base: BaseCV,
  style: CvStyleId,
  sel: CvSelection,
  accent: string,
  filename?: string,
  atsOptimize = false
): void {
  const monoAccent = accent ? `var(--${accent})` : 'var(--pink)';
  const safeTitle = (filename || base.general.name || 'CV').replace(/[<>"'&]/g, '');

  const cvHtml = renderToStaticMarkup(
    <CVPaper base={base} style={style} sel={sel} monoAccent={monoAccent} />
  );

  if (atsOptimize && !ATS_FRIENDLY_STYLES.has(style)) {
    const atsText = buildATS(base, sel);
    void rasterizeAndPrint(cvHtml, atsText, safeTitle);
    return;
  }

  // Simple path: the browser's print-to-PDF already encodes every CSS-rendered
  // character as real extractable text — no hidden layer needed.
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>${safeTitle}</title>
<style>${globalsCss}</style>
<style>${cvCss}</style>
<style>${BASE_PRINT_CSS}</style>
</head>
<body>
${cvHtml}
</body>
</html>`;

  openPrintWindow(html);
}
