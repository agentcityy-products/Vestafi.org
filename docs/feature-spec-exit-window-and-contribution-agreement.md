# Feature Spec: Exit Window + Personalized Contribution Agreement

**Version:** 1.1  
**Date:** March 2026  
**Scope:** Two client-requested features; single 1-week delivery timeline including QA.

---

## 0. Client Answers (Locked)

### Exit Window

| # | Question | Client answer |
|---|----------|---------------|
| 1 | Pricing | **NOT face value.** Admin sets an **updated property price** before each exit window (properties appreciate). Stakes sold at new valuation. No bidding, FCFS. |
| 2 | Who can buy | **Approved members only.** Same rules as who can invest. |
| 3 | Settlement | **Vault-to-vault.** Buyer pays from vault; seller receives into vault. Instant when buyer clicks buy. No admin middleman. |
| 4 | Partial fills | **YES.** Multiple buyers can buy portions (e.g. 10M UGX: Buyer A 2M, Buyer B 3M). Seller sees **progress bar** for amount sold. |
| 5 | Unfilled at window end | **Auto-expire.** Email seller that their stake could not be sold. |
| 6 | Fees | **1.5% platform fee**, admin configurable in settings. |
| 7 | Transfer A→B | **Two-step only.** Sell → vault → user **manually** deploys. No wizard. |

### Personalized Agreement

| Item | Client answer |
|------|----------------|
| Fields | Full name, phone, email, contribution amount, property details, property ID. |
| Template | Use **current agreement PDF** and **inject** user details. |
| Failure | Send email **without** attachment and **log error**. Do **not** fail the contribution. |

### Additional Requirements

- Admin **interface to set updated property prices** before enabling each exit window.
- **`exit_window_fee_percentage`** in app_settings (default 1.5%).
- **Property exit price** (field or table) for per-window valuations.

---

## 1. Feature A: Exit Window (Sell / Transfer Stake)

### 1.1 Summary

During an **admin-defined open window**, users can **sell** part or all of their stake at the **admin-set exit price** (updated valuation). Multiple buyers can partially fill one order (progress bar for seller). Settlement is **vault-to-vault**, instant. **Transfer = two-step:** sell → vault → user manually deploys to another property.

- **Trigger:** Admin enables a window and sets per-property exit prices first.
- **Fees:** 1.5% platform fee (admin configurable). Unfilled orders expire at window end; seller gets email.

### 1.2 Current System (Relevant)

- Ownership % = `sum(successful investment.amount) / property.price * 100` (see `owned_properties_view`).
- Returns distribution uses that ownership % (`monthly-rent` action).
- `investment` table: one row per contribution; no negative amounts today.
- Admin settings via `app_settings` (e.g. membership_enabled, fee).

### 1.3 Data Model (Exit Window)

- **`exit_windows`** — `id`, `start_at`, `end_at`, `is_active` (or status). One window per period; admin configures before enabling.
- **`exit_window_property_prices`** — `exit_window_id`, `property_id`, `exit_price`. Admin sets before enabling window. Sell order value = stake × (exit_price / property.price).
- **`app_settings`** — New key: **`exit_window_fee_percentage`** (number, default 1.5).
- **`exit_window_orders`** — `id`, `exit_window_id`, `property_id`, `seller_user_id`, `amount_total`, `amount_remaining`, `status` (open | partially_filled | filled | cancelled | expired), `created_at`, `expires_at`.
- **`exit_window_trades`** — `id`, `order_id`, `property_id`, `seller_user_id`, `buyer_user_id`, `amount`, `fee_amount`, `seller_proceeds`, `created_at`.
- **`property_ownership_movements`** — `id`, `property_id`, `user_id`, `amount_delta`, `reason`, `ref_id`, `created_at`. Ledger for who owns what; keeps `investment` / `listings_view` unchanged.

