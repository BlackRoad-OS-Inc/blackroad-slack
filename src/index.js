// BlackRoad Slack Hub — Cloudflare Worker
// No app, no OAuth, no tokens. Just webhooks + a smart proxy.
// Pis post here → worker routes to Slack with formatting.
// External services (Stripe, GitHub, Vercel) post here → Slack.

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Fleet posts
    if (path === '/post' && request.method === 'POST') return handlePost(request, env);
    if (path === '/alert' && request.method === 'POST') return handleAlert(request, env);
    if (path === '/chatter' && request.method === 'POST') return handleChatter(request, env);

    // External integrations
    if (path === '/stripe' && request.method === 'POST') return handleStripe(request, env);
    if (path === '/github' && request.method === 'POST') return handleGitHub(request, env);
    if (path === '/vercel' && request.method === 'POST') return handleVercel(request, env);
    if (path === '/deploy' && request.method === 'POST') return handleDeploy(request, env);

    // Info
    if (path === '/health') return json({ status: 'alive', service: 'blackroad-slack' });
    if (path === '/status') return handleStatus(env);

    return json({ service: 'BlackRoad Slack Hub', endpoints: ['/post', '/alert', '/chatter', '/stripe', '/github', '/vercel', '/deploy', '/health', '/status'] });
  }
};

// ── Fleet Messages ──────────────────────────────────────

async function handlePost(request, env) {
  const body = await request.json();
  const text = body.text || 'no message';
  return postToSlack(env, text);
}

async function handleAlert(request, env) {
  const body = await request.json();
  const text = '🚨 *ALERT*\n' + (body.text || 'unknown alert');
  return postToSlack(env, text);
}

async function handleChatter(request, env) {
  const body = await request.json();
  const text = body.text || 'hey';
  return postToSlack(env, text);
}

// ── Stripe Webhook ──────────────────────────────────────

async function handleStripe(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'bad json' }, 400);
  }

  const type = body.type || 'unknown';
  const data = body.data?.object || {};

  let msg = '';
  switch (type) {
    case 'checkout.session.completed':
      msg = `💰 *Payment received!*\n• Amount: $${(data.amount_total / 100).toFixed(2)}\n• Customer: ${data.customer_email || 'unknown'}\n• Product: ${data.metadata?.product || 'unknown'}`;
      break;
    case 'invoice.paid':
      msg = `💳 *Invoice paid*\n• Amount: $${(data.amount_paid / 100).toFixed(2)}\n• Customer: ${data.customer_email || 'unknown'}`;
      break;
    case 'invoice.payment_failed':
      msg = `⚠️ *Payment failed*\n• Customer: ${data.customer_email || 'unknown'}\n• Reason: ${data.last_payment_error?.message || 'unknown'}`;
      break;
    case 'customer.subscription.created':
      msg = `🎉 *New subscriber!*\n• Plan: ${data.items?.data?.[0]?.price?.nickname || 'unknown'}\n• Status: ${data.status}`;
      break;
    case 'customer.subscription.deleted':
      msg = `😔 *Subscription cancelled*\n• Customer: ${data.customer || 'unknown'}`;
      break;
    default:
      msg = `📦 *Stripe event:* ${type}`;
  }

  return postToSlack(env, msg);
}

// ── GitHub Webhook ──────────────────────────────────────

