const PDF_PAGE_WIDTH = 595;
const PDF_PAGE_HEIGHT = 842;
const PDF_MARGIN = 48;
const PDF_BOTTOM_MARGIN = 52;
const PDF_LINE_HEIGHT = 18;

function sanitizeFileName(value, fallback = "download") {
  return (value || fallback)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || fallback;
}

function escapePdfText(text) {
  return String(text)
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/\r/g, "")
    .replace(/\n/g, " ");
}

function wrapText(text, maxChars) {
  const content = String(text || "").trim();
  if (!content) return [""];

  const words = content.split(/\s+/);
  const lines = [];
  let current = words[0] || "";

  for (let i = 1; i < words.length; i += 1) {
    const next = `${current} ${words[i]}`;
    if (next.length <= maxChars) {
      current = next;
    } else {
      lines.push(current);
      current = words[i];
    }
  }

  lines.push(current);
  return lines;
}

function buildPdfDocument(blocks) {
  const pages = [];
  let currentPage = [];
  let y = PDF_PAGE_HEIGHT - PDF_MARGIN;

  const ensureSpace = (requiredHeight) => {
    if (y - requiredHeight < PDF_BOTTOM_MARGIN) {
      pages.push(currentPage);
      currentPage = [];
      y = PDF_PAGE_HEIGHT - PDF_MARGIN;
    }
  };

  blocks.forEach((block) => {
    const fontSize = block.fontSize || 12;
    const lineHeight = block.lineHeight || Math.round(fontSize * 1.45);
    const maxChars = block.maxChars || Math.max(26, Math.floor((86 * 12) / fontSize));
    const lines = wrapText(block.text, maxChars);
    const spacingBefore = block.spacingBefore ?? 0;
    const spacingAfter = block.spacingAfter ?? 0;

    ensureSpace(spacingBefore + lines.length * lineHeight + spacingAfter);
    y -= spacingBefore;

    lines.forEach((line) => {
      currentPage.push({
        x: PDF_MARGIN,
        y,
        fontSize,
        text: line
      });
      y -= lineHeight;
    });

    y -= spacingAfter;
  });

  if (currentPage.length) {
    pages.push(currentPage);
  }

  const objects = [];
  const addObject = (body) => {
    objects.push(body);
    return objects.length;
  };

  const fontObjectId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  const pageObjectIds = [];

  const contentObjectIds = pages.map((page) => {
    const content = page
      .map(
        (line) =>
          `BT /F1 ${line.fontSize} Tf 1 0 0 1 ${line.x} ${line.y} Tm (${escapePdfText(line.text)}) Tj ET`
      )
      .join("\n");
    return addObject(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
  });

  const pagesRootId = addObject("");

  pages.forEach((_, index) => {
    const pageObjectId = addObject(
      `<< /Type /Page /Parent ${pagesRootId} 0 R /MediaBox [0 0 ${PDF_PAGE_WIDTH} ${PDF_PAGE_HEIGHT}] /Contents ${contentObjectIds[index]} 0 R /Resources << /Font << /F1 ${fontObjectId} 0 R >> >> >>`
    );
    pageObjectIds.push(pageObjectId);
  });

  objects[pagesRootId - 1] = `<< /Type /Pages /Count ${pageObjectIds.length} /Kids [${pageObjectIds
    .map((id) => `${id} 0 R`)
    .join(" ")}] >>`;

  const catalogObjectId = addObject(`<< /Type /Catalog /Pages ${pagesRootId} 0 R >>`);

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((body, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
  });

  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogObjectId} 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return new Blob([pdf], { type: "application/pdf" });
}

