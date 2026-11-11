const express = require('express');
const http = require('http');
const path = require('path');
const crypto = require('crypto');
const { Server } = require('socket.io');
const QRCode = require('qrcode');
const C = require('./content');
const P = require('./pitch');
const PITCH_TYPES = ['pitchRules', 'ceoAssign', 'pitchRound', 'superVote', 'pitchStandings', 'pitchTruth', 'callback'];

const PORT = process.env.PORT || 3000;
const HOST_KEY = process.env.HOST_KEY || 'theranos';
const PUBLIC_URL = (process.env.PUBLIC_URL || '').replace(/\/$/, '');

const app = express();
app.set('trust proxy', true);
const server = http.createServer(app);
const io = new Server(server, { pingInterval: 10000, pingTimeout: 20000 });

const pub = path.join(__dirname, 'public');
app.get('/', (req, res) => res.redirect('/play'));
app.get('/play', (req, res) => res.sendFile(path.join(pub, 'play.html')));
app.get('/host', (req, res) => res.sendFile(path.join(pub, 'host.html')));
app.use(express.static(pub));

function joinUrl(req) {
  if (PUBLIC_URL) return PUBLIC_URL + '/play';
  const proto = (req.get('x-forwarded-proto') || req.protocol).split(',')[0];
  return `${proto}://${req.get('host')}/play`;
}
app.get('/join-url', (req, res) => res.json({ url: joinUrl(req) }));
app.get('/qr.svg', async (req, res) => {
  const svg = await QRCode.toString(joinUrl(req), { type: 'svg', margin: 1, errorCorrectionLevel: 'M' });
  res.type('image/svg+xml').set('Cache-Control', 'no-store').send(svg);
});
app.get('/healthz', (req, res) => res.send('ok'));

// ---------------- game state ----------------
let game;
function freshGame() {
  return {
    phaseIndex: 0,
    maxPhase: 0,
    players: new Map(), // pid -> player
    quizState: {}, // qIndex -> { start, revealed }
    pitch: P.freshPitch(),
  };
}
game = freshGame();

const phase = () => C.phases[game.phaseIndex];
const reached = (id) => {
  const i = C.phases.findIndex((p) => p.id === id);
  return i >= 0 && i <= game.maxPhase;
};

function newPlayer(pid, name, group) {
  return { pid, name, group, votes: {}, alloc: null, answers: {}, sockets: new Set(), joinedAt: Date.now() };
}

function smallestGroup() {
  const counts = Object.fromEntries(C.groups.map((g) => [g, 0]));
  game.players.forEach((p) => p.group && counts[p.group]++);
  return C.groups.reduce((a, b) => (counts[b] < counts[a] ? b : a));
}

function cleanName(s) {
  return String(s || '').replace(/[<>]/g, '').trim().slice(0, 18) || 'Player';
}

// Activity #1 points come from the pitch game (CEO or board score for the player's group).
function votePoints(p) {
  return P.playerPoints(game, p);
}

function revealedCompanies() {
  return C.revealOrder.filter((c) => reached('reveal' + c));
}

function portfolioValue(p, onlyRevealed = true) {
  if (!p.alloc) return 0;
  const list = onlyRevealed ? revealedCompanies() : C.companyOrder;
  return list.reduce((sum, c) => sum + (p.alloc[c] || 0) * C.companies[c].multiplier, 0);
}

function quizPoints(p) {
  let pts = 0;
  Object.entries(p.answers).forEach(([qi, a]) => {
    const qs = game.quizState[qi];
    if (qs && qs.revealed && a.choice === C.quiz[qi].correct) pts += a.points;
  });
  return pts;
}

function scoreOf(p) {
  const votes = votePoints(p);
  const portfolio = reached('portfolio') ? portfolioValue(p) * C.scoring.perMillion : 0;
  const quizPts = quizPoints(p);
  return { votes, portfolio, quiz: quizPts, total: votes + portfolio + quizPts };
}

