// Activity #1, "The Pitch": one CEO per group pitches claims to the rest of the group (the board).
// The CEO earns more for less-true claims; the board earns points for telling true from false.
const C = require('./content');

function freshPitch() {
  return {
    ceos: {}, // group -> pid
    groups: {}, // group -> { tokens, immune }
    rounds: C.pitchRounds.map(() => ({ stage: 'pick', picks: {}, votes: {}, verified: {}, results: null })),
    super: { stage: 'decide', votes: {}, results: null },
  };
}

const groupsInPlay = (game) => {
  const g = new Set();
  game.players.forEach((p) => p.group && g.add(p.group));
  return C.groups.filter((x) => g.has(x));
};
const membersOf = (game, group) => [...game.players.values()].filter((p) => p.group === group);
const roleOf = (game, p) => (p.group && game.pitch.ceos[p.group] === p.pid ? 'ceo' : 'board');
const boardOf = (game, group) => membersOf(game, group).filter((p) => game.pitch.ceos[group] !== p.pid);

function groupState(game, group) {
  if (!game.pitch.groups[group]) game.pitch.groups[group] = { tokens: C.verifyTokens, immune: false };
  return game.pitch.groups[group];
}

// Pick a random CEO for every group with at least two people. Once chosen, a CEO stays CEO.
function assignCeos(game) {
  groupsInPlay(game).forEach((group) => {
    const members = membersOf(game, group);
    const current = game.pitch.ceos[group];
    if (current && members.some((m) => m.pid === current)) return;
    if (members.length < 2) return;
    const online = members.filter((m) => m.sockets.size);
    const pool = online.length ? online : members;
    game.pitch.ceos[group] = pool[Math.floor(Math.random() * pool.length)].pid;
    groupState(game, group);
  });
}

// Majority of the board's votes; ties (and no votes) go to the CEO, the way boards usually defer.
function decide(game, group, votes, ceoWins, other) {
  let a = 0, b = 0;
  boardOf(game, group).forEach((p) => {
    if (votes[p.pid] === ceoWins) a++;
    else if (votes[p.pid] === other) b++;
  });
  return { decision: b > a ? other : ceoWins, counts: { [ceoWins]: a, [other]: b } };
}

function advanceRound(game, r) {
  const round = game.pitch.rounds[r];
  if (round.stage === 'pick') {
    // A CEO who never picked is treated as telling the truth.
    Object.keys(game.pitch.ceos).forEach((g) => { if (round.picks[g] === undefined) round.picks[g] = 0; });
    round.stage = 'decide';
    return true;
  }
  if (round.stage === 'decide') {
    round.results = {};
    Object.keys(game.pitch.ceos).forEach((g) => {
      const card = C.pitchRounds[r].cards[round.picks[g]];
      const { decision, counts } = decide(game, g, round.votes, 'believe', 'challenge');
      let [ceo, board] = C.pitchPoints[card.kind][decision];
      const immune = groupState(game, g).immune;
      if (immune && ceo < 0) ceo = 0;
      round.results[g] = { card: round.picks[g], kind: card.kind, decision, counts, verified: !!round.verified[g], ceo, board, immune };
    });
    round.stage = 'reveal';
    return true;
  }
  return false; // already revealed: move to the next phase
}

function advanceSuper(game) {
  const sv = game.pitch.super;
  if (sv.stage === 'decide') {
    sv.results = {};
    Object.keys(game.pitch.ceos).forEach((g) => {
      const { decision, counts } = decide(game, g, sv.votes, 'approve', 'reject');
      const pts = C.superMotion[decision];
      if (decision === 'approve') groupState(game, g).immune = true;
      sv.results[g] = { decision, counts, ceo: pts.ceo, board: pts.board };
    });
    sv.stage = 'reveal';
    return true;
  }
  return false;
}

function totals(game) {
  const t = {};
  Object.keys(game.pitch.ceos).forEach((g) => (t[g] = { ceo: 0, board: 0 }));
  game.pitch.rounds.forEach((round) => {
    if (round.stage !== 'reveal') return;
    Object.entries(round.results).forEach(([g, r]) => { if (t[g]) { t[g].ceo += r.ceo; t[g].board += r.board; } });
  });
  if (game.pitch.super.stage === 'reveal') {
    Object.entries(game.pitch.super.results).forEach(([g, r]) => { if (t[g]) { t[g].ceo += r.ceo; t[g].board += r.board; } });
  }
  return t;
}

// Points this player earns from the pitch game, already scaled for the overall leaderboard.
function playerPoints(game, p, t = totals(game)) {
  if (!p.group || !t[p.group]) return 0;
  return (roleOf(game, p) === 'ceo' ? t[p.group].ceo : t[p.group].board) * C.pointsScale;
}

// ---------- actions from phones ----------
function pick(game, p, r, idx) {
  const round = game.pitch.rounds[r];
  if (round.stage !== 'pick' || roleOf(game, p) !== 'ceo') return false;
  if (!Number.isInteger(idx) || idx < 0 || idx >= C.pitchRounds[r].cards.length) return false;
  round.picks[p.group] = idx;
  return true;
}

function vote(game, p, r, choice) {
  const round = game.pitch.rounds[r];
  if (round.stage !== 'decide' || roleOf(game, p) !== 'board' || !game.pitch.ceos[p.group]) return false;
  if (!['believe', 'challenge'].includes(choice)) return false;
  round.votes[p.pid] = choice;
  return true;
}

function verify(game, p, r) {
  const round = game.pitch.rounds[r];
  if (round.stage !== 'decide' || roleOf(game, p) !== 'board' || !game.pitch.ceos[p.group]) return false;
  if (round.verified[p.group]) return false;
  const gs = groupState(game, p.group);
  if (gs.tokens <= 0) return false;
  gs.tokens--;
  round.verified[p.group] = true;
  return true;
}

