# AI-Powered Document Intelligence Platform

An advanced, full-stack enterprise-grade Document Intelligence and RAG (Retrieval-Augmented Generation) system. Users can upload various documents (PDF, DOCX, XLSX), view interactive insights, and converse with an AI assistant that references the uploaded content. It also features a fully-customizable, floating AI Chat Widget that third-party sites can integrate in seconds with single-line scripts or secure Single Sign-On (SSO) authentication.

---

## Key Features

### Document Processing & Extraction
- **Multi-Format Parser**: Supports PDF (`pdf-parse-new`), Word (`mammoth` for DOCX), and Excel (`xlsx` for sheets).
- **Text Chunking & Embedding**: Extracts and structures document content into dense vectors using LangChain.
- **pgvector Vector Database**: Stores vector embeddings in PostgreSQL with similarity search capability.

### Conversational RAG Engine
- **AI Chat Room**: Interactive interface for discussing documents, generating summaries, and querying complex data tables.
- **Provider Support**: Seamlessly switch or fall back between Google Gemini (`@langchain/google-genai`) and Groq (`@langchain/groq` using Llama 3 models).
- **PII Protection**: Automatically redacts sensitive information (like emails, phone numbers, SSNs) before sending context to LLMs.

### Extensible Floating Chat Widget
- **One-Script Embedding**: Embed a customized floating assistant by including a single `<script>` tag.
- **Configurable Attributes**: Control custom branding colors, initial messages, and positioning directly via script attributes.
- **SSO & Guest Access**: Secure SSO authentication via signed HMAC tokens, alongside immediate anonymous guest capabilities.

### Security & Access Control
- **Authentication**: JWT-based auth flow (Access and Refresh tokens stored in HTTP-Only cookies) plus Google and GitHub OAuth.
- **Admin Dashboard**: Manage users, view statistics, and block/unblock accounts.
- **Rate Limiting**: Protect endpoints against abuse and API flooding.

---

## Tech Stack

### Backend
- **Node.js** & **Express** (TypeScript)
- **Sequelize ORM** (PostgreSQL & pgvector)
- **LangChain** (Google Gemini & Groq APIs)
- **Swagger / OpenAPI 3.0** (Interactive API explorer)

### Frontend
- **React 19** & **Vite** (TypeScript)
- **Tailwind CSS v4** (Modern styling & layout)
- **Zustand** (State management)
- **TanStack Query (React Query)** (Server state caching)

---

## Prerequisites

Ensure you have the following installed on your local machine:
- **Node.js** (v18.x or higher)
- **npm** (v9.x or higher)
- **Docker** (for running PostgreSQL with the `pgvector` extension)

---

## Getting Started

### 1. Database Setup (pgvector)
Run a PostgreSQL container with the `pgvector` extension enabled:
```bash
docker run --name pgvector-db -e POSTGRES_PASSWORD=ishan123 -e POSTGRES_DB=document_intelligence -p 5433:5432 -d ankane/pgvector
```

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` directory and fill in the required environment variables:
   ```env
   PORT=8080
   NODE_ENV=development

   # Database
   DB_HOST=localhost
   DB_PORT=5433
   DB_NAME=document_intelligence
   DB_USER=postgres
   DB_PASSWORD=ishan123

   # JWT Secrets
   ACCESS_TOKEN_SECRET=your_super_secret_access_token_secret
   ACCESS_TOKEN_EXPIRES_IN=15m
   REFRESH_TOKEN_SECRET=your_super_secret_refresh_token_secret
   REFRESH_TOKEN_EXPIRES_IN=7d

   # Email Configuration (Nodemailer)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_specific_password
   EMAIL_FROM="DocIntel AI <no-reply@yourdomain.com>"

   # OAuth Client Credentials
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_CALLBACK_URL=http://localhost:8080/api/v1/auth/oauth/google/callback

   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   GITHUB_CALLBACK_URL=http://localhost:8080/api/v1/auth/oauth/github/callback

   # LLM Provider Keys
   GROQ_API_KEY=your_groq_api_key
   CHAT_MODEL=llama-3.3-70b-versatile
   GOOGLE_API_KEY=your_gemini_api_key

   # Widget Security
   SSO_SHARED_SECRET=your_sso_shared_secret
   FRONTEND_URL=http://localhost:3000
   ```
4. Run database migrations to set up the schema and enable pgvector:
   ```bash
   npx sequelize-cli db:migrate
   ```
5. Start the backend development server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `frontend` directory:
   ```env
   VITE_API_URL=http://localhost:8080/api/v1
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```

---

## API Documentation & Integration

### Interactive API Explorer
Once the backend is running, you can explore, test, and view schemas for all endpoints (Auth, Document upload, Chats, Admin Panel, Widget endpoints) interactively:
- Swagger UI: [http://localhost:8080/api/docs](http://localhost:8080/api/docs)
- OpenAPI Specification: [http://localhost:8080/api/docs.json](http://localhost:8080/api/docs.json)

### Chat Widget Integration
To learn how to embed the floating chat widget on any website, configure the client theme dynamically, or set up Single Sign-On (SSO) token parameters, refer to the [Widget Integration Guide](WIDGET_INTEGRATION.md).

---

## Development Commands

### Backend Commands
- `npm run dev` — Starts the backend server with `tsx watch` for hot-reloads.
- `npm run build` — Transpiles TypeScript files to JavaScript in `dist/`.
- `npm run start` — Runs the compiled backend from `dist/index.js`.

### Frontend Commands
- `npm run dev` — Starts Vite dev server.
- `npm run build` — Compiles and bundles the application for production.
- `npm run lint` — Audits the codebase for React/ESLint warning guidelines.
