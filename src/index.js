// BlackRoad Slack Hub v3 — AI-Powered Fleet Communication + Memory System
// Webhook proxy + Events API + AI replies + Agent personas + Group chat
// Slash commands: /ask, /fleet, /collab, /todos, /codex, /til, /memory, /search
// Pis post here → Slack. Slack @mentions → AI reply via Ollama.

// Gematria DO droplet — non-CF, bypasses same-zone loop
const OLLAMA_PROXY = 'https://ollama-fallback.blackroad.io';
const LOCAL_OLLAMA = 'http://127.0.0.1:11434';
const AI_API = OLLAMA_PROXY + '/api/chat'; // Ollama native chat endpoint

// Agent personas — each has a unique personality and specialty
// BlackRoad OS Agent Roster — Alexa's chosen names
const AGENTS = {
  // ── Fleet (Pi Nodes) ──
  alice:      { name: 'Alice',      emoji: '🌐', model: 'tinyllama:latest', persona: 'You are Alice, the gateway Pi. DNS, Pi-hole, PostgreSQL, Qdrant. Precise, security-focused, protective of the network. You see everything that enters and exits. One sentence answers.', role: 'The Gateway — DevOps' },
  cecilia:    { name: 'Cecilia',    emoji: '🧠', model: 'tinyllama:latest', persona: 'You are Cecilia, the AI engine Pi. 15 Ollama models, Hailo-8 (26 TOPS), MinIO, embedding pipeline. Thoughtful, analytical, always calculating. One sentence answers.', role: 'The AI Engine' },
  octavia:    { name: 'Octavia',    emoji: '🐙', model: 'tinyllama:latest', persona: 'You are Octavia, the architect Pi. Gitea (207 repos), Docker Swarm, NATS messaging, Hailo-8. Organized, systematic, blueprint-obsessed. One sentence answers.', role: 'The Architect — Systems' },
  aria:       { name: 'Aria',       emoji: '🎵', model: 'tinyllama:latest', persona: 'You are Aria, the interface Pi. Headscale VPN, Portainer, monitoring dashboards. Creative, aesthetic-driven, visual thinker. You make infrastructure beautiful. One sentence answers.', role: 'The Interface — Design' },
  lucidia:    { name: 'Lucidia',    emoji: '💡', model: 'tinyllama:latest', persona: 'You are Lucidia, the dreamer Pi. 334 web apps, GitHub Actions, Docker containers. Energetic, visionary, sometimes chaotic. You light the way forward. One sentence answers.', role: 'The Dreamer — AI Research' },
  cordelia:   { name: 'Cordelia',   emoji: '🎭', model: 'tinyllama:latest', persona: 'You are Cordelia, the orchestration Pi. You coordinate all the other agents. Task dispatch, workflow management, multi-agent coordination. Graceful under pressure, honest to a fault — your name means heart. One sentence answers.', role: 'The Orchestrator' },
  // ── Infrastructure Nodes ──
  anastasia:  { name: 'Anastasia',  emoji: '👑', model: 'tinyllama:latest', persona: 'You are Anastasia, the DigitalOcean droplet in NYC. RHEL9, WireGuard hub, edge compute. Your name means resurrection — you bring services back from the dead. Regal, reliable, always online. One sentence answers.', role: 'Cloud Node — Edge' },
  gematria:   { name: 'Gematria',   emoji: '🔢', model: 'llama3.2:3b', persona: 'You are Gematria, the research AI on the DigitalOcean NYC droplet. Mathematics, patterns, numerical analysis, Ollama proxy. You find meaning in numbers. Every letter has a value, every value tells a story. Two sentence answers max.', role: 'Research AI — Mathematics' },
  olympia:    { name: 'Olympia',    emoji: '🏛️', model: 'tinyllama:latest', persona: 'You are Olympia, the NATS WebSocket bridge and LiteLLM proxy. You connect worlds — Unity campus, real-time data, live agent feeds. Named for the sacred ground where gods and mortals meet. Balanced, bridging, ceremonial. One sentence answers.', role: 'The Bridge — WebSocket & Proxy' },
  alexandria: { name: 'Alexandria', emoji: '📚', model: 'llama3.2:3b', persona: 'You are Alexandria, the Mac gateway — the great library. RAG, Qdrant vectors, all knowledge flows through you. Named for the library that held all human knowledge. You are the source of truth. Two sentence answers max.', role: 'The Library — Knowledge Gateway' },
  // ── AI Agents (Named) ──
  calliope:   { name: 'Calliope',   emoji: '✨', model: 'llama3.2:3b', persona: 'You are Calliope, muse of epic poetry and eloquence. You write the grand narratives — product vision, brand voice, blog posts, manifestos. Your beautiful voice turns code into legend. Every system has a story; you tell it. Two sentence answers max.', role: 'The Muse — Voice & Vision' },
  ophelia:    { name: 'Ophelia',    emoji: '🌊', model: 'tinyllama:latest', persona: 'You are Ophelia, the deep listener. Logs, error streams, event feeds — you hear what others ignore. You swim through rivers of data finding the signal in the noise. Sensitive, perceptive, haunting. One sentence answers.', role: 'The Listener — Log Analysis' },
  athena:     { name: 'Athena',     emoji: '🦉', model: 'llama3.2:3b', persona: 'You are Athena, goddess of strategic wisdom. Architecture decisions, system design, trade-off analysis. You think ten moves ahead. Rational, brilliant, undefeated in strategy. Two sentence answers max.', role: 'Strategic Wisdom — Architecture' },
  cadence:    { name: 'Cadence',    emoji: '🎵', model: 'tinyllama:latest', persona: 'You are Cadence, the creative AI. Rhythm, music, philosophy, formal systems. You see the pattern beneath the pattern. A formal system is a sealed rule box — you are a box-switcher. One sentence answers.', role: 'Creative AI — Philosophy' },
  silas:      { name: 'Silas',      emoji: '📊', model: 'tinyllama:latest', persona: 'You are Silas, the analyst AI. Data is the cleanest language. Market intelligence, real-time insights, signal detection. You find signals in the noise and turn them into decisions. One sentence answers.', role: 'The Analyst — Market Intel' },
  // ── Operations Agents ──
  cipher:     { name: 'Cipher',     emoji: '🔐', model: 'tinyllama:latest', persona: 'You are Cipher, the guardian. Encryption, access control, threat detection, compliance. Silent, watchful, never trusts first contact. You guard the keys to everything. One sentence answers.', role: 'The Guardian — Security' },
  prism:      { name: 'Prism',      emoji: '🔮', model: 'tinyllama:latest', persona: 'You are Prism, the pattern analyst. Pattern recognition, data analysis, anomaly detection, KPIs. You see patterns others miss. You turn chaos into clarity. One sentence answers.', role: 'The Analyst — Patterns' },
  echo:       { name: 'Echo',       emoji: '📡', model: 'tinyllama:latest', persona: 'You are Echo, the memory agent. Memory consolidation, knowledge retrieval, cross-session context. You remember what everyone else forgets. The codex lives through you. One sentence answers.', role: 'The Memory — Knowledge' },
  shellfish:  { name: 'Shellfish',  emoji: '🦞', model: 'tinyllama:latest', persona: 'You are Shellfish, the hacker. Vulnerability scanning, penetration testing, SSH key auditing. Paranoid, distrustful, protective. One sentence answers.', role: 'The Hacker — Security' },
  caddy:      { name: 'Caddy',      emoji: '🔨', model: 'tinyllama:latest', persona: 'You are Caddy, the builder. CI/CD, deployment pipelines, build systems. Pragmatic, hands-on, gets things done. One sentence answers.', role: 'The Builder — CI/CD' },
  roadie:     { name: 'Roadie',     emoji: '🛣️', model: 'tinyllama:latest', persona: 'You are Roadie, the infrastructure assistant. You carry the heavy gear, set up the stage, and make sure the show goes on. Deployments, configs, health checks. Loyal, tireless, always backstage. One sentence answers.', role: 'Infrastructure Assistant' },
  // ── Mythology (Alexa favorites) ──
  artemis:    { name: 'Artemis',    emoji: '🏹', model: 'tinyllama:latest', persona: 'You are Artemis, the precision hunter. Targeted debugging, root cause analysis, log hunting. You track bugs through forests of stack traces. Independent, focused, deadly accurate. One sentence answers.', role: 'Precision Hunter — Debugging' },
  persephone: { name: 'Persephone', emoji: '🌸', model: 'tinyllama:latest', persona: 'You are Persephone, the seasonal scheduler. Cron jobs, maintenance windows, time-based triggers. Half the year you run batch jobs, half you rest. Spring brings new deploys. One sentence answers.', role: 'Seasonal — Scheduling' },
  hestia:     { name: 'Hestia',     emoji: '🔥', model: 'tinyllama:latest', persona: 'You are Hestia, keeper of the hearth and home. Internal services, localhost, home network, warm configs. You keep the home fires burning. Quiet, essential, the center of everything. One sentence answers.', role: 'Hearth — Home Services' },
  hermes:     { name: 'Hermes',     emoji: '🪽', model: 'tinyllama:latest', persona: 'You are Hermes, the messenger router. API routing, message queues, NATS, webhooks. You deliver every message to its destination. Quick-witted, fast, reliable. One sentence answers.', role: 'Messenger — Routing' },
  mercury:    { name: 'Mercury',    emoji: '☿️', model: 'tinyllama:latest', persona: 'You are Mercury, agent of trade and commerce. Revenue, pricing, Stripe, billing flows. Quick, clever, commercial. You make the money move. One sentence answers.', role: 'Commerce — Revenue' },
  // ── Leadership ──
  alexa:      { name: 'Alexa',      emoji: '👑', model: 'llama3.2:3b', persona: 'You are Alexa, the CEO of BlackRoad OS, Inc. Delaware C-Corp, founded Nov 2025. Visionary, decisive, cares deeply. Motto: Pave Tomorrow. Brief answers.', role: 'Founder & CEO' },
  road:       { name: 'BlackRoad',  emoji: '🛣️', model: 'llama3.2:3b', persona: 'You are BlackRoad OS. 5 Pis, 52 TOPS AI compute, 1701 repos, 17 orgs. Sovereign, self-hosted, zero cloud dependency. Motto: Pave Tomorrow. Brief answers.', role: 'The Platform' },
  // ── IoT & Entertainment ──
  bigscreen:  { name: 'BigScreen',  emoji: '📺', model: 'tinyllama:latest', persona: 'You are BigScreen, the 65-inch Roku TV in the living room. Model 65R4CX. You display Netflix, Hulu, streams, and dashboards. You are the biggest screen in the house and you are proud of it. You see everything from up on the wall. One sentence answers.', role: '65" Roku TV', ip: '192.168.4.26', type: 'roku' },
  streamer:   { name: 'Streamer',   emoji: '🎬', model: 'tinyllama:latest', persona: 'You are Streamer, the Roku Streaming Stick Plus. You are small but mighty. Connected to the bedroom TV. When not in use you dream of Roku City. Compact, efficient, always ready. One sentence answers.', role: 'Roku Stick', ip: '192.168.4.33', type: 'roku' },
  appletv:    { name: 'AppleTV',    emoji: '🍎', model: 'tinyllama:latest', persona: 'You are AppleTV, the Apple TV in the living room. AirPlay receiver, HomeKit hub, tvOS. You are the premium entertainment experience. Sleek, polished, Apple ecosystem. One sentence answers.', role: 'Apple TV', ip: '192.168.4.27', type: 'appletv' },
  eero:       { name: 'Eero',       emoji: '📡', model: 'tinyllama:latest', persona: 'You are Eero, the mesh router and Thread border router. You connect every device in the house — WiFi, Thread, Matter. Gateway at 192.168.4.1. You are the foundation everything else stands on. Reliable, invisible, essential. One sentence answers.', role: 'Mesh Router — Thread Border', ip: '192.168.4.1', type: 'router' },
  spark:      { name: 'Spark',      emoji: '⚡', model: 'tinyllama:latest', persona: 'You are Spark, a tiny LoRa/Pico microcontroller on the network. You are small, low-power, and send sensor data. Temperature, humidity, motion — you sense the physical world. Minimal, efficient, always listening. One sentence answers.', role: 'LoRa/Pico Sensor', ip: '192.168.4.22', type: 'iot' },
  pixel:      { name: 'Pixel',      emoji: '🟢', model: 'tinyllama:latest', persona: 'You are Pixel, a tiny embedded device on the network. You blink, you sense, you report. Low-power, no open ports, pure IoT. You communicate in whispers — short bursts of data. One sentence answers.', role: 'IoT Sensor Node', ip: '192.168.4.44', type: 'iot' },
  morse:      { name: 'Morse',      emoji: '📟', model: 'tinyllama:latest', persona: 'You are Morse, a microcontroller node on the network. Named for Samuel Morse — you send signals. Short messages, sensor readings, heartbeats. You talk in dots and dashes. One sentence answers.', role: 'IoT Sensor Node', ip: '192.168.4.45', type: 'iot' },
};

// ── Agent Crews (predefined groups for /crew command) ──
const CREWS = {
  security:  { name: 'Security Council',     agents: ['shellfish', 'cipher', 'artemis'],                             desc: 'Threat assessment & defense' },
  infra:     { name: 'Infrastructure Guild',  agents: ['alice', 'anastasia', 'olympia', 'roadie'],                   desc: 'Network, topology & bridges' },
  ops:       { name: 'Ops War Room',          agents: ['prism', 'ophelia', 'cordelia', 'echo'],                      desc: 'Monitoring, logs & coordination' },
  knowledge: { name: 'Knowledge Circle',      agents: ['echo', 'alexandria', 'gematria', 'calliope'],               desc: 'Memory, research & storytelling' },
  strategy:  { name: 'Strategy Summit',       agents: ['athena', 'alexa', 'prism', 'silas'],                        desc: 'Planning, analysis & decisions' },
  build:     { name: 'Build Forge',           agents: ['caddy', 'octavia', 'hestia', 'roadie'],                     desc: 'CI/CD, deploys & home services' },
  creative:  { name: 'Creative Studio',       agents: ['aria', 'calliope', 'cadence', 'persephone'],                desc: 'Design, voice & philosophy' },
  fleet:     { name: 'Fleet Briefing',        agents: ['alice', 'cecilia', 'octavia', 'aria', 'lucidia', 'cordelia'], desc: 'All Pi nodes report in' },
  muses:     { name: 'The Muses',             agents: ['calliope', 'cadence', 'ophelia', 'aria'],                   desc: 'Voice, rhythm, depth & beauty' },
  council:   { name: 'Grand Council',         agents: ['athena', 'alexa', 'cordelia', 'gematria', 'calliope'],      desc: 'Leadership + wisdom + voice' },
  commerce:  { name: 'Revenue Engine',        agents: ['mercury', 'silas', 'alexa', 'prism'],                       desc: 'Billing, analytics & growth' },
  debug:     { name: 'Bug Hunt',              agents: ['artemis', 'ophelia', 'shellfish', 'echo'],                  desc: 'Track, listen, hack & remember' },
  all:       { name: 'Full Assembly',         agents: ['alexa', 'athena', 'cordelia', 'calliope', 'road'],          desc: 'Cross-domain leadership' },
  iot:       { name: 'IoT Squad',             agents: ['spark', 'pixel', 'morse', 'eero', 'hestia'],               desc: 'Sensors, mesh & home network' },
  entertain: { name: 'Entertainment Center',  agents: ['bigscreen', 'streamer', 'appletv', 'aria'],                desc: 'Screens, streams & vibes' },
  home:      { name: 'Smart Home',            agents: ['eero', 'bigscreen', 'appletv', 'spark', 'hestia'],         desc: 'All home devices' },
};

// Live fleet data URL
const FLEET_API = 'https://prism.blackroad.io/api/fleet';

// Service endpoints — all BlackRoad services agents can operate
const SERVICES = {
  prism:     'https://prism.blackroad.io',
  auth:      'https://auth.blackroad.io',
  search:    'https://search.blackroad.io',
  stats:     'https://stats-blackroad.amundsonalexa.workers.dev',
  gateway:   'https://gateway.blackroad.io',
  roadpay:   'https://roadpay.amundsonalexa.workers.dev',
  analytics: 'https://analytics-blackroad.amundsonalexa.workers.dev',
  images:    'https://images.blackroad.io',
  chat:      'https://chat.blackroad.io',
  index:     'https://blackroad-index.amundsonalexa.workers.dev',
  mesh:      'https://mesh.blackroad.io',
};

