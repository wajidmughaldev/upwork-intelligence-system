# Upwork Official MCP Tool Map (Phase 2A Reference)

This document maps the official Upwork MCP server tools (`https://mcp.upwork.com/mcp`) used by the Upwork Opportunity Intelligence backend.

All tools are self-describing via Upwork's MCP server discovery and `get_tool_help`.

---

## 1. Security & Execution Boundaries

- **Phase 2A Policy:** Strictly **READ-ONLY**.
- **Blocked Write Tools:** `manage_proposals`, `confirm_preview`, `save_job`, `send_message`, `update_profile`, etc.
- **Token Protection:** OAuth 2.1 tokens are stored encrypted at rest server-side and never exposed to the frontend, JSON payloads, or logs.
- **Identifier Separation:** Internal Upwork `org_uid` values are kept server-side to resolve tool calls and never rendered in public-facing API responses.

---

## 2. Tool Reference Map

### A. `list_accounts`

| Attribute | Specification |
| :--- | :--- |
| **Tool Name** | `list_accounts` |
| **Classification** | **READ-ONLY** |
| **Description** | Discovers available Upwork accounts (Freelancer, Client, Agency). Must be invoked after initial OAuth exchange to identify the authenticated talent context. |
| **Parameters** | None (empty object `{}`) |
| **Account Resolution** | Evaluates the returned accounts list. Locates the account where role/type is `TALENT` (freelancer). Stores the `org_uid` server-side for scoped operations. |
| **Identifier Expectations** | None required on input. Returns account identifiers including `org_uid` and account display names. |
| **Response Fields Needed** | `org_uid` (internal server-side context), `name` / `company_name`, `account_type` / `type` (`TALENT`). |

---

### B. `get_profile`

| Attribute | Specification |
| :--- | :--- |
| **Tool Name** | `get_profile` |
| **Classification** | **READ-ONLY** |
| **Description** | Accesses authenticated freelancer profile information, highlights, work history signals, and Connects balance. |
| **Actions** | <ul><li>`get`: Full freelancer profile overview, title, skills, hourly rate.</li><li>`list_highlights`: Portfolio proof, certificates, top achievements.</li><li>`connects_balance`: Current available Connects balance.</li><li>`transactions`: Financial transaction audit history.</li></ul> |
| **Important Parameters** | <ul><li>`action` (string, required): `get` \| `list_highlights` \| `connects_balance` \| `transactions`</li><li>`org_uid` (string, required): The talent's `org_uid` resolved from `list_accounts`.</li><li>`params` (object, optional): Action-specific options.</li></ul> |
| **Identifier Expectations** | Requires valid freelancer `org_uid`. |
| **Response Fields Needed** | <ul><li>`title`: Professional profile headline.</li><li>`overview`: Summary narrative.</li><li>`skills`: Verified technical and functional skills array.</li><li>`hourly_rate`: Standard hourly billing rate.</li><li>`connects_balance`: Available balance for proposals.</li><li>`highlights` / `portfolio`: Title, description, URL, and completion evidence.</li></ul> |

---

### C. `find_jobs`

| Attribute | Specification |
| :--- | :--- |
| **Tool Name** | `find_jobs` |
| **Classification** | **READ-ONLY** |
| **Description** | Marketplace job discovery, keyword and filter search, single job detail lookup, and AI smart recommendation feed. |
| **Actions** | <ul><li>`search`: Filtered search across title, description, skills, budget, and client signals.</li><li>`get`: Fetch complete, untruncated details for a single job posting.</li><li>`smart_search`: Personalized recommendations ranked by profile fit (`mode: best_match` or `mode: most_recent`).</li></ul> |
| **Important Parameters** | <ul><li>`action` (string, required): `search` \| `get` \| `smart_search`</li><li>`org_uid` (string, required): Talent `org_uid`.</li><li>`params` (object, required):<ul><li>For `search`: `query` (string), `skills` (string[], max 5), `category` (string), `job_type` (`fixed` \| `hourly`), `budget_min`, `budget_max`, `rate_min`, `rate_max`, `experience_level` (`entry_level` \| `intermediate` \| `expert`), `verified_payment_only` (bool), `limit` (int, 1-10, default 10).</li><li>For `get`: `id` or `job_id` (numeric ID or `~02...` ciphertext reference).</li><li>For `smart_search`: `mode` (`best_match` \| `most_recent`), `limit` (int, 1-10).</li></ul></li></ul> |
| **Identifier Expectations** | <ul><li>Returns **both** numeric job IDs and `~02...` ciphertext references.</li><li>`find_jobs action=get` accepts either form transparently.</li><li>Both identifiers are normalized and preserved for proposal workflows.</li></ul> |
| **Response Fields Needed** | `id`, `ciphertext`, `title`, `description`, `category`, `job_type`, `budget`, `hourly_rate`, `skills`, `experience_level`, `connects_required`, `client` (`rating`, `total_spent`, `hire_rate`, `location`, `verified_payment`), `screening_questions`. |

