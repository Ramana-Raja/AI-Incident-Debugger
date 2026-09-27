# AI Incident Debugger

A Cloudflare-native AI-powered incident investigation assistant for a Cloudflare Software Engineer application. A developer chats with the agent, describes an incident, and the AI investigates simulated production data — logs, metrics, deployments, service status — then produces a diagnosis, remediation plan, and supports human-in-the-loop approval before simulated remediation.

## Features
- **Workers AI**: Powers the `@cf/meta/llama-3.3-70b-instruct-fp8-fast` model for intelligent incident debugging.
- **Workflows**: Durable multi-step execution for reliable investigations, pauses, and approvals.
- **Durable Objects**: Maintains isolated, per-investigation conversation and history state using SQLite.

## How to run locally

### Install dependencies
\`\`\`bash
npm install
npm install -D vitest
```

### Start development server
\`\`\`bash
npm run dev
\`\`\`
*(Opens http://localhost:5173. Requires \`wrangler login\` for Workers AI proxy).*

### Run Tests
\`\`\`bash
npm run test
\`\`\`

### Type checking
\`\`\`bash
npx tsc --noEmit
\`\`\`

## Using the UI
- Enter `checkout-service is returning 500 errors. Investigate.` to start an investigation.
- Watch the Workflow iterate through its steps on the Investigation panel.
- Wait for the Workflow to pause for approval, then click **Approve** to execute the simulated remediation.
- The UI will reset and show incident history on the side panel.

## Architecture & Security Tradeoffs
- Simulates in-memory changes without affecting infrastructure.
- Tool input schemas statically enforce safety via `zod`.
- Strict LLM instruction system to reject prompt injections.