**Pricing:** Sellable value at exit = (owner's stake amount) × (exit_price / property.price). Fee deducted from seller proceeds; rest to seller vault.

### 1.4 Business Rules

- **Window gating:** Create order / buy only when window is active and `now ∈ [start_at, end_at]`.
- **Who can buy:** Approved members only (same as invest; reuse `checkMembershipAccess`).
- **Partial fills:** Order in currency; buyers take chunks until `amount_remaining` = 0; progress bar = (amount_total - amount_remaining) / amount_total.
- **Settlement (atomic):** Decrement `amount_remaining`; insert trade; apply fee; credit seller vault, debit buyer vault; insert ownership movements (seller −, buyer +).
- **End of window:** Mark expired orders; **email** sellers whose orders expired unfilled.
- **Transfer:** No wizard. Sell → vault → user deploys manually.

### 1.5 Edge Cases

- **Race:** Two buyers for same remaining amount → DB transaction + row lock (e.g. `SELECT ... FOR UPDATE` on order).
- Only **successful** stake is sellable. Seller cannot list more than ledger balance minus open order amounts.
- Buyer must have sufficient vault balance. Fee from seller proceeds (1.5%).
- Admin disables window: block new trades; open orders expire at window end.

### 1.6 Revenue and UI After a Secondary Sale

**Who gets the rent?**  
**The buyer (User B).** Once the trade settles, ownership is transferred in the ledger (seller −, buyer +). Monthly rent distribution must use **current ownership** from the ownership ledger (not only the investment table). So from the next distribution onward, **User B** receives the share of rent for the stake they bought; **User A** no longer receives that share. Implementation: returns distribution (e.g. `addMonthlyRentAndDistributeReturns`) must read ownership % from a source that includes `property_ownership_movements` (e.g. a view or query that sums movements per user per property, or an updated `owned_properties_view` that uses the ledger).

**Does the buyer see it in “My contributions”?**  
**Yes.** (1) **Owned properties / portfolio** must list all current stakes from the ledger, so User B sees the property and their new ownership % there. (2) **“My contributions” (or “My stakes”)** should show all current stakes: both from direct investment and from exit-window purchases, so User B sees the acquired portion too (e.g. with a label like “Exit window purchase” or “Acquired”). Do not rely only on the `investment` table for this list, since secondary purchases do not create investment rows.

---

## 2. Feature B: Personalized Contribution Agreement Email

### 2.1 Summary

When a user **makes a contribution** (deploy from vault or legacy direct investment), the system sends a **contribution agreement** document to their email. The document is **customized** with their name, phone, email, contribution amount, property details, property ID. Use the current agreement PDF and **inject** user details. If PDF generation fails: send email **without** attachment and **log error**; do **not** fail the contribution.

### 2.2 Current Integration Points

- **Vault deploy:** `src/actions/vault.ts` — after successful deployment, fetches static agreement PDF and attaches to confirmation email.
- **Legacy investment:** `src/actions/investment.ts` — similar on approval/confirmation.
- **Static asset:** `public/docs/contribution-agreement.pdf` (or Supabase storage URL).

### 2.3 Behaviour (Locked)

- **Trigger:** On successful contribution (vault deploy or approved direct investment).
- **Attachment:** One PDF customized with: full name, phone, email, contribution amount, property details, property ID (inject into current agreement template).
- **Failure:** Send email without attachment; log error; do not fail the contribution.

---

## 3. One-Week Timeline (High-Level)

| Day | Focus |
|-----|--------|
| Mon | Spec lock + Contribution agreement (customized PDF inject + email; failure handling). |
| Tue | Exit window — DB, app_settings fee, property exit prices, backend actions. |
| Wed | Exit window — Investor UI (stakes, create order, browse/buy, progress bar); Admin UI (window + property prices). |
| Thu | Exit window — Hardening, expired-order email, QA. |
| Fri | UAT, fixes, short docs. |

---

## 4. Full Execution Plan

Ordered steps with dependencies. Complete these in sequence where dependencies are stated; parallel work is called out.

---

### Phase 1: Foundation (DB + settings)

**1.1** Add **`exit_window_fee_percentage`** to app_settings  
- **Where:** Seed or migration: ensure key exists with value `1.5` (number).  
- **Usage:** `getAppSetting('exit_window_fee_percentage', 1.5)` (same pattern as membership fee in `src/actions/membership.ts`).

**1.2** Create migration: **`exit_windows`** table  
- Columns: `id` (uuid, PK), `start_at` (timestamptz), `end_at` (timestamptz), `is_active` (boolean) or `status` (enum: draft | active | ended), `created_at`, `updated_at`.  
- RLS: admin only for insert/update/delete; authenticated can read when needed for “is window open” checks.

**1.3** Create migration: **`exit_window_property_prices`** table  
- Columns: `id` (uuid, PK), `exit_window_id` (FK → exit_windows), `property_id` (FK → property), `exit_price` (numeric), `created_at`.  
- Unique (exit_window_id, property_id). RLS: admin write; read for active window + property.

**1.4** Create migration: **`property_ownership_movements`** table  
- Columns: `id`, `property_id`, `user_id`, `amount_delta` (numeric, can be negative), `reason` (text or enum: e.g. `primary_investment`, `secondary_trade`), `ref_id` (uuid, optional — investment_id or trade_id), `created_at`.  
- RLS: admin + owner (user_id) read; insert only via server (service role or admin).

**1.5** Create migration: **`exit_window_orders`** table  
- Columns: `id`, `exit_window_id`, `property_id`, `seller_user_id`, `amount_total`, `amount_remaining`, `status` (e.g. open, partially_filled, filled, cancelled, expired), `created_at`, `expires_at`.  
- RLS: seller and admin full access to their orders; buyers need to read open orders (authenticated + member).

**1.6** Create migration: **`exit_window_trades`** table  
- Columns: `id`, `order_id`, `property_id`, `seller_user_id`, `buyer_user_id`, `amount`, `fee_amount`, `seller_proceeds`, `created_at`.  
- RLS: participants and admin read; insert only via server.

**1.7** Backfill **`property_ownership_movements`** from current **successful** investments  
- One row per investment: positive `amount_delta`, `reason = 'primary_investment'`, `ref_id = investment.id`.  
- Run once in migration or one-off script. Ensures “who owns what” is consistent before any exit window opens.

**1.8** (Optional for v1) Update **`owned_properties_view`** to use `property_ownership_movements` for “current ownership” if you move away from summing investments; otherwise keep view and use ledger only for “sellable amount” checks in exit-window logic. *Recommendation:* keep existing view for dashboard; in exit-window server logic, compute sellable amount from movements (or from view minus amount in open orders).

---

### Phase 2: Contribution agreement (Feature B)

**2.1** Implement **customized contribution agreement PDF**  
- **Inputs:** User (full name, phone, email), contribution amount, property (details, id).  
- **Method:** Load current agreement PDF (from `public/docs/contribution-agreement.pdf` or same URL as today); inject fields (form fill if PDF is fillable, or overlay text with PDF lib).  
- **Output:** Buffer or temp file.  
- **Failure:** Return null or throw; caller will send email without attachment and log.

**2.2** In **`src/actions/vault.ts`** (deploy success path):  
- Replace static PDF fetch with call to generate customized agreement (user, amount, property).  
- If generation fails: log error; do **not** attach agreement; send email as usual (with receipt only).  
- If success: attach customized PDF with a clear filename (e.g. `vestafi-contribution-agreement-{lastName}-{date}.pdf`).

**2.3** In **`src/actions/investment.ts`** (approval/confirmation path):  
- Same as 2.2: use customized agreement; on failure, send without attachment and log; do not fail the contribution.

**2.4** QA: Deploy once (vault) and (if applicable) approve one direct investment; confirm email has personalized agreement; confirm that on PDF failure, email still sends and contribution succeeds.

---

### Phase 3: Exit window — backend (Feature A)

**3.1** **Helper / config**  
- `getExitWindowFeePercentage()` — read from app_settings, default 1.5.  
- `getActiveExitWindow()` — return current window where `is_active` and `now() between start_at and end_at` (and optionally status = active).  
- `getExitPrice(exitWindowId, propertyId)` — from `exit_window_property_prices`.

**3.2** **Sellable amount**  
- For a user and property in a given window: (a) current ownership from `property_ownership_movements` (sum of amount_delta) or from `owned_properties_view` for that user/property; (b) minus amount already in open/partially_filled orders for that user/property/window.  
- Value at exit = sellable stake amount × (exit_price / property.price). Use exit_price from `exit_window_property_prices`.

**3.3** **Server action: Create sell order**  
- **Input:** exit_window_id, property_id, amount (currency to sell).  
- **Checks:** Window active; user is member; sellable amount ≥ amount; no duplicate open order for same user/property/window (or sum of open orders + this ≤ sellable).  
- **Insert:** `exit_window_orders` (amount_total = amount, amount_remaining = amount, status = open, expires_at = window.end_at).

**3.4** **Server action: Buy from order (atomic)**  
- **Input:** order_id, amount (currency).  
- **Checks:** Window active; buyer is member; order open/partially_filled; amount_remaining ≥ amount; buyer vault balance ≥ amount.  
- **In one transaction:**  
  - Update order: `amount_remaining -= amount`; set status to filled if amount_remaining = 0 else partially_filled.  
  - Insert `exit_window_trades` (amount, fee_amount = amount * fee%, seller_proceeds = amount - fee_amount).  
  - Insert two `property_ownership_movements`: seller −amount (reason secondary_trade, ref_id = trade.id), buyer +amount (same).  
  - Debit buyer vault (vault_transaction + user_vault balance update).  
  - Credit seller vault (vault_transaction + user_vault balance update).  
- Use DB transaction and row lock on order (`SELECT ... FOR UPDATE`) to prevent race.

**3.5** **Server actions: List**  
- List open orders for a property or globally (for active window): orders where status in (open, partially_filled) and amount_remaining > 0.  
- List my orders (seller): for current user.  
- List my stakes (for create-order UI): owned properties with sellable amount and exit price.

**3.6** **Expired orders and email**  
- **When:** End of window (cron or scheduled job) or on next read of window.  
- **Logic:** Mark orders with `expires_at <= now()` and status in (open, partially_filled) as expired.  
- **Email:** For each such order, send seller an email: “Your exit window sell order could not be fully sold.” (Template + link to dashboard.)

---

### Phase 4: Admin UI (Exit window + property prices)

**4.1** **Exit window fee**  
- In admin settings (e.g. alongside membership settings): number input for **Exit window fee %**; save to `app_settings.exit_window_fee_percentage`.

**4.2** **Exit window CRUD**  
- List exit windows (past and upcoming).  
- Create / edit window: start_at, end_at, is_active (or status).  
- **Before enabling:** Require that all properties with existing investors have an exit price set for this window (or allow partial and only those with prices are sellable).

**4.3** **Set property exit prices per window**  
- Screen: Select exit window → list properties (or only those with investors). For each, input **exit_price** for that window.  
- Save to `exit_window_property_prices`.  
- Validation: exit_price > 0; optionally warn if &lt; property.price (depreciation).

**4.4** **Enable window**  
- “Enable” sets window as active and start_at/end_at are in effect. Only when at least required property prices are set (product rule).

---

### Phase 5: Investor UI (Exit window)

**5.1** **Dashboard entry**  
- When an exit window is active: show “Exit window” section (or link). If no active window, show “Next exit window: …” or hide.

**5.2** **My stakes**  
- List properties the user owns (from owned_properties_view or ledger) with sellable amount and exit value (using exit_price).  
- Button: “Sell stake” → opens create-order flow for that property.

**5.3** **Create sell order**  
- Form: property (pre-filled if from stake row), amount (max = sellable amount). Submit → create order action.  
- Success: order appears in “My sell orders” with progress bar (0% initially).

**5.4** **My sell orders**  
- Table/cards: order, property, amount_total, amount_remaining, status, progress bar `(amount_total - amount_remaining) / amount_total`.  
- Option to cancel (set status cancelled) if window still open and order not fully filled.

**5.5** **Browse / buy**  
- List open orders (other users’): property, seller (optional), amount_remaining, exit price.  
- “Buy” → input amount (≤ amount_remaining, ≤ my vault balance). Submit → buy-from-order action.  
- Success: vault debited; order progress updates; seller sees updated progress bar.

**5.6** **Transfer (two-step)**  
- No wizard. Copy/messaging: “To move to another property: sell your stake here → funds go to your vault → deploy to another property from the vault.” Link to vault/deploy.

---

### Phase 6: QA and wrap-up

**6.1** **Contribution agreement:** Deploy + approve flows; PDF present and personalized; failure path (e.g. break PDF generation) → email without attachment, contribution succeeds.  
**6.2** **Exit window:** Create window, set property prices, set fee; create order; buy partial; buy remainder; progress bar; vault balances; expired order email.  
**6.3** **Permissions:** Non-member cannot buy; admin can manage windows and prices.  
**6.4** **Docs:** Short “Exit window: how to sell / buy” and “Contribution agreement email” for support.

---

## 5. Open Points (Optional)

- **Cron for expiry:** Use Supabase cron or external scheduler to mark expired orders and send emails, or run “expire” logic on next admin/investor read of window.
- **Property without exit price:** If admin does not set exit price for a property, that property is not sellable in that window (hide from “sell” or show “Not available this window”).
- **Decimal/rounding:** Define minimum trade amount (e.g. 10 UGX) and round fee to 2 decimals to avoid floating-point issues.

No further open questions from the original spec; client answers are locked in Section 0.