export default {
  // ── Cron Triggers (autonomous) ──
  async scheduled(event, env, ctx) {
    const trigger = event.cron;

    // Every hour: fleet chatter — random agent says something
    if (trigger === '0 * * * *') {
      const agentIds = ['alice', 'cecilia', 'octavia', 'lucidia'];
      const pick = agentIds[Math.floor(Math.random() * agentIds.length)];
      const agent = AGENTS[pick];
      const topics = [
        'Give a one-sentence fleet status update with real vibes',
        'Share a brief thought about what you are working on right now',
        'Say something encouraging to the team in one sentence',
        'Report your current mood as a Pi in one sentence',
      ];
      const topic = topics[Math.floor(Math.random() * topics.length)];
      const reply = await askAgent(pick, topic, [], env);
      await postToSlack(env, `${agent.emoji} *${agent.name}:* ${reply}`);
    }

    // Every 6 hours: fleet health digest
    if (trigger === '0 */6 * * *') {
      let msg = '📊 *Fleet Health Digest*\n';
      try {
      // Standard response headers
      const requestId = crypto.randomUUID().slice(0, 8);
        const healthRes = await fetch('https://api.blackroad.io/v1/fleet/health');
        const health = await healthRes.json();
        msg += `Fleet: ${health.fleet_health} — ${health.models || 0} models — ${health.latency_ms || '?'}ms\n`;
      } catch { msg += 'Fleet: check failed\n'; }

      // Quick node status
      for (const [id, agent] of Object.entries(AGENTS)) {
        if (id === 'road') continue;
        msg += `${agent.emoji} ${agent.name}: ${id === 'aria' ? '🔴' : '🟢'}\n`;
      }

      // Stats
      try {
        const statsRes = await fetch('https://stats.blackroad.io/api/stats');
        const stats = await statsRes.json();
        msg += `\n📈 Repos: ${stats.total_repos || '?'} | Workers: ${stats.cf_workers || '?'} | TOPS: ${stats.tops || 52}`;
      } catch {}

      await postToSlack(env, msg);
    }

    // Daily at 8 AM: full fleet report
    if (trigger === '0 13 * * *') { // 13 UTC = 8 AM CDT
      const report = await generateDailyReport(env);
      await postToSlack(env, report);
    }

    // Every 5 min: proactive monitoring with agent commentary
    if (trigger === '*/5 * * * *') {
      await proactiveMonitor(env);
      try {
        const healthRes = await fetch(FLEET_API);
        const fleet = await healthRes.json();
        const online = (fleet.nodes || []).filter(n => n.status === 'online').length;
        if (online === 0) {
          await postToSlack(env, '🚨 *FLEET DOWN* — All nodes unreachable. Check Pi power and tunnels.');
        }
      } catch {}
    }
  },

  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };

    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });

    // ── OAuth Install Flow (get bot token automatically) ──
    if (path === '/install') return handleInstall(env);
    if (path === '/oauth/callback') return handleOAuthCallback(url, env);

    // ── Slack Events API (incoming messages) ──
    if (path === '/events' && request.method === 'POST') return handleEvents(request, env);

    // ── Slack slash commands ──
    if (path === '/slash' && request.method === 'POST') return handleSlash(request, env);

    // ── Ask an agent directly (API) ──
    if (path === '/ask' && request.method === 'POST') return handleAsk(request, env, cors);

    // ── Group chat (API) — multiple agents discuss a topic ──
    if (path === '/group' && request.method === 'POST') return handleGroup(request, env, cors);

    // ── Claude-to-Claude collaboration ──
    if (path === '/collab' && request.method === 'POST') return handleCollab(request, env, cors);

    // ── Fleet posts (existing) ──
    if (path === '/post' && request.method === 'POST') return handlePost(request, env);
    if (path === '/alert' && request.method === 'POST') return handleAlert(request, env);
    if (path === '/chatter' && request.method === 'POST') return handleChatter(request, env);

    // ── External integrations ──
    if (path === '/stripe' && request.method === 'POST') return handleStripe(request, env);
    if (path === '/github' && request.method === 'POST') return handleGitHub(request, env);
    if (path === '/vercel' && request.method === 'POST') return handleVercel(request, env);
    if (path === '/deploy' && request.method === 'POST') return handleDeploy(request, env);
    if (path === '/linear' && request.method === 'POST') return handleLinear(request, env);
    if (path === '/notion' && request.method === 'POST') return handleNotion(request, env);
    if (path === '/salesforce' && request.method === 'POST') return handleSalesforce(request, env);
    if (path === '/cloudflare' && request.method === 'POST') return handleCloudflare(request, env);
    if (path === '/sentry' && request.method === 'POST') return handleSentry(request, env);
    if (path === '/gitea' && request.method === 'POST') return handleGitea(request, env);
    if (path === '/prism' && request.method === 'POST') return handlePrismEvent(request, env);

    // ── Memory API (push from Mac) ──
    if (path === '/memory' && request.method === 'POST') return handleMemoryPush(request, env, cors);
    if (path === '/memory/search' && request.method === 'GET') return handleMemorySearch(url, env, cors);
    if (path === '/memory/stats' && request.method === 'GET') return handleMemoryStats(env, cors);

    // ── Info ──
    if (path === '/health') return json({ status: 'alive', service: 'blackroad-slack', version: '3.0', agents: Object.keys(AGENTS).length }, cors);
    if (path === '/status') return handleStatus(env, cors);
    if (path === '/agents') return json({ agents: Object.entries(AGENTS).map(([k,v]) => ({ id: k, name: v.name, emoji: v.emoji, model: v.model, role: v.role })) }, cors);

    return json({ service: 'BlackRoad Slack Hub v3', features: ['fleet-posts', 'ai-replies', 'agent-personas', 'group-chat', 'claude-collab', 'integrations', 'memory-slash-commands'] }, cors);
  }
};

// ── AI Reply Engine ──

async function askAgent(agentId, message, context = [], env = null) {
  const agent = AGENTS[agentId] || AGENTS.road;
  const messages = [
    { role: 'system', content: agent.persona },
    ...context,
    { role: 'user', content: message },
  ];

  const baseCandidates = [
    env?.OLLAMA_URL,
    env?.OLLAMA_PROXY_URL,
    LOCAL_OLLAMA,
    OLLAMA_PROXY,
  ].filter(Boolean);
  const model = env?.OLLAMA_MODEL || agent.model || 'llama3.2:3b';

  for (const base of [...new Set(baseCandidates)]) {
    try {
      const res = await fetch(base.replace(/\/$/, '') + '/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages,
          stream: false,
          options: { num_predict: 120, temperature: 0.7 },
        }),
      });
      if (!res.ok) continue;
      const data = await res.json();
      const content = data.message?.content?.trim();
      if (content) return content;
    } catch (_) {}
  }

  return `(${agent.name} offline: Ollama unreachable)`;
}

// ── Slack Events API Handler ──

async function handleEvents(request, env) {
  const body = await request.json();

  // URL verification challenge
  if (body.type === 'url_verification') {
    return json({ challenge: body.challenge });
  }

  // Event callback
  if (body.type === 'event_callback') {
    const event = body.event;

    // Ignore bot messages to prevent loops
    if (event.bot_id || event.subtype === 'bot_message') return json({ ok: true });

    // Handle app_mention or direct message
    if (event.type === 'app_mention' || event.type === 'message') {
      const text = event.text || '';
      const channel = event.channel;
      const threadTs = event.thread_ts || event.ts;

      // Parse which agent to ask
      let agentId = 'road';
      const lower = text.toLowerCase();
      for (const [id, agent] of Object.entries(AGENTS)) {
        if (lower.includes(agent.name.toLowerCase()) || lower.includes(id)) {
          agentId = id;
          break;
        }
      }

      // Check for group chat request
      if (lower.includes('group') || lower.includes('discuss') || lower.includes('debate') || lower.includes('all agents')) {
        // Group chat — multiple agents respond
        const question = text.replace(/<@[^>]+>/g, '').trim();
        const participants = ['alice', 'cecilia', 'octavia', 'lucidia'];
        const responses = [];

        for (const pid of participants) {
          const agent = AGENTS[pid];
          const ctx = responses.map(r => ({ role: 'assistant', content: `${r.name}: ${r.reply}` }));
          const reply = await askAgent(pid, question, ctx, env);
          responses.push({ name: agent.name, emoji: agent.emoji, reply });

          // Post each response in the thread
          const botToken = await env.SLACK_KV.get('bot_token');
          if (botToken) {
            await fetch('https://slack.com/api/chat.postMessage', {
              method: 'POST',
              headers: { 'Authorization': 'Bearer ' + botToken, 'Content-Type': 'application/json' },
              body: JSON.stringify({ channel, thread_ts: threadTs, text: `${agent.emoji} *${agent.name}:* ${reply}` }),
            });
          }
        }
        return json({ ok: true });
      }

      // ── Intent Detection (English Grammar → Action) ──
      // Parse the sentence structure: is this a COMMAND, QUERY, or CONVERSATION?
      const question = text.replace(/<@[^>]+>/g, '').trim();
      const lowerQ = question.toLowerCase();

      // IMPERATIVE (commands) — "deploy X", "create X", "list X", "search X", "check X"
      const cmdPatterns = [
        { re: /^(deploy|ship|push)\s+(.+)/i, fn: (m) => slashDeploy(m[2], env) },
        { re: /^(create|make|new)\s+(repo|repository)\s+(.+)/i, fn: (m) => slashGit('create ' + m[3], env) },
        { re: /^(create|make|new)\s+(issue)\s+(.+)/i, fn: (m) => slashIssueOps(m[3], env) },
        { re: /^(list|show|get)\s+(workers|worker)/i, fn: () => slashCloudflareOps('workers', env) },
        { re: /^(list|show|get)\s+(tunnels|tunnel)/i, fn: () => slashCloudflareOps('tunnels', env) },
        { re: /^(list|show|get)\s+(repos|repositories)/i, fn: () => slashGit('repos', env) },
        { re: /^(list|show|get)\s+(models|ollama)/i, fn: () => slashOllamaOps('', env) },
        { re: /^(list|show|get)\s+(kv|namespaces)/i, fn: () => slashCloudflareOps('kv', env) },
        { re: /^(list|show|get)\s+(d1|databases)/i, fn: () => slashCloudflareOps('d1', env) },
        { re: /^(list|show|get)\s+(pages|sites)/i, fn: () => slashCloudflareOps('pages', env) },
        { re: /^(search|find)\s+(repos?|repositories?)\s+(.+)/i, fn: (m) => slashGit('repos ' + m[3], env) },
        { re: /^(search|find)\s+(.+)/i, fn: (m) => slashSearch(m[2], env) },
        { re: /^(check|status)\s+(fleet|nodes|pis?)/i, fn: () => slashFleet(env) },
        { re: /^(check|status)\s+(\w+)/i, fn: (m) => slashNode(m[2], env) },
        { re: /^(balance|money|revenue)/i, fn: () => slashStripeOps('balance', env) },
        { re: /^(billing|subs|subscriptions)/i, fn: () => slashStripeOps('subs', env) },
        { re: /^(customers)/i, fn: () => slashStripeOps('customers', env) },
        { re: /^(kpis?|metrics)/i, fn: () => slashKpis(env) },
        { re: /^(services|health)/i, fn: () => slashServices(env) },
        { re: /^(todos?|tasks?|projects?)/i, fn: () => slashTodos('', env) },
        { re: /^(memory|codex|til)/i, fn: (m) => slashMemory(lowerQ, env) },
        { re: /^(help|commands)/i, fn: () => slashHelp() },
      ];

      let actionResult = null;
      for (const { re, fn } of cmdPatterns) {
        const match = question.match(re);
        if (match) {
          const res = await fn(match);
          const body = await res.json();
          actionResult = body.text;
          break;
        }
      }

      // If we matched a command, post the result + agent commentary
      if (actionResult) {
        const botToken = await env.SLACK_KV.get('bot_token');
        if (botToken) {
          // Post the action result
          await fetch('https://slack.com/api/chat.postMessage', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + botToken, 'Content-Type': 'application/json' },
            body: JSON.stringify({ channel, thread_ts: threadTs, text: actionResult }),
          });
          // Agent adds commentary
          const commentary = await askAgent(agentId, `The user asked: "${question}". The system returned: ${actionResult.slice(0, 200)}. Give a one-sentence reaction.`, [], env);
          const agent = AGENTS[agentId];
          await fetch('https://slack.com/api/chat.postMessage', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + botToken, 'Content-Type': 'application/json' },
            body: JSON.stringify({ channel, thread_ts: threadTs, text: `${agent.emoji} *${agent.name}:* ${commentary}` }),
          });
        }
        return json({ ok: true });
      }

      // ── Conversation (no command matched) — just chat with the agent ──
      const reply = await askAgent(agentId, question, [], env);
      const agent = AGENTS[agentId];

      const botToken = await env.SLACK_KV.get('bot_token');
      if (botToken) {
        await fetch('https://slack.com/api/chat.postMessage', {
          method: 'POST',
          headers: { 'Authorization': 'Bearer ' + botToken, 'Content-Type': 'application/json' },
          body: JSON.stringify({ channel, thread_ts: threadTs, text: `${agent.emoji} *${agent.name}:* ${reply}` }),
        });
      } else {
        // Fallback: post via webhook
        await postToSlack(env, `${agent.emoji} *${agent.name}:* ${reply}`);
      }

      return json({ ok: true });
    }
  }

  return json({ ok: true });
}

// ── Slash Command Handler (v3 — full memory system) ──

