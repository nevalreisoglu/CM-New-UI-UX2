/**
 * Sender for the prototype's live send (decision X9): one real message per channel of a journey.
 * Recipients and keys come only from the site's environment variables — the page cannot choose who
 * receives anything. See sender/README.md.
 */
const crypto = require('crypto');

const MAX = { text: 1000, subject: 200, html: 100000, title: 120 };
const cut = (v, n) => String(v == null ? '' : v).slice(0, n);
const maskMail = (a) => String(a).replace(/^(.).*(@.*)$/, '$1•••$2');
const maskPhone = (p) => String(p).replace(/^(\+?\d{2,3}).*(\d{2})$/, '$1 ••• •• $2');
const sameKey = (a, b) => { const x = Buffer.from(String(a)), y = Buffer.from(String(b)); return x.length === y.length && crypto.timingSafeEqual(x, y); };

/* which variables this deployment does not have — names only, never a value */
const missing = (env, names) => { const m = names.filter((n) => !String(env[n] || '').trim()); return m.length ? `missing in this deployment: ${m.join(', ')}` : ''; };
const readJson = async (r) => { try { return (r && typeof r.json === 'function' && (await r.json())) || {}; } catch (e) { return {}; } };
/* the Twilio error codes a first set-up runs into, in plain words; the code itself is always shown */
const TWILIO_CODES = {
  20003: 'the Account SID or Auth Token is wrong', 21211: 'DEMO_SMS_TO is not a valid number — use +90…', 21408: 'sending to this country is switched off — enable it under Messaging › Settings › Geo permissions',
  21606: 'TWILIO_FROM is not a number of this account that can send SMS', 21608: 'a trial account can only send to verified numbers — verify the phone in Twilio', 21610: 'this phone has opted out (replied STOP)',
  21612: 'this Twilio number cannot send to this destination', 21614: 'the destination is not a mobile number',
  30003: 'the phone is unreachable', 30004: 'the message was blocked', 30005: 'the number is unknown', 30006: 'the number is a landline or unreachable carrier',
  30007: 'the operator filtered the message', 30008: 'the operator did not deliver it and gave no reason — common for foreign numbers sending links to Türkiye',
};
const twilioWhy = (code) => (code ? ` (Twilio ${code}${TWILIO_CODES[code] ? ': ' + TWILIO_CODES[code] : ''})` : '');