function rankings() {
  const list = [...game.players.values()].map((p) => ({ pid: p.pid, name: p.name, group: p.group, value: portfolioValue(p), ...scoreOf(p) }));
  const byTotal = [...list].sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));
  const byPortfolio = [...list].filter((x) => game.players.get(x.pid).alloc).sort((a, b) => b.value - a.value || a.name.localeCompare(b.name));
  const teams = {};
  list.forEach((x) => {
    if (!x.group) return;
    teams[x.group] = teams[x.group] || { group: x.group, sum: 0, n: 0 };
    teams[x.group].sum += x.total;
    teams[x.group].n += 1;
  });
  const teamList = Object.values(teams)
    .map((t) => ({ group: t.group, avg: Math.round(t.sum / t.n), n: t.n }))
    .sort((a, b) => b.avg - a.avg);
  return { byTotal, byPortfolio, teams: teamList };
}

function tallies() {
  const out = {};
  C.motions.forEach((m) => {
    const counts = Object.fromEntries(m.options.map((o) => [o, 0]));
    game.players.forEach((p) => {
      if (p.votes[m.id] in counts) counts[p.votes[m.id]]++;
    });
    out[m.id] = counts;
  });
  return out;
}

function investTotals() {
  const totals = Object.fromEntries(C.companyOrder.map((c) => [c, 0]));
  let submitted = 0;
  game.players.forEach((p) => {
    if (!p.alloc) return;
    submitted++;
    C.companyOrder.forEach((c) => (totals[c] += p.alloc[c] || 0));
  });
  return { totals, submitted };
}

function quizInfo() {
  const ph = phase();
  if (ph.type !== 'quiz') return null;
  const qs = game.quizState[ph.q];
  const dist = C.quiz[ph.q].options.map(() => 0);
  let answered = 0;
  game.players.forEach((p) => {
    const a = p.answers[ph.q];
    if (a) {
      dist[a.choice]++;
      answered++;
    }
  });
  return {
    q: ph.q,
    number: ph.q + 1,
    total: C.quiz.length,
    question: C.quiz[ph.q].q,
    options: C.quiz[ph.q].options,
    start: qs.start,
    seconds: C.scoring.quizSeconds,
    revealed: qs.revealed,
    correct: qs.revealed ? C.quiz[ph.q].correct : null,
    dist: qs.revealed ? dist : null,
    answered,
  };
}

function connectedCount() {
  let n = 0;
  game.players.forEach((p) => p.sockets.size && n++);
  return n;
}

function publicState() {
  const ph = phase();
  const r = rankings();
  const s = {
    phaseIndex: game.phaseIndex,
    phaseCount: C.phases.length,
    phase: ph,
    sections: [...new Set(C.phases.map((p) => p.section))],
    players: game.players.size,
    online: connectedCount(),
    now: Date.now(),
  };
  if (ph.type === 'vote') {
    const m = C.motions[ph.motion];
    s.motion = { id: m.id, title: m.title, concept: m.concept, text: m.text, options: m.options, warmup: !!m.warmup };
    s.tally = tallies()[m.id];
    s.voted = Object.values(s.tally).reduce((a, b) => a + b, 0);
  }
  if (ph.type === 'boardReveal') {
    const t = tallies();
    s.board = C.motions.filter((m) => !m.warmup).map((m) => ({ ...m, tally: t[m.id] }));
  }
  if (ph.type === 'callback') {
    const w = C.motions.find((m) => m.warmup);
    s.warmup = { text: w.text, options: w.options, tally: tallies()[w.id] };
  }
  if (PITCH_TYPES.includes(ph.type)) Object.assign(s, P.publicView(game, ph));
  if (ph.type === 'invest' || ph.type === 'companyReveal' || ph.type === 'profiles') {
    Object.assign(s, investTotals());
  }
  if (ph.type === 'companyReveal') {
    const c = C.companies[ph.company];
    s.company = { key: ph.company, ...c, classValue: s.totals[ph.company] * c.multiplier };
  }
  if (ph.type === 'portfolio') s.leaders = r.byPortfolio.slice(0, 10);
  if (ph.type === 'quiz') s.quiz = quizInfo();
  if (ph.type === 'quiz' && s.quiz.revealed) s.leaders = r.byTotal.slice(0, 5);
  if (ph.type === 'final') {
    s.leaders = r.byTotal.slice(0, 10);
    s.teams = r.teams;
  }
  return s;
}