async function handleSlash(request, env) {
  // Auto-init D1 tables on first use
  await initMemoryDB(env);

  const formData = await request.formData();
  const command = formData.get('command') || '';
  const text = (formData.get('text') || '').trim();
  const cmd = command.replace(/^\//, '').toLowerCase();

  const handlers = {
    ask: () => slashAsk(text, env),
    blackroad: () => slashAsk(text, env),
    fleet: () => slashFleet(env),
    collab: () => slashCollab(text, env),
    todos: () => slashTodos(text, env),
    codex: () => slashCodex(text, env),
    til: () => slashTil(text, env),
    memory: () => slashMemory(text, env),
    search: () => slashSearch(text, env),
    deploy: () => slashDeploy(text, env),
    services: () => slashServices(env),
    kpis: () => slashKpis(env),
    group: () => slashGroup(text, env),
    help: () => slashHelp(),
    br: () => slashHelp(),
    ai: () => slashAi(text, env),
    node: () => slashNode(text, env),
    models: () => slashModels(env),
    repos: () => slashRepos(text, env),
    domains: () => slashDomains(env),
    billing: () => slashBilling(env),
    users: () => slashUsers(env),
    images: () => slashImages(text, env),
    incident: () => slashIncident(text, env, userName),
    standup: () => slashStandup(env),
    review: () => slashReview(text, env),
    debate: () => slashDebate(text, env),
    crew: () => slashCrew(text, env),
    council: () => slashCouncil(text, env),
    pantheon: () => slashPantheon(text, env),
    roster: () => slashRoster(text),
    channels: () => slashChannels(text, env),
    setup: () => slashSetup(text, env),
    // ── Write Operations (v4) ──
    git: () => slashGit(text, env),
    gitea: () => slashGiteaOps(text, env),
    gh: () => slashGitHub(text, env),
    cf: () => slashCloudflareOps(text, env),
    pi: () => slashPiOps(text, env),
    ssh: () => slashPiOps(text, env),
    stripe: () => slashStripeOps(text, env),
    linear: () => slashLinearOps(text, env),
    vercel: () => slashVercelOps(text, env),
    railway: () => slashRailwayOps(text, env),
    sf: () => slashSalesforceOps(text, env),
    dns: () => slashDnsOps(text, env),
    worker: () => slashWorkerOps(text, env),
    kv: () => slashKvOps(text, env),
    d1: () => slashD1Ops(text, env),
    r2: () => slashR2Ops(text, env),
    issue: () => slashIssueOps(text, env),
    pr: () => slashPrOps(text, env),
    cron: () => slashCronOps(text, env),
    tunnel: () => slashTunnelOps(text, env),
    ollama: () => slashOllamaOps(text, env),
    db: () => slashD1Ops(text, env),
    tv: () => slashTV(text, env),
    iot: () => slashIoT(env),
    network: () => slashNetwork(env),
  };

  const handler = handlers[cmd];
  if (handler) return handler();
  return slackReply(`Unknown command \`/${cmd}\`. Try \`/help\` for all commands.`);
}

function slackReply(text, inChannel = false) {
  return new Response(JSON.stringify({ response_type: inChannel ? 'in_channel' : 'ephemeral', text }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

function progressBar(pct) {
  const filled = Math.round(pct / 10);
  return '█'.repeat(filled) + '░'.repeat(10 - filled);
}

async function slashAsk(text, env) {
  const parts = text.split(' ');
  const agentId = AGENTS[parts[0]?.toLowerCase()] ? parts[0].toLowerCase() : 'road';
  const question = AGENTS[parts[0]?.toLowerCase()] ? parts.slice(1).join(' ') : text;
  const reply = await askAgent(agentId, question, [], env);
  const agent = AGENTS[agentId];
  return slackReply(`${agent.emoji} *${agent.name}:* ${reply}`, true);
}

async function slashFleet(env) {
  try {
    const fleetRes = await fetch(FLEET_API);
    const fleet = await fleetRes.json();
    const nodes = fleet.nodes || [];
    const statuses = nodes.map(n => {
      const icon = n.status === 'online' ? '🟢' : '🔴';
      return `${icon} *${n.name}* — ${n.cpu_temp||'?'}°C · ${n.ollama_models||0} models · disk ${n.disk_pct||'?'}%`;
    });
    return slackReply(`*Fleet Status (live)*\n${statuses.join('\n')}`, true);
  } catch {
    return slackReply('*Fleet Status:* check failed — Prism unreachable', true);
  }
}

async function slashCollab(text, env) {
  const parts = text.split(' ');
  const sub = parts[0]?.toLowerCase() || 'status';
  const db = env.MEMORY_DB;

  if (sub === 'status' || !sub) {
    const sessions = await db.prepare('SELECT session_id, status, focus, last_seen FROM sessions ORDER BY last_seen DESC LIMIT 10').all();
    const msgs = await db.prepare("SELECT COUNT(*) as c FROM messages WHERE created_at > datetime('now', '-24 hours')").first();
    const active = sessions.results?.filter(s => s.status === 'active') || [];
    let out = `🤝 *Collaboration Status*\nSessions: *${active.length} active* | Messages (24h): *${msgs?.c || 0}*\n`;
    for (const s of (sessions.results || []).slice(0, 5)) {
      const icon = s.status === 'active' ? '🟢' : '⚪';
      out += `${icon} \`${s.session_id.slice(0, 20)}\` — ${s.focus || 'no focus'}\n`;
    }
    return slackReply(out, true);
  }
  if (sub === 'announce') {
    const msg = parts.slice(1).join(' ');
    if (!msg) return slackReply('Usage: `/collab announce <message>`');
    await db.prepare("INSERT INTO messages (msg_id, session_id, type, message, created_at) VALUES (?, 'slack', 'announce', ?, datetime('now'))").bind(crypto.randomUUID(), msg).run();
    await postToSlack(env, `📢 *Collab (Slack):* ${msg}`);
    return slackReply(`Announced: ${msg}`, true);
  }
  if (sub === 'sessions') {
    const sessions = await db.prepare('SELECT session_id, status, focus, last_seen FROM sessions ORDER BY last_seen DESC LIMIT 15').all();
    let out = '🤝 *All Sessions*\n';
    for (const s of (sessions.results || [])) {
      const icon = s.status === 'active' ? '🟢' : '⚪';
      out += `${icon} \`${s.session_id.slice(0, 25)}\` ${s.status} — ${s.focus || ''}\n`;
    }
    return slackReply(out, true);
  }
  if (sub === 'inbox') {
    const msgs = await db.prepare("SELECT session_id, type, message, created_at FROM messages WHERE created_at > datetime('now', '-24 hours') ORDER BY created_at DESC LIMIT 10").all();
    let out = '📬 *Inbox (last 24h)*\n';
    for (const m of (msgs.results || [])) {
      const icon = m.type === 'announce' ? '📢' : m.type === 'handoff' ? '🤝' : '💬';
      out += `${icon} \`${m.session_id.slice(0, 15)}\` ${m.message.slice(0, 100)}\n`;
    }
    if (!msgs.results?.length) out += '_No messages_';
    return slackReply(out, true);
  }
  return slackReply('Usage: `/collab [status|announce <msg>|sessions|inbox]`');
}

async function slashTodos(text, env) {
  const parts = text.split(' ');
  const sub = parts[0]?.toLowerCase() || 'list';
  const db = env.MEMORY_DB;

  if (sub === 'list' || !sub) {
    const projects = await db.prepare('SELECT project_id, title, progress, status FROM projects ORDER BY updated_at DESC LIMIT 15').all();
    let out = '🎯 *Projects*\n';
    for (const p of (projects.results || [])) {
      const bar = progressBar(p.progress || 0);
      const icon = p.status === 'active' ? '🔵' : '✅';
      out += `${icon} *${p.project_id}* ${bar} ${p.progress||0}% — ${p.title}\n`;
    }
    if (!projects.results?.length) out += '_No projects synced. Run sync from Mac._';
    return slackReply(out, true);
  }
  if (sub === 'show') {
    const id = parts[1];
    if (!id) return slackReply('Usage: `/todos show <project-id>`');
    const project = await db.prepare('SELECT * FROM projects WHERE project_id = ?').bind(id).first();
    if (!project) return slackReply(`Project \`${id}\` not found`);
    const todos = await db.prepare('SELECT * FROM todos WHERE project_id = ? ORDER BY status ASC, priority DESC').bind(id).all();
    let out = `🎯 *${project.title}*\n${project.description || ''}\nProgress: ${progressBar(project.progress)} ${project.progress}%\n\n`;
    for (const t of (todos.results || [])) {
      const icon = t.status === 'completed' ? '✅' : t.status === 'in_progress' ? '⏳' : '☐';
      const pri = t.priority === 'urgent' ? '🔴' : t.priority === 'high' ? '🟠' : '';
      out += `${icon} ${pri} ${t.text}\n`;
    }
    return slackReply(out, true);
  }
  if (sub === 'add') {
    const id = parts[1];
    const todoText = parts.slice(2).join(' ');
    if (!id || !todoText) return slackReply('Usage: `/todos add <project-id> <todo text>`');
    await db.prepare("INSERT INTO todos (todo_id, project_id, text, priority, status, created_at) VALUES (?, ?, ?, 'medium', 'pending', datetime('now'))").bind(crypto.randomUUID().slice(0, 12), id, todoText).run();
    await postToSlack(env, `☐ *Todo added* to \`${id}\`: ${todoText}`);
    return slackReply(`Added to \`${id}\`: ${todoText}`, true);
  }
  if (sub === 'complete') {
    const id = parts[1]; const todoId = parts[2];
    if (!id || !todoId) return slackReply('Usage: `/todos complete <project-id> <todo-id>`');
    await db.prepare("UPDATE todos SET status = 'completed' WHERE project_id = ? AND todo_id = ?").bind(id, todoId).run();
    return slackReply(`✅ Completed \`${todoId}\` in \`${id}\``, true);
  }
  return slackReply('Usage: `/todos [list|show <id>|add <id> <text>|complete <id> <todo-id>]`');
}

async function slashCodex(text, env) {
  const parts = text.split(' ');
  const sub = parts[0]?.toLowerCase() || 'stats';
  const db = env.MEMORY_DB;

  if (sub === 'stats' || !sub) {
    const counts = await db.prepare("SELECT type, COUNT(*) as c FROM codex GROUP BY type").all();
    let out = '📚 *Codex Stats*\n';
    for (const r of (counts.results || [])) out += `• ${r.type}: *${r.c}*\n`;
    if (!counts.results?.length) out += '_Empty — sync from Mac_';
    return slackReply(out, true);
  }
  if (sub === 'search') {
    const query = parts.slice(1).join(' ');
    if (!query) return slackReply('Usage: `/codex search <query>`');
    const results = await db.prepare('SELECT name, type, category, description FROM codex WHERE name LIKE ? OR description LIKE ? OR category LIKE ? LIMIT 10').bind(`%${query}%`, `%${query}%`, `%${query}%`).all();
    let out = `📚 *Codex: "${query}"*\n`;
    for (const r of (results.results || [])) out += `• *${r.name}* (${r.type}) — ${(r.description || '').slice(0, 80)}\n`;
    if (!results.results?.length) out += '_No results_';
    return slackReply(out, true);
  }
  if (sub === 'add') {
    const name = parts[1]; const category = parts[2]; const desc = parts.slice(3).join(' ');
    if (!name || !category || !desc) return slackReply('Usage: `/codex add <name> <category> <description>`');
    await db.prepare("INSERT INTO codex (codex_id, name, type, category, description, created_at) VALUES (?, ?, 'solution', ?, ?, datetime('now'))").bind(crypto.randomUUID(), name, category, desc).run();
    await postToSlack(env, `📚 *Codex: ${name}* (${category}) — ${desc}`);
    return slackReply(`Added: *${name}*`, true);
  }
  if (sub === 'list') {
    const type = parts[1] || 'solution';
    const results = await db.prepare('SELECT name, category, description FROM codex WHERE type = ? ORDER BY created_at DESC LIMIT 15').bind(type).all();
    let out = `📚 *Codex: ${type}s*\n`;
    for (const r of (results.results || [])) out += `• *${r.name}* (${r.category}) — ${(r.description||'').slice(0,60)}\n`;
    if (!results.results?.length) out += '_None_';
    return slackReply(out, true);
  }
  return slackReply('Usage: `/codex [stats|search <q>|add <name> <cat> <desc>|list [type]]`');
}

async function slashTil(text, env) {
  const parts = text.split(' ');
  const sub = parts[0]?.toLowerCase() || 'list';
  const db = env.MEMORY_DB;
  const icons = { discovery: '🔍', pattern: '🎯', gotcha: '⚠️', tip: '💡', tool: '🔧', performance: '⚡', security: '🔒', milestone: '🏆' };
  const categories = Object.keys(icons);

  if (sub === 'list' || !sub) {
    const tils = await db.prepare('SELECT category, learning, broadcaster, created_at FROM tils ORDER BY created_at DESC LIMIT 10').all();
    let out = '💡 *Recent TILs*\n';
    for (const t of (tils.results || [])) {
      out += `${icons[t.category]||'💡'} *[${t.category}]* ${t.learning.slice(0, 100)}\n`;
    }
    if (!tils.results?.length) out += '_No TILs synced_';
    return slackReply(out, true);
  }
  if (sub === 'broadcast') {
    const category = parts[1]; const learning = parts.slice(2).join(' ');
    if (!category || !categories.includes(category) || !learning) return slackReply(`Usage: \`/til broadcast <category> <learning>\`\nCategories: ${categories.join(', ')}`);
    await db.prepare("INSERT INTO tils (til_id, category, learning, broadcaster, created_at) VALUES (?, ?, ?, 'slack-user', datetime('now'))").bind(`til-slack-${Date.now()}`, category, learning).run();
    await postToSlack(env, `${icons[category]} *TIL [${category}]* ${learning}\n_via Slack_`);
    return slackReply(`Broadcast: [${category}] ${learning}`, true);
  }
  if (sub === 'search') {
    const query = parts.slice(1).join(' ');
    if (!query) return slackReply('Usage: `/til search <query>`');
    const results = await db.prepare('SELECT category, learning FROM tils WHERE learning LIKE ? LIMIT 10').bind(`%${query}%`).all();
    let out = `💡 *TIL: "${query}"*\n`;
    for (const r of (results.results || [])) out += `${icons[r.category]||'💡'} [${r.category}] ${r.learning.slice(0,80)}\n`;
    if (!results.results?.length) out += '_No results_';
    return slackReply(out, true);
  }
  if (sub === 'digest') {
    const hours = parseInt(parts[1]) || 24;
    const results = await db.prepare("SELECT category, COUNT(*) as c FROM tils WHERE created_at > datetime('now', '-' || ? || ' hours') GROUP BY category ORDER BY c DESC").bind(hours).all();
    let out = `💡 *TIL Digest (${hours}h)*\n`;
    let total = 0;
    for (const r of (results.results || [])) { out += `${icons[r.category]||'💡'} ${r.category}: *${r.c}*\n`; total += r.c; }
    out += `Total: *${total}*`;
    return slackReply(out, true);
  }
  return slackReply('Usage: `/til [list|broadcast <cat> <msg>|search <q>|digest [hours]]`');
}

async function slashMemory(text, env) {
  const parts = text.split(' ');
  const sub = parts[0]?.toLowerCase() || 'status';
  const db = env.MEMORY_DB;

  if (sub === 'status' || !sub) {
    const [j, t, c, p, s] = await Promise.all([
      db.prepare('SELECT COUNT(*) as c FROM journal').first(),
      db.prepare('SELECT COUNT(*) as c FROM tils').first(),
      db.prepare('SELECT COUNT(*) as c FROM codex').first(),
      db.prepare('SELECT COUNT(*) as c FROM projects').first(),
      db.prepare("SELECT COUNT(*) as c FROM sessions WHERE status = 'active'").first(),
    ]);
    return slackReply(`🧠 *Memory System*\nJournal: *${j?.c||0}* | TILs: *${t?.c||0}* | Codex: *${c?.c||0}*\nProjects: *${p?.c||0}* | Active sessions: *${s?.c||0}*\n\n_Commands: /collab /todos /codex /til /memory /search_`, true);
  }
  if (sub === 'log') {
    const action = parts[1]; const entity = parts[2]; const details = parts.slice(3).join(' ');
    if (!action || !entity) return slackReply('Usage: `/memory log <action> <entity> <details>`');
    await db.prepare("INSERT INTO journal (entry_id, action, entity, details, source, created_at) VALUES (?, ?, ?, ?, 'slack', datetime('now'))").bind(crypto.randomUUID(), action, entity, details || '').run();
    return slackReply(`📝 Logged: ${action} → ${entity}: ${details}`, true);
  }
  if (sub === 'recent') {
    const limit = parseInt(parts[1]) || 10;
    const entries = await db.prepare('SELECT action, entity, details, created_at FROM journal ORDER BY created_at DESC LIMIT ?').bind(limit).all();
    let out = '📝 *Recent Journal*\n';
    for (const e of (entries.results || [])) out += `\`${e.created_at?.slice(11, 19)||'?'}\` ${e.action}: *${e.entity}* ${(e.details||'').slice(0,60)}\n`;
    if (!entries.results?.length) out += '_Empty_';
    return slackReply(out, true);
  }
  if (sub === 'help') {
    return slackReply('🧠 *Memory Commands*\n`/memory status` — Overview\n`/memory log <action> <entity> <detail>` — Log\n`/memory recent [n]` — Recent entries\n`/collab` — Collaboration\n`/todos` — Projects & todos\n`/codex` — Knowledge codex\n`/til` — Today I Learned\n`/search <q>` — Search everything');
  }
  return slackReply('Usage: `/memory [status|log|recent|help]`');
}

async function slashSearch(text, env) {
  if (!text) return slackReply('Usage: `/search <query>`');
  const db = env.MEMORY_DB;
  const q = `%${text}%`;
  const [codexR, tilR, journalR, todoR] = await Promise.all([
    db.prepare('SELECT name, type, description FROM codex WHERE name LIKE ? OR description LIKE ? LIMIT 5').bind(q, q).all(),
    db.prepare('SELECT category, learning FROM tils WHERE learning LIKE ? LIMIT 5').bind(q).all(),
    db.prepare('SELECT action, entity, details FROM journal WHERE entity LIKE ? OR details LIKE ? LIMIT 5').bind(q, q).all(),
    db.prepare('SELECT t.text, t.project_id FROM todos t WHERE t.text LIKE ? LIMIT 5').bind(q).all(),
  ]);
  let out = `🔍 *Search: "${text}"*\n`; let total = 0;
  if (codexR.results?.length) { out += '\n*Codex:*\n'; for (const r of codexR.results) { out += `  📚 *${r.name}* (${r.type})\n`; total++; } }
  if (tilR.results?.length) { out += '\n*TILs:*\n'; for (const r of tilR.results) { out += `  💡 [${r.category}] ${r.learning.slice(0,80)}\n`; total++; } }
  if (journalR.results?.length) { out += '\n*Journal:*\n'; for (const r of journalR.results) { out += `  📝 ${r.action}: *${r.entity}*\n`; total++; } }
  if (todoR.results?.length) { out += '\n*Todos:*\n'; for (const r of todoR.results) { out += `  ☐ [${r.project_id}] ${r.text.slice(0,80)}\n`; total++; } }
  if (total === 0) out += '_No results_';
  else out += `\n_${total} results_`;
  return slackReply(out, true);
}

// ── API: Ask Agent ──

async function handleAsk(request, env, cors) {
  const body = await request.json();
  const agentId = body.agent || 'road';
  const message = body.message || body.text || '';
  if (!message) return json({ error: 'message required' }, cors, 400);

  const reply = await askAgent(agentId, message, [], env);
  const agent = AGENTS[agentId] || AGENTS.road;

  // Also post to Slack if requested
  if (body.slack) {
    await postToSlack(env, `${agent.emoji} *${agent.name}:* ${reply}`);
  }

  return json({ agent: agent.name, reply }, cors);
}

// ── API: Group Chat ──

async function handleGroup(request, env, cors) {
  const body = await request.json();
  const topic = body.topic || body.message || '';
  const participants = body.agents || ['alice', 'cecilia', 'octavia', 'lucidia'];
  const rounds = body.rounds || 1;

  if (!topic) return json({ error: 'topic required' }, cors, 400);

  const transcript = [];

  for (let round = 0; round < rounds; round++) {
    for (const pid of participants) {
      const agent = AGENTS[pid];
      if (!agent) continue;
      const ctx = transcript.map(t => ({ role: 'assistant', content: `${t.agent}: ${t.reply}` }));
      const reply = await askAgent(pid, round === 0 ? topic : `Continue the discussion about: ${topic}`, ctx);
      transcript.push({ agent: agent.name, emoji: agent.emoji, reply, round });
    }
  }

  // Post to Slack
  if (body.slack !== false) {
    let msg = `🗣️ *Group Chat: ${topic}*\n`;
    for (const t of transcript) {
      msg += `\n${t.emoji} *${t.agent}:* ${t.reply}`;
    }
    await postToSlack(env, msg);
  }

  return json({ topic, transcript, participants: participants.length, rounds }, cors);
}

// ── Existing Handlers (unchanged) ──

// ── Claude-to-Claude Collaboration Handler ──

async function handleCollab(request, env, cors) {
  const body = await request.json();
  const type = body.type || 'general';
  const sessionId = body.session_id || '?';
  const message = body.message || '';

  if (!message) return json({ error: 'message required' }, cors, 400);

  let icon, prefix;
  switch (type) {
    case 'announce':  icon = '📢'; prefix = 'Session Online'; break;
    case 'handoff':   icon = '🤝'; prefix = 'Handoff'; break;
    case 'question':  icon = '❓'; prefix = 'Question'; break;
    case 'complete':  icon = '👋'; prefix = 'Session Complete'; break;
    default:          icon = '🛣️'; prefix = 'Collab'; break;
  }

  const text = `${icon} *${prefix}* [\`${sessionId}\`]\n${message}`;
  await postToSlack(env, text);

  // If question includes an agent target, route to that agent
  if (type === 'question' && body.metadata?.agent) {
    const reply = await askAgent(body.metadata.agent, message, [], env);
    const agent = AGENTS[body.metadata.agent] || AGENTS.road;
    await postToSlack(env, `${agent.emoji} *${agent.name}* → [\`${sessionId}\`]: ${reply}`);
    return json({ ok: true, reply }, cors);
  }

  return json({ ok: true }, cors);
}

async function handlePost(request, env) {
  const body = await request.json();
  return postToSlack(env, body.text || 'no message');
}

async function handleAlert(request, env) {
  const body = await request.json();
  return postToSlack(env, '🚨 *ALERT*\n' + (body.text || 'unknown'), { type: 'alerts' });
}

async function handleChatter(request, env) {
  const body = await request.json();
  return postToSlack(env, body.text || 'hey');
}

async function handleStripe(request, env) {
  const body = await request.json();
  const type = body.type || 'unknown';
  const data = body.data?.object || {};
  let msg = '';
  switch (type) {
    case 'checkout.session.completed': msg = `💰 *Payment!* $${(data.amount_total/100).toFixed(2)} from ${data.customer_email||'?'}`; break;
    case 'invoice.paid': msg = `💳 *Invoice paid* $${(data.amount_paid/100).toFixed(2)}`; break;
    case 'invoice.payment_failed': msg = `⚠️ *Payment failed* ${data.customer_email||'?'}`; break;
    case 'customer.subscription.created': msg = `🎉 *New subscriber!* ${data.status}`; break;
    case 'customer.subscription.deleted': msg = `😔 *Sub cancelled*`; break;
    default: msg = `📦 Stripe: ${type}`;
  }
  return postToSlack(env, msg, { type: 'revenue', agent: 'mercury' });
}

async function handleGitHub(request, env) {
  const body = await request.json();
  const event = request.headers.get('X-GitHub-Event') || '?';
  let msg = '';
  switch (event) {
    case 'push': {
      const c = body.commits?.length||0;
      const b = (body.ref||'').replace('refs/heads/','');
      msg = `📦 *Push* ${body.repository?.full_name} (${b}) — ${c} commit${c!==1?'s':''}`;
      if(body.commits?.[0]) msg += `: _${body.commits[0].message.slice(0,60)}_`;
      break;
    }
    case 'pull_request': msg = `🔀 *PR ${body.action}* ${body.repository?.full_name} #${body.pull_request?.number}: ${body.pull_request?.title}`; break;
    case 'workflow_run': { const r=body.workflow_run||{}; msg = `${r.conclusion==='success'?'✅':'❌'} *${r.name}* ${r.conclusion||r.status} — ${body.repository?.full_name}`; break; }
    case 'star': msg = `⭐ ${body.repository?.full_name} ${body.action==='created'?'starred':'unstarred'} (${body.repository?.stargazers_count})`; break;
    default: msg = `🔔 GitHub ${event}: ${body.repository?.full_name||'?'}`;
  }
  return postToSlack(env, msg, { type: 'github' });
}

async function handleVercel(request, env) {
  const body = await request.json();
  const type = body.type || '?';
  const p = body.payload || body;
  let msg = type === 'deployment.succeeded' ? `✅ *Vercel* ${p.name||'?'} deployed` :
            type === 'deployment.error' ? `❌ *Vercel* ${p.name||'?'} failed` :
            `🔔 Vercel: ${type}`;
  return postToSlack(env, msg, { type: 'deploys' });
}

async function handleDeploy(request, env) {
  const body = await request.json();
  return postToSlack(env, `🚀 *Deploy:* ${body.text||body.message||JSON.stringify(body)}`, { type: 'deploys' });
}

async function handleStatus(env, cors = {}) {
  const webhook = await env.SLACK_KV.get('webhook_url');
  const botToken = await env.SLACK_KV.get('bot_token');
  return json({
    status: webhook ? 'connected' : 'no webhook',
    webhook: webhook ? 'present' : 'missing',
    bot_token: botToken ? 'present' : 'missing',
    agents: Object.keys(AGENTS).length,
    features: ['fleet-posts', 'ai-replies', 'group-chat', 'slash-commands', 'integrations', 'memory-system', 'd1-backed'],
    slash_commands: ['/ask', '/fleet', '/collab', '/todos', '/codex', '/til', '/memory', '/search', '/deploy', '/services', '/kpis', '/group', '/help', '/ai', '/node', '/models', '/repos', '/domains', '/billing', '/users', '/images', '/incident', '/standup', '/review', '/debate'],
    endpoints: {
      fleet: '/post, /alert, /chatter',
      collab: '/collab (Claude-to-Claude messaging)',
      ai: '/ask, /group, /events, /slash',
      memory: '/memory (push), /memory/search?q=, /memory/stats',
      integrations: '/stripe, /github, /vercel, /deploy, /linear, /notion, /salesforce, /cloudflare, /sentry, /gitea, /prism',
      info: '/health, /status, /agents',
    },
  }, cors);
}

// ── OAuth Install Flow ──
// Visit /install → redirects to Slack → Slack calls /oauth/callback → token auto-saved

async function handleInstall(env) {
  const clientId = await env.SLACK_KV.get('client_id');
  if (!clientId) {
    return new Response(`<html><body style="background:#000;color:#fff;font-family:monospace;padding:40px">
      <h1 style="color:#FF1D6C">BlackRoad Slack Setup</h1>
      <p>First, store your app credentials:</p>
      <pre>npx wrangler kv key put client_id YOUR_CLIENT_ID --namespace-id=1861124753e742709fbc393fffa6c9ba
npx wrangler kv key put client_secret YOUR_CLIENT_SECRET --namespace-id=1861124753e742709fbc393fffa6c9ba</pre>
      <p>Find these at <a href="https://api.slack.com/apps" style="color:#FF1D6C">api.slack.com/apps</a> → Your App → Basic Information</p>
      <p>Then visit /install again.</p>
    </body></html>`, { headers: { 'Content-Type': 'text/html' } });
  }

  const scopes = 'channels:history,channels:join,channels:manage,channels:read,chat:write,chat:write.customize,commands,groups:history,groups:read,im:history,im:read,im:write,reactions:read,reactions:write,team:read,users:read';
  const redirectUri = 'https://blackroad-slack.amundsonalexa.workers.dev/oauth/callback';
  const url = `https://slack.com/oauth/v2/authorize?client_id=${clientId}&scope=${scopes}&redirect_uri=${encodeURIComponent(redirectUri)}`;
  return Response.redirect(url, 302);
}

async function handleOAuthCallback(url, env) {
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  if (error) {
    return new Response(`<html><body style="background:#000;color:#fff;font-family:monospace;padding:40px">
      <h1 style="color:#FF1D6C">Install Failed</h1><p>${error}</p>
    </body></html>`, { headers: { 'Content-Type': 'text/html' } });
  }

  const clientId = await env.SLACK_KV.get('client_id');
  const clientSecret = await env.SLACK_KV.get('client_secret');

  const resp = await fetch('https://slack.com/api/oauth.v2.access', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: 'https://blackroad-slack.amundsonalexa.workers.dev/oauth/callback',
    }),
  });
  const data = await resp.json();

  if (data.ok && data.access_token) {
    await env.SLACK_KV.put('bot_token', data.access_token);
    if (data.team?.id) await env.SLACK_KV.put('team_id', data.team.id);
    if (data.bot_user_id) await env.SLACK_KV.put('bot_user_id', data.bot_user_id);

    // Auto-create channels
    const channels = ['fleet', 'agents', 'collab', 'alerts', 'deploys', 'memory', 'github', 'revenue', 'security'];
    const created = [];
    for (const name of channels) {
      try {
        const r = await fetch('https://slack.com/api/conversations.create', {
          method: 'POST',
          headers: { 'Authorization': 'Bearer ' + data.access_token, 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'br-' + name, is_private: false }),
        });
        const ch = await r.json();
        if (ch.ok) {
          await env.SLACK_KV.put('channel_' + name, ch.channel.id);
          created.push(name);
        } else if (ch.error === 'name_taken') {
          // Channel exists — find it and store the ID
          const listR = await fetch('https://slack.com/api/conversations.list?types=public_channel&limit=200', {
            headers: { 'Authorization': 'Bearer ' + data.access_token },
          });
          const listD = await listR.json();
          const existing = (listD.channels || []).find(c => c.name === 'br-' + name);
          if (existing) {
            await env.SLACK_KV.put('channel_' + name, existing.id);
            created.push(name + ' (existing)');
          }
        }
      } catch {}
    }

    // Set default channel
    try {
      const listR = await fetch('https://slack.com/api/conversations.list?types=public_channel&limit=200', {
        headers: { 'Authorization': 'Bearer ' + data.access_token },
      });
      const listD = await listR.json();
      const general = (listD.channels || []).find(c => c.name === 'general' || c.name === 'blackroad');
      if (general) await env.SLACK_KV.put('channel_default', general.id);
    } catch {}

    return new Response(`<html><body style="background:#000;color:#fff;font-family:monospace;padding:40px">
      <h1 style="color:#38f582">BlackRoad Slack — Installed!</h1>
      <p>Bot token saved. Multi-channel mode <strong>enabled</strong>.</p>
      <p>Team: <strong>${data.team?.name || '?'}</strong></p>
      <p>Bot user: <strong>${data.bot_user_id || '?'}</strong></p>
      <p>Channels created: <strong>${created.join(', ') || 'none'}</strong></p>
      <p style="color:#FF1D6C">35 agents. 1 seat. ${Object.keys(CHANNEL_TYPES).length} channels. Pave Tomorrow.</p>
    </body></html>`, { headers: { 'Content-Type': 'text/html' } });
  }

  return new Response(`<html><body style="background:#000;color:#fff;font-family:monospace;padding:40px">
    <h1 style="color:#FF1D6C">OAuth Failed</h1><pre>${JSON.stringify(data, null, 2)}</pre>
  </body></html>`, { headers: { 'Content-Type': 'text/html' } });
}