const CHANNELS = {
  async email(m, env, fetchImpl) {
    const miss = missing(env, ['RESEND_API_KEY', 'DEMO_EMAIL_TO']); if (miss) return { status: 'skipped', detail: `e-mail is not set up — ${miss}` };
    const r = await fetchImpl('https://api.resend.com/emails', {
      method: 'POST', headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        from: env.DEMO_EMAIL_FROM || 'Demo Telco <onboarding@resend.dev>', to: [env.DEMO_EMAIL_TO],
        subject: '[TEST] ' + cut(m.subject, MAX.subject),
        html: (m.preheader ? `<div style="display:none;max-height:0;overflow:hidden">${cut(m.preheader, MAX.subject).replace(/[<>&]/g, '')}</div>` : '') + cut(m.html, MAX.html),
        text: cut(m.text, MAX.text * 4),
      }),
    });
    return r.ok ? { status: 'sent', detail: `to ${maskMail(env.DEMO_EMAIL_TO)}` } : { status: 'failed', detail: `e-mail service answered ${r.status}` };
  },
  async sms(m, env, fetchImpl) {
    const miss = missing(env, ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_FROM', 'DEMO_SMS_TO']); if (miss) return { status: 'skipped', detail: `SMS is not set up — ${miss}` };
    const base = `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(env.TWILIO_ACCOUNT_SID)}/Messages`;
    const auth = { authorization: 'Basic ' + Buffer.from(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`).toString('base64') };
    const r = await fetchImpl(`${base}.json`, {
      method: 'POST', headers: Object.assign({ 'content-type': 'application/x-www-form-urlencoded' }, auth),
      body: new URLSearchParams({ To: env.DEMO_SMS_TO, From: env.TWILIO_FROM, Body: cut(m.text, MAX.text) }).toString(),
    });
    const body = await readJson(r);
    if (!r.ok) return { status: 'failed', detail: `SMS service answered ${r.status}${twilioWhy(body.code)}` };
    /* accepted is not delivered: ask Twilio what became of it, for a few seconds */
    let st = body.status || '', code = body.error_code;
    for (let i = 0; body.sid && i < 4 && !['delivered', 'undelivered', 'failed'].includes(st); i++) {
      await new Promise((ok) => setTimeout(ok, env.SMS_POLL_MS ? +env.SMS_POLL_MS : 1500));
      const q = await readJson(await fetchImpl(`${base}/${encodeURIComponent(body.sid)}.json`, { headers: auth }));
      st = q.status || st; code = q.error_code || code;
    }
    const to = `to ${maskPhone(env.DEMO_SMS_TO)}`;
    if (st === 'undelivered' || st === 'failed') return { status: 'failed', detail: `${to} — the operator did not deliver it${twilioWhy(code)}` };
    return { status: 'sent', detail: st === 'delivered' ? `${to} — delivered` : `${to} — accepted, delivery not confirmed yet` };
  },
  async push(m, env, fetchImpl) {
    const miss = missing(env, ['NTFY_TOPIC']); if (miss) return { status: 'skipped', detail: `push is not set up — ${miss}` };
    const r = await fetchImpl(env.NTFY_SERVER || 'https://ntfy.sh', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ topic: env.NTFY_TOPIC, title: cut(m.title, MAX.title), message: cut(m.text, MAX.text), click: /^https:\/\//.test(m.click || '') ? m.click : undefined, tags: ['iphone'] }),
    });
    return r.ok ? { status: 'sent', detail: 'to the subscribed phone' } : { status: 'failed', detail: `push service answered ${r.status}` };
  },
  async web(m) {
    return /^https?:\/\/[^\s]+\/offer\/\?/.test(m.url || '') ? { status: 'sent', url: m.url, detail: 'offer page is live' } : { status: 'failed', detail: 'no offer page link' };
  },
};

/** One send per channel, whatever the page asks for. */
async function sendAll(pkg, env, fetchImpl) {
  const seen = new Set(); const results = [];
  for (const m of Array.isArray(pkg && pkg.messages) ? pkg.messages.slice(0, 8) : []) {
    const send = CHANNELS[m && m.channel]; if (!send || seen.has(m.channel)) continue; seen.add(m.channel);
    let res; try { res = await send(m, env, fetchImpl); } catch (e) { res = { status: 'failed', detail: 'could not reach the service' }; }
    results.push(Object.assign({ channel: m.channel }, res));
  }
  return results;
}

/** The request rules, apart from the host's request/response objects, so they can be tested. */
async function handle(method, headers, rawBody, env, fetchImpl) {
  if (method !== 'POST') return { statusCode: 405, body: { error: 'POST only' } };
  const h = headers || {};
  /* only the site's own page may ask: a browser on another site sends a different Origin */
  if (h.origin && h.host && h.origin.replace(/^https?:\/\//, '') !== h.host) return { statusCode: 403, body: { error: 'Other sites cannot send' } };
  /* DEMO_SEND_KEY is optional (decision X10): set it to require ?live=<key>, leave it out to send on every activation */
  if (env.DEMO_SEND_KEY && !sameKey(h['x-live-key'] || '', env.DEMO_SEND_KEY)) return { statusCode: 401, body: { error: 'Wrong live key' } };
  let pkg = rawBody;
  if (typeof rawBody === 'string') { try { pkg = JSON.parse(rawBody); } catch (e) { return { statusCode: 400, body: { error: 'Not JSON' } }; } }
  return { statusCode: 200, body: { results: await sendAll(pkg, env, fetchImpl) } };
}

/* Vercel serverless function: POST /api/send */
module.exports = async (req, res) => {
  const out = await handle(req.method, req.headers, req.body, process.env, fetch);
  res.setHeader('cache-control', 'no-store');
  res.status(out.statusCode).json(out.body);
};
module.exports.sendAll = sendAll;
module.exports.handle = handle;
