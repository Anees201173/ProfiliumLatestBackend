const axios = require("axios");
const mammoth = require("mammoth");

// Try to require pdf-parse lazily and provide minimal polyfills for
// DOM classes that pdf.js expects in some serverless environments
// (Vercel's Node runtime may not provide DOMMatrix/ImageData/Path2D).
// If pdf-parse can't be loaded (native canvas bindings missing),
// we gracefully fall back and return an empty string for PDFs.
let pdfParse = null;
try {
  if (typeof global.DOMMatrix === "undefined") {
    // Minimal no-op polyfills to avoid ReferenceError during require.
    // These are intentionally light-weight: we only need them so the
    // module loads; full canvas rendering won't be available here.
    global.DOMMatrix = global.DOMMatrix || function DOMMatrix() {};
    global.ImageData = global.ImageData || class ImageData {};
    global.Path2D = global.Path2D || function Path2D() {};
  }
  // Require after polyfills are set
  // eslint-disable-next-line global-require
  pdfParse = require("pdf-parse");
} catch (err) {
  // If pdf-parse cannot be loaded (for example @napi-rs/canvas native
  // bindings not available on Vercel), keep pdfParse as null and
  // allow the rest of the app to function. CV parsing will be a no-op.
  pdfParse = null;
}

/**
 * Download a CV file (PDF or DOCX) and extract plain text.
 * This is best-effort and should never throw: on any error it returns an empty string.
 *
 * @param {string|null|undefined} cvUrl
 * @returns {Promise<string>}
 */
async function extractTextFromCv(cvUrl) {
  if (!cvUrl || typeof cvUrl !== "string") return "";

  try {
    const response = await axios.get(cvUrl, { responseType: "arraybuffer" });
    const contentType = (response.headers["content-type"] || "").toLowerCase();

    // Decide parser based on content type or file extension
    if (contentType.includes("pdf") || cvUrl.toLowerCase().endsWith(".pdf")) {
      if (!pdfParse) {
        // Running in an environment where pdf-parse (or its native deps)
        // can't be loaded. Skip parsing rather than crashing.
        return "";
      }
      const data = await pdfParse(Buffer.from(response.data));
      return (data.text || "").trim();
    }

    if (
      contentType.includes("vnd.openxmlformats-officedocument.wordprocessingml.document") ||
      cvUrl.toLowerCase().endsWith(".docx")
    ) {
      const result = await mammoth.extractRawText({ buffer: Buffer.from(response.data) });
      return (result.value || "").trim();
    }

    // Unsupported type for now
    return "";
  } catch (err) {
    // Fail silently; CV parsing is an enhancement, not critical path
    return "";
  }
}

module.exports = {
  extractTextFromCv,
};
