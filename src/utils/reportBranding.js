import headerLogoUrl from "../assets/frii-report-header.png";

export const INSTITUTE_NAME = "Faizur Rahman Ideal Institute";

export const BRAND = {
  navy: [15, 23, 42],
  slate: [51, 65, 85],
  muted: [100, 116, 139],
  teal: [15, 118, 110],
  line: [203, 213, 225],
};

// Source image: 717 x 121
const HEADER_LOGO_ASPECT = 717 / 121;

const getHeaderLogoSize = (pageWidth, preferredWidth = 250) => {
  const width = Math.min(pageWidth - 72, preferredWidth);
  const height = width / HEADER_LOGO_ASPECT;
  return { width, height };
};

export const drawInstituteHeaderLogo = (doc, options = {}) => {
  const {
    y = 14,
    preferredWidth = 250,
    centerX = doc.internal.pageSize.getWidth() / 2,
  } = options;
  const pageWidth = doc.internal.pageSize.getWidth();
  if (!headerLogoUrl) return null;

  const { width, height } = getHeaderLogoSize(pageWidth, preferredWidth);
  const x = centerX - width / 2;
  doc.addImage(headerLogoUrl, "PNG", x, y, width, height);
  return { x, y, width, height, bottomY: y + height };
};

const getInstituteDividerY = (baselineY) => baselineY + 5;

export const drawInstituteHeader = (doc, options = {}) => {
  const {
    y = 14,
    fontSize = 17,
    align = "center",
    color = BRAND.navy,
    x = null,
    withDivider = false,
    dividerWidth = null,
    preferredWidth = 250,
    useLogo = true,
  } = options;
  const pageWidth = doc.internal.pageSize.getWidth();
  const centerX = align === "center" ? pageWidth / 2 : x ?? pageWidth / 2;

  if (useLogo) {
    const drawn = drawInstituteHeaderLogo(doc, {
      y,
      preferredWidth,
      centerX,
    });
    if (drawn) {
      const dividerY = drawn.bottomY + 6;
      if (withDivider) {
        const width = dividerWidth ?? Math.min(pageWidth * 0.62, 420);
        const halfWidth = width / 2;
        doc.setDrawColor(...BRAND.teal);
        doc.setLineWidth(0.9);
        doc.line(centerX - halfWidth, dividerY, centerX + halfWidth, dividerY);
        return dividerY;
      }
      return drawn.bottomY;
    }
  }

  const xPos = x ?? (align === "center" ? pageWidth / 2 : x ?? 40);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(fontSize);
  doc.setTextColor(...color);
  doc.text(INSTITUTE_NAME, xPos, y + fontSize * 0.75, { align });

  const dividerY = getInstituteDividerY(y + fontSize * 0.75);
  if (withDivider) {
    const width = dividerWidth ?? Math.min(pageWidth * 0.62, 420);
    const halfWidth = width / 2;
    doc.setDrawColor(...BRAND.teal);
    doc.setLineWidth(0.9);
    doc.line(centerX - halfWidth, dividerY, centerX + halfWidth, dividerY);
  }

  return withDivider ? dividerY : y + fontSize + 4;
};

export const drawReportTitleBlock = (doc, options = {}) => {
  const {
    y,
    title = null,
    subtitle = null,
    subtitleLines = null,
    titleFontSize = 13,
    subtitleFontSize = 10.5,
    centerX = doc.internal.pageSize.getWidth() / 2,
  } = options;

  let currentY = y;

  if (title) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(titleFontSize);
    doc.setTextColor(...BRAND.navy);
    doc.text(title, centerX, currentY, { align: "center" });
    currentY += titleFontSize + 6;
  }

  const lines =
    subtitleLines ?? (subtitle ? doc.splitTextToSize(String(subtitle), 480) : []);

  if (lines.length) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(subtitleFontSize);
    doc.setTextColor(...BRAND.slate);
    lines.forEach((line) => {
      doc.text(line, centerX, currentY, { align: "center" });
      currentY += subtitleFontSize + 4;
    });
  }

  return currentY + 6;
};

export const drawProfessionalReportHeader = (doc, options = {}) => {
  const {
    y = 14,
    instituteFontSize = 17,
    withDivider = true,
    title = null,
    subtitle = null,
    subtitleLines = null,
    titleFontSize = 13,
    subtitleFontSize = 10.5,
    preferredWidth = 250,
    centerX = doc.internal.pageSize.getWidth() / 2,
  } = options;

  const headerBottomY = drawInstituteHeader(doc, {
    y,
    fontSize: instituteFontSize,
    withDivider,
    x: centerX,
    align: "center",
    preferredWidth,
    useLogo: true,
  });

  const titleStartY = title
    ? headerBottomY + 4 + titleFontSize * 0.78
    : headerBottomY + 10;

  return drawReportTitleBlock(doc, {
    y: titleStartY,
    title,
    subtitle,
    subtitleLines,
    titleFontSize,
    subtitleFontSize,
    centerX,
  });
};
