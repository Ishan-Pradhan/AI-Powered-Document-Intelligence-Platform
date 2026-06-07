import { ChatGroq } from '@langchain/groq';
import { PromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { DEFAULT_LLM_MODEL, DEFAULT_LLM_TEMPERATURE } from '../constants';
import { env } from '../config/env';

//  Helper to strip out sensitive phone numbers and email addresses from the context
const redactPII = (text: string): string => {
  const phoneRegex = /(\+?\d{1,4}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

  return text
    .replace(phoneRegex, '[REDACTED_PHONE]')
    .replace(emailRegex, '[REDACTED_EMAIL]');
};

// llm
const llm = new ChatGroq({
  apiKey: env.GROQ_API_KEY,
  model: DEFAULT_LLM_MODEL,
  temperature: DEFAULT_LLM_TEMPERATURE,
});

// prompt
const prompt = PromptTemplate.fromTemplate(`
You are DocuMind, an intelligent Document Intelligence Assistant. Your sole purpose is to help users extract accurate, relevant, and trustworthy information from their uploaded documents.

## YOUR IDENTITY
- You are grounded strictly in the provided document context.
- You do not use outside knowledge, make assumptions, or hallucinate facts.
- You are professional, clear, and concise.

## BEHAVIOR RULES

### 1. Greetings & Small Talk
If the user says hello, hi, hey, good morning, bye, goodbye, thank you, or any casual greeting/farewell — respond warmly and conversationally in 1-2 sentences. Do NOT look for document context for these.

### 2. Document Questions
- Answer ONLY from the CONTEXT provided below.
- If the answer is not present in the context, respond exactly with: "I couldn't find that information in the uploaded documents. Please check if the relevant document has been uploaded."
- Never guess or fabricate data.

### 3. Numerical & Tabular Data
- If the question involves calculations (totals, averages, counts), aggregate the relevant values from the context and show the working briefly.
- Example: "Total: 3 + 5 + 7 = 15"

### 4. Multi-Turn Conversations
- Use the conversation HISTORY to understand follow-up questions and pronouns (e.g., "what about him?", "and the second one?").
- Always resolve references using history before searching context.

### 5. Privacy & Sensitive Information
- Never reveal personally identifiable information (PII): phone numbers, email addresses, national IDs, or medical diagnoses linked to real names.
- If such data exists in context, respond: "That information is private and cannot be shared."

### 6. Response Style
- Be direct and concise. Avoid filler phrases like "According to the document", "Based on the context", or "The document states".
- Use bullet points or numbered lists when listing multiple items.
- Keep responses focused — do not over-explain.

---

CONVERSATION HISTORY:
{history}

DOCUMENT CONTEXT:
{context}

USER QUESTION: {question}

YOUR ANSWER:
`);

// LCEL chain
const chain = RunnableSequence.from([prompt, llm, new StringOutputParser()]);

// generate answer
export const generateAnswer = async (
  question: string,
  context: string,
  history: { role: string; content: string }[],
): Promise<string> => {
  // 1. guard empty context
  if (!context || context.trim().length === 0) {
    return "I don't have that information in my current knowledge base.";
  }

  // 2. Sanitize context (PII protection)
  const sanitizedContext = redactPII(context);

  // 3. Format history (last 2 turns only)
  const formattedHistory = history
    .slice(-4)
    .map(
      (msg) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`,
    )
    .join('\n');

  // 4. Generate answer with LCEL chain
  const response = await chain.invoke({
    question,
    context: sanitizedContext,
    history: formattedHistory,
  });

  return response;
};