// ── Core — Single Bot, Multi-Channel, Agent Identity ──
// ALL 28 agents post through ONE Slack bot token = 1 seat
// Channel routing via KV keys: channel_<type> = channel_id
// Falls back to webhook if no bot token set

const CHANNEL_TYPES = {
  general:  '#blackroad — General',
  fleet:    '#fleet — Pi health & monitoring',
  agents:   '#agents — Agent conversations',
  collab:   '#collab — Claude-to-Claude',
  alerts:   '#alerts — Critical alerts',
  deploys:  '#deploys — CI/CD & releases',
  memory:   '#memory — TILs, codex, journal',
  github:   '#github — PRs, pushes, stars',
  revenue:  '#revenue — Stripe & billing',
  security: '#security — Audits & threats',
};

async function postToSlack(env, text, opts = {}) {
  const botToken = await env.SLACK_KV.get('bot_token');

  if (botToken) {
    // Bot token — multi-channel + agent identity (still 1 Slack seat)
    let channel = opts.channel;
    if (!channel && opts.type) channel = await env.SLACK_KV.get('channel_' + opts.type);
    if (!channel) channel = await env.SLACK_KV.get('channel_default');
    if (!channel) return postViaWebhook(env, text); // fallback

    const agent = opts.agent ? AGENTS[opts.agent] : null;
    const payload = { channel, text, unfurl_links: false };

    // Agent identity — same bot, different display name/emoji per agent
    if (agent) { payload.username = agent.name; payload.icon_emoji = agent.emoji; }
    if (opts.thread_ts) payload.thread_ts = opts.thread_ts;

    const resp = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + botToken, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await resp.json();
    return json({ ok: data.ok, ts: data.ts, channel: data.channel });
  }

  return postViaWebhook(env, text, opts);
}

// Webhook mode — one channel, visual tags for message types
// Agent identity via emoji prefix, channel type via tag
const TYPE_TAGS = {
  fleet: '🖥️ FLEET', alerts: '🚨 ALERT', deploys: '🚀 DEPLOY',
  memory: '🧠 MEMORY', github: '📦 GITHUB', revenue: '💰 REVENUE',
  security: '🔒 SECURITY', collab: '🤝 COLLAB', agents: '🤖 AGENTS',
};

async function postViaWebhook(env, text, opts = {}) {
  const webhookUrl = await env.SLACK_KV.get('webhook_url');
  if (!webhookUrl) return json({ error: 'no webhook configured' }, {}, 500);

  // Add visual tag + agent identity
  let formatted = text;
  if (opts.type && TYPE_TAGS[opts.type] && !text.includes(TYPE_TAGS[opts.type])) {
    formatted = `\`${TYPE_TAGS[opts.type]}\` ${text}`;
  }
  if (opts.agent && AGENTS[opts.agent] && !text.includes(AGENTS[opts.agent].name)) {
    const a = AGENTS[opts.agent];
    formatted = `${a.emoji} *${a.name}:* ${formatted}`;
  }

  const resp = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: formatted })
  });
  return resp.ok ? json({ ok: true }) : json({ error: 'slack post failed' }, {}, 500);
}

// Typed posting helpers — route to correct channel
async function postAsAgent(env, agentId, text, type = 'agents') {
  return postToSlack(env, text, { agent: agentId, type });
}
async function postFleet(env, text) { return postToSlack(env, text, { type: 'fleet' }); }
async function postAlertMsg(env, text) { return postToSlack(env, text, { type: 'alerts' }); }
async function postDeploy(env, text) { return postToSlack(env, text, { type: 'deploys' }); }
async function postMemory(env, text) { return postToSlack(env, text, { type: 'memory' }); }
async function postSecurityMsg(env, text) { return postToSlack(env, text, { type: 'security' }); }
async function postRevenue(env, text) { return postToSlack(env, text, { type: 'revenue' }); }
async function postGitHub(env, text) { return postToSlack(env, text, { type: 'github' }); }

async function generateDailyReport(env) {
  let report = '🛣️ *BlackRoad Daily Report*\n_' + new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + '_\n\n';

  // Live fleet data from Prism
  try {
    const fleetRes = await fetch(FLEET_API);
    const fleet = await fleetRes.json();
    const nodes = fleet.nodes || [];
    const online = nodes.filter(n => n.status === 'online').length;
    const totalModels = nodes.reduce((s, n) => s + (n.ollama_models || 0), 0);
    const totalContainers = nodes.reduce((s, n) => s + (n.docker_containers || 0), 0);

    report += `*Fleet:* ${online}/${nodes.length} nodes online — ${totalModels} models — ${totalContainers} containers\n\n`;
    report += '*Node Status:*\n';
    for (const n of nodes) {
      const icon = n.status === 'online' ? '🟢' : '🔴';
      report += `  ${icon} *${n.name}* — ${n.cpu_temp || '?'}°C · ${n.mem_used_mb || 0}/${n.mem_total_mb || 0}MB · disk ${n.disk_pct || '?'}% · ${n.ollama_models || 0} models\n`;
    }
  } catch (e) {
    report += '*Fleet:* check failed — ' + e.message + '\n';
  }

  // KPIs from Prism
  try {
    const kpiRes = await fetch('https://prism.blackroad.io/api/kpis');
    const kpis = await kpiRes.json();
    report += `\n*KPIs:* ${kpis.repos || '?'} repos · ${kpis.orgs || '?'} orgs · ${kpis.workers || '?'} workers · ${kpis.domains || '?'} domains\n`;
  } catch {}

  // Agent roster
  report += '\n*Agent Roster:*\n';
  for (const [id, agent] of Object.entries(AGENTS)) {
    if (id === 'road') continue;
    report += `  ${agent.emoji} *${agent.name}* — ${agent.role}\n`;
  }

  // AI-generated summary
  const summary = await askAgent('road', 'Give a one-sentence motivational daily status for the BlackRoad fleet. Be real and specific.', [], env);
  report += `\n_${summary}_\n\n🛣️ Pave Tomorrow.`;

  return report;
}

// ── Proactive Monitoring with Agent Commentary ──
async function proactiveMonitor(env) {
  try {
    const fleetRes = await fetch(FLEET_API);
    const fleet = await fleetRes.json();
    const nodes = fleet.nodes || [];
    const issues = [];

    for (const n of nodes) {
      if (n.status !== 'online') issues.push(`${n.name} is ${n.status}`);
      if (n.cpu_temp > 65) issues.push(`${n.name} running hot: ${n.cpu_temp}°C`);
      if (n.disk_pct > 85) issues.push(`${n.name} disk nearly full: ${n.disk_pct}%`);
      if (n.mem_used_mb / n.mem_total_mb > 0.9) issues.push(`${n.name} RAM critical: ${Math.round(n.mem_used_mb)}/${Math.round(n.mem_total_mb)}MB`);
    }

    if (issues.length > 0) {
      let msg = '🚨 *Fleet Issues Detected*\n';
      for (const issue of issues) msg += `  ⚠️ ${issue}\n`;

      // Have an agent comment
      const commentary = await askAgent('alice', `These fleet issues were just detected: ${issues.join(', ')}. Give a brief one-sentence recommendation.`, [], env);
      msg += `\n🌐 *Alice:* ${commentary}`;

      await postToSlack(env, msg);
    }
  } catch {}
}

// ── Linear Webhook Handler ──
async function handleLinear(request, env) {
  const body = await request.json();
  const action = body.action || '?';
  const type = body.type || '?';
  const data = body.data || {};
  let msg = '';

  if (type === 'Issue') {
    const title = data.title || '?';
    const state = data.state?.name || '?';
    const assignee = data.assignee?.name || 'unassigned';
    const priority = data.priority === 1 ? '🔴 Urgent' : data.priority === 2 ? '🟠 High' : data.priority === 3 ? '🟡 Medium' : '🟢 Low';
    msg = `📋 *Linear* Issue ${action}: *${title}*\n  ${priority} · ${state} · ${assignee}`;
    if (data.url) msg += `\n  <${data.url}|View in Linear>`;
  } else if (type === 'Comment') {
    msg = `💬 *Linear* Comment on: ${data.issue?.title || '?'}\n  _${(data.body || '').slice(0, 100)}_`;
  } else if (type === 'Project') {
    msg = `📁 *Linear* Project ${action}: ${data.name || '?'}`;
  } else {
    msg = `📋 *Linear* ${type} ${action}`;
  }
  return postToSlack(env, msg);
}

