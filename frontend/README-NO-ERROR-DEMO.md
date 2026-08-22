# Nabha Telemed — Resilient Local Demo

This build is configured for a **no-block / no-error local demo mode** so the patient and doctor journeys keep moving even when the backend, OTP provider, video permissions, or API routes are unavailable.

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Demo behavior

- Patient phone login always advances to OTP.
- Any OTP input is accepted in demo mode; incomplete codes are silently completed.
- OTP resend never blocks the flow.
- Missing patient registration fields receive safe demo defaults.
- Empty symptom selection falls back to a demo symptom.
- Queue/API failures fall back to a local demo queue.
- Call start/end failures fall back to the local consultation room.
- Camera/microphone permission failures do not block the consultation.
- Doctor login accepts any entered credentials in demo mode and creates a demo doctor session.
- Doctor queue, patient lookup, prescription and consultation flows all have local fallbacks.
- Legacy error panels are hidden while `VITE_DEMO_MODE=true` so the prototype never presents a red failure screen during the demo.

## Demo credentials

Doctor:
- Phone: any 10-digit value
- Password: anything

Patient:
- Phone: any value is accepted and normalized for the demo
- OTP: any 0–4 digits; the flow will continue automatically

## Switching back to real backend behavior

Set:

```env
VITE_DEMO_MODE=false
VITE_BACKEND_URL=http://localhost:5000
```

and restart Vite.
