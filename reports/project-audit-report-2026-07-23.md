# 🔍 LEDGERA PROJECT AUDIT REPORT

**Date:** July 23, 2026  
**Project:** Ledgera (Decentralized Transaction Platform)  
**Stage:** v0.1.0 MVP  
**Auditor:** Claude Code

---

## Executive Summary

The project is at a **v0.1.0 MVP** stage with authentication flows working but significant security vulnerabilities, UX inconsistencies, and missing functionality that would prevent production deployment.

| Category | Count |
|----------|-------|
| Critical Bugs | 3 |
| High-Severity Bugs | 5 |
| UX Flow Issues | 5 |
| Incorrect Functions | 4 |
| Best Practice Improvements | 7 |
| Other Observations | 12+ |

---

## 1. 🚨 EXPLICIT BUGS

### BUG-1: Invalid Tailwind Class `z-100` in ProfileModal
**File:** `src/components/sidebar/profile/ProfileModal.tsx:83`

```tsx
<div className="fixed inset-0 z-100 flex items-center justify-center p-4">
```

**Problem:** `z-100` is **not a valid Tailwind class**. The highest z-index in Tailwind is `z-50`. This means the modal's backdrop and overlay will NOT properly layer above other elements.

**Fix:** Change `z-100` to `z-50` (since WalletModal uses `z-50`).

---

### BUG-2: WalletModal `onConnect` Type Signature Mismatch
**File:** `src/components/auth/wallets/WalletModal.tsx:14`

```tsx
onConnect: (address: string, type: string) => void;
```

**Problem:** The interface accepts two parameters, but callers like `ConnectWalletButton.tsx:213` only pass one:

```tsx
onConnect={handleConnect} // handleConnect(walletAddress, type) - second param ignored
```

**Fix:** Change to `onConnect: (address: string, type?: string) => void` to be accurate.

---

### BUG-3: `completedNameStep` State Not Persisted
**File:** `src/components/auth/NameRegistrationModal.tsx:49-51`

```tsx
const step: "NAME" | "WALLET_QUESTION" = (user?.displayName || completedNameStep)
  ? "WALLET_QUESTION"
  : "NAME";
```

