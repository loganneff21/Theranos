// All game text lives here so the team can edit wording without touching the server.
// Each motion and quiz question is tied to a concept from the Week 14 lecture (CoB487).

const motions = [
  {
    id: 'w0',
    title: 'Warm-up',
    concept: 'Lecture: "Would you invest?"',
    text: 'A company has a CEO who is also Chair of the Board, a board made up mostly of insiders, and CEO pay tied heavily to short-term stock price. Would you invest?',
    options: ['Yes', 'No', 'Not sure'],
    sound: [], // opinion poll, no points
    warmup: true,
  },
  {
    id: 'm1',
    title: 'Motion 1',
    concept: 'Board role: forward-looking strategy',
    text: 'Approve expansion of wellness centers to more Walgreens stores nationwide.',
    options: ['Yes', 'No'],
    sound: [], // judgment call: no points either way
    real: 'Approved. Theranos opened 40+ wellness centers, most inside Walgreens stores, without the board verifying the technology.',
  },
  {
    id: 'm2',
    title: 'Motion 2',
    concept: 'CEO duality',
    text: 'Let the CEO also act as Chair: she sets the board agenda and picks new directors.',
    options: ['Yes', 'No'],
    sound: ['No'],
    real: 'In practice, yes. Holmes recruited the directors herself and controlled what they saw. Unity of command made her fast; agency theory explains why it was dangerous.',
  },
  {
    id: 'm3',
    title: 'Motion 3',
    concept: 'Shareholder activism',
    text: 'Grant the CEO 100 votes for every share she owns (about 99.7% of all voting rights).',
    options: ['Yes', 'No'],
    sound: ['No'],
    real: 'Approved. Holmes ended up with about 99.7% of the votes, so other shareholders’ proxy votes no longer mattered.',
  },
  {
    id: 'm4',
    title: 'Motion 4',
    concept: 'Board effectiveness: verifying the agent',
    text: 'Keep device technology details confidential from the board as trade secrets.',
    options: ['Yes', 'No'],
    sound: ['No'],
    real: 'Accepted. The board could not verify what the agent was actually doing: the core agency problem.',
  },
  {
    id: 'm5',
    title: 'Motion 5',
    concept: 'Incentives: dismissal as a realistic threat',
    text: 'Remove Elizabeth Holmes as CEO.',
    options: ['Remove', 'Investigate', 'Keep'],
    sound: ['Remove', 'Investigate'],
    real: 'Too late. She controlled the votes that elect the board, so dismissal was never a realistic threat. In 2008 an earlier board voted to remove her, then reversed.',
  },
];

const packetA = {
  title: "CEO's Board Report",
  byline: 'Prepared by Elizabeth Holmes, CEO · Confidential · 2014',
  points: [
    'Raised more than $400 million from top investors',
    'Walgreens invested $50 million; 40+ wellness centers open',
    'Our Edison device runs 200+ tests from a few drops of blood',
    'CEO on the cover of Fortune and on the Forbes 400',
    'Board: two former secretaries of state, a former secretary of defense, a senator, an admiral, a general',
    'COO Sunny Balwani personally invested $20 million',
    'Device details tightly controlled to protect trade secrets',
  ],
};

const pitch =
  "I know there's noise out there. Any time you try to disrupt a giant industry, the incumbents come after you. They want us to fail. But look at what we've built: hundreds of millions in funding, Walgreens, the most respected board in America. I need you to trust me. Give me the room to finish what we started, and I promise to be more transparent with this board going forward.";

const packetB = {
  title: 'What Employees Knew',
  points: [
    'Edison ran only 15 of the 240 tests offered; the rest ran on secretly modified commercial machines',
    'Prototypes gave inaccurate results; no validation tests were run',
    'Inaccurate findings were not reported to CMS',
    'The CFO was fired in 2008 and never replaced',
    'Employees who raised concerns were fired; leavers were threatened and followed by detectives',
    'Director Avie Tevanian was pushed out after questioning projections and the voting increase',
    'Holmes recruited the current directors through her own network; none had medical-device or lab-medicine expertise',
    'Holmes and COO Balwani were in an undisclosed romantic relationship',
  ],
};

