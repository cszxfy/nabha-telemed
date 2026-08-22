# Nabha Telemed — Doctor Portal

## Doctor access
From the main patient landing page, use the **Doctor Portal** button in the top-right header.

That opens:

`/doctor/login`

You can also open `/doctor` directly; it redirects to the doctor login.

## Demo credentials

Phone: `9876543210`

Password: `doctor123`

Demo mode is enabled through `.env` so the prototype keeps moving even when the backend is unavailable.

## Doctor flow

Doctor Portal → Login → Dashboard → Queue → Patient → Consultation → Notes → Prescription → Completed

The doctor header clearly identifies the **Doctor Portal** and includes Dashboard, Queue, History, the doctor identity, and Logout.

## Patient portal

The patient flow remains available from the main landing page. The Doctor Portal entry is an additional access path and does not remove the patient journey.
