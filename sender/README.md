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

1. Open the site at its normal address.
2. Build a journey and press **Activate**.
3. The prototype posts the journey's first SMS, e-mail and push delivery — resolved for the test
   recipient, the e-mail exactly as the preview draws it — to `/api/send`.
4. The function sends each to the recipient configured **in the site's environment**, and the Send test
   dialog shows *Sent for real* with the result per channel.

Opened from a file, the prototype requests nothing.

## Rules it keeps

- **Recipients and keys live only in the site's environment variables.** The page cannot name a
  recipient; a `to` in the request is ignored. Nothing real is committed to the repository.
- **One message per channel per activation.** Resuming a paused journey does not send again.
- **The key is optional** (decision X10). Without `DEMO_SEND_KEY`, anyone who has the site address can
  trigger one test message per channel — to the configured recipients only. Set `DEMO_SEND_KEY` to
  require opening the site as `/?live=<key>` instead. Requests from another site's page are refused.
- Subjects are prefixed `[TEST]`; results show masked recipients only.
- Only `index.html` and `sender/site/` are published (`vercel.json`) — docs, tests and meeting notes
  are not. The site asks search engines not to index it.

## Set-up (Vercel)

1. The repository's existing Vercel project picks up `vercel.json` on the next deploy: it publishes
   only `index.html` and `sender/site/`, and `api/send.js` becomes `POST /api/send`. Leave the build
   settings in the dashboard on their defaults so `vercel.json` decides.
2. **Project → Settings → Environment Variables** (Production), add:

| Variable | Value |
| --- | --- |
| `DEMO_SEND_KEY` | optional — leave it out to send from the plain address; set a passphrase to require `/?live=<passphrase>` |
| `RESEND_API_KEY` | Resend → API Keys |
| `DEMO_EMAIL_TO` | the address that receives the e-mail (on a Resend account without a verified domain: the account's own address) |
| `DEMO_EMAIL_FROM` | optional, e.g. `Demo Telco <hello@your-domain>` once a domain is verified |
| `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` | Twilio console |
| `TWILIO_FROM` | the Twilio phone number, `+1…` |
| `DEMO_SMS_TO` | the phone that receives the SMS, `+90…` (on a trial account: a verified number) |
| `NTFY_TOPIC` | a long random topic name; subscribe to the same name in the ntfy app |

3. **Deployments → Redeploy** — variables only apply to a new deployment. A channel whose variables are missing is reported as *not set up*
   and the others still send.

## Test

`node tests/sender.js` — the function on its own and end to end against the served prototype, with the
three services stubbed. No real message is sent by the tests.