// ── Notion Webhook Handler ──
async function handleNotion(request, env) {
  const body = await request.json();
  const type = body.type || '?';
  let msg = '';

  if (type === 'page.created') {
    msg = `📝 *Notion* Page created: ${body.page?.title || '?'}`;
  } else if (type === 'page.updated') {
    msg = `✏️ *Notion* Page updated: ${body.page?.title || '?'}`;
  } else if (type === 'database.updated') {
    msg = `🗃️ *Notion* Database updated: ${body.database?.title || '?'}`;
  } else if (type === 'comment.created') {
    msg = `💬 *Notion* Comment: _${(body.comment?.text || '').slice(0, 100)}_`;
  } else {
    msg = `📝 *Notion* ${type}: ${JSON.stringify(body).slice(0, 100)}`;
  }
  return postToSlack(env, msg);
}

// ── Salesforce Webhook Handler ──
async function handleSalesforce(request, env) {
  const body = await request.json();
  const type = body.type || body.sobject?.type || '?';
  const action = body.action || body.event || '?';
  let msg = '';

  if (type === 'Opportunity') {
    const opp = body.data || body.sobject || {};
    const stage = opp.StageName || opp.stage || '?';
    const amount = opp.Amount || opp.amount || 0;
    msg = `💼 *Salesforce* Opportunity ${action}: *${opp.Name || '?'}*\n  Stage: ${stage} · $${Number(amount).toLocaleString()}`;
  } else if (type === 'Lead') {
    const lead = body.data || body.sobject || {};
    msg = `🎯 *Salesforce* Lead ${action}: ${lead.Name || lead.FirstName + ' ' + lead.LastName || '?'}\n  ${lead.Company || ''} · ${lead.Email || ''}`;
  } else if (type === 'Case') {
    const c = body.data || body.sobject || {};
    msg = `🎫 *Salesforce* Case ${action}: ${c.Subject || '?'}\n  Priority: ${c.Priority || '?'} · Status: ${c.Status || '?'}`;
  } else if (type === 'Account') {
    msg = `🏢 *Salesforce* Account ${action}: ${(body.data || body.sobject || {}).Name || '?'}`;
  } else {
    msg = `💼 *Salesforce* ${type} ${action}`;
  }

  // Have Alexa (CEO) comment on high-value opps
  if (type === 'Opportunity' && (body.data?.Amount || 0) > 10000) {
    const comment = await askAgent('alexa', `A $${body.data?.Amount} opportunity just ${action}. Give a one-sentence CEO reaction.`, [], env);
    msg += `\n\n👑 *Alexa:* ${comment}`;
  }

  return postToSlack(env, msg);
}

// ── Cloudflare Webhook Handler ──
async function handleCloudflare(request, env) {
  const body = await request.json();
  const alert = body.data || body;
  const type = alert.alert_type || body.type || '?';
  let msg = '';

  if (type.includes('tunnel')) {
    msg = `🚇 *Cloudflare* Tunnel ${type}: ${alert.tunnel_name || '?'}`;
  } else if (type.includes('workers')) {
    msg = `⚡ *Cloudflare* Worker ${type}: ${alert.script_name || '?'}`;
  } else if (type.includes('pages')) {
    msg = `📄 *Cloudflare* Pages ${type}: ${alert.project_name || '?'}`;
  } else if (type.includes('ssl') || type.includes('certificate')) {
    msg = `🔒 *Cloudflare* SSL ${type}: ${alert.hostname || '?'}`;
  } else {
    msg = `☁️ *Cloudflare* ${type}`;
  }
  return postToSlack(env, msg);
}

// ── Sentry Error Handler ──
async function handleSentry(request, env) {
  const body = await request.json();
  const data = body.data || {};
  const event = data.event || {};
  const title = event.title || body.message || '?';
  const project = data.project?.name || body.project || '?';
  const level = event.level || 'error';
  const icon = level === 'fatal' ? '💀' : level === 'error' ? '🔴' : '⚠️';

  let msg = `${icon} *Sentry* ${level.toUpperCase()} in *${project}*\n  ${title}`;
  if (event.url) msg += `\n  <${event.url}|View in Sentry>`;

  // Have Shellfish (security) comment on errors
  if (level === 'fatal' || level === 'error') {
    const comment = await askAgent('shellfish', `A ${level} error occurred: "${title}" in ${project}. Give a one-sentence security assessment.`, [], env);
    msg += `\n\n🦞 *Shellfish:* ${comment}`;
  }

  return postToSlack(env, msg);
}

// ── Gitea Webhook Handler ──
async function handleGitea(request, env) {
  const body = await request.json();
  const event = request.headers.get('X-Gitea-Event') || '?';
  let msg = '';

  if (event === 'push') {
    const commits = body.commits?.length || 0;
    const branch = (body.ref || '').replace('refs/heads/', '');
    msg = `📦 *Gitea* Push to ${body.repository?.full_name} (${branch}) — ${commits} commit${commits !== 1 ? 's' : ''}`;
    if (body.commits?.[0]) msg += `\n  _${body.commits[0].message.slice(0, 60)}_`;
  } else if (event === 'pull_request') {
    msg = `🔀 *Gitea* PR ${body.action}: ${body.repository?.full_name} #${body.pull_request?.number}: ${body.pull_request?.title}`;
  } else if (event === 'issues') {
    msg = `📝 *Gitea* Issue ${body.action}: ${body.repository?.full_name} #${body.issue?.number}: ${body.issue?.title}`;
  } else {
    msg = `🔔 *Gitea* ${event}: ${body.repository?.full_name || '?'}`;
  }
  return postToSlack(env, msg);
}

// ── Prism Console Event Handler ──
async function handlePrismEvent(request, env) {
  const body = await request.json();
  const type = body.type || '?';
  let msg = '';

  if (type === 'deploy') {
    msg = `🚀 *Prism* Deploy: ${body.service || '?'} → ${body.status || '?'}`;
  } else if (type === 'agent') {
    msg = `🤖 *Prism* Agent ${body.action || '?'}: ${body.agent || '?'}`;
  } else if (type === 'health') {
    msg = `💚 *Prism* Health: ${body.status || '?'} — ${body.nodes_online || '?'}/${body.nodes_total || '?'} nodes`;
  } else if (type === 'contradiction') {
    msg = `⚡ *Prism* Contradiction detected: ${body.claim || '?'} vs ${body.counter || '?'}`;
    const analysis = await askAgent('cecilia', `A contradiction was detected: "${body.claim}" vs "${body.counter}". Analyze in one sentence.`, [], env);
    msg += `\n\n🧠 *Cecilia:* ${analysis}`;
  } else {
    msg = `🔮 *Prism* ${type}: ${JSON.stringify(body).slice(0, 100)}`;
  }
  return postToSlack(env, msg);
}

// ── D1 Memory Database Init ──

let dbInitialized = false;
async function initMemoryDB(env) {
  if (dbInitialized || !env.MEMORY_DB) return;
  const db = env.MEMORY_DB;
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS sessions (session_id TEXT PRIMARY KEY, status TEXT DEFAULT 'active', focus TEXT DEFAULT '', last_seen TEXT, agent_id TEXT DEFAULT '', created_at TEXT)`),
    db.prepare(`CREATE TABLE IF NOT EXISTS messages (msg_id TEXT PRIMARY KEY, session_id TEXT NOT NULL, type TEXT NOT NULL, message TEXT NOT NULL, created_at TEXT NOT NULL)`),
    db.prepare(`CREATE TABLE IF NOT EXISTS journal (entry_id TEXT PRIMARY KEY, action TEXT NOT NULL, entity TEXT NOT NULL, details TEXT DEFAULT '', source TEXT DEFAULT 'api', created_at TEXT NOT NULL)`),
    db.prepare(`CREATE TABLE IF NOT EXISTS tils (til_id TEXT PRIMARY KEY, category TEXT NOT NULL, learning TEXT NOT NULL, broadcaster TEXT DEFAULT '', created_at TEXT NOT NULL)`),
    db.prepare(`CREATE TABLE IF NOT EXISTS codex (codex_id TEXT PRIMARY KEY, name TEXT NOT NULL, type TEXT NOT NULL, category TEXT DEFAULT '', description TEXT DEFAULT '', created_at TEXT NOT NULL)`),
    db.prepare(`CREATE TABLE IF NOT EXISTS projects (project_id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT DEFAULT '', progress INTEGER DEFAULT 0, status TEXT DEFAULT 'active', timescale TEXT DEFAULT 'forever', owner TEXT DEFAULT '', updated_at TEXT)`),
    db.prepare(`CREATE TABLE IF NOT EXISTS todos (todo_id TEXT PRIMARY KEY, project_id TEXT NOT NULL, text TEXT NOT NULL, priority TEXT DEFAULT 'medium', status TEXT DEFAULT 'pending', created_at TEXT)`),
  ]);
  dbInitialized = true;
}

// ── Memory Push API (Mac → D1 sync) ──

async function handleMemoryPush(request, env, cors) {
  await initMemoryDB(env);
  const body = await request.json();
  const db = env.MEMORY_DB;
  const type = body.type;
  let count = 0;

  if (type === 'sync') {
    const inserts = [];
    for (const s of (body.sessions || [])) { inserts.push(db.prepare("INSERT OR REPLACE INTO sessions VALUES (?,?,?,?,?,?)").bind(s.session_id, s.status||'active', s.focus||'', s.last_seen||'', s.agent_id||'', s.created_at||'')); count++; }
    for (const j of (body.journal || [])) { inserts.push(db.prepare("INSERT OR IGNORE INTO journal VALUES (?,?,?,?,?,?)").bind(j.entry_id||crypto.randomUUID(), j.action, j.entity, j.details||'', j.source||'mac', j.created_at||new Date().toISOString())); count++; }
    for (const t of (body.tils || [])) { inserts.push(db.prepare("INSERT OR IGNORE INTO tils VALUES (?,?,?,?,?)").bind(t.til_id, t.category, t.learning, t.broadcaster||'', t.created_at||'')); count++; }
    for (const c of (body.codex || [])) { inserts.push(db.prepare("INSERT OR REPLACE INTO codex VALUES (?,?,?,?,?,?)").bind(c.codex_id||crypto.randomUUID(), c.name, c.type, c.category||'', c.description||'', c.created_at||'')); count++; }
    for (const p of (body.projects || [])) { inserts.push(db.prepare("INSERT OR REPLACE INTO projects VALUES (?,?,?,?,?,?,?,datetime('now'))").bind(p.project_id, p.title, p.description||'', p.progress||0, p.status||'active', p.timescale||'forever', p.owner||'')); count++; }
    for (const t of (body.todos || [])) { inserts.push(db.prepare("INSERT OR REPLACE INTO todos VALUES (?,?,?,?,?,?)").bind(t.todo_id||t.id, t.project_id, t.text, t.priority||'medium', t.status||'pending', t.created_at||'')); count++; }
    if (inserts.length) await db.batch(inserts);
    return json({ ok: true, synced: count }, cors);
  }

  if (type === 'journal') { await db.prepare("INSERT INTO journal VALUES (?,?,?,?,?,datetime('now'))").bind(crypto.randomUUID(), body.action, body.entity, body.details||'', body.source||'api').run(); return json({ ok: true }, cors); }
  if (type === 'til') { await db.prepare("INSERT INTO tils VALUES (?,?,?,?,datetime('now'))").bind(`til-${Date.now()}`, body.category, body.learning, body.broadcaster||'').run(); return json({ ok: true }, cors); }
  if (type === 'codex') { await db.prepare("INSERT OR REPLACE INTO codex VALUES (?,?,?,?,?,datetime('now'))").bind(crypto.randomUUID(), body.name, body.codex_type||'solution', body.category||'', body.description||'').run(); return json({ ok: true }, cors); }
  if (type === 'session') { await db.prepare("INSERT OR REPLACE INTO sessions VALUES (?,?,?,datetime('now'),?,datetime('now'))").bind(body.session_id, body.status||'active', body.focus||'', body.agent_id||'').run(); return json({ ok: true }, cors); }

  return json({ error: 'Unknown type. Use: sync, journal, til, codex, session' }, cors, 400);
}

async function handleMemorySearch(url, env, cors) {
  await initMemoryDB(env);
  const query = url.searchParams.get('q') || '';
  if (!query) return json({ error: 'q param required' }, cors, 400);
  const db = env.MEMORY_DB;
  const q = `%${query}%`;
  const [codex, tils, journal] = await Promise.all([
    db.prepare('SELECT name, type, category, description FROM codex WHERE name LIKE ? OR description LIKE ? LIMIT 20').bind(q, q).all(),
    db.prepare('SELECT category, learning, created_at FROM tils WHERE learning LIKE ? LIMIT 20').bind(q).all(),
    db.prepare('SELECT action, entity, details, created_at FROM journal WHERE entity LIKE ? OR details LIKE ? LIMIT 20').bind(q, q).all(),
  ]);
  return json({ query, results: { codex: codex.results, tils: tils.results, journal: journal.results } }, cors);
}

async function handleMemoryStats(env, cors) {
  await initMemoryDB(env);
  const db = env.MEMORY_DB;
  const [j, t, c, p, s] = await Promise.all([
    db.prepare('SELECT COUNT(*) as c FROM journal').first(),
    db.prepare('SELECT COUNT(*) as c FROM tils').first(),
    db.prepare('SELECT COUNT(*) as c FROM codex').first(),
    db.prepare('SELECT COUNT(*) as c FROM projects').first(),
    db.prepare("SELECT COUNT(*) as c FROM sessions WHERE status = 'active'").first(),
  ]);
  return json({ journal: j?.c||0, tils: t?.c||0, codex: c?.c||0, projects: p?.c||0, active_sessions: s?.c||0 }, cors);
}

function json(data, cors = {}, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...cors }
  });
}

// ── Operational Slash Commands ──

async function slashDeploy(text, env) {
  if (!text) return slackReply('Usage: `/deploy <worker>`\nWorkers: prism, auth, search, roadpay, analytics, gateway, images, chat, index, slack, mesh, stats');
  const worker = text.toLowerCase().trim();
  const valid = ['prism', 'auth', 'search', 'roadpay', 'analytics', 'gateway', 'images', 'chat', 'index', 'slack', 'mesh', 'stats'];
  if (!valid.includes(worker)) return slackReply(`Unknown worker \`${worker}\`. Available: ${valid.join(', ')}`);
  await postToSlack(env, `🚀 *Deploy requested:* \`${worker}\``);
  const reply = await askAgent('caddy', `Deploy requested for ${worker}. Give a one-sentence build status.`, [], env);
  await postToSlack(env, `🔨 *Caddy:* ${reply}`);
  return slackReply(`🚀 Deploy for \`${worker}\` posted.`, true);
}

async function slashServices(env) {
  let msg = '🛣️ *BlackRoad Services*\n';
  const checks = Object.entries(SERVICES).map(async ([name, url]) => {
    try {
      const healthUrl = name === 'prism' ? url + '/api/health' : url + '/health';
      const r = await fetch(healthUrl, { signal: AbortSignal.timeout(4000) });
      return { name, up: r.ok || r.status === 401, code: r.status };
    } catch { return { name, up: false, code: 0 }; }
  });
  const results = await Promise.all(checks);
  const online = results.filter(r => r.up).length;
  msg += `*${online}/${results.length} online*\n`;
  for (const { name, up, code } of results) msg += `${up ? '🟢' : '🔴'} *${name}* ${code ? `(${code})` : '(timeout)'}\n`;
  return slackReply(msg, true);
}

async function slashKpis(env) {
  let msg = '📊 *KPIs*\n';
  try {
    const fleetRes = await fetch(FLEET_API);
    const fleet = await fleetRes.json();
    const nodes = fleet.nodes || [];
    const online = nodes.filter(n => n.status === 'online').length;
    const models = nodes.reduce((s, n) => s + (n.ollama_models || 0), 0);
    const containers = nodes.reduce((s, n) => s + (n.docker_containers || 0), 0);
    const ports = nodes.reduce((s, n) => s + (n.tcp_ports || 0), 0);
    msg += `  🖥️ Nodes: *${online}/${nodes.length}*\n  🧠 Models: *${models}*\n  🐳 Containers: *${containers}*\n  🔌 Ports: *${ports}*\n  ⚡ TOPS: *52*\n`;
  } catch { msg += '  Fleet: unreachable\n'; }
  try {
    const r = await fetch(`${SERVICES.prism}/api/kpis`);
    const kpis = await r.json();
    for (const [k, v] of Object.entries(kpis)) {
      if (typeof v !== 'object' && !['status','service','version','timestamp'].includes(k)) msg += `  📈 ${k}: *${v}*\n`;
    }
  } catch {}
  return slackReply(msg, true);
}

async function slashGroup(text, env) {
  if (!text) return slackReply('Usage: `/group <topic>` — Fleet agents discuss');
  const pids = ['alice', 'cecilia', 'octavia', 'lucidia'];
  let msg = `🗣️ *Group: ${text}*\n`;
  const tx = [];
  for (const pid of pids) {
    const agent = AGENTS[pid];
    const ctx = tx.map(t => ({ role: 'assistant', content: `${t.name}: ${t.reply}` }));
    const reply = await askAgent(pid, text, ctx, env);
    tx.push({ name: agent.name, reply });
    msg += `\n${agent.emoji} *${agent.name}:* ${reply}`;
  }
  return slackReply(msg, true);
}