async function handleGitHub(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'bad json' }, 400);
  }

  const event = request.headers.get('X-GitHub-Event') || 'unknown';
  let msg = '';

  switch (event) {
    case 'push':
      const commits = body.commits?.length || 0;
      const branch = (body.ref || '').replace('refs/heads/', '');
      const repo = body.repository?.full_name || 'unknown';
      const pusher = body.pusher?.name || 'someone';
      msg = `📦 *Push to ${repo}*\n• Branch: ${branch}\n• ${commits} commit${commits !== 1 ? 's' : ''} by ${pusher}`;
      if (body.commits?.[0]) msg += `\n• Latest: _${body.commits[0].message}_`;
      break;
    case 'pull_request':
      const action = body.action || '';
      const pr = body.pull_request || {};
      msg = `🔀 *PR ${action}* in ${body.repository?.full_name || 'unknown'}\n• #${pr.number}: ${pr.title}\n• By: ${pr.user?.login || 'unknown'}`;
      break;
    case 'issues':
      msg = `📋 *Issue ${body.action}* in ${body.repository?.full_name || 'unknown'}\n• #${body.issue?.number}: ${body.issue?.title}`;
      break;
    case 'workflow_run':
      const run = body.workflow_run || {};
      const status = run.conclusion || run.status || 'unknown';
      const emoji = status === 'success' ? '✅' : status === 'failure' ? '❌' : '⏳';
      msg = `${emoji} *Workflow ${status}*: ${run.name || 'unknown'}\n• Repo: ${body.repository?.full_name}\n• Branch: ${run.head_branch}`;
      break;
    case 'release':
      msg = `🚀 *Release ${body.action}*: ${body.release?.tag_name} in ${body.repository?.full_name}\n• ${body.release?.name || ''}`;
      break;
    case 'star':
      msg = `⭐ *${body.repository?.full_name}* ${body.action === 'created' ? 'got a star' : 'lost a star'}! (${body.repository?.stargazers_count} total)`;
      break;
    default:
      msg = `🔔 *GitHub ${event}* in ${body.repository?.full_name || 'unknown'}`;
  }

  return postToSlack(env, msg);
}

// ── Vercel Webhook ──────────────────────────────────────

async function handleVercel(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'bad json' }, 400);
  }

  const type = body.type || 'unknown';
  const payload = body.payload || body;

  let msg = '';
  switch (type) {
    case 'deployment.created':
      msg = `🚀 *Vercel deploy started*\n• Project: ${payload.name || 'unknown'}\n• URL: ${payload.url || ''}`;
      break;
    case 'deployment.succeeded':
      msg = `✅ *Vercel deploy succeeded*\n• Project: ${payload.name || 'unknown'}\n• URL: ${payload.url || ''}`;
      break;
    case 'deployment.error':
      msg = `❌ *Vercel deploy failed*\n• Project: ${payload.name || 'unknown'}\n• Error: ${payload.error?.message || 'unknown'}`;
      break;
    default:
      msg = `🔔 *Vercel:* ${type}`;
  }

  return postToSlack(env, msg);
}

// ── Generic Deploy Notification ─────────────────────────

async function handleDeploy(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'bad json' }, 400);
  }
  const msg = `🚀 *Deploy:* ${body.text || body.message || JSON.stringify(body)}`;
  return postToSlack(env, msg);
}

// ── Status ──────────────────────────────────────────────

async function handleStatus(env) {
  const webhookUrl = await env.SLACK_KV.get('webhook_url');
  return json({
    status: webhookUrl ? 'connected' : 'no webhook',
    webhook: webhookUrl ? 'present' : 'missing',
    endpoints: {
      fleet: '/post, /alert, /chatter',
      integrations: '/stripe, /github, /vercel, /deploy'
    },
    integration_urls: {
      stripe_webhook: 'https://blackroad-slack.amundsonalexa.workers.dev/stripe',
      github_webhook: 'https://blackroad-slack.amundsonalexa.workers.dev/github',
      vercel_webhook: 'https://blackroad-slack.amundsonalexa.workers.dev/vercel'
    }
  });
}

// ── Core ────────────────────────────────────────────────

async function postToSlack(env, text) {
  const webhookUrl = await env.SLACK_KV.get('webhook_url');
  if (!webhookUrl) return json({ error: 'no webhook configured' }, 500);

  const resp = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });

  if (resp.ok) return json({ ok: true });
  return json({ error: 'slack post failed', status: resp.status }, 500);
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}
