# Security Boundaries for OpenClaw

Load this when touching auth, payments, API routes, or LLM prompts.

## Never-Commit List

Files that MUST NOT enter git:
- `.env`, `.env.local`, `.env.production`, `.env.development`
- Any file with an actual API key, token, or password
- `node_modules/`, `.next/`, `.vercel/`
- Credit card numbers in test data — use Stripe test cards

If a secret is accidentally committed, treat it as compromised:
1. Rotate the secret immediately at the provider.
2. Force-remove from git history (requires team coordination).
3. Report to the team.

## Payment Boundary

- Credit cards NEVER reach our server.
- Use Stripe Elements iframe → PaymentIntent.
- We store `last4`, `brand`, `exp_month`, `exp_year` only (non-PCI).
- Our PCI scope: SAQ-A only (3rd-party hosted payment).

## LLM Prompt Boundary

- NEVER inject secrets into the system prompt or tool descriptions.
- Wrap user input in `<user_input>...</user_input>` tags (spotlighting defense).
- Wrap tool results in `<tool_result>...</tool_result>` tags.
- Validate all LLM tool call arguments with Zod before executing.
- Validate all LLM final responses with Zod when feasible.

## Database Queries

- NEVER concatenate user input into SQL strings.
- Use the Supabase typed client — it parameterizes automatically.
- Restrict database access via RLS (Row Level Security) policies.
- User can only read/write their own `bookings`, `profiles`, `sessions`.

## API Routes

Every route handler in `src/app/api/*` MUST:

1. Validate the request body with Zod.
2. Check authentication (via Supabase session) unless explicitly public.
3. Rate-limit via Upstash (to be added in later step).
4. Return structured errors (no stack traces in production).
5. Use idempotency keys for any mutation that charges money.

## Logging

- Log levels: `debug`, `info`, `warn`, `error`.
- NEVER log: passwords, tokens, credit cards, full names, emails, booking IDs.
- Sentry captures errors — make sure `beforeSend` hook strips PII.

## Webhook Handling

- Always verify the webhook signature (Stripe, LiteAPI).
- Use raw body for signature verification (not parsed JSON).
- Return 200 within 5 seconds — process heavy work in background job.