**Problem:** If a user fills in their name, refreshes the page, `completedNameStep` resets to `false`, and the user is stuck on the name step (since `user.displayName` won't update until the API response is stored and page refreshes).

**Fix:** Persist `completedNameStep` in localStorage or use a server-side session.

---

### BUG-4: Email Password — No Validation
**File:** `src/components/auth/EmailLoginForm.tsx`

**Problems:**
- No minimum length validation for password
- No password confirmation field
- No password strength indicator
- No error feedback if API returns validation errors (only generic `alert`)

**Fix:** Add client-side and server-side validation for password strength.

---

### BUG-5: Click-Outside Timer Race Condition
**File:** `src/components/sidebar/profile/ProfileModal.tsx:51-53`

```tsx
const timer = setTimeout(() => {
  document.addEventListener("mousedown", handleClickOutside);
}, 100);
```

**Problem:** If the user clicks within 100ms of opening the modal, the click-outside handler isn't registered yet — the click is effectively lost.

**Fix:** Register the event listener immediately, but check if the modal has finished mounting.

---

## 2. ⚠️ UX FLOW ISSUES

### UX-1: Onboarding Modal Dismisses on Backdrop Click
**File:** `src/components/auth/NameRegistrationModal.tsx:163`

```tsx
onClick={() => !loading && setIsDismissed(true)}
```

**Problem:** Users can accidentally dismiss the onboarding by clicking the backdrop. If dismissed, the modal **never reappears** — `isDismissed` is never reset. Users could end up without a wallet address and no way to set one.

**Fix:** Either remove the dismiss functionality, or add a "dismissed" flag that resets on next login.

---

### UX-2: Wallet Connection is Disconnected from Authentication
**File:** `src/app/login/page.tsx:111-120`

**Problem:** The "Connect Wallet" button on the login page works **independently** of the auth flow. A user can:
1. Connect a wallet
2. Login with Google
3. The wallet they connected earlier is NOT linked to their account

**Fix:** Merge the two wallet flows into a single unified system.

---

### UX-3: All Menu Items Point to `#`
**File:** `src/components/sidebar/Sidebar.tsx:24-44`

```tsx
const menuItems: MenuItem[] = [
  { title: "Dashboard", icon: Home, url: "#" },
  { title: "Analytics", icon: BarChart, url: "#" },
  // ...
];
```

**Problem:** All sidebar navigation links are placeholders. The sidebar has no functional routing.

**Fix:** Implement proper routing with Next.js `Link` component.

---

### UX-4: No Logout Confirmation
**File:** `src/components/sidebar/SidebarUserProfile.tsx:41-47`

**Problem:** The logout function immediately clears localStorage and redirects — no confirmation dialog.

**Fix:** Add a confirmation dialog before logout.

---

### UX-5: Disconnected Dual-Wallet State
**Files:** `src/components/auth/ConnectWalletButton.tsx` vs `NameRegistrationModal.tsx`

**Problem:**
- `ConnectWalletButton` stores wallet state in `wallet_address` and `wallet_type` keys
- `NameRegistrationModal` stores wallet state in the `user` object (via API → database)

These two systems are **completely independent**. A wallet connected via `ConnectWalletButton` on the login page won't appear in the sidebar wallet display (which reads from `user.walletAddress`).

**Fix:** Consolidate into a single wallet state management system.

---

## 3. 🔧 INCORRECT / MISSING FUNCTIONS

### FUNC-1: Deterministic "Wallet" Generation for Email Auth
**File:** `src/app/api/auth/email/route.ts:124`

```tsx
const dummyWalletAddress = `0x${Math.random().toString(16).slice(2, 42).padEnd(40, "0")}`;
```

**Problem:** This is **not a real wallet** — it's a pseudo-random string. This is stored in the database as `walletAddress`. If a user ever tries to use this address, they'll be sending funds to an invalid address.

**Fix:** Either:
- Generate a real wallet (like the onboarding flow does), OR
- Mark it clearly as `walletAddress: null` and require wallet setup later

---

### FUNC-2: Private Key Stored in Plain sessionStorage
**File:** `src/components/auth/NameRegistrationModal.tsx:115`

```tsx
sessionStorage.setItem("user_pk", newWallet.privateKey);
```

**Problem:** This stores the **raw private key** in browser storage. Even in `sessionStorage`:
- Accessible via XSS attacks
- Not encrypted
- No indication to the user that their private key is stored locally

**Fix:** Remove this immediately. Use server-side key generation with proper custody, or remove the auto-wallet feature until proper implementation.

---

### FUNC-3: No Wallet Address Validation
**File:** `src/app/api/user/wallet/route.ts`

**Problem:** Any string is accepted as a `walletAddress`. There's no validation for:
- EVM address format (`0x` + 40 hex chars)
- Checksum validation
- Blacklist of known invalid addresses

**Fix:** Add EVM address format validation using viem or ethers.js.

---

### FUNC-4: Microsoft OAuth State Generation is Weak
**File:** `src/hooks/useMicrosoftLogin.ts:22`

```tsx
const state = Math.random().toString(36).substring(2, 15);
```

**Problem:** `Math.random()` is **not cryptographically secure**. An attacker could predict the state and perform a CSRF attack.

**Fix:** Use `crypto.getRandomValues()` instead:

```tsx
const array = new Uint8Array(16);
crypto.getRandomValues(array);
const state = Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
```

---

## 4. 🏆 BEST PRACTICE IMPROVEMENTS

### BP-1: JWT Stored in localStorage — XSS Vulnerability
**Files:** Multiple login handlers

```tsx
localStorage.setItem("auth_token", token);
document.cookie = `auth_token=${token}; path=/; max-age=3600; SameSite=Lax; Secure`;
```

**Problem:**
- **localStorage is accessible via XSS** — if any XSS vulnerability exists, the attacker can steal the JWT
- **The cookie lacks `httpOnly`** — it should be `httpOnly; Secure; SameSite=Strict` for the cookie to provide XSS protection

**Best Practice:** Set JWT **only** as an `httpOnly` cookie from the server. Never expose it to JavaScript.

---

### BP-2: Default JWT Secret in Code
**File:** `src/app/api/auth/email/route.ts:43`

```tsx
const secret = new TextEncoder().encode(process.env.JWT_SECRET || "your-super-secret-dev-key");
```

**Problem:** Using a fallback secret key means the app will **silently run with an insecure secret** if the environment variable is missing.

**Best Practice:** Throw an error in production:

```tsx
const secret = process.env.JWT_SECRET;
if (!secret) {
  throw new Error("JWT_SECRET environment variable is not set");
}
```

---

### BP-3: No Token Refresh Mechanism
**Files:** All auth flows

**Problem:** All auth flows set a fixed token with `expiresIn: '7d'` (Google/Microsoft) or `1h` (email). There's no refresh token rotation. If the JWT is compromised within 7 days, there's no way to invalidate it server-side.

**Best Practice:** Implement JWT refresh token rotation.

---

### BP-4: Repeated Login Handler Code
**Files:** `GoogleLoginButton.tsx`, `MicrosoftLoginButton.tsx`, `EmailLoginForm.tsx`, `ConnectWalletButton.tsx`

**Problem:** All four files repeat identical patterns:

```tsx
localStorage.setItem("auth_token", token);
localStorage.setItem("user", JSON.stringify(user));
localStorage.setItem("token_expiry", (Date.now() + 3600000).toString());
document.cookie = `auth_token=${token}; path=/; max-age=3600; SameSite=Lax; Secure`;
window.location.replace("/dashboard");
```

**Best Practice:** Extract into a shared `auth.service.ts` utility.

---

### BP-5: Mixed Storage Strategies
**Files:** Multiple components

**Problem:**
- Auth tokens: `localStorage` + `document.cookie` + `sessionStorage` (for PK)
- User profile: `localStorage`
- Wallet: `localStorage` + Database via API
- OAuth state: `sessionStorage`

This is fragmented.

**Best Practice:** Consider a single authentication context provider that manages all auth state in one place.

---

### BP-6: No Input Sanitization on Display Names
**File:** `src/app/api/user/profile/route.ts`

**Problem:** `displayName` is stored and displayed without sanitization.

**Best Practice:** Sanitize and limit length on the server.

---

### BP-7: Inconsistent Error Handling — Raw `alert()` Calls
**Files:** Throughout all auth components

**Problem:** Using `alert()` for user-facing errors is a poor UX pattern. It blocks the UI and looks unprofessional.

**Best Practice:** Replace with toast notifications or inline error messages.

---

## 5. 📋 OTHER OBSERVATIONS

### Architecture Observations

| Area | Status | Notes |
|------|--------|-------|
| Login Page | ✅ Working | Multi-provider auth functional |
| Dashboard | ⚠️ Stub | Empty placeholder |
| Sidebar | ⚠️ Partial | Navigation links are `#` |
| Wallet Connection | ⚠️ Fragmented | Two independent flows |
| Onboarding | ⚠️ One-time | Can't be re-triggered |
| Database Schema | ⚠️ Incomplete | `microsoftSub` field, wallet validation missing |
| Smart Contracts | ❌ Not started | Per Coinspace spec |
| Arweave/Irys | ❌ Not started | Per Coinspace spec |
| BNB Chain Integration | ⚠️ Partial | `generateAutoWallet` works but private key storage is unsafe |

---

### Security Posture Summary

| Issue | Severity | Status |
|-------|----------|--------|
| JWT in localStorage | 🔴 High | Unaddressed |
| Default JWT secret fallback | 🔴 High | Unaddressed |
| Private key in sessionStorage | 🔴 High | Unaddressed |
| Weak CSRF state generation | 🟡 Medium | Unaddressed |
| No token refresh | 🟡 Medium | Unaddressed |
| No rate limiting on auth APIs | 🟡 Medium | Unaddressed |
| No password strength validation | 🟡 Medium | Unaddressed |
| Deterministic fake wallet addresses | 🟡 Medium | Unaddressed |

---

### Missing Production Features

1. **No Prisma schema file** — `prisma/schema.prisma` exists but the DB schema lacks:
   - `microsoftSub` field referenced in API code but not in schema
   - No index on `email` for login lookups

2. **No logout endpoint** — only client-side localStorage clearing

3. **No token verification middleware** — API routes trust client-sent user IDs without server-side verification

4. **No environment validation** — app runs with missing env vars silently

5. **Tailwind v4 config incompatibility** — `tailwind.config.js` uses v3 syntax but `package.json` installs Tailwind v4

---

## 🎯 PRIORITY RECOMMENDATIONS

### 🔴 CRITICAL (Fix Immediately)

| Priority | Issue | Fix |
|----------|-------|-----|
| 1 | Private key in `sessionStorage` | Remove `sessionStorage.setItem("user_pk", ...)` |
| 2 | JWT in `localStorage` | Use only `httpOnly` cookies |
| 3 | Default JWT secret fallback | Throw error if `JWT_SECRET` is not set |
| 4 | Missing Prisma `microsoftSub` field | Add field to schema.prisma |

### 🟡 HIGH (Fix Before Production)

| Priority | Issue | Fix |
|----------|-------|-----|
| 5 | Add `httpOnly` cookie flag | Add `httpOnly` to auth token cookie |
| 6 | Fix `z-100` → `z-50` | ProfileModal.tsx:83 |
| 7 | Persist `completedNameStep` | localStorage or server session |
| 8 | Wallet address validation | Add EVM format validation in API |
| 9 | Weak CSRF state | Use `crypto.getRandomValues()` |

### 🟢 MEDIUM (Post-MVP)

| Priority | Issue | Fix |
|----------|-------|-----|
| 10 | Token verification middleware | Add JWT verification to protected routes |
| 11 | Consolidate login code | Create `auth.service.ts` |
| 12 | Toast notifications | Replace `alert()` with toast |
| 13 | Tailwind v4 config | Migrate to v4 config format |

---

## 📁 File Summary

| File | Issues |
|------|--------|
| `src/components/auth/NameRegistrationModal.tsx` | 🔴 PK in sessionStorage, UX dismiss issue, state persistence |
| `src/components/auth/EmailLoginForm.tsx` | 🟡 No password validation, alert() errors |
| `src/components/auth/GoogleLoginButton.tsx` | 🟡 JWT in localStorage |
| `src/components/auth/MicrosoftLoginButton.tsx` | 🟡 JWT in localStorage |
| `src/components/auth/ConnectWalletButton.tsx` | 🟡 JWT in localStorage, fragmented wallet state |
| `src/components/auth/wallets/WalletModal.tsx` | 🟡 Type mismatch |
| `src/components/sidebar/profile/ProfileModal.tsx` | 🟡 z-100 bug, race condition |
| `src/components/sidebar/Sidebar.tsx` | ⚠️ Placeholder navigation |
| `src/components/sidebar/SidebarUserProfile.tsx` | ⚠️ No logout confirmation |
| `src/hooks/useMicrosoftLogin.ts` | 🟡 Weak Math.random() CSRF state |
| `src/app/api/auth/email/route.ts` | 🔴 Default JWT secret, fake wallet generation |
| `src/app/api/auth/google/route.ts` | 🟡 Missing error handling |
| `src/app/api/auth/microsoft/route.ts` | 🟡 Inconsistent error handling |
| `src/app/api/user/wallet/route.ts` | 🟡 No wallet validation |
| `src/app/api/user/profile/route.ts` | 🟡 No input sanitization |
| `src/lib/wallet.ts` | ✅ Correct implementation |
| `prisma/schema.prisma` | 🔴 Missing `microsoftSub` field |

---

*Report generated on July 23, 2026*
