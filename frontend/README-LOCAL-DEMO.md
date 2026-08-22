# Nabha Telemed — Local Demo Mode

This package is configured to run the complete patient + doctor frontend without requiring the incomplete backend routes from the current GitHub `main` branch.

## Start

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

## Doctor demo login

- Phone: `9876543210`
- Password: `doctor123`

## Patient demo OTP

Enter any valid 10-digit Indian mobile number. Use OTP:

```text
1234
```

## What is mocked locally

The Vite dev server provides an in-memory demo implementation for the frontend contract:

- doctor login
- patient OTP login + registration
- symptom check / triage
- patient queue join + status
- doctor queue + call-next
- patient lookup
- call start/end
- prescription creation + patient prescription history

The browser still uses the same `/api/v1/...` paths, so switching to the real backend later only requires setting:

```env
VITE_DEMO_MODE=false
VITE_BACKEND_URL=http://localhost:5000
```

and restarting Vite.

## Important

The current public GitHub `main` branch still contains empty route modules for `call.js` and `queue.js`, so a real backend cannot currently satisfy those calls. This local demo mode is therefore intentionally isolated behind `VITE_DEMO_MODE=true` and does not modify the frozen contract.
