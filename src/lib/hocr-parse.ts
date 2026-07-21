export type ParsedHocrWord = {
  offset: number;
  endOffset: number;
  word: string;
  nlpWord: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  orientation: string;
  lineNo: number;
  confidence: number | null;
};

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function normalize(word: string): string {
  return word.toLowerCase().replace(/[^\w]/g, "");
}

/**
 * Flattens hOCR markup into one row per word -- bounding box, line number,
 * and running character offset into the reconstructed plain-text string --
 * so word-level OCR data is queryable in the database, not just readable
 * inside the raw hOCR file.
 */
export function parseHocrWords(hocr: string): ParsedHocrWord[] {
  const words: ParsedHocrWord[] = [];
  let lineNo = 0;
  let offset = 0;

  const linePattern = /<span class='ocr_line'[^>]*>|<\/span>|<span class='ocrx_word'[^>]*title='([^']*)'[^>]*>([^<]*)<\/span>/g;
  let match: RegExpExecArray | null;

  while ((match = linePattern.exec(hocr)) !== null) {
    const [full, title, rawWord] = match;

    if (full.startsWith("<span class='ocr_line'")) {
      lineNo += 1;
      continue;
    }
    if (!title) continue;

    const bboxMatch = title.match(/bbox (\d+) (\d+) (\d+) (\d+)/);
    const confMatch = title.match(/x_wconf (\d+)/);
    if (!bboxMatch) continue;

    const word = decodeEntities(rawWord).trim();
    if (!word) continue;

    const start = offset;
    const end = start + word.length;
    offset = end + 1; // account for the space joining words in extractedText

    words.push({
      offset: start,
      endOffset: end,
      word,
      nlpWord: normalize(word),
      x1: Number(bboxMatch[1]),
      y1: Number(bboxMatch[2]),
      x2: Number(bboxMatch[3]),
      y2: Number(bboxMatch[4]),
      orientation: "H",
      lineNo: Math.max(lineNo, 1),
      confidence: confMatch ? Number(confMatch[1]) : null,
    });
  }

  return words;
}
