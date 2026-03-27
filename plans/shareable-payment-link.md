# Feature: Shareable Payment Link from Invoice Detail + Paid Status with Payment ID

## Context
Currently, payment links are only created during the InvoiceReview → save flow. Once an invoice is saved as a draft (e.g., via edit), there's no way to generate a payment link from the details page. Additionally, when a payment is received via Dodo webhook, the invoice status flips to 'paid' but no payment ID is stored or displayed.

## Goals
1. Add a "Create Payment Link" button on the InvoiceDetail page for invoices without a link
2. Store the Dodo payment ID when a payment completes
3. Display a "Payment Received" section with the payment ID on the details page

---

## Changes

### 1. DB Migration — add `payment_id` column
**New file:** `supabase/migrations/005_payment_id.sql`
```sql
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_id TEXT;
```

---

### 2. TypeScript types
**File:** `src/types/index.ts`

Add `payment_id: string | null` to the `Invoice` interface (after `payment_link`).

---

### 3. Webhook — capture payment ID
**File:** `supabase/functions/dodo-webhook/index.ts`

- Add `payment_id?: string` to the webhook payload `data` type
- On `payment.completed`, save both `status: 'paid'` and `payment_id: data.payment_id ?? null`

---

### 4. InvoiceDetail UI
**File:** `src/pages/InvoiceDetail.tsx`

**Local invoice state** — loader data is static, so mirror it in `useState` so the UI can update after link creation without a page reload:
```ts
const [localInvoice, setLocalInvoice] = useState(invoice)
const [linkLoading, setLinkLoading] = useState(false)
```

**`handleCreatePaymentLink`** — calls the existing `create-payment-link` edge function (same pattern as InvoiceReview), then patches local state:
```ts
setLocalInvoice(prev => ({ ...prev, payment_link: data.payment_link!, status: 'sent' }))
```

**"Create Payment Link" button** — shown when `!localInvoice.payment_link`:
- Purple primary button, matches existing style
- Spinner + "Creating…" label while in-flight
- Disappears and is replaced by "Copy Payment Link" once link is created

**"Payment Received" card** — shown when `localInvoice.status === 'paid' && localInvoice.payment_id`:
- Green-tinted card (`bg-green-50`, `border-green-100`)
- Displays the payment ID in monospace

---

## File Summary

| File | Type | Change |
|------|------|--------|
| `supabase/migrations/005_payment_id.sql` | New | Add `payment_id` column |
| `src/types/index.ts` | Edit | Add `payment_id` to Invoice |
| `supabase/functions/dodo-webhook/index.ts` | Edit | Capture + store payment_id |
| `src/pages/InvoiceDetail.tsx` | Edit | Create link button + paid section |

---

## Verification

1. Open a **draft** invoice → "Create Payment Link" button appears (purple)
2. Tap it → spinner → link section appears + button swaps to "Copy Payment Link"
3. Simulate a `payment.completed` Dodo webhook → invoice status becomes `paid`, `payment_id` stored in DB
4. Open that invoice → status badge shows **paid** (green), "Payment Received" card shows the payment ID
5. Invoices that already have a payment link continue to show "Copy Payment Link" as before — no regression
