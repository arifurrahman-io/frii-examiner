import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import IncrementLetterPrint from "../components/increment/IncrementLetterPrint";
import { A4_HEIGHT_PX, fitLetterToPage } from "./incrementLetterFit";

const A4_WIDTH_PX = Math.round((210 * 96) / 25.4);

const wait = (ms = 0) => new Promise((resolve) => window.setTimeout(resolve, ms));

const waitForImages = async (root) => {
  const images = [...root.querySelectorAll("img")];
  await Promise.all(
    images.map((image) => {
      if (image.complete && image.naturalWidth > 0) return Promise.resolve();
      return new Promise((resolve) => {
        image.onload = resolve;
        image.onerror = resolve;
      });
    })
  );
};

const createCaptureHost = () => {
  const overlay = document.createElement("div");
  overlay.className = "il-letter-progress no-print";
  overlay.innerHTML =
    '<div class="il-letter-progress-card"><p class="il-letter-progress-title">Creating PDF</p><p class="il-letter-progress-copy">Preparing letters…</p></div>';

  const host = document.createElement("div");
  host.className = "il-letter-capture no-print";
  host.style.width = `${A4_WIDTH_PX}px`;
  host.style.height = `${A4_HEIGHT_PX}px`;

  document.body.append(overlay, host);
  return { overlay, host };
};

const setProgress = (overlay, current, total, campusName) => {
  const copy = overlay.querySelector(".il-letter-progress-copy");
  if (copy) {
    copy.textContent = `${campusName || "Shift"} · ${current} / ${total}`;
  }
};

export const sanitizeLetterFilename = (value) =>
  String(value || "increment-letters")
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, "_");

export const downloadShiftIncrementLettersPdf = async (
  items,
  { campusName, fiscalYear, onProgress } = {}
) => {
  if (!items?.length) {
    throw new Error("No teachers found for this shift.");
  }

  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);

  if (document.fonts?.ready) {
    await document.fonts.ready;
  }

  const { overlay, host } = createCaptureHost();
  const root = createRoot(host);
  const filename = sanitizeLetterFilename(
    `Increment-Letters-${campusName || "Shift"}-${fiscalYear || ""}.pdf`
  );

  try {
    const pdf = new jsPDF({
      unit: "mm",
      format: "a4",
      orientation: "portrait",
      compress: true,
    });

    for (let index = 0; index < items.length; index += 1) {
      const item = items[index];
      setProgress(overlay, index + 1, items.length, campusName);
      onProgress?.(index + 1, items.length);

      flushSync(() => {
        root.render(
          <IncrementLetterPrint
            teacher={item.teacher}
            letter={{
              ...item.letter,
              fiscalYear: item.letter?.fiscalYear || fiscalYear,
            }}
            evaluateeRole={item.evaluateeRole}
            criteria={item.criteria}
          />
        );
      });

      await waitForImages(host);
      await wait(40);
      const liveLetter = host.querySelector(".il-letter");
      if (liveLetter) fitLetterToPage(liveLetter);

      const page = host.querySelector(".increment-letter-page") || host;
      const canvas = await html2canvas(page, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: "#ffffff",
        width: A4_WIDTH_PX,
        height: A4_HEIGHT_PX,
        windowWidth: A4_WIDTH_PX,
        windowHeight: A4_HEIGHT_PX,
        scrollX: 0,
        scrollY: 0,
        onclone: (clonedDoc) => {
          const clonedPage = clonedDoc.querySelector(".increment-letter-page");
          if (!clonedPage) return;
          clonedPage.style.display = "block";
          clonedPage.style.width = `${A4_WIDTH_PX}px`;
          clonedPage.style.height = `${A4_HEIGHT_PX}px`;
          clonedPage.style.minHeight = `${A4_HEIGHT_PX}px`;
          clonedPage.style.maxHeight = `${A4_HEIGHT_PX}px`;
          clonedPage.style.overflow = "hidden";
          clonedPage.style.background = "#ffffff";

          const letter = clonedPage.querySelector(".il-letter");
          if (letter) fitLetterToPage(letter);
        },
      });

      const image = canvas.toDataURL("image/jpeg", 0.92);
      if (index > 0) pdf.addPage("a4", "portrait");
      pdf.addImage(image, "JPEG", 0, 0, 210, 297, undefined, "FAST");
      canvas.width = 0;
      canvas.height = 0;
    }

    pdf.save(filename);
  } finally {
    flushSync(() => {
      root.render(null);
    });
    root.unmount();
    overlay.remove();
    host.remove();
  }
};
