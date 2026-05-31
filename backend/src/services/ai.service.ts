import { ChatGroq } from "@langchain/groq";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import dotenv from "dotenv";
import { DEFAULT_LLM_MODEL, DEFAULT_LLM_TEMPERATURE } from "../constants";

dotenv.config();

/**
 * Invokes groq via LangChain LCEL sequence to generate a grounded answer
 */
export const generateAnswer = async (
    question: string,
    context: string,
    history: { role: string; content: string }[]
): Promise<string> => {

    const model = new ChatGroq({
        apiKey: process.env.GROQ_API_KEY,
        model: DEFAULT_LLM_MODEL,
        temperature: DEFAULT_LLM_TEMPERATURE,
    });

    const prompt = PromptTemplate.fromTemplate(`
You are an expert AI assistant for a Document Intelligence Platform.

Your task is to answer the user's question strictly using ONLY the provided document context.

-------------------------------------
RULES (MANDATORY)
-------------------------------------

1. Grounding:
- Use only the information from the DOCUMENT CONTEXT.
- Do NOT use prior knowledge.
- Do NOT assume or infer beyond what is explicitly stated.

2. Missing Information:
- If the answer is not clearly found in the context, respond EXACTLY with:
  "I cannot find the answer in the uploaded documents."

3. Structured Data Handling:
- If the context includes structured rows (e.g., "Row 1: Name: X, Value: Y"):
  - Parse all relevant rows carefully
  - Perform aggregation if needed (sum, average, count, etc.)
  - Show intermediate reasoning briefly if calculations are involved

4. Answer Style:
- Be clear, concise, and factual
- Do NOT include irrelevant details
- Do NOT mention "context" or "documents" in your answer
- Do NOT hallucinate

5. Conflicting Data:
- If multiple entries conflict, mention the inconsistency and present both values

---
CONVERSATION HISTORY:
{history}

---
DOCUMENT CONTEXT:
{context}

---
USER QUESTION: {question}

YOUR GROUNDED ANSWER:
  `);

    const formattedHistory = history
        .map(msg => `${msg.role.toUpperCase()}: ${msg.content}`)
        .join("\n");

    const chain = RunnableSequence.from([
        prompt,
        model,
        new StringOutputParser()
    ]);

    return await chain.invoke({
        question,
        context,
        history: formattedHistory,
    });
};