function meState(p) {
  const r = rankings();
  const ph = phase();
  const sc = scoreOf(p);
  const rank = r.byTotal.findIndex((x) => x.pid === p.pid) + 1;
  const pRank = r.byPortfolio.findIndex((x) => x.pid === p.pid) + 1;
  const me = {
    pid: p.pid,
    name: p.name,
    group: p.group,
    votes: p.votes,
    alloc: p.alloc,
    score: sc,
    rank,
    of: game.players.size,
    portfolioRank: pRank,
    portfolioValue: portfolioValue(p),
  };
  if (ph.type === 'quiz') me.answer = p.answers[ph.q] || null;
  if (PITCH_TYPES.includes(ph.type)) me.pitch = P.meView(game, p, ph);
  return me;
}

let pending = null;
function broadcast() {
  // Coalesce bursts of votes into one update every 150 ms.
  if (pending) return;
  pending = setTimeout(() => {
    pending = null;
    const s = publicState();
    io.to('host').emit('state', { ...s, hostView: hostExtras() });
    game.players.forEach((p) => {
      const me = meState(p);
      p.sockets.forEach((sid) => io.to(sid).emit('state', { ...s, me }));
    });
  }, 150);
}

function hostExtras() {
  const ph = phase();
  return {
    names: [...game.players.values()].map((p) => ({ name: p.name, group: p.group, online: p.sockets.size > 0 })),
    next: C.phases[game.phaseIndex + 1] ? C.phases[game.phaseIndex + 1].id : null,
    awaitingReveal: ph.type === 'quiz' && !game.quizState[ph.q].revealed,
    pitchStage: ph.type === 'pitchRound' ? game.pitch.rounds[ph.round].stage : ph.type === 'superVote' ? game.pitch.super.stage : null,
  };
}

function enterPhase(i) {
  game.phaseIndex = Math.max(0, Math.min(C.phases.length - 1, i));
  game.maxPhase = Math.max(game.maxPhase, game.phaseIndex);
  const ph = phase();
  if (['ceoAssign', 'pitchRound', 'superVote'].includes(ph.type)) P.assignCeos(game);
  if (ph.type === 'quiz' && !game.quizState[ph.q]) {
    game.quizState[ph.q] = { start: Date.now(), revealed: false };
    // Nudge everyone when time runs out so screens show "time's up".
    setTimeout(broadcast, C.scoring.quizSeconds * 1000 + 300);
  }
  broadcast();
}