---

### D. `list_freelancer_proposals`

| Attribute | Specification |
| :--- | :--- |
| **Tool Name** | `list_freelancer_proposals` |
| **Classification** | **READ-ONLY** |
| **Description** | Retrieves existing submitted proposals, client interview invitations, and active proposal status. |
| **Actions** | <ul><li>`list`: Active, archived, and submitted proposals. Note: Status `Accepted` indicates submission was validated by Upwork (not hired).</li><li>`invitations`: Received client interview or project invitations.</li><li>`get`: Single proposal details.</li><li>`get_room`: Associated messaging room reference.</li></ul> |
| **Important Parameters** | <ul><li>`action` (string, required): `list` \| `invitations` \| `get` \| `get_room`</li><li>`org_uid` (string, required): Talent `org_uid`.</li><li>`params` (object, optional): Cursor, pagination, status filters.</li></ul> |
| **Identifier Expectations** | Proposal references, job references, invitation IDs. |
| **Response Fields Needed** | `id`, `job_title`, `job_id`, `client_name`, `status`, `status_label`, `submitted_date`, `bid_amount`, `connects_used`, `cover_letter`. |

---

### E. `get_tool_help`

| Attribute | Specification |
| :--- | :--- |
| **Tool Name** | `get_tool_help` |
| **Classification** | **READ-ONLY** |
| **Description** | Introspects live JSON Schema, descriptions, actions, and constraints for any named Upwork MCP tool. |
| **Important Parameters** | `tool_name` (string, required): e.g. `"find_jobs"`, `"get_profile"`. |
| **Usage** | Validates parameter requirements dynamically before issuing calls. |

---

### F. Write Tools (Documented for Architecture — BLOCKED in Phase 2A)

The following tools are part of the official Upwork MCP server but **strictly guarded and forbidden** during Phase 2A:

#### 1. `manage_proposals`
- **Classification:** **WRITE OPERATION (Gated by explicit user confirmation)**
- **Actions:** `create`, `accept_invitation`, `decline_invitation`, `withdraw`, `edit_terms`, `send_proposal`, `acknowledge_policy`.
- **Behavior:** `create` does **NOT** submit immediately; it returns a `preview_id` requiring explicit invocation of `confirm_preview`.
- **Phase 2A Status:** **BLOCKED** by `UpworkMcpService::assertReadOnlyTool`.

#### 2. `confirm_preview`
- **Classification:** **WRITE OPERATION (Final execution)**
- **Actions:** `confirm`
- **Parameters:** `preview_id` (string, required), `type` (`"proposal"` \| `"job_posting"`, etc.).
- **Phase 2A Status:** **BLOCKED** by `UpworkMcpService::assertReadOnlyTool`.

---

## 3. Data Normalization & Identifier Rules

Upwork returns two distinct job identifiers:
1. **Ciphertext Reference:** Starts with `~02...` (e.g. `~02189a7f34c2b98e71`). Used in web URLs and job browsing.
2. **Numeric Job ID:** 64-bit integer formatted as string (e.g. `1849204918239019283`). Required for proposal drafts and submissions.

`UpworkMcpService` automatically inspects all job objects in responses and guarantees both attributes are present:
```php
$job['ciphertext'] = '~02...';
$job['numeric_id'] = '1849...';
```
If an identifier is unavailable from an endpoint, it gracefully degrades without breaking API contracts.