function triggerBrowserDownload(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function splitParagraphs(text) {
  return String(text || "")
    .split(/\n+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function downloadPdf(fileName, blocks) {
  triggerBrowserDownload(buildPdfDocument(blocks), fileName);
}

export function downloadPortfolioPdf({ studentName, department, year, visibility, bio, achievements }) {
  const blocks = [
    { text: "CampusBloom Student Portfolio", fontSize: 24, lineHeight: 30, spacingAfter: 10 },
    { text: `Student: ${studentName || "Student"}`, fontSize: 13, spacingAfter: 2 },
    { text: `Department: ${department || "Not provided"}`, fontSize: 13, spacingAfter: 2 },
    { text: `Academic Year: ${year || "Not provided"}`, fontSize: 13, spacingAfter: 2 },
    { text: `Visibility: ${visibility || "Public"}`, fontSize: 13, spacingAfter: 12 },
    { text: "Profile Summary", fontSize: 17, lineHeight: 24, spacingAfter: 6 }
  ];

  splitParagraphs(bio || "No profile summary added yet.").forEach((paragraph) => {
    blocks.push({ text: paragraph, fontSize: 12, spacingAfter: 4 });
  });

  blocks.push({ text: "Achievements", fontSize: 17, lineHeight: 24, spacingBefore: 12, spacingAfter: 6 });

  (achievements || []).forEach((achievement, index) => {
    const heading = `${index + 1}. ${achievement.title}`;
    const metadata = [
      achievement.category,
      achievement.level,
      achievement.status,
      achievement.date
    ]
      .filter(Boolean)
      .join(" | ");
    blocks.push({ text: heading, fontSize: 13, lineHeight: 20, spacingBefore: 6, spacingAfter: 2 });
    if (metadata) {
      blocks.push({ text: metadata, fontSize: 11, spacingAfter: 2 });
    }
    if (achievement.description) {
      blocks.push({ text: achievement.description, fontSize: 12, spacingAfter: 2 });
    }
    if (achievement.skills?.length) {
      blocks.push({ text: `Skills: ${achievement.skills.join(", ")}`, fontSize: 11, spacingAfter: 4 });
    }
  });

  downloadPdf(`${sanitizeFileName(studentName, "student")}-portfolio.pdf`, blocks);
}

export function downloadCertificatesPdf(certificates) {
  const blocks = [
    { text: "CampusBloom Certificate Registry", fontSize: 24, lineHeight: 30, spacingAfter: 10 },
    { text: `Generated on: ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`, fontSize: 12, spacingAfter: 12 }
  ];

  (certificates || []).forEach((certificate, index) => {
    blocks.push({ text: `${index + 1}. ${certificate.title}`, fontSize: 13, lineHeight: 20, spacingBefore: 6, spacingAfter: 2 });
    blocks.push({
      text: [certificate.category, certificate.event, certificate.type, `${certificate.sizeMB}MB`, certificate.status]
        .filter(Boolean)
        .join(" | "),
      fontSize: 11,
      spacingAfter: 2
    });
    blocks.push({
      text: `Uploaded: ${certificate.uploadedAt}`,
      fontSize: 11,
      spacingAfter: certificate.remarks ? 2 : 4
    });
    if (certificate.remarks) {
      blocks.push({ text: `Remarks: ${certificate.remarks}`, fontSize: 11, spacingAfter: 4 });
    }
  });

  downloadPdf("campusbloom-certificates-export.pdf", blocks);
}

export function downloadCertificatePdf(certificate) {
  const blocks = [
    { text: "CampusBloom Certificate Record", fontSize: 24, lineHeight: 30, spacingAfter: 10 },
    { text: certificate.title, fontSize: 18, lineHeight: 24, spacingAfter: 6 },
    { text: `Event: ${certificate.event}`, fontSize: 12, spacingAfter: 3 },
    { text: `Category: ${certificate.category}`, fontSize: 12, spacingAfter: 3 },
    { text: `Status: ${certificate.status}`, fontSize: 12, spacingAfter: 3 },
    { text: `Uploaded: ${certificate.uploadedAt}`, fontSize: 12, spacingAfter: 3 },
    { text: `File Type: ${certificate.type}`, fontSize: 12, spacingAfter: 3 },
    { text: `File Size: ${certificate.sizeMB}MB`, fontSize: 12, spacingAfter: 10 },
    { text: "Verification Remarks", fontSize: 16, lineHeight: 22, spacingAfter: 5 },
    { text: certificate.remarks || "No remarks available yet.", fontSize: 12, spacingAfter: 8 }
  ];

  downloadPdf(`${sanitizeFileName(certificate.title, "certificate")}.pdf`, blocks);
}

export function downloadCertificateJpg(certificate) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = 1600;
    canvas.height = 1120;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      reject(new Error("Unable to prepare certificate download"));
      return;
    }

    ctx.fillStyle = "#f4efe4";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "#0f766e");
    gradient.addColorStop(1, "#1d4ed8");
    ctx.fillStyle = gradient;
    ctx.fillRect(70, 70, canvas.width - 140, canvas.height - 140);

    ctx.fillStyle = "#fffaf2";
    ctx.fillRect(110, 110, canvas.width - 220, canvas.height - 220);

    ctx.strokeStyle = "#d6c4a0";
    ctx.lineWidth = 6;
    ctx.strokeRect(138, 138, canvas.width - 276, canvas.height - 276);

    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 38px Georgia";
    ctx.fillText("CampusBloom Verified Certificate", 180, 220);

    ctx.fillStyle = "#475569";
    ctx.font = "28px Arial";
    ctx.fillText(certificate.event || "Achievement Certificate", 180, 280);

    ctx.fillStyle = "#111827";
    ctx.font = "bold 58px Georgia";
    const titleLines = wrapText(certificate.title, 28);
    titleLines.slice(0, 3).forEach((line, index) => {
      ctx.fillText(line, 180, 390 + index * 74);
    });

    ctx.font = "28px Arial";
    ctx.fillStyle = "#334155";
    const metadata = [
      `Category: ${certificate.category || "N/A"}`,
      `Status: ${certificate.status || "N/A"}`,
      `Uploaded: ${certificate.uploadedAt || "N/A"}`,
      `Size: ${certificate.sizeMB || "N/A"}MB`
    ];
    metadata.forEach((line, index) => {
      ctx.fillText(line, 180, 660 + index * 52);
    });

    ctx.fillStyle = "#7c2d12";
    ctx.font = "bold 26px Arial";
    ctx.fillText("Verification Remarks", 180, 900);

    ctx.fillStyle = "#4b5563";
    ctx.font = "24px Arial";
    wrapText(certificate.remarks || "No remarks available yet.", 72)
      .slice(0, 3)
      .forEach((line, index) => {
        ctx.fillText(line, 180, 950 + index * 38);
      });

    ctx.save();
    ctx.translate(1260, 880);
    ctx.rotate(-0.12);
    ctx.strokeStyle = "#b91c1c";
    ctx.lineWidth = 8;
    ctx.strokeRect(-120, -58, 240, 116);
    ctx.fillStyle = "#b91c1c";
    ctx.font = "bold 34px Arial";
    ctx.textAlign = "center";
    ctx.fillText(certificate.status || "Verified", 0, 12);
    ctx.restore();

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Unable to generate certificate image"));
          return;
        }
        triggerBrowserDownload(blob, `${sanitizeFileName(certificate.title, "certificate")}.jpg`);
        resolve();
      },
      "image/jpeg",
      0.94
    );
  });
}
