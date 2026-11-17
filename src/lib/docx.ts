import JSZip from "jszip";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { formatPrice, slugify } from "@/lib/utils";

export const DOCX_DIR = path.join(
  process.cwd(),
  process.env.DOCX_STORAGE_DIR ?? path.join("storage", "fc"),
);

type DocxProduct = {
  id: number;
  name: string;
  slug?: string;
  brand: string;
  platform: string;
  price: number | string;
  originalPrice?: number | string | null;
  description: string;
  specifications?: string | null;
  systemRequirements?: string | null;
};

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function paragraphs(
  text: string | null | undefined,
  bullet: "•" | "■" | null,
): string {
  if (!text) return "";
  return text
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const prefix = bullet
        ? `<w:r><w:rPr><w:b/><w:color w:val="${bullet === "•" ? "E50914" : "555555"}"/></w:rPr><w:t>${bullet} </w:t></w:r>`
        : "";
      return (
        `<w:p><w:pPr><w:spacing w:after="${bullet ? 80 : 160}"${bullet ? ' w:ind w:left="360"' : " w:line=\"276\" w:lineRule=\"auto\""}/></w:pPr>` +
        prefix +
        `<w:r><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="${bullet ? 21 : 22}"/><w:color w:val="${bullet ? "222222" : "333333"}"/></w:rPr><w:t>${escapeXml(line)}</w:t></w:r></w:p>`
      );
    })
    .join("");
}

function sectionHeading(title: string): string {
  return (
    `<w:p><w:pPr><w:spacing w:before="240" w:after="120"/>` +
    `<w:pBdr><w:bottom w:val="single" w:sz="6" w:color="DDDDDD"/></w:pBdr></w:pPr>` +
    `<w:r><w:rPr><w:b/><w:color w:val="E50914"/><w:sz w:val="26"/></w:rPr><w:t>${title}</w:t></w:r></w:p>`
  );
}

function buildDocumentXml(product: DocxProduct): string {
  const name = escapeXml(product.name);
  const brand = escapeXml(product.brand);
  const platform = escapeXml(product.platform);
  const price = formatPrice(product.price);
  const original = product.originalPrice ? formatPrice(product.originalPrice) : "";
  const stock = "In Stock";
  const date = new Date().toLocaleString("en-US", {
    month: "long",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const row = (label: string, value: string, color = "333333") =>
    `<w:tr><w:tc><w:tcPr><w:tcW w:w="3000" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="F5F5F5"/></w:tcPr><w:p><w:r><w:rPr><w:b/><w:color w:val="333333"/></w:rPr><w:t>${label}</w:t></w:r></w:p></w:tc>` +
    `<w:tc><w:tcPr><w:tcW w:w="6500" w:type="dxa"/></w:tcPr><w:p><w:r><w:rPr><w:color w:val="${color}"/><w:b/></w:rPr><w:t>${value}</w:t></w:r></w:p></w:tc></w:tr>`;

  return (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>' +
    '<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="240"/></w:pPr><w:r><w:rPr><w:b/><w:color w:val="E50914"/><w:sz w:val="40"/><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/></w:rPr><w:t>TANGOLINE INC. OFFICIAL PRODUCT SPECIFICATION</w:t></w:r></w:p>' +
    `<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="400"/></w:pPr><w:r><w:rPr><w:i/><w:color w:val="666666"/><w:sz w:val="18"/></w:rPr><w:t>Generated on ${escapeXml(date)} | Authorized Authentic Gaming Hardware &amp; Software</w:t></w:r></w:p>` +
    '<w:p><w:pPr><w:pBdr><w:bottom w:val="single" w:sz="18" w:space="8" w:color="E50914"/></w:pBdr><w:spacing w:after="200"/></w:pPr><w:r><w:rPr><w:b/><w:color w:val="111111"/><w:sz w:val="32"/><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/></w:rPr><w:t>' + name + '</w:t></w:r></w:p>' +
    '<w:tbl><w:tblPr><w:tblW w:w="9500" w:type="dxa"/><w:tblBorders><w:top w:val="single" w:sz="6" w:color="CCCCCC"/><w:bottom w:val="single" w:sz="6" w:color="CCCCCC"/><w:insideH w:val="single" w:sz="4" w:color="EEEEEE"/></w:tblBorders></w:tblPr>' +
    row("Brand / Manufacturer:", brand) +
    row("Platform / Category:", platform) +
    row("Official Price:", price + (original ? ` (Original: ${original})` : ""), "E50914") +
    row("Inventory Status:", stock, "28A745") +
    "</w:tbl>" +
    sectionHeading("Overview &amp; Description") +
    paragraphs(product.description, null) +
    (product.specifications ? sectionHeading("Technical Specifications") + paragraphs(product.specifications, "•") : "") +
    (product.systemRequirements ? sectionHeading("System Requirements &amp; Requirements") + paragraphs(product.systemRequirements, "■") : "") +
    '<w:p><w:pPr><w:spacing w:before="400" w:after="80"/><w:pBdr><w:top w:val="single" w:sz="6" w:color="CCCCCC"/></w:pBdr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:sz w:val="18"/><w:color w:val="777777"/></w:rPr><w:t>Tangoline, Inc. | Saima Tower, I.I Chundrigar Road, Karachi | Support: tangoline.Inc@gmail.com</w:t></w:r></w:p>' +
    "</w:body></w:document>"
  );
}

export async function generateProductDocx(product: DocxProduct): Promise<string> {
  await mkdir(DOCX_DIR, { recursive: true });
  const fileName = `${product.slug || slugify(product.name)}-details.docx`;
  const filePath = path.join(DOCX_DIR, fileName);

  const zip = new JSZip();
  zip.file(
    "[Content_Types].xml",
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
      '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
      '<Default Extension="xml" ContentType="application/xml"/>' +
      '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>' +
      "</Types>",
  );
  zip.file(
    "_rels/.rels",
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
      '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>' +
      "</Relationships>",
  );
  zip.file("word/document.xml", buildDocumentXml(product));

  const buffer = await zip.generateAsync({ type: "nodebuffer" });
  await writeFile(filePath, buffer);
  return `fc/${fileName}`;
}

/** Resolve a legacy `docx_file` value to a file inside the private DOCX dir. */
export function resolveDocxPath(docxFile: string | null | undefined): string | null {
  if (!docxFile) return null;
  const base = path.basename(docxFile.replace(/\\/g, "/"));
  if (!base.toLowerCase().endsWith(".docx")) return null;
  const candidate = path.join(DOCX_DIR, base);
  // Prevent directory traversal: resolved path must stay inside DOCX_DIR.
  if (!candidate.startsWith(DOCX_DIR + path.sep)) return null;
  return candidate;
}

export async function docxExists(docxFile: string | null | undefined): Promise<boolean> {
  const resolved = resolveDocxPath(docxFile);
  if (!resolved) return false;
  try {
    await readFile(resolved);
    return true;
  } catch {
    return false;
  }
}

export async function removeProductDocx(docxFile: string | null | undefined): Promise<void> {
  const resolved = resolveDocxPath(docxFile);
  if (!resolved) return;
  try {
    const { unlink } = await import("node:fs/promises");
    await unlink(resolved);
  } catch {
    // Ignore missing files.
  }
}
