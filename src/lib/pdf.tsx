import { renderToStaticMarkup } from 'react-dom/server';
import { toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { CVPaper } from '../cv/CVRenderer';
import { buildATS } from '../cv/ats';
import type { BaseCV, CvStyleId, CvSelection } from '../types';

export const ATS_FRIENDLY_STYLES = new Set<CvStyleId>(['ledger', 'manuscript']);

const A4_W_MM = 210;
const A4_W_PX = 794;

async function rasterizeCv(cvHtml: string): Promise<{ dataUrl: string; heightPx: number }> {
  const container = document.createElement('div');
  container.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:794px;';
  container.innerHTML = cvHtml;
  document.body.appendChild(container);

  const node = container.firstElementChild as HTMLElement;
  const heightPx = node.scrollHeight;
  let dataUrl: string;
  try {
    dataUrl = await toJpeg(node, { pixelRatio: 1.5, quality: 0.92, width: A4_W_PX, height: heightPx, backgroundColor: '#ffffff' });
  } finally {
    container.remove();
  }

  return { dataUrl, heightPx };
}

function buildAndSavePdf(
  dataUrl: string,
  heightPx: number,
  atsText: string,
  safeTitle: string
): void {
  const imgHeightMm = (heightPx / A4_W_PX) * A4_W_MM;

  const doc = new jsPDF({ unit: 'mm', format: [A4_W_MM, imgHeightMm] });
  doc.addImage(dataUrl, 'JPEG', 0, 0, A4_W_MM, imgHeightMm);

  if (atsText) {
    doc.setFontSize(8);
    doc.text(doc.splitTextToSize(atsText, A4_W_MM), 5, 10, { renderingMode: 'invisible' });
  }

  doc.save(`${safeTitle}.pdf`);
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

  // ATS-friendly styles were previously handled by print-to-PDF (text was real CSS text).
  // Now that we always rasterize, we add the hidden text layer for them too.
  const needsAtsText = atsOptimize || ATS_FRIENDLY_STYLES.has(style);
  const atsText = needsAtsText ? buildATS(base, sel) : '';

  void rasterizeCv(cvHtml).then(({ dataUrl, heightPx }) => {
    buildAndSavePdf(dataUrl, heightPx, atsText, safeTitle);
  });
}
