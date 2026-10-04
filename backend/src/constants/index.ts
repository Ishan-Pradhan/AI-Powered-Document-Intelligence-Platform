// AI & Embedding Model Configurations
export const DEFAULT_LLM_MODEL = 'openai/gpt-oss-20b';
export const DEFAULT_LLM_TEMPERATURE = 0.2;
export const DEFAULT_EMBEDDING_MODEL = 'gemini-embedding-2';

// Vector / Semantic Search limits
export const DEFAULT_VECTOR_SEARCH_LIMIT = 5;
export const CHUNK_SIZE = 1000;
export const OVERLAP = 200;
export const ROWS_PER_CHUNK = 25;
export const MAX_CONTEXT_CHARS = 12000;

// User roles
export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
} as const;

export const TWENTY_FOUR_HOURS_IN_MS = 24 * 60 * 60 * 1000;
export const ONE_HOUR_IN_MS = 60 * 60 * 1000;
export const MAX_UPLOAD_SIZE = 10 * 1024 * 1024;
