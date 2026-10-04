# Upwork Integration Compliance & Architecture Standards

This document establishes the official compliance rules and architectural boundaries for integrating with the Upwork MCP Server and Upwork APIs within the **Upwork Opportunity Intelligence** system, in accordance with the Upwork API & MCP Terms of Use (v2.3, effective August 13, 2026).

---

## 1. Storage & Data Lifecycle Policy

### A. OAuth Credentials & Security
- **Encrypted at Rest**: `access_token`, `refresh_token`, `client_id`, and `org_uid` MUST be stored with AES-256-CBC encryption using Laravel's application key (`APP_KEY`).
- **Non-Exposure**: Credentials, refresh tokens, and internal identifiers (such as `org_uid` or `preview_id`) MUST NEVER be returned in frontend API responses or logged in diagnostics.

### B. Upwork Content & Caching Policy
- **Maximum Cache TTL**: Any cached Upwork content (job listings, profile details, client metadata) MUST NOT exceed a 24-hour retention period.
- **Expiration & Cleanup**: Cached data must automatically expire and be deleted after 24 hours.
- **No Refetch Looping**: The application MUST NOT re-fetch content solely to reset the 24-hour cache timer.

### C. MCP Tool Output Handling
- **Task-Scoped Processing**: MCP responses are strictly task-scoped data.
- **No Permanent Raw Storage**: The application operates on the **Request → Normalize → Return Safe DTO → Discard Raw Payload** lifecycle.
- **Retention Limit**: MCP tool outputs MUST NEVER be retained for more than 30 days under any circumstances.
- **Separation of Authoring**: Upwork-derived content is kept strictly separate from locally authored user data (e.g., custom user preferences, scoring rules, or private notes).

---

## 2. Model Training & AI Usage Restrictions

- **Zero Model Training**: Upwork Content, user profile data, job descriptions, proposals, invitations, messages, or MCP outputs MUST NEVER be used for:
  - Base model training or fine-tuning.
  - Building RAG training corpora.
  - Creating vector embeddings or dataset stores for model improvement.
  - Evaluation or benchmarking datasets.
- **Inference-Only Requirement**: AI components must operate in an **inference-only / task-oriented** context. Prompt contexts containing Upwork data are ephemeral and must be discarded immediately after producing the requested user output.

---

## 3. Opportunity Intelligence Architecture Rule

To maintain full compliance and user transparency, the application MUST NOT allow an AI model to autonomously invent criteria or independently re-rank the entire marketplace.

### Approved Architecture Flow:
1. **Upwork Recommendations**: `find_jobs` (action=`smart_search`) fetches profile-matched job listings directly from Upwork.
2. **Deterministic Filtering**: Local user-defined criteria (e.g., rate thresholds, skills, location preferences) are applied via deterministic Laravel filters.
3. **Specific Job Analysis**: When a user explicitly opens or selects a specific job:
   - The system analyzes that specific job against the user's explicit, configured evaluation criteria.
   - The system highlights strengths, potential risks, and required skills.
   - The user retains 100% control over whether to save, skip, or draft a proposal.
4. **Explicit Scoring**: Opportunity Scores MUST be calculated using transparent, user-configurable evaluation criteria.

---

## 4. Minimum Data Principle & Provenance

- **Field Minimization**: Only request and expose fields strictly necessary for the product workflow. Extra fields returned by MCP tools are stripped by server-side response mappers ([UpworkResponseMapper.php](file:///C:/Users/wajid/.gemini/antigravity-ide/scratch/upwork-opportunity-intelligence/backend/app/Services/Upwork/Mappers/UpworkResponseMapper.php)).
- **Provenance Preservation**: Maintain original Upwork attribution, job references, and provenance metadata wherever presented to the user.
