/**
 * What the demo operator's site (sender/site/telco) shows: the latest banner, web push and offer the
 * sender published on activation. Read from the site store — a second ntfy topic that keeps messages
 * for 12 hours — so there is no database. Returns {} when nothing was sent or nothing is set up.
 */
const { siteTopic } = require('./send.js');

async function latest(env, fetchImpl) {
  if (!env.NTFY_TOPIC && !env.SITE_TOPIC) return {};
  let text = '';
  try { const r = await fetchImpl(`${env.NTFY_SERVER || 'https://ntfy.sh'}/${encodeURIComponent(siteTopic(env))}/json?poll=1&since=12h`, {}); if (!r.ok) return {}; text = await r.text(); } catch (e) { return {}; }
  let doc = {};
  for (const line of text.split('\n')) { try { const ev = JSON.parse(line); if (ev.event === 'message') { const d = JSON.parse(ev.message); if (d && typeof d === 'object' && d.at) doc = d; } } catch (e) { /* not ours */ } }
  return doc;
}

module.exports = async (req, res) => { res.setHeader('cache-control', 'no-store'); res.status(200).json(await latest(process.env, fetch)); };
module.exports.latest = latest;