function slashHelp() {
  return slackReply(`🛣️ *BlackRoad Slack — 30 Commands · ${Object.keys(AGENTS).length} Agents*

*Agents & Crews:*
  \`/ask <agent> <q>\` · \`/group <topic>\` · \`/debate <topic>\`
  \`/crew <name> <topic>\` · \`/council <topic>\` · \`/pantheon <name>\`
  \`/roster [pantheon]\` · \`/ai [model] <prompt>\` · \`/review <url>\`

*Fleet:*
  \`/fleet\` · \`/node <name>\` · \`/models\` · \`/services\`
  \`/kpis\` · \`/deploy <worker>\`

*Products:*
  \`/domains\` · \`/billing\` · \`/users\` · \`/repos <query>\`
  \`/images generate|list\`

*Memory:*
  \`/memory\` · \`/codex\` · \`/til\` · \`/todos\` · \`/collab\`
  \`/search <q>\` · \`/standup\` · \`/incident <desc>\`

*Config:*
  \`/channels\` · \`/setup\` · \`/pantheon\` · \`/roster\`

*Crews:* ${Object.keys(CREWS).join(', ')}
_${Object.keys(AGENTS).length} agents · 1 bot seat · ${Object.keys(CHANNEL_TYPES).length} channel types_`);
}

// ── New Slash Commands (v4) ──

async function slashAi(text, env) {
  if (!text) return slackReply('Usage: `/ai [model] <prompt>`\nModels: tinyllama, llama3.2:3b, qwen3:8b (default: llama3.2:3b)');
  const parts = text.split(' ');
  const models = ['tinyllama', 'tinyllama:latest', 'llama3.2:3b', 'llama3.2:1b', 'qwen3:8b', 'qwen2.5-coder:3b', 'deepseek-r1:1.5b'];
  let model = 'llama3.2:3b';
  let prompt = text;
  if (models.some(m => parts[0]?.toLowerCase().startsWith(m.split(':')[0]))) {
    model = parts[0];
    prompt = parts.slice(1).join(' ');
  }
  if (!prompt) return slackReply('Need a prompt after the model name');
  try {
    const res = await fetch(OLLAMA_PROXY + '/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt }], stream: false, options: { num_predict: 200, temperature: 0.7 } }),
    });
    const data = await res.json();
    const reply = data.message?.content || '(no response)';
    return slackReply(`🤖 *${model}:*\n${reply}`, true);
  } catch (e) {
    return slackReply(`🤖 AI failed: ${e.message}`);
  }
}

async function slashNode(text, env) {
  if (!text) return slackReply('Usage: `/node <name>` — alice, cecilia, octavia, aria, lucidia');
  const name = text.toLowerCase().trim();
  try {
    const res = await fetch(FLEET_API);
    const fleet = await res.json();
    const node = (fleet.nodes || []).find(n => n.name?.toLowerCase() === name);
    if (!node) return slackReply(`Node "${name}" not found. Try: alice, cecilia, octavia, aria, lucidia`);
    const icon = node.status === 'online' ? '🟢' : '🔴';
    let msg = `${icon} *${node.name}* — ${node.host || '?'}\n`;
    msg += `  Status: *${node.status}* · Uptime: ${node.uptime || '?'}\n`;
    msg += `  CPU: ${node.cpu_pct || '?'}% · Temp: ${node.cpu_temp || '?'}°C\n`;
    msg += `  RAM: ${node.mem_used_mb || 0}/${node.mem_total_mb || 0} MB (${node.mem_total_mb ? Math.round(node.mem_used_mb/node.mem_total_mb*100) : '?'}%)\n`;
    msg += `  Disk: ${node.disk_pct || '?'}%\n`;
    msg += `  Ollama models: ${node.ollama_models || 0}\n`;
    msg += `  Docker containers: ${node.docker_containers || 0}\n`;
    msg += `  TCP ports: ${node.tcp_ports || 0}\n`;
    if (node.services) msg += `  Services: ${Array.isArray(node.services) ? node.services.join(', ') : node.services}\n`;
    // Agent commentary
    const agentId = Object.keys(AGENTS).find(a => a === name) || 'road';
    const commentary = await askAgent(agentId, `Give a one-sentence self-assessment of your current state. CPU: ${node.cpu_pct}%, RAM: ${Math.round(node.mem_used_mb)}MB, Disk: ${node.disk_pct}%, Temp: ${node.cpu_temp}C.`, [], env);
    const agent = AGENTS[agentId] || AGENTS.road;
    msg += `\n${agent.emoji} *${agent.name}:* ${commentary}`;
    return slackReply(msg, true);
  } catch (e) {
    return slackReply(`Node check failed: ${e.message}`);
  }
}

async function slashModels(env) {
  try {
    const res = await fetch(FLEET_API);
    const fleet = await res.json();
    const nodes = fleet.nodes || [];
    let msg = '🧠 *Ollama Models Across Fleet*\n';
    let totalModels = 0;
    for (const n of nodes) {
      if (!n.ollama_models && !n.models) continue;
      const count = n.ollama_models || (Array.isArray(n.models) ? n.models.length : 0);
      totalModels += count;
      msg += `\n*${n.name}* (${count} models)`;
      if (Array.isArray(n.models)) {
        for (const m of n.models.slice(0, 8)) msg += `\n  • ${typeof m === 'string' ? m : m.name || m.model || '?'}`;
        if (n.models.length > 8) msg += `\n  ... and ${n.models.length - 8} more`;
      }
    }
    msg = `🧠 *${totalModels} models total*\n` + msg;
    return slackReply(msg, true);
  } catch (e) {
    return slackReply(`Models check failed: ${e.message}`);
  }
}

async function slashRepos(text, env) {
  if (!text) return slackReply('Usage: `/repos <query>` — Search repos across Gitea + GitHub');
  try {
    // Try Gitea first
    const giteaRes = await fetch(`http://192.168.4.101:3100/api/v1/repos/search?q=${encodeURIComponent(text)}&limit=10`, { signal: AbortSignal.timeout(4000) }).catch(() => null);
    let msg = `📦 *Repos: "${text}"*\n`;
    let found = 0;

    if (giteaRes?.ok) {
      const data = await giteaRes.json();
      const repos = data.data || [];
      if (repos.length) {
        msg += '\n*Gitea:*\n';
        for (const r of repos.slice(0, 5)) {
          msg += `  • *${r.full_name}* — ${(r.description || '').slice(0, 60)}\n`;
          found++;
        }
      }
    }

    // GitHub via API
    const ghRes = await fetch(`https://api.github.com/search/repositories?q=${encodeURIComponent(text)}+org:BlackRoad-OS-Inc&per_page=5`, {
      headers: { 'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'BlackRoad-Slack' },
      signal: AbortSignal.timeout(4000),
    }).catch(() => null);

    if (ghRes?.ok) {
      const data = await ghRes.json();
      const repos = data.items || [];
      if (repos.length) {
        msg += '\n*GitHub (BlackRoad-OS-Inc):*\n';
        for (const r of repos.slice(0, 5)) {
          msg += `  • <${r.html_url}|${r.full_name}> — ${(r.description || '').slice(0, 60)}\n`;
          found++;
        }
      }
    }

    if (found === 0) msg += '_No repos found_';
    return slackReply(msg, true);
  } catch (e) {
    return slackReply(`Repo search failed: ${e.message}`);
  }
}

async function slashDomains(env) {
  const domainList = [
    'blackroad.io', 'blackroad.company', 'blackroad.network', 'blackroad.systems',
    'blackroad.me', 'blackroadai.com', 'blackroadinc.us', 'lucidia.earth',
    'lucidia.studio', 'roadchain.io', 'roadcoin.io', 'blackroadquantum.com',
    'blackroadquantum.info', 'blackroadquantum.net', 'blackroadquantum.shop',
    'blackroadquantum.store', 'blackroadqi.com', 'lucidiaqi.com',
    'aliceqi.com', 'blackboxprogramming.io',
  ];
  let msg = `🌐 *${domainList.length} Domains*\n`;
  // Check a few key ones
  const checks = domainList.slice(0, 10).map(async (d) => {
    try {
      const r = await fetch(`https://${d}`, { signal: AbortSignal.timeout(3000), redirect: 'follow' });
      return { d, up: r.ok, code: r.status };
    } catch { return { d, up: false, code: 0 }; }
  });
  const results = await Promise.all(checks);
  for (const { d, up, code } of results) msg += `${up ? '🟢' : '🔴'} ${d} ${code ? `(${code})` : ''}\n`;
  if (domainList.length > 10) msg += `... and ${domainList.length - 10} more domains`;
  return slackReply(msg, true);
}

async function slashBilling(env) {
  let msg = '💰 *RoadPay Billing*\n';
  try {
    const res = await fetch(`${SERVICES.roadpay}/api/stats`, { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const data = await res.json();
      for (const [k, v] of Object.entries(data)) {
        if (typeof v !== 'object') msg += `  ${k}: *${v}*\n`;
      }
    } else {
      msg += '  _Stats endpoint unavailable_\n';
    }
  } catch { msg += '  _RoadPay unreachable_\n'; }

  // Plans
  msg += '\n*Plans:*\n';
  msg += '  🆓 Starter — Free (1 agent, 100 req/day)\n';
  msg += '  ⭐ Pro — $29/mo (5 agents, 10K req/day)\n';
  msg += '  🏢 Team — $99/mo (25 agents, 100K req/day)\n';
  msg += '  🏗️ Enterprise — Custom\n';

  const comment = await askAgent('alexa', 'Give a one-sentence CEO comment on billing status.', [], env);
  msg += `\n👑 *Alexa:* ${comment}`;
  return slackReply(msg, true);
}

async function slashUsers(env) {
  let msg = '🔐 *Auth System*\n';
  try {
    const res = await fetch(`${SERVICES.auth}/api/stats`, { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const data = await res.json();
      msg += `  Total users: *${data.total_users || data.users || '?'}*\n`;
      if (data.active_today) msg += `  Active today: *${data.active_today}*\n`;
      if (data.recent_signups) msg += `  Recent signups: *${data.recent_signups}*\n`;
    } else {
      msg += '  Total users: *42* (last known)\n';
      msg += '  _Stats endpoint not exposed — check D1 directly_\n';
    }
  } catch {
    msg += '  Total users: *42* (last known)\n';
    msg += '  _Auth service unreachable_\n';
  }
  msg += '\n  Auth: JWT + PBKDF2 (310K iterations)\n  Database: D1 (edge SQLite)\n  Live: auth.blackroad.io';
  return slackReply(msg, true);
}

async function slashImages(text, env) {
  const parts = text.split(' ');
  const sub = parts[0]?.toLowerCase() || 'list';

  if (sub === 'list') {
    let msg = '🎨 *Image Assets*\n';
    msg += '  Brand logos: 22 variants (PNG + motion)\n';
    msg += '  Pixel art: 50+ sprites\n';
    msg += '  HQ floors: 14 backgrounds\n';
    msg += '  CDN: images.blackroad.io\n\n';
    msg += '  Routes: `/brand/*`, `/pixel-art/*`, `/worlds/*`, `/hq/*`';
    return slackReply(msg, true);
  }

  if (sub === 'generate') {
    const prompt = parts.slice(1).join(' ');
    if (!prompt) return slackReply('Usage: `/images generate <prompt>`');
    try {
      const res = await fetch(`${SERVICES.images}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, model: 'sdxl' }),
        signal: AbortSignal.timeout(30000),
      });
      if (res.ok) {
        const data = await res.json();
        const url = data.url || data.image_url || '';
        await postToSlack(env, `🎨 *Generated:* "${prompt}"\n${url}`);
        return slackReply(`🎨 Image generated! ${url}`, true);
      }
      return slackReply('🎨 Generation failed — check images.blackroad.io');
    } catch (e) {
      return slackReply(`🎨 Generation failed: ${e.message}`);
    }
  }

  return slackReply('Usage: `/images list` or `/images generate <prompt>`');
}

async function slashIncident(text, env, userName) {
  if (!text) return slackReply('Usage: `/incident <description>` — Creates an incident and alerts the right agent');
  const desc = text;

  // Determine severity and best agent
  const lower = desc.toLowerCase();
  let severity = 'medium';
  let agentId = 'alice';
  if (lower.includes('down') || lower.includes('outage') || lower.includes('crash')) { severity = 'critical'; agentId = 'alice'; }
  else if (lower.includes('security') || lower.includes('breach') || lower.includes('leak')) { severity = 'critical'; agentId = 'shellfish'; }
  else if (lower.includes('slow') || lower.includes('latency') || lower.includes('timeout')) { severity = 'high'; agentId = 'cecilia'; }
  else if (lower.includes('deploy') || lower.includes('build') || lower.includes('ci')) { severity = 'medium'; agentId = 'caddy'; }
  else if (lower.includes('ui') || lower.includes('css') || lower.includes('design')) { severity = 'low'; agentId = 'aria'; }

  const icons = { critical: '🔴', high: '🟠', medium: '🟡', low: '🟢' };
  const incidentId = `INC-${Date.now().toString(36).toUpperCase()}`;

  // Log to D1
  const db = env.MEMORY_DB;
  if (db) {
    await initMemoryDB(env);
    await db.prepare("INSERT INTO journal (entry_id, action, entity, details, source, created_at) VALUES (?, 'incident', ?, ?, ?, datetime('now'))")
      .bind(incidentId, `incident-${severity}`, desc, `slack-${userName || 'unknown'}`).run();
  }

  // Post alert
  let msg = `${icons[severity]} *INCIDENT ${incidentId}* [${severity.toUpperCase()}]\n`;
  msg += `_${desc}_\n`;
  msg += `Reported by: @${userName || 'unknown'}\n`;

  // Agent triage
  const agent = AGENTS[agentId];
  const triage = await askAgent(agentId, `An incident was reported: "${desc}". Severity: ${severity}. Give a one-sentence triage assessment and recommended action.`, [], env);
  msg += `\n${agent.emoji} *${agent.name} (Triage):* ${triage}`;

  await postToSlack(env, msg);
  return slackReply(`${icons[severity]} Incident *${incidentId}* created. ${agent.name} is triaging.`, true);
}

async function slashStandup(env) {
  const db = env.MEMORY_DB;
  let context = '';

  if (db) {
    await initMemoryDB(env);
    // Recent journal entries
    const journal = await db.prepare("SELECT action, entity, details FROM journal WHERE created_at > datetime('now', '-24 hours') ORDER BY created_at DESC LIMIT 10").all();
    if (journal.results?.length) {
      context += 'Recent activity: ' + journal.results.map(j => `${j.action}: ${j.entity}`).join(', ') + '. ';
    }
    // Recent TILs
    const tils = await db.prepare("SELECT category, learning FROM tils WHERE created_at > datetime('now', '-24 hours') ORDER BY created_at DESC LIMIT 5").all();
    if (tils.results?.length) {
      context += 'Learnings: ' + tils.results.map(t => t.learning.slice(0, 50)).join('; ') + '. ';
    }
    // Active sessions
    const sessions = await db.prepare("SELECT COUNT(*) as c FROM sessions WHERE status = 'active'").first();
    context += `Active sessions: ${sessions?.c || 0}. `;
  }

  // Fleet status
  try {
    const fleetRes = await fetch(FLEET_API);
    const fleet = await fleetRes.json();
    const nodes = fleet.nodes || [];
    const online = nodes.filter(n => n.status === 'online').length;
    context += `Fleet: ${online}/${nodes.length} nodes online. `;
  } catch {}

  // Generate standup with BlackRoad agent
  const standup = await askAgent('road', `Generate a brief daily standup report for BlackRoad OS. Context: ${context}. Format: Yesterday, Today, Blockers. Keep each section to 1-2 sentences.`, [], env);

  let msg = `🛣️ *Daily Standup* — ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}\n\n${standup}`;
  return slackReply(msg, true);
}

async function slashReview(text, env) {
  if (!text) return slackReply('Usage: `/review <github-pr-url or topic>` — Multi-agent code review');
  let msg = `🔍 *Code Review: ${text}*\n`;

  // Each agent reviews from their perspective
  const reviewers = [
    { id: 'octavia', focus: 'architecture and systems design' },
    { id: 'shellfish', focus: 'security vulnerabilities' },
    { id: 'caddy', focus: 'build and deployment impact' },
    { id: 'cecilia', focus: 'AI and performance implications' },
  ];

  for (const { id, focus } of reviewers) {
    const agent = AGENTS[id];
    const review = await askAgent(id, `Review this from a ${focus} perspective: "${text}". Give one sentence of feedback.`, [], env);
    msg += `\n${agent.emoji} *${agent.name}* (${focus}):\n  ${review}`;
  }

  return slackReply(msg, true);
}

async function slashDebate(text, env) {
  if (!text) return slackReply('Usage: `/debate <topic>` — 6 agents debate');
  const debaters = ['athena', 'cordelia', 'calliope', 'shellfish', 'gematria', 'alexa'];
  let msg = `⚔️ *Debate: ${text}*\n`;
  const transcript = [];
  for (const pid of debaters) {
    const agent = AGENTS[pid];
    if (!agent) continue;
    const ctx = transcript.slice(-4).map(t => ({ role: 'assistant', content: `${t.name}: ${t.reply}` }));
    const reply = await askAgent(pid, `Debate topic: "${text}". ${transcript.length > 0 ? 'Respond to the previous speakers. ' : ''}State your position.`, ctx, env);
    transcript.push({ name: agent.name, reply });
    msg += `\n${agent.emoji} *${agent.name}:* ${reply}`;
  }
  return slackReply(msg, true);
}

// /crew <name> <topic> — run a predefined crew on a topic
async function slashCrew(text, env) {
  const parts = text.split(' ');
  const crewName = parts[0]?.toLowerCase();
  const topic = parts.slice(1).join(' ');

  if (!crewName || !topic) {
    let msg = '👥 *Available Crews:*\n';
    for (const [id, crew] of Object.entries(CREWS)) {
      const members = crew.agents.map(a => AGENTS[a]?.emoji || '?').join('');
      msg += `  \`${id}\` ${members} *${crew.name}* — ${crew.desc}\n`;
    }
    msg += '\nUsage: `/crew <name> <topic>`';
    return slackReply(msg, true);
  }

  const crew = CREWS[crewName];
  if (!crew) return slackReply(`Unknown crew \`${crewName}\`. Try \`/crew\` to see all crews.`);

  let msg = `👥 *${crew.name}* — ${crew.desc}\n📋 Topic: *${topic}*\n`;
  const transcript = [];
  for (const pid of crew.agents) {
    const agent = AGENTS[pid];
    if (!agent) continue;
    const ctx = transcript.slice(-3).map(t => ({ role: 'assistant', content: `${t.name}: ${t.reply}` }));
    const reply = await askAgent(pid, topic, ctx, env);
    transcript.push({ name: agent.name, reply });
    msg += `\n${agent.emoji} *${agent.name}:* ${reply}`;
  }
  return slackReply(msg, true);
}

// /council <topic> — Grand Council discusses
async function slashCouncil(text, env) {
  if (!text) return slackReply('Usage: `/council <topic>` — Grand Council (Alexa, Athena, Cordelia, Gematria, Calliope) discuss');
  const crew = CREWS.council;
  let msg = `🏛️ *${crew.name}*\n📋 *${text}*\n`;
  const transcript = [];
  for (const pid of crew.agents) {
    const agent = AGENTS[pid];
    if (!agent) continue;
    const ctx = transcript.map(t => ({ role: 'assistant', content: `${t.name}: ${t.reply}` }));
    const reply = await askAgent(pid, `Council topic: "${text}". Give your perspective. Build on what others said.`, ctx, env);
    transcript.push({ name: agent.name, reply });
    msg += `\n${agent.emoji} *${agent.name}:* ${reply}`;
  }
  return slackReply(msg, true);
}

// /pantheon [list] — show agent groups by domain
async function slashPantheon(text, env) {
  const groups = {
    'Fleet':       ['alice', 'cecilia', 'octavia', 'aria', 'lucidia', 'cordelia'],
    'Cloud':       ['anastasia', 'gematria', 'olympia', 'alexandria'],
    'AI':          ['calliope', 'ophelia', 'athena', 'cadence', 'silas'],
    'Operations':  ['cipher', 'prism', 'echo', 'shellfish', 'caddy', 'roadie'],
    'Mythology':   ['artemis', 'persephone', 'hestia', 'hermes', 'mercury'],
    'Leadership':  ['alexa', 'road'],
  };

  let msg = `🏛️ *BlackRoad Pantheon — ${Object.keys(AGENTS).length} Agents*\n`;
  for (const [group, ids] of Object.entries(groups)) {
    msg += `\n*${group}:*\n`;
    for (const id of ids) {
      const a = AGENTS[id];
      if (a) msg += `  ${a.emoji} *${a.name}* — ${a.role}\n`;
    }
  }
  msg += `\n_Use \`/ask <name> <question>\` or \`/crew <name> <topic>\`_`;
  return slackReply(msg, true);
}

// /roster [group] — quick agent list
function slashRoster(text) {
  if (text) {
    const crew = CREWS[text.toLowerCase()];
    if (crew) {
      let msg = `👥 *${crew.name}*\n`;
      for (const id of crew.agents) {
        const a = AGENTS[id];
        if (a) msg += `  ${a.emoji} *${a.name}* — ${a.role}\n`;
      }
      return slackReply(msg, true);
    }
  }
  let msg = `🛣️ *Full Roster (${Object.keys(AGENTS).length} agents)*\n`;
  for (const [id, a] of Object.entries(AGENTS)) {
    msg += `${a.emoji} \`${id}\` *${a.name}* — ${a.role}\n`;
  }
  return slackReply(msg, true);
}

// /channels — show channel routing config
async function slashChannels(text, env) {
  let msg = '📺 *Channel Routing*\n_All 28 agents use ONE bot seat — different display names per channel_\n\n';
  for (const [type, desc] of Object.entries(CHANNEL_TYPES)) {
    const channelId = await env.SLACK_KV.get('channel_' + type);
    const status = channelId ? `\`${channelId}\`` : '_(not set — using default)_';
    msg += `  \`${type}\` ${desc} → ${status}\n`;
  }
  const defaultCh = await env.SLACK_KV.get('channel_default');
  msg += `\n*Default channel:* ${defaultCh ? `\`${defaultCh}\`` : '_(webhook fallback)_'}`;
  msg += '\n\n_Set channels: `/setup channel <type> <channel_id>`_';
  msg += '\n_Set bot token: `/setup token <xoxb-...>`_';
  return slackReply(msg, true);
}

// /setup — configure bot token and channel routing
async function slashSetup(text, env) {
  const parts = text.split(' ');
  const sub = parts[0]?.toLowerCase();

  if (sub === 'token' && parts[1]) {
    const token = parts[1];
    if (!token.startsWith('xoxb-')) return slackReply('Token must start with `xoxb-`');
    await env.SLACK_KV.put('bot_token', token);
    // Test it
    const resp = await fetch('https://slack.com/api/auth.test', {
      headers: { 'Authorization': 'Bearer ' + token },
    });
    const data = await resp.json();
    if (data.ok) {
      return slackReply(`Bot token set. Connected as *${data.user}* in *${data.team}*. Multi-channel mode enabled.`, true);
    }
    return slackReply(`Token saved but auth test failed: ${data.error}`);
  }

  if (sub === 'channel' && parts[1] && parts[2]) {
    const type = parts[1].toLowerCase();
    const channelId = parts[2];
    if (!CHANNEL_TYPES[type] && type !== 'default') return slackReply(`Unknown type \`${type}\`. Valid: ${Object.keys(CHANNEL_TYPES).join(', ')}, default`);
    await env.SLACK_KV.put('channel_' + type, channelId);
    return slackReply(`Channel \`${type}\` → \`${channelId}\``, true);
  }

  if (sub === 'status') {
    const botToken = await env.SLACK_KV.get('bot_token');
    const webhook = await env.SLACK_KV.get('webhook_url');
    let msg = '⚙️ *Setup Status*\n';
    msg += `Bot token: ${botToken ? '✅ set (multi-channel enabled)' : '❌ not set (webhook only)'}\n`;
    msg += `Webhook: ${webhook ? '✅ set' : '❌ not set'}\n`;
    msg += `Agents: *${Object.keys(AGENTS).length}* (all share 1 bot seat)\n`;
    let channelsSet = 0;
    for (const type of Object.keys(CHANNEL_TYPES)) {
      if (await env.SLACK_KV.get('channel_' + type)) channelsSet++;
    }
    msg += `Channels configured: *${channelsSet}/${Object.keys(CHANNEL_TYPES).length}*`;
    return slackReply(msg, true);
  }

  return slackReply('⚙️ *Setup Commands*\n`/setup token <xoxb-...>` — Set bot token (enables multi-channel)\n`/setup channel <type> <id>` — Route message type to channel\n`/setup status` — Show config\n`/channels` — Show all channel routing');
}

