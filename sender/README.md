# Sender — live send for the prototype

A small hosted app around `index.html` (decision X9). It serves the prototype, a *Demo Telco* offer
page, and one function that sends **one real message per channel** when a journey is activated:

| Channel | Service | Where it arrives |
| --- | --- | --- |
| E-mail | Resend | the address in `DEMO_EMAIL_TO` |
| SMS | Twilio | the number in `DEMO_SMS_TO` |
| Mobile push | ntfy | the phone subscribed to `NTFY_TOPIC` in the ntfy app |
| Website | this site | `/offer/?…` — the link the SMS, the e-mail button and the push open |

## How it works

1. Open the site as `https://<site>/?live=<DEMO_SEND_KEY>`.
2. Build a journey and press **Activate**.
3. The prototype posts the journey's first SMS, e-mail and push delivery — resolved for the test
   recipient, the e-mail exactly as the preview draws it — to `/api/send`.
4. The function sends each to the recipient configured **in the site's environment**, and the Send test
   dialog shows *Sent for real* with the result per channel.

Without `?live=`, or opened from a file, the prototype requests nothing.

## Rules it keeps

- **Recipients and keys live only in the site's environment variables.** The page cannot name a
  recipient; a `to` in the request is ignored. Nothing real is committed to the repository.
- **One message per channel per activation.** Resuming a paused journey does not send again.
- **The key is required.** A request without the right `x-live-key` is refused; with no
  `DEMO_SEND_KEY` set, nothing can be sent at all.
- Subjects are prefixed `[TEST]`; results show masked recipients only.
- Only `index.html` and `sender/site/` are published (`netlify.toml`) — docs, tests and meeting notes
  are not. The site asks search engines not to index it.

## Set-up (Netlify)

1. Netlify → **Add new site → Import an existing project** → this GitHub repository. The build settings
   come from `netlify.toml`; leave them as they are.
2. **Site configuration → Environment variables**, add:

| Variable | Value |
| --- | --- |
| `DEMO_SEND_KEY` | a long random passphrase — it goes in the `?live=` link |
| `RESEND_API_KEY` | Resend → API Keys |
| `DEMO_EMAIL_TO` | the address that receives the e-mail (on a Resend account without a verified domain: the account's own address) |
| `DEMO_EMAIL_FROM` | optional, e.g. `Demo Telco <hello@your-domain>` once a domain is verified |
| `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` | Twilio console |
| `TWILIO_FROM` | the Twilio phone number, `+1…` |
| `DEMO_SMS_TO` | the phone that receives the SMS, `+90…` (on a trial account: a verified number) |
| `NTFY_TOPIC` | a long random topic name; subscribe to the same name in the ntfy app |

3. **Deploys → Trigger deploy.** A channel whose variables are missing is reported as *not set up*
   and the others still send.

## Test

`node tests/sender.js` — the function on its own and end to end against the served prototype, with the
three services stubbed. No real message is sent by the tests.
