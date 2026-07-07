import { extractText, getDocumentProxy } from 'unpdf';

/**
 * Generic interface for extracting text content from binary documents.
 * Allows support for different file formats (e.g. DOCX, TXT) in the future.
 */
export interface ResumeTextExtractor {
  /**
   * Extracts text content from a file's raw binary buffer.
   *
   * @param fileBuffer - Raw buffer of the file.
   * @returns            Extracted plain text.
   * @throws             If parsing fails or no text content is found.
   */
  extractText(fileBuffer: Buffer): Promise<string>;
}

/**
 * PDF implementation of ResumeTextExtractor using unpdf.
 */
export class PdfExtractor implements ResumeTextExtractor {
  async extractText(fileBuffer: Buffer): Promise<string> {
    try {
      const pdf = await getDocumentProxy(new Uint8Array(fileBuffer));
      const { text } = await extractText(pdf, { mergePages: true });
      
      if (!text || typeof text !== 'string') {
        throw new Error('Parser returned invalid or empty text structure.');
      }
      
      const cleanText = text
        .normalize('NFKC')
        .replace(/\u0000/g, '')
        .replace(/\r\n?/g, '\n')
        .replace(/[\u00ad\u200b-\u200d\ufeff]/g, '')
        .replace(/[ \t]+\n/g, '\n')
        .replace(/\n[ \t]+/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
      if (cleanText.length === 0) {
        throw new Error('No readable text content found inside the PDF document.');
      }
      
      return cleanText;
    } catch (err) {
      throw new Error(`PDF text extraction failed: ${(err as Error).message}`);
    }
  }
}