// Activity 2. Profiles use the lecture's Governance Deep Dive lenses.
const lenses = ['Board structure', 'CEO duality', 'Incentives', 'Controls & information'];

const companies = {
  A: {
    alias: 'NovaDx',
    sector: 'Health tech',
    story: 'Claims 200+ blood tests from a few drops. Raised $400M+; a national pharmacy chain invested $50M.',
    lens: {
      'Board structure': 'Famous outsiders (former cabinet officials, generals) recruited by the CEO; no medical or lab expertise',
      'CEO duality': 'Founder-CEO holds about 99.7% of voting rights and controls what the board sees',
      'Incentives': 'Founder’s fortune rides on a sky-high private valuation (Forbes 400)',
      'Controls & information': 'No CFO since 2008; device details withheld from the board; no peer-reviewed data',
    },
    identity: 'Theranos (2014)',
    outcome: 'Exposed by the Wall Street Journal in 2015, dissolved in 2018. Holmes was convicted of fraud.',
    multiplier: 0,
  },
  B: {
    alias: 'Searchlight',
    sector: 'Internet',
    story: 'Product used by millions every day. Profitable 3 years running: ~$962M net revenue, $106M net income.',
    lens: {
      'Board structure': 'Veteran tech investors and an experienced biotech CEO',
      'CEO duality': 'Yes: an experienced outside CEO, hired by the founders, also chairs the board',
      'Incentives': 'Founders and executives own large stakes; insiders get 10 votes per share',
      'Controls & information': 'Files audited financial statements with the SEC',
    },
    identity: 'Google (2004 IPO)',
    outcome: 'CEO duality and founder control, but with real profits, audited books and experienced leadership. Became a $1 trillion+ company.',
    multiplier: 10,
  },
  C: {
    alias: 'Ledgerline',
    sector: 'Financial tech',
    story: 'Valued at ~$32B. Celebrity endorsements, a Super Bowl ad, arena naming rights.',
    lens: {
      'Board structure': 'Many group companies never held a board meeting',
      'CEO duality': 'Founder-CEO runs the company and also owns an affiliated trading firm run by a close associate',
      'Incentives': 'Founder controls the company; his wealth depends on its token-fueled valuation',
      'Controls & information': 'No in-house accounting department; little-known auditor; spending approved in a group chat',
    },
    identity: 'FTX (2022)',
    outcome: 'Collapsed into bankruptcy in November 2022. The restructuring CEO called it the worst failure of corporate controls he had seen. Founder convicted of fraud.',
    multiplier: 0,
  },
  D: {
    alias: 'Bulkway',
    sector: 'Retail',
    story: 'Membership warehouse retailer. Thin margins, steady growth. Not flashy.',
    lens: {
      'Board structure': 'Lead independent director; long-serving directors include a famous value investor',
      'CEO duality': 'No: Chairman and CEO are separate people',
      'Incentives': 'Directors must own meaningful company stock; executive pay modest for a company its size',
      'Controls & information': 'Audit committee oversees internal controls',
    },
    identity: 'Costco',
    outcome: 'Disciplined governance, not hype. Compounded steadily for decades and beat Walmart by a wide margin.',
    multiplier: 5,
  },
};
const companyOrder = ['A', 'B', 'C', 'D'];
const revealOrder = ['D', 'B', 'C', 'A'];

