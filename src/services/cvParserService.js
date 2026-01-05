const axios = require("axios");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

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