// ---------------- sockets ----------------
io.on('connection', (socket) => {
  let player = null;
  let isHost = false;

  // The presenter's own laptop can open /host with no key, so the PowerPoint link never changes.
  // Phones always arrive through the public link, which adds forwarding headers, so they still need the key.
  const h = socket.handshake;
  const addr = (h.address || '').replace('::ffff:', '');
  const viaProxy = h.headers['cf-connecting-ip'] || h.headers['x-forwarded-for'] || h.headers['x-real-ip'];
  const onThisLaptop = !viaProxy && (addr === '127.0.0.1' || addr === '::1');

  socket.on('host:auth', (key, ack) => {
    if (key !== HOST_KEY && !onThisLaptop) return ack && ack({ ok: false });
    isHost = true;
    socket.join('host');
    ack && ack({ ok: true });
    socket.emit('state', { ...publicState(), hostView: hostExtras() });
  });

  socket.on('host:next', () => {
    if (!isHost) return;
    const ph = phase();
    if (ph.type === 'quiz' && !game.quizState[ph.q].revealed) {
      game.quizState[ph.q].revealed = true;
      return broadcast();
    }
    // Pitch rounds step through pick -> decide -> reveal before moving on.
    if (ph.type === 'pitchRound' && P.advanceRound(game, ph.round)) return broadcast();
    if (ph.type === 'superVote' && P.advanceSuper(game)) return broadcast();
    enterPhase(game.phaseIndex + 1);
  });
  socket.on('host:back', () => isHost && enterPhase(game.phaseIndex - 1));
  socket.on('host:goto', (i) => isHost && Number.isInteger(i) && enterPhase(i));
  socket.on('host:reset', () => {
    if (!isHost) return;
    const old = game.players;
    game = freshGame();
    old.forEach((p) => p.sockets.forEach((sid) => io.to(sid).emit('reset')));
    broadcast();
  });
  socket.on('host:kick', (name) => {
    if (!isHost) return;
    game.players.forEach((p, pid) => {
      if (p.name === name) {
        p.sockets.forEach((sid) => io.to(sid).emit('reset'));
        game.players.delete(pid);
      }
    });
    broadcast();
  });

  // Player joins or rejoins with the id saved on their phone.
  socket.on('join', ({ pid, name, group } = {}, ack) => {
    if (pid && game.players.has(pid)) {
      player = game.players.get(pid);
    } else if (name) {
      pid = crypto.randomBytes(8).toString('hex');
      player = newPlayer(pid, cleanName(name), C.groups.includes(group) ? group : smallestGroup());
      game.players.set(pid, player);
    } else {
      return ack && ack({ ok: false });
    }
    player.sockets.add(socket.id);
    ack && ack({ ok: true, pid: player.pid, groups: C.groups });
    broadcast();
  });

  socket.on('vote', (choice) => {
    const ph = phase();
    if (!player || ph.type !== 'vote') return;
    const m = C.motions[ph.motion];
    if (!m.options.includes(choice)) return;
    player.votes[m.id] = choice;
    broadcast();
  });

  // ----- Activity #1: The Pitch -----
  socket.on('pitch:pick', (idx) => {
    const ph = phase();
    if (player && ph.type === 'pitchRound' && P.pick(game, player, ph.round, idx)) broadcast();
  });
  socket.on('pitch:vote', (choice) => {
    const ph = phase();
    if (player && ph.type === 'pitchRound' && P.vote(game, player, ph.round, choice)) broadcast();
  });
  socket.on('pitch:verify', () => {
    const ph = phase();
    if (player && ph.type === 'pitchRound' && P.verify(game, player, ph.round)) broadcast();
  });
  socket.on('pitch:super', (choice) => {
    if (player && phase().type === 'superVote' && P.superVote(game, player, choice)) broadcast();
  });

  socket.on('invest', (alloc, ack) => {
    if (!player || phase().type !== 'invest') return ack && ack({ ok: false, error: 'Investing is closed.' });
    const clean = {};
    let sum = 0;
    for (const c of C.companyOrder) {
      const v = Number(alloc && alloc[c]) || 0;
      if (!Number.isInteger(v) || v < 0 || v > C.scoring.maxPerCompany) return ack && ack({ ok: false, error: 'Max $5M per company.' });
      clean[c] = v;
      sum += v;
    }
    if (sum !== C.scoring.budget) return ack && ack({ ok: false, error: 'Invest exactly $10M.' });
    player.alloc = clean;
    ack && ack({ ok: true });
    broadcast();
  });

  socket.on('answer', (choice) => {
    const ph = phase();
    if (!player || ph.type !== 'quiz') return;
    const qs = game.quizState[ph.q];
    if (qs.revealed || player.answers[ph.q]) return;
    const elapsed = (Date.now() - qs.start) / 1000;
    if (elapsed > C.scoring.quizSeconds + 0.5) return;
    if (!Number.isInteger(choice) || choice < 0 || choice >= C.quiz[ph.q].options.length) return;
    const left = Math.max(0, C.scoring.quizSeconds - elapsed) / C.scoring.quizSeconds;
    const points = Math.round(C.scoring.quizBase + (C.scoring.quizMax - C.scoring.quizBase) * left);
    player.answers[ph.q] = { choice, points };
    broadcast();
  });

  socket.on('disconnect', () => {
    if (player) {
      player.sockets.delete(socket.id);
      broadcast();
    }
  });
});

// Static content the screens need once (profiles, packets, pitch).
app.get('/content.json', (req, res) => {
  res.json({
    packetA: C.packetA,
    packetB: C.packetB,
    pitch: C.pitch,
    companies: Object.fromEntries(C.companyOrder.map((k) => [k, { alias: C.companies[k].alias, sector: C.companies[k].sector, story: C.companies[k].story, lens: C.companies[k].lens }])),
    lenses: C.lenses,
    quizCount: C.quiz.length,
    companyOrder: C.companyOrder,
    groups: C.groups,
    scoring: C.scoring,
    pitchRoundCount: C.pitchRounds.length,
    verifyTokens: C.verifyTokens,
    pitchPoints: C.pitchPoints,
    superMotion: C.superMotion,
    activity2OnPhones: C.ACTIVITY2_ON_PHONES,
  });
});

server.listen(PORT, () => {
  console.log(`Theranos game running on port ${PORT}`);
  console.log(`  Projector: http://localhost:${PORT}/host?key=${HOST_KEY}`);
  console.log(`  Phones:    http://localhost:${PORT}/play`);
});
