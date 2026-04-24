import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export interface CertificatePdfData {
  studentName: string;
  courseTitle: string;
  certificateNumber: string;
  issuedAt: string;
}

export async function renderCertificatePdf(
  data: CertificatePdfData,
): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([842, 595]); // A4 landscape

  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const fontReg = await pdf.embedFont(StandardFonts.Helvetica);

  const { width, height } = page.getSize();
  const cx = width / 2;

  const gold = rgb(0.85, 0.65, 0.16);
  const dark = rgb(0.1, 0.1, 0.12);
  const mid = rgb(0.4, 0.4, 0.45);

  // Outer + inner borders
  page.drawRectangle({
    x: 30,
    y: 30,
    width: width - 60,
    height: height - 60,
    borderColor: gold,
    borderWidth: 4,
  });
  page.drawRectangle({
    x: 40,
    y: 40,
    width: width - 80,
    height: height - 80,
    borderColor: gold,
    borderWidth: 1,
  });

  drawCenteredText(page, "CERTIFICATE OF COMPLETION", {
    cx,
    y: height - 130,
    size: 14,
    font: fontBold,
    color: gold,
  });

  drawCenteredText(page, "This is to certify that", {
    cx,
    y: height - 200,
    size: 14,
    font: fontReg,
    color: mid,
  });

  drawCenteredText(page, truncate(data.studentName, 60), {
    cx,
    y: height - 270,
    size: 36,
    font: fontBold,
    color: dark,
  });

  drawCenteredText(page, "has successfully completed", {
    cx,
    y: height - 330,
    size: 14,
    font: fontReg,
    color: mid,
  });

  drawCenteredText(page, truncate(data.courseTitle, 80), {
    cx,
    y: height - 380,
    size: 22,
    font: fontBold,
    color: dark,
  });

  // Footer — issued date (left) + certificate number (right)
  const issued = formatDate(data.issuedAt);
  page.drawText(`Issued ${issued}`, {
    x: 80,
    y: 80,
    size: 10,
    font: fontReg,
    color: mid,
  });

  const certLabel = `Certificate № ${data.certificateNumber}`;
  const certLabelWidth = fontReg.widthOfTextAtSize(certLabel, 10);
  page.drawText(certLabel, {
    x: width - 80 - certLabelWidth,
    y: 80,
    size: 10,
    font: fontReg,
    color: mid,
  });

  return pdf.save();
}

type Page = ReturnType<PDFDocument["addPage"]>;
type Font = Awaited<ReturnType<PDFDocument["embedFont"]>>;

function drawCenteredText(
  page: Page,
  text: string,
  opts: {
    cx: number;
    y: number;
    size: number;
    font: Font;
    color: ReturnType<typeof rgb>;
  },
) {
  const w = opts.font.widthOfTextAtSize(text, opts.size);
  page.drawText(text, {
    x: opts.cx - w / 2,
    y: opts.y,
    size: opts.size,
    font: opts.font,
    color: opts.color,
  });
}

function truncate(s: string, max: number): string {
  return s.length <= max ? s : `${s.slice(0, max - 1).trimEnd()}…`;
}

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}