function superVote(game, p, choice) {
  const sv = game.pitch.super;
  if (sv.stage !== 'decide' || roleOf(game, p) !== 'board' || !game.pitch.ceos[p.group]) return false;
  if (!['approve', 'reject'].includes(choice)) return false;
  sv.votes[p.pid] = choice;
  return true;
}

// ---------- what screens see ----------
function nameOf(game, pid) {
  const p = game.players.get(pid);
  return p ? p.name : '?';
}

function groupRows(game, extra) {
  const t = totals(game);
  return Object.keys(game.pitch.ceos)
    .sort((a, b) => C.groups.indexOf(a) - C.groups.indexOf(b))
    .map((g) => ({ group: g, ceo: nameOf(game, game.pitch.ceos[g]), boardSize: boardOf(game, g).length, tokens: groupState(game, g).tokens, immune: groupState(game, g).immune, total: t[g], ...(extra ? extra(g) : {}) }));
}

function publicView(game, ph) {
  if (ph.type === 'ceoAssign' || ph.type === 'pitchRules') {
    const solo = groupsInPlay(game).filter((g) => !game.pitch.ceos[g]);
    return { pitchGroups: groupRows(game, (g) => ({ members: membersOf(game, g).map((m) => m.name) })), soloGroups: solo };
  }
  if (ph.type === 'pitchRound') {
    const r = ph.round;
    const round = game.pitch.rounds[r];
    const def = C.pitchRounds[r];
    const view = { round: { index: r, number: r + 1, total: C.pitchRounds.length, topic: def.topic, stage: round.stage } };
    view.pitchGroups = groupRows(game, (g) => {
      const board = boardOf(game, g);
      return {
        picked: round.picks[g] !== undefined,
        voted: board.filter((p) => round.votes[p.pid]).length,
        verified: !!round.verified[g],
        result: round.stage === 'reveal' ? { ...round.results[g], text: def.cards[round.results[g].card].text } : null,
      };
    });
    if (round.stage === 'reveal') view.round.cards = def.cards.map((c) => ({ ...c, label: C.kindLabel[c.kind] }));
    if (round.stage === 'reveal') view.round.truth = def.truth;
    return view;
  }
  if (ph.type === 'superVote') {
    const sv = game.pitch.super;
    return {
      superVote: { stage: sv.stage, text: C.superMotion.text, effect: C.superMotion.approve.effect, real: sv.stage === 'reveal' ? C.superMotion.real : null },
      pitchGroups: groupRows(game, (g) => ({
        voted: boardOf(game, g).filter((p) => sv.votes[p.pid]).length,
        result: sv.stage === 'reveal' ? sv.results[g] : null,
      })),
    };
  }
  if (ph.type === 'pitchStandings' || ph.type === 'pitchTruth' || ph.type === 'callback') {
    const rows = groupRows(game);
    const approved = game.pitch.super.results ? Object.values(game.pitch.super.results).filter((x) => x.decision === 'approve').length : 0;
    return {
      pitchGroups: rows,
      ceoBoard: [...rows].sort((a, b) => b.total.ceo - a.total.ceo),
      boardBoard: [...rows].sort((a, b) => b.total.board - a.total.board),
      superApproved: approved,
      truths: C.pitchRounds.map((rd) => ({ topic: rd.topic, lie: rd.cards.find((c) => c.kind === 'lie').text, truth: rd.truth })),
      superReal: C.superMotion.real,
    };
  }
  return {};
}

function meView(game, p, ph) {
  const role = roleOf(game, p);
  const hasCeo = !!(p.group && game.pitch.ceos[p.group]);
  const t = totals(game);
  const mine = p.group && t[p.group] ? t[p.group] : { ceo: 0, board: 0 };
  const out = {
    role: hasCeo ? role : 'solo',
    ceoName: hasCeo ? nameOf(game, game.pitch.ceos[p.group]) : null,
    tokens: p.group ? groupState(game, p.group).tokens : 0,
    immune: p.group ? groupState(game, p.group).immune : false,
    teamPoints: role === 'ceo' ? mine.ceo : mine.board,
  };
  if (ph.type === 'pitchRound' && hasCeo) {
    const r = ph.round;
    const round = game.pitch.rounds[r];
    const def = C.pitchRounds[r];
    const pickIdx = round.picks[p.group];
    if (role === 'ceo') {
      out.cards = def.cards.map((c) => ({ ...c, label: C.kindLabel[c.kind], ifBelieved: C.pitchPoints[c.kind].believe[0], ifChallenged: C.pitchPoints[c.kind].challenge[0] }));
      out.picked = pickIdx === undefined ? null : pickIdx;
    } else if (round.stage !== 'pick') {
      out.claim = def.cards[pickIdx].text;
      out.myVote = round.votes[p.pid] || null;
      out.verified = !!round.verified[p.group];
      if (out.verified) out.truthLabel = C.kindLabel[def.cards[pickIdx].kind];
    }
    if (round.stage === 'reveal') {
      const res = round.results[p.group];
      out.result = { ...res, label: C.kindLabel[res.kind], text: def.cards[res.card].text, mine: role === 'ceo' ? res.ceo : res.board };
    }
  }
  if (ph.type === 'superVote' && hasCeo) {
    const sv = game.pitch.super;
    if (role === 'board') out.myVote = sv.votes[p.pid] || null;
    if (sv.stage === 'reveal') {
      const res = sv.results[p.group];
      out.result = { ...res, mine: role === 'ceo' ? res.ceo : res.board };
    }
  }
  return out;
}

module.exports = { freshPitch, assignCeos, advanceRound, advanceSuper, totals, playerPoints, pick, vote, verify, superVote, publicView, meView, roleOf };