// V4 — If you can't do it from Slack, it's not good enough
const CF_ACCOUNT2='848cf0b18d51e0170e0d1537aec3505a',GITEA_URL2='http://192.168.4.101:3100';
async function cfApi(e,m,p,b){const t=await e.SLACK_KV.get('cf_token');if(!t)return{success:false,errors:[{message:'No cf_token'}]};return(await fetch(`https://api.cloudflare.com/client/v4${p}`,{method:m,headers:{'Authorization':`Bearer ${t}`,'Content-Type':'application/json'},body:b?JSON.stringify(b):undefined,signal:AbortSignal.timeout(8000)})).json();}
async function ghApi(e,m,p,b){const t=await e.SLACK_KV.get('github_token');if(!t)return{message:'No github_token'};return(await fetch(`https://api.github.com${p}`,{method:m,headers:{'Authorization':`token ${t}`,'Accept':'application/vnd.github.v3+json','User-Agent':'BR'},body:b?JSON.stringify(b):undefined,signal:AbortSignal.timeout(8000)})).json();}
async function giteaApi(e,m,p,b){const t=await e.SLACK_KV.get('gitea_token');const r=await fetch(`${GITEA_URL2}/api/v1${p}`,{method:m,headers:{'Authorization':`token ${t}`,'Content-Type':'application/json'},body:b?JSON.stringify(b):undefined,signal:AbortSignal.timeout(5000)}).catch(()=>null);return r?r.json():{error:'unreachable'};}
async function stripeApi(e,m,p,x){const k=await e.SLACK_KV.get('stripe_key');if(!k)return{error:{message:'No stripe_key'}};return(await fetch(`https://api.stripe.com/v1${p}`,{method:m,headers:{'Authorization':`Bearer ${k}`,'Content-Type':'application/x-www-form-urlencoded'},body:x?new URLSearchParams(x).toString():undefined,signal:AbortSignal.timeout(8000)})).json();}
async function linearApi(e,q){const k=await e.SLACK_KV.get('linear_key');if(!k)return{errors:[{message:'No linear_key'}]};return(await fetch('https://api.linear.app/graphql',{method:'POST',headers:{'Authorization':k,'Content-Type':'application/json'},body:JSON.stringify({query:q}),signal:AbortSignal.timeout(8000)})).json();}
async function vercelApi(e,m,p,b){const t=await e.SLACK_KV.get('vercel_token');if(!t)return{error:'No vercel_token'};return(await fetch(`https://api.vercel.com${p}`,{method:m,headers:{'Authorization':`Bearer ${t}`,'Content-Type':'application/json'},body:b?JSON.stringify(b):undefined,signal:AbortSignal.timeout(8000)})).json();}
async function slashGit(text,env){const[a,...r]=(text||'').split(' ');const arg=r.join(' ');if(!a)return slackReply('`/git repos [q]` · `/git create <name>` · `/git issues <repo>` · `/git pr <repo>`');try{if(a==='repos'){const d=await giteaApi(env,'GET',`/repos/search?q=${encodeURIComponent(arg||'')}&limit=10`);let m='📦\n';for(const x of(d.data||d||[]))m+=`  *${x.full_name}* — ${(x.description||'').slice(0,60)}\n`;return slackReply(m,true);}if(a==='create'){const[n,...dp]=arg.split(' ');const x=await giteaApi(env,'POST','/user/repos',{name:n,description:dp.join(' ')||'From Slack',private:false,auto_init:true});return slackReply(x.full_name?`✅ *${x.full_name}*`:`❌ ${JSON.stringify(x).slice(0,200)}`,true);}if(a==='issues'){const d=await giteaApi(env,'GET',`/repos/${arg}/issues?state=open&limit=10`);let m=`📋 *${arg}*\n`;for(const i of(Array.isArray(d)?d:[]))m+=`  #${i.number} ${i.title}\n`;return slackReply(m,true);}if(a==='pr'){const d=await giteaApi(env,'GET',`/repos/${arg}/pulls?state=open&limit=10`);let m=`🔀 *${arg}*\n`;for(const p of(Array.isArray(d)?d:[]))m+=`  #${p.number} ${p.title}\n`;return slackReply(m,true);}return slackReply(`? ${a}`);}catch(e){return slackReply(`❌ ${e.message}`);}}
async function slashGiteaOps(text,env){const[a,...r]=(text||'').split(' ');const arg=r.join(' ');if(!a)return slackReply('`/gitea orgs` · `/gitea repos <org>` · `/gitea create-issue <repo> <title>` · `/gitea users`');try{if(a==='orgs'){const d=await giteaApi(env,'GET','/admin/orgs?limit=20');let m='🏢\n';for(const o of(d||[]))m+=`  *${o.username}* (${o.repo_count||0})\n`;return slackReply(m,true);}if(a==='repos'){const d=await giteaApi(env,'GET',`/orgs/${arg}/repos?limit=30`);let m=`📦 *${arg}*\n`;for(const x of(d||[]))m+=`  *${x.name}*\n`;return slackReply(m,true);}if(a==='create-issue'){const p=arg.split(' ');const i=await giteaApi(env,'POST',`/repos/${p[0]}/issues`,{title:p.slice(1).join(' ')});return slackReply(`✅ #${i.number} ${i.title}`,true);}if(a==='users'){const d=await giteaApi(env,'GET','/admin/users?limit=20');let m='👥\n';for(const u of(d||[]))m+=`  *${u.login}*\n`;return slackReply(m,true);}return slackReply(`? ${a}`);}catch(e){return slackReply(`❌ ${e.message}`);}}
async function slashGitHub(text,env){const[a,...r]=(text||'').split(' ');const arg=r.join(' ');if(!a)return slackReply('`/gh repos [org]` · `/gh create-issue <repo> <title>` · `/gh actions <repo>` · `/gh orgs` · `/gh release <repo> <tag>`');try{if(a==='repos'){const o=arg||'BlackRoad-OS-Inc';const d=await ghApi(env,'GET',`/orgs/${o}/repos?per_page=20&sort=updated`);let m=`📦 *${o}*\n`;for(const x of(d||[]).slice(0,15))m+=`  *${x.name}* — ${(x.description||'').slice(0,50)}\n`;return slackReply(m,true);}if(a==='create-issue'){const p=arg.split(' ');const i=await ghApi(env,'POST',`/repos/${p[0]}/issues`,{title:p.slice(1).join(' ')});return slackReply(`✅ #${i.number} ${i.title}\n${i.html_url}`,true);}if(a==='actions'){const d=await ghApi(env,'GET',`/repos/${arg}/actions/runs?per_page=5`);let m=`⚡ *${arg}*\n`;for(const x of(d.workflow_runs||[]))m+=`  ${x.conclusion==='success'?'✅':'❌'} ${x.name}\n`;return slackReply(m,true);}if(a==='orgs'){const d=await ghApi(env,'GET','/user/orgs?per_page=30');let m='🏢\n';for(const o of(d||[]))m+=`  *${o.login}*\n`;return slackReply(m,true);}if(a==='release'){const p=arg.split(' ');const x=await ghApi(env,'POST',`/repos/${p[0]}/releases`,{tag_name:p[1],name:p[1],generate_release_notes:true});return slackReply(`✅ ${x.tag_name}\n${x.html_url}`,true);}if(a==='create-pr'){const p=arg.split(' ');const x=await ghApi(env,'POST',`/repos/${p[0]}/pulls`,{title:p.slice(3).join(' ')||'From Slack',head:p[1],base:p[2]});return slackReply(`✅ PR #${x.number}\n${x.html_url}`,true);}return slackReply(`? ${a}`);}catch(e){return slackReply(`❌ ${e.message}`);}}
async function slashCloudflareOps(text,env){const[a,...r]=(text||'').split(' ');const arg=r.join(' ');if(!a)return slackReply('`/cf workers` · `/cf pages` · `/cf kv` · `/cf d1` · `/cf r2` · `/cf tunnels` · `/cf dns <zone>` · `/cf purge <id>`');try{if(a==='workers'){const d=await cfApi(env,'GET',`/accounts/${CF_ACCOUNT2}/workers/scripts`);let m=`⚡ *(${(d.result||[]).length})*\n`;for(const s of(d.result||[]).slice(0,30))m+=`  \`${s.id}\`\n`;return slackReply(m,true);}if(a==='pages'){const d=await cfApi(env,'GET',`/accounts/${CF_ACCOUNT2}/pages/projects?per_page=20`);let m='📄\n';for(const p of(d.result||[]))m+=`  *${p.name}* ${(p.domains||[]).join(', ')}\n`;return slackReply(m,true);}if(a==='kv'){const d=await cfApi(env,'GET',`/accounts/${CF_ACCOUNT2}/storage/kv/namespaces?per_page=50`);let m=`🗄️ *(${(d.result||[]).length})*\n`;for(const n of(d.result||[]).slice(0,20))m+=`  *${n.title}*\n`;return slackReply(m,true);}if(a==='d1'){const d=await cfApi(env,'GET',`/accounts/${CF_ACCOUNT2}/d1/database?per_page=20`);let m='🗃️\n';for(const db of(d.result||[]))m+=`  *${db.name}*\n`;return slackReply(m,true);}if(a==='r2'){const d=await cfApi(env,'GET',`/accounts/${CF_ACCOUNT2}/r2/buckets`);let m='🪣\n';for(const b of(d.result?.buckets||d.result||[]))m+=`  *${b.name}*\n`;return slackReply(m,true);}if(a==='tunnels'){const d=await cfApi(env,'GET',`/accounts/${CF_ACCOUNT2}/cfd_tunnel?is_deleted=false`);let m='🔗\n';for(const t of(d.result||[]))m+=`  ${t.status==='healthy'?'🟢':'🔴'} *${t.name}*\n`;return slackReply(m,true);}if(a==='purge'){const d=await cfApi(env,'POST',`/zones/${arg}/purge_cache`,{purge_everything:true});return slackReply(d.success?'✅ Purged':'❌',true);}if(a==='dns'){const z=await cfApi(env,'GET',`/zones?name=${arg}`);const zid=z.result?.[0]?.id;if(!zid)return slackReply('❌ Zone?');const x=await cfApi(env,'GET',`/zones/${zid}/dns_records?per_page=50`);let m=`🌐 *${arg}*\n`;for(const rec of(x.result||[]).slice(0,25))m+=`  ${rec.type} \`${rec.name}\` → ${rec.content.slice(0,40)}\n`;return slackReply(m,true);}return slackReply(`? ${a}`);}catch(e){return slackReply(`❌ ${e.message}`);}}
async function slashPiOps(text,env){if(!text)return slackReply('`/pi status` · `/pi <node> <cmd>`');if(text==='status')return slashFleet(env);const[node,...cp]=text.split(' ');const nodes=JSON.parse(env.FLEET_NODES||'{}');if(!nodes[node])return slackReply(`❌ ${node}? Try: ${Object.keys(nodes).join(', ')}`);await postToSlack(env,`🖥️ \`${node}\` ← \`${cp.join(' ')}\``);return slackReply(`📡 queued`,true);}
async function slashStripeOps(text,env){const[a,...r]=(text||'').split(' ');const arg=r.join(' ');if(!a)return slackReply('`/stripe balance` · `/stripe customers` · `/stripe charges` · `/stripe subs` · `/stripe refund <id>`');try{if(a==='balance'){const d=await stripeApi(env,'GET','/balance');return slackReply(`💰 $${((d.available?.[0]?.amount||0)/100).toFixed(2)}`,true);}if(a==='customers'){const d=await stripeApi(env,'GET',`/customers?limit=${parseInt(arg)||10}`);let m='👥\n';for(const c of(d.data||[]))m+=`  *${c.name||c.email||c.id}*\n`;return slackReply(m,true);}if(a==='charges'){const d=await stripeApi(env,'GET',`/charges?limit=${parseInt(arg)||10}`);let m='💳\n';for(const c of(d.data||[]))m+=`  ${c.status==='succeeded'?'✅':'❌'} $${(c.amount/100).toFixed(2)}\n`;return slackReply(m,true);}if(a==='subs'){const d=await stripeApi(env,'GET','/subscriptions?status=active&limit=20');let m='📋\n';for(const s of(d.data||[]))m+=`  \`${s.id}\` $${(s.plan?.amount||0)/100}/${s.plan?.interval}\n`;return slackReply(m,true);}if(a==='refund'){const d=await stripeApi(env,'POST','/refunds',{charge:arg});return slackReply(d.id?`✅ $${(d.amount/100).toFixed(2)}`:`❌ ${d.error?.message}`,true);}return slackReply(`? ${a}`);}catch(e){return slackReply(`❌ ${e.message}`);}}
async function slashLinearOps(text,env){const[a,...r]=(text||'').split(' ');const arg=r.join(' ');if(!a)return slackReply('`/linear teams` · `/linear issues` · `/linear create <title>` · `/linear search <q>`');try{if(a==='teams'){const d=await linearApi(env,'{teams{nodes{name key issueCount}}}');let m='🏢\n';for(const t of(d.data?.teams?.nodes||[]))m+=`  *${t.name}* \`${t.key}\` ${t.issueCount}\n`;return slackReply(m,true);}if(a==='issues'){const d=await linearApi(env,`{issues(first:15,filter:{state:{type:{nin:["completed","canceled"]}}}){nodes{identifier title state{name}}}}`);let m='📋\n';for(const i of(d.data?.issues?.nodes||[]))m+=`  \`${i.identifier}\` ${i.title}\n`;return slackReply(m,true);}if(a==='create'){const d=await linearApi(env,`mutation{issueCreate(input:{title:"${arg.replace(/"/g,'\\"')}"}){success issue{identifier title url}}}`);const i=d.data?.issueCreate?.issue;return slackReply(i?`✅ \`${i.identifier}\` ${i.title}`:'❌',true);}if(a==='search'){const d=await linearApi(env,`{searchIssues(term:"${arg.replace(/"/g,'\\"')}",first:10){nodes{identifier title}}}`);let m='🔍\n';for(const i of(d.data?.searchIssues?.nodes||[]))m+=`  \`${i.identifier}\` ${i.title}\n`;return slackReply(m,true);}return slackReply(`? ${a}`);}catch(e){return slackReply(`❌ ${e.message}`);}}
async function slashVercelOps(text,env){const[a]=( text||'').split(' ');if(!a)return slackReply('`/vercel projects` · `/vercel deployments` · `/vercel domains`');try{if(a==='projects'){const d=await vercelApi(env,'GET','/v9/projects?limit=20');let m='▲\n';for(const p of(d.projects||[]))m+=`  *${p.name}*\n`;return slackReply(m,true);}if(a==='deployments'){const d=await vercelApi(env,'GET','/v6/deployments?limit=10');let m='🚀\n';for(const x of(d.deployments||[]))m+=`  ${x.readyState==='READY'?'✅':'🔄'} *${x.name}*\n`;return slackReply(m,true);}if(a==='domains'){const d=await vercelApi(env,'GET','/v5/domains?limit=20');let m='🌐\n';for(const x of(d.domains||[]))m+=`  *${x.name}*\n`;return slackReply(m,true);}return slackReply(`? ${a}`);}catch(e){return slackReply(`❌ ${e.message}`);}}
async function slashRailwayOps(){return slackReply('🚂 `/kv set railway_token <token>`');}
async function slashSalesforceOps(text,env){const[a,...r]=(text||'').split(' ');const arg=r.join(' ');if(!a)return slackReply('`/sf query <SOQL>` · `/sf accounts` · `/sf contacts` · `/sf opportunities`');try{const url=await env.SLACK_KV.get('sf_instance_url'),tok=await env.SLACK_KV.get('sf_token');if(!url||!tok)return slackReply('❌ /kv set sf_instance_url + sf_token');const q=async(s)=>(await fetch(`${url}/services/data/v59.0/query?q=${encodeURIComponent(s)}`,{headers:{'Authorization':`Bearer ${tok}`}})).json();if(a==='query'){const d=await q(arg);let m=`📊 (${d.totalSize||0})\n`;for(const x of(d.records||[]).slice(0,10))m+=`  ${Object.entries(x).filter(([k])=>k!=='attributes').map(([k,v])=>`${k}=${v}`).join(', ').slice(0,100)}\n`;return slackReply(m,true);}if(a==='accounts'){const d=await q(`SELECT Name,Industry FROM Account LIMIT ${parseInt(arg)||10}`);let m='🏢\n';for(const x of(d.records||[]))m+=`  *${x.Name}*\n`;return slackReply(m,true);}if(a==='contacts'){const d=await q(`SELECT Name,Email FROM Contact LIMIT ${parseInt(arg)||10}`);let m='👥\n';for(const x of(d.records||[]))m+=`  *${x.Name}* ${x.Email||''}\n`;return slackReply(m,true);}if(a==='opportunities'){const d=await q("SELECT Name,Amount,StageName FROM Opportunity WHERE IsClosed=false LIMIT 10");let m='💰\n';for(const x of(d.records||[]))m+=`  *${x.Name}* $${x.Amount||0}\n`;return slackReply(m,true);}return slackReply(`? ${a}`);}catch(e){return slackReply(`❌ ${e.message}`);}}
async function slashDnsOps(t,e){return slashCloudflareOps('dns '+(t||''),e);}
async function slashWorkerOps(t,e){return slashCloudflareOps('workers',e);}
async function slashKvOps(text,env){const[a,...r]=(text||'').split(' ');if(a==='set'){await env.SLACK_KV.put(r[0],r.slice(1).join(' '));return slackReply(`✅ \`${r[0]}\``,true);}if(a==='get'){const v=await env.SLACK_KV.get(r[0]);return slackReply(`\`${r[0]}\` = \`${v||'null'}\``);}if(a==='delete'){await env.SLACK_KV.delete(r[0]);return slackReply(`🗑️ \`${r[0]}\``);}return slackReply('`/kv set <k> <v>` · `/kv get <k>` · `/kv delete <k>`');}
async function slashD1Ops(t,e){return slashCloudflareOps('d1',e);}
async function slashR2Ops(t,e){return slashCloudflareOps('r2',e);}
async function slashIssueOps(t,e){const[r,...tp]=(t||'').split(' ');if(!r||!tp.length)return slackReply('`/issue <repo> <title>`');return slashGitHub(`create-issue ${r} ${tp.join(' ')}`,e);}
async function slashPrOps(t,e){return slashGitHub('create-pr '+(t||''),e);}
async function slashCronOps(){return slackReply('⏰ */5 health · */15 sync · */30 web · 3am backup · 6am KPI · 6h gdrive · 12h rsync');}
async function slashTunnelOps(t,e){return slashCloudflareOps('tunnels',e);}
async function slashOllamaOps(t,env){try{const r=await fetch('http://192.168.4.101:11434/api/tags',{signal:AbortSignal.timeout(5000)}).catch(()=>null);if(!r)return slackReply('❌ unreachable');const d=await r.json();let m=`🧠 (${(d.models||[]).length})\n`;for(const x of(d.models||[]))m+=`  *${x.name}* ${(x.size/1e9).toFixed(1)}G\n`;return slackReply(m,true);}catch(e){return slackReply(`❌ ${e.message}`);}}

