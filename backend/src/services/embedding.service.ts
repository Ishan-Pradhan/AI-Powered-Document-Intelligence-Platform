import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import dotenv from "dotenv";
import { DEFAULT_EMBEDDING_MODEL } from "../constants";

dotenv.config();

const embeddingsModel = new GoogleGenerativeAIEmbeddings({
    modelName: DEFAULT_EMBEDDING_MODEL,
});

/**
 * Generate a single vector representation for a query
 */
export const embedQueryText = async (text: string): Promise<number[]> => {
    return await embeddingsModel.embedQuery(text);
};

/**
 * Generate vectors for multiple chunk texts at once (efficient batching)
 */
export const embedChunkTexts = async (texts: string[]): Promise<number[][]> => {
    return await embeddingsModel.embedDocuments(texts);
};
