import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import dotenv from 'dotenv';
import { DEFAULT_EMBEDDING_MODEL } from '../constants';

dotenv.config();

const embeddingsModel = new GoogleGenerativeAIEmbeddings({
  modelName: DEFAULT_EMBEDDING_MODEL,
});

//  *Embed a single query string
export const embedQueryText = async (text: string): Promise<number[]> => {
  const cleaned = text.trim().length ? text.trim() : '[empty]';
  return embeddingsModel.embedQuery(cleaned);
};

// Embed multiple document chunks
export const embedChunkTexts = async (texts: string[]): Promise<number[][]> => {
  if (!texts.length) return [];

  // Sanitize texts: Gemini embeddings fail if any text is empty or whitespace-only
  const sanitizedTexts = texts.map((t) => {
    const trimmed = t?.trim();
    return trimmed && trimmed.length > 0 ? trimmed : '[empty]';
  });

  return embeddingsModel.embedDocuments(sanitizedTexts);
};