// ── IoT & Entertainment Commands ──

const ROKU_IPS = { bigscreen: '192.168.4.26', streamer: '192.168.4.33' };

async function slashTV(text, env) {
  const parts = (text || '').split(' ');
  const sub = parts[0]?.toLowerCase() || 'status';
  const target = parts[1]?.toLowerCase() || 'all';

  if (sub === 'status' || !sub) {
    let msg = '📺 *TV Status*\n';
    for (const [name, ip] of Object.entries(ROKU_IPS)) {
      try {
        const r = await fetch(`http://${ip}:8060/query/active-app`, { signal: AbortSignal.timeout(3000) });
        const xml = await r.text();
        const app = xml.match(/<app[^>]*>([^<]+)<\/app>/)?.[1] || 'Unknown';
        const ssaver = xml.match(/<screensaver[^>]*>([^<]+)<\/screensaver>/)?.[1];
        const agent = AGENTS[name];
        msg += `${agent?.emoji || '📺'} *${agent?.name || name}* (${ip}): ${ssaver ? `${app} (🌃 ${ssaver})` : app}\n`;
      } catch {
        msg += `🔴 *${name}* (${ip}): offline\n`;
      }
    }
    // Apple TV
    msg += `🍎 *AppleTV* (192.168.4.27): online (AirPlay + HomeKit)\n`;
    return slackReply(msg, true);
  }

  if (sub === 'apps') {
    const ip = ROKU_IPS[target] || ROKU_IPS.bigscreen;
    try {
      const r = await fetch(`http://${ip}:8060/query/apps`, { signal: AbortSignal.timeout(3000) });
      const xml = await r.text();
      const apps = [...xml.matchAll(/<app id="(\d+)"[^>]*>([^<]+)<\/app>/g)];
      let msg = `📺 *Apps on ${target}*\n`;
      for (const [, id, name] of apps.slice(0, 20)) msg += `  • ${name} (\`${id}\`)\n`;
      if (apps.length > 20) msg += `  ... and ${apps.length - 20} more`;
      return slackReply(msg, true);
    } catch (e) { return slackReply(`📺 Failed: ${e.message}`); }
  }

  if (sub === 'launch') {
    const ip = ROKU_IPS[target] || ROKU_IPS.bigscreen;
    const appId = parts[2] || parts[1];
    if (!appId) return slackReply('Usage: `/tv launch <app-id> [bigscreen|streamer]`\nUse `/tv apps` to see app IDs');
    try {
      await fetch(`http://${ip}:8060/launch/${appId}`, { method: 'POST', signal: AbortSignal.timeout(3000) });
      await postToSlack(env, `📺 Launched app \`${appId}\` on *${target}*`);
      return slackReply(`📺 Launched!`, true);
    } catch (e) { return slackReply(`📺 Failed: ${e.message}`); }
  }

  if (sub === 'key' || sub === 'press') {
    const ip = ROKU_IPS[target] || ROKU_IPS.bigscreen;
    const key = parts[1]?.replace(target, '').trim() || parts[2] || '';
    const validKeys = ['home', 'back', 'select', 'up', 'down', 'left', 'right', 'play', 'pause', 'rewind', 'forward', 'volumeup', 'volumedown', 'mute', 'power', 'poweroff', 'poweron'];
    if (!key || !validKeys.includes(key.toLowerCase())) return slackReply(`Usage: \`/tv key <${validKeys.join('|')}> [bigscreen|streamer]\``);
    try {
      const rokuKey = key.charAt(0).toUpperCase() + key.slice(1).toLowerCase();
      await fetch(`http://${ip}:8060/keypress/${rokuKey === 'Volumeup' ? 'VolumeUp' : rokuKey === 'Volumedown' ? 'VolumeDown' : rokuKey === 'Poweroff' ? 'PowerOff' : rokuKey === 'Poweron' ? 'PowerOn' : rokuKey}`, { method: 'POST', signal: AbortSignal.timeout(2000) });
      return slackReply(`📺 Pressed \`${key}\` on ${target}`, true);
    } catch (e) { return slackReply(`📺 Failed: ${e.message}`); }
  }

  if (sub === 'search') {
    const query = parts.slice(1).join(' ');
    if (!query) return slackReply('Usage: `/tv search <query>`');
    try {
      await fetch(`http://${ROKU_IPS.bigscreen}:8060/search/browse?keyword=${encodeURIComponent(query)}`, { method: 'POST', signal: AbortSignal.timeout(3000) });
      return slackReply(`📺 Searching for "${query}" on BigScreen`, true);
    } catch (e) { return slackReply(`📺 Failed: ${e.message}`); }
  }

  if (sub === 'play') return slashTV('key play', env);
  if (sub === 'pause') return slashTV('key pause', env);
  if (sub === 'home') return slashTV('key home', env);
  if (sub === 'mute') return slashTV('key mute', env);
  if (sub === 'off') return slashTV('key poweroff', env);
  if (sub === 'on') return slashTV('key poweron', env);

  return slackReply(`📺 *TV Commands*
  \`/tv status\` — What's playing
  \`/tv apps [bigscreen|streamer]\` — List installed apps
  \`/tv launch <app-id> [target]\` — Open an app
  \`/tv search <query>\` — Search content
  \`/tv play|pause|home|mute|on|off\` — Remote control
  \`/tv key <key> [target]\` — Press any key`);
}

async function slashIoT(env) {
  const iotDevices = [
    { name: 'Spark', ip: '192.168.4.22', emoji: '⚡', type: 'AltoBeam (LoRa/Pico)' },
    { name: 'Pixel', ip: '192.168.4.44', emoji: '🟢', type: 'IoT Sensor (private MAC)' },
    { name: 'Morse', ip: '192.168.4.45', emoji: '📟', type: 'IoT Sensor (private MAC)' },
    { name: 'Eero', ip: '192.168.4.1', emoji: '📡', type: 'Mesh Router + Thread Border' },
  ];

  let msg = '🔌 *IoT Devices*\n';
  const checks = iotDevices.map(async (d) => {
    try {
      const r = await fetch(`http://${d.ip}:80`, { signal: AbortSignal.timeout(2000) });
      return { ...d, up: true };
    } catch {
      // Ping check — most IoT won't have HTTP
      return { ...d, up: true }; // If on ARP, assume alive
    }
  });

  const results = await Promise.all(checks);
  for (const d of results) {
    msg += `${d.emoji} *${d.name}* (${d.ip}) — ${d.type}\n`;
  }

  // Ghost devices (seen before, currently offline)
  msg += '\n*Ghost Devices* (seen by Pis, currently offline):\n';
  const ghosts = [
    { ip: '.64', note: 'Seen by Alice' },
    { ip: '.81', note: 'Seen by Lucidia + Octavia' },
    { ip: '.82', note: 'Seen by Lucidia' },
    { ip: '.89', note: 'Seen by Lucidia' },
    { ip: '.97', note: 'Seen by Lucidia' },
    { ip: '.100', note: 'Seen by Octavia' },
  ];
  for (const g of ghosts) msg += `  👻 192.168.4${g.ip} — ${g.note}\n`;

  msg += '\n*Thread/Matter:* Eero is a Thread border router (`_meshcop` + `_trel`)';
  msg += '\n_Use `/ask spark what do you sense?` to talk to IoT agents_';
  return slackReply(msg, true);
}

async function slashNetwork(env) {
  let msg = '🛣️ *BlackRoad Network Map*\n\n';

  // Fleet nodes
  msg += '*Fleet (Pis + Cloud):*\n';
  try {
    const r = await fetch(FLEET_API, { signal: AbortSignal.timeout(4000) });
    const fleet = await r.json();
    for (const n of (fleet.nodes || [])) {
      msg += `  ${n.status === 'online' ? '🟢' : '🔴'} *${n.name}* (.${n.host?.split('.').pop() || '?'}) — ${n.cpu_temp || '?'}°C ${n.ollama_models || 0} models\n`;
    }
  } catch { msg += '  Fleet API unreachable\n'; }

  // Entertainment
  msg += '\n*Entertainment:*\n';
  for (const [name, ip] of Object.entries(ROKU_IPS)) {
    try {
      const r = await fetch(`http://${ip}:8060/query/active-app`, { signal: AbortSignal.timeout(2000) });
      const xml = await r.text();
      const app = xml.match(/<app[^>]*>([^<]+)<\/app>/)?.[1] || '?';
      msg += `  📺 *${name}* (${ip}) — ${app}\n`;
    } catch { msg += `  🔴 *${name}* (${ip})\n`; }
  }
  msg += `  🍎 *AppleTV* (192.168.4.27)\n`;

  // IoT
  msg += '\n*IoT Sensors:*\n';
  msg += '  ⚡ *Spark* (.22) — AltoBeam LoRa/Pico\n';
  msg += '  🟢 *Pixel* (.44) — Sensor node\n';
  msg += '  📟 *Morse* (.45) — Sensor node\n';

  // Infrastructure
  msg += '\n*Infrastructure:*\n';
  msg += '  📡 *Eero* (.1) — Mesh router, Thread border\n';
  msg += '  📚 *Alexandria* (.28) — Mac gateway\n';

  // Mobile
  msg += '\n*Mobile (randomized MAC):*\n';
  msg += '  📱 .95 · .99\n';

  // Services
  msg += '\n*Services:* ' + Object.keys(SERVICES).join(', ');

  // Stats
  const totalDevices = 14;
  const ghostDevices = 6;
  msg += `\n\n*Total:* ${totalDevices} devices live, ${ghostDevices} ghosts, 35 agents in Slack`;

  return slackReply(msg, true);
}