const quiz = [
  { q: 'Of the 240 tests Theranos offered, how many actually ran on its Edison device?', options: ['120', '15', '200', 'All 240'], correct: 1 },
  { q: 'In agency theory, Holmes is the ___ and the shareholders are the ___.', options: ['Principal; agents', 'Steward; owners', 'Agent; principals', 'Director; managers'], correct: 2 },
  { q: 'Which argument favors letting the CEO also be board chair?', options: ['Agency theory', 'Shareholder activism', 'Director independence', 'Unity of command'], correct: 3 },
  { q: 'Which of these is NOT one of the governance mechanisms from lecture?', options: ['An involved board of directors', 'A famous, charismatic CEO', 'Shareholder activism', 'Managerial rewards and incentives'], correct: 1 },
  { q: 'Giving Holmes 99.7% of the votes mainly took away which shareholder right?', options: ['Voting the proxy', 'Selling their stock', 'Residual rights after liquidation', 'Suing for damages'], correct: 0 },
  { q: "Theranos's board was mostly outsiders. Which drawback of outsider boards from lecture hit hardest?", options: ['Too much CEO loyalty', 'Too many board meetings', 'Less direct operational information', 'Too much industry expertise'], correct: 2 },
  { q: 'Lecture says dismissal should be a realistic threat. Why wasn’t it at Theranos?', options: ['Her contract banned it', 'She controlled the votes that elect the board', 'The CFO blocked it', 'Walgreens vetoed it'], correct: 1 },
  { q: "Theranos's board had no lab-medicine expert. What is today's version of that risk?", options: ['Boards overseeing AI without AI expertise', 'CEOs who own too much stock', 'Too many independent directors', 'Shareholders voting proxies'], correct: 0 },
];

const scoring = {
  soundVote: 250, // per governance-sound board vote
  perMillion: 20, // portfolio points per $1M of final value
  quizMax: 1000, // fastest correct answer
  quizBase: 500, // slowest correct answer
  quizSeconds: 20,
  budget: 10,
  maxPerCompany: 5,
};

// Activity #2 is played on paper; the phones sit it out.
const ACTIVITY2_ON_PHONES = false;

const groups = ['Board 1', 'Board 2', 'Board 3', 'Board 4', 'Board 5', 'Board 6'];

// The run of show. The host's Next button walks this list.
const phases = [
  { id: 'lobby', type: 'lobby', section: 'Join' },
  { id: 'w0', type: 'vote', motion: 0, section: 'Activity #1' },
  { id: 'packetA', type: 'packetA', section: 'Activity #1' },
  { id: 'm1', type: 'vote', motion: 1, section: 'Activity #1' },
  { id: 'm2', type: 'vote', motion: 2, section: 'Activity #1' },
  { id: 'm3', type: 'vote', motion: 3, section: 'Activity #1' },
  { id: 'm4', type: 'vote', motion: 4, section: 'Activity #1' },
  { id: 'pitch', type: 'pitch', section: 'Activity #1' },
  { id: 'packetB', type: 'packetB', section: 'Activity #1' },
  { id: 'm5', type: 'vote', motion: 5, section: 'Activity #1' },
  { id: 'boardReveal', type: 'boardReveal', section: 'Activity #1' },
  { id: 'callback', type: 'callback', section: 'Activity #1' },
  // Activity #2 runs on paper in class. Set ACTIVITY2_ON_PHONES to true to play it on phones instead.
  ...(ACTIVITY2_ON_PHONES
    ? [
        { id: 'profiles', type: 'profiles', section: 'Activity #2' },
        { id: 'invest', type: 'invest', section: 'Activity #2' },
        ...revealOrder.map((c) => ({ id: 'reveal' + c, type: 'companyReveal', company: c, section: 'Activity #2' })),
        { id: 'portfolio', type: 'portfolio', section: 'Activity #2' },
      ]
    : [{ id: 'paperBreak', type: 'paperBreak', section: 'Activity #2' }]),
  { id: 'quizIntro', type: 'quizIntro', section: 'Quiz' },
  ...quiz.map((_, i) => ({ id: 'q' + (i + 1), type: 'quiz', q: i, section: 'Quiz' })),
  { id: 'final', type: 'final', section: 'Results' },
];

module.exports = { ACTIVITY2_ON_PHONES, motions, packetA, pitch, packetB, lenses, companies, companyOrder, revealOrder, quiz, scoring, groups, phases };
