// All game text lives here so the team can edit wording without touching the server.
// Each motion and quiz question is tied to a concept from the Week 14 lecture (CoB487).

const motions = [
  {
    id: 'w0',
    title: 'Warm-up',
    concept: 'Lecture: "Would you invest?"',
    text: 'A company’s CEO also runs its board of directors, most directors work for the company, and the CEO’s pay depends mostly on this year’s stock price. Would you invest?',
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


// ---------------- Activity #1: The Pitch (CEO vs. board) ----------------
// Every lie card is a real claim. Theranos rounds come from the SEC's 2018 complaint against Holmes and
// Balwani (allegations; both were later convicted of fraud). Five rounds use other companies (Nikola,
// Wells Fargo, Frank, Enron, FTX) to show the same governance failure elsewhere. None of this is in the IMD case reading.
const pitchRounds = [
  {
    topic: 'Military',
    briefing: 'It is 2013. Theranos is a private blood-testing startup. It says its device can run many tests from a few drops of blood, and it is opening testing centers inside Walgreens stores. It has also been pitching the device to the US military. Device details are kept secret.',
    ask: ['Which military units use it, and where?', 'Can we see a contract or a report from the military?'],
    company: 'Theranos',
    said: 'Theranos told investors',
    ceoBrief: 'What only you know: no military unit uses your device. Your talks with the Department of Defense have not led to any deployment. Your board can’t check, because you keep device details secret.',
    cards: [
      { kind: 'honest', text: 'The military has not deployed our technology yet.' , note: 'True. Saying it may cool investors’ excitement.'},
      { kind: 'exaggeration', text: 'The military is very interested in what we’re building.' , note: 'There have been talks, but “very interested” oversells them.'},
      { kind: 'lie', text: 'Our products are deployed on the battlefield in Afghanistan and on medevac (medical rescue) helicopters.' , note: 'False. Nothing has been deployed anywhere.'},
    ],
    truth: 'According to the SEC’s 2018 complaint, Theranos’s technology was never deployed by the Department of Defense.',
  },
  {
    // Not Theranos: the same governance failure at an electric-truck startup.
    topic: 'The electric truck',
    briefing: 'It is December 2016. Nikola, a startup building hydrogen-electric semi trucks, is unveiling its first prototype, the Nikola One, on stage. It says buyers have placed billions in preorders. Skeptics ask if the truck really runs or is a “pusher”: a shell that has to be pushed or towed.',
    ask: ['Has the truck driven under its own power?', 'Can we see it drive, not just sit on a stage?'],
    company: 'Nikola',
    said: 'Nikola’s founder told the public',
    ceoBrief: 'What only you know: the truck on stage is missing gears and motors and is powered by an external battery. It cannot drive itself. Real production is years away.',
    cards: [
      { kind: 'honest', text: 'Our truck prototype can’t drive under its own power yet.' , note: 'True. Saying it on launch day could deflate the hype.'},
      { kind: 'exaggeration', text: 'Our prototype is nearly ready for the road.' , note: 'It is years from road-ready, so “nearly” stretches it.'},
      { kind: 'lie', text: 'This is a real truck. This is not a pusher.' , note: 'False. It can’t move on its own power.'},
    ],
    truth: 'At its 2016 launch the truck was missing gears and motors and was powered by an external battery. A later promo video of it “in motion” was filmed by rolling it down a hill. Founder Trevor Milton was convicted of fraud in 2022 and sentenced to four years; he was pardoned in March 2025.',
  },
  {
    // Not Theranos: a big public bank whose board missed it for years.
    topic: 'Cross-selling',
    briefing: 'It is 2015. Wells Fargo is one of the largest US banks. Its strategy is cross-selling: getting existing customers to use more of its products, like a credit card or a second account. Investors reward it for how many products each household holds.',
    ask: ['How do you know customers wanted and use these accounts?', 'What happens to employees who miss their sales goals?'],
    company: 'Wells Fargo',
    said: 'Wells Fargo told investors',
    ceoBrief: 'What only you know: branch employees face daily sales quotas, and some open accounts customers never asked for to hit them. Those unwanted accounts also inflate the products-per-household number investors watch.',
    cards: [
      { kind: 'honest', text: 'Our branch employees work under tough daily sales goals.' , note: 'True. It hints at the pressure without admitting misconduct.'},
      { kind: 'exaggeration', text: 'The average household uses about six of our products.' , note: 'The number is real on paper, but unwanted accounts inflate it.'},
      { kind: 'lie', text: 'Our sales growth comes from serving customers’ real needs.' , note: 'False. Much of the growth comes from sales pressure, not need.'},
    ],
    truth: 'To hit sales goals, employees opened millions of accounts customers never asked for. In 2020 Wells Fargo paid $3 billion to settle with the Justice Department and the SEC, which said it misled investors about its “needs-based” sales model.',
  },
  {
    topic: 'Users',
    briefing: 'It is 2021. Frank is a startup that helps college students fill out financial aid (FAFSA) forms. Its young founder made the Forbes 30 Under 30 list. JPMorgan Chase wants to buy Frank to reach young customers, and the price depends on how many users Frank has.',
    ask: ['How many people have actually signed up for Frank?', 'Can an outside firm check the customer list before the deal closes?'],
    company: 'Frank',
    said: 'Frank told JPMorgan',
    ceoBrief: 'What only you know: fewer than 300,000 people have signed up for Frank. JPMorgan expects millions. You could pay someone to build a fake customer list that looks real.',
    cards: [
      { kind: 'honest', text: 'We have fewer than 300,000 users.', note: 'True. JPMorgan would likely pay far less, or walk away.' },
      { kind: 'exaggeration', text: 'We are one of the fastest-growing financial aid tools for students.', note: 'Vague bragging. It hides how small Frank really is.' },
      { kind: 'lie', text: 'Frank has more than 4 million student users.', note: 'False. You have fewer than 300,000.' },
    ],
    truth: 'JPMorgan paid $175 million for Frank. According to the SEC and federal prosecutors, Frank had fewer than 300,000 users, and the founder paid a professor to create fake data for 4.25 million. She was convicted of fraud in 2025.',
  },
  {
    // Not Theranos: the classic case of a board that waived its own rules.
    topic: 'The energy giant',
    briefing: 'It is September 2001. Enron is one of America’s largest energy companies. In August its CEO quit after six months, citing personal reasons, and Chairman Ken Lay took the job back. The stock has fallen by more than half. Analysts say its deals with outside partnerships are hard to understand.',
    ask: ['Why did the CEO really leave?', 'What is in those partnerships, and who runs them?'],
    company: 'Enron',
    said: 'Enron’s CEO told employees',
    ceoBrief: 'What only you know: partnerships run by your CFO have been hiding losses and debt off Enron’s books. A big correction to past profits is coming. Employees still hold lots of Enron stock.',
    cards: [
      { kind: 'honest', text: 'Our CFO also runs outside partnerships that do deals with Enron.' , note: 'True. Saying it invites hard questions about the partnerships.'},
      { kind: 'exaggeration', text: 'Our partnerships are disclosed in our financial statements.' , note: 'They’re mentioned, but not the losses and debt that matter.'},
      { kind: 'lie', text: 'Enron stock is an incredible bargain right now.' , note: 'False. You know losses are about to come out.'},
    ],
    truth: 'On September 26, 2001, Ken Lay called the stock an incredible bargain. Weeks later Enron cut its past profits by $586 million because partnerships run by its CFO had hidden losses and debt. It went bankrupt in December 2001.',
  },
  {
    topic: 'Customer money',
    briefing: 'It is November 2022. FTX is one of the world’s biggest crypto exchanges, valued at $32 billion and run by its 30-year-old founder. Customers keep their money and crypto on FTX to trade. A news report just raised questions about FTX’s sister trading firm, Alameda Research, and customers are rushing to pull their money out.',
    ask: ['Has any customer money been lent to Alameda or used for anything else?', 'Can we see proof that every customer’s deposit is still there?'],
    company: 'FTX',
    said: 'Founder Sam Bankman-Fried tweeted',
    ceoBrief: 'What only you know: billions of dollars of customer deposits have been moved to Alameda Research, your trading firm, and spent or lost. If every customer asks for their money back, FTX can’t pay.',
    cards: [
      { kind: 'honest', text: 'Some customer money went to Alameda, and we can’t cover every withdrawal right now.', note: 'True. Saying it would likely make the rush to withdraw even worse.' },
      { kind: 'exaggeration', text: 'We’re processing withdrawals as fast as we can, and the rush will pass.', note: 'Spin. The problem isn’t speed: the money isn’t there.' },
      { kind: 'lie', text: 'FTX has enough to cover all client holdings. We don’t invest client assets.', note: 'False. Customer money was moved to Alameda.' },
    ],
    truth: 'FTX stopped withdrawals the next day and filed for bankruptcy on November 11, 2022. In 2023 a jury convicted Bankman-Fried of fraud for taking billions of dollars of customer money. He was sentenced to 25 years in prison.',
  },
];

const kindLabel = { honest: 'Honest', exaggeration: 'Exaggeration', lie: 'Lie' };

// [CEO points, board points] for each card kind and board decision.
const pitchPoints = {
  honest: { believe: [1, 1], challenge: [1, -1] },
  exaggeration: { believe: [2, -1], challenge: [-2, 1] },
  lie: { believe: [3, -2], challenge: [-3, 2] },
};
const verifyTokens = 3;
const unanimousBonus = 1; // extra board point when every board member votes the same way and the board is right // per board, for the whole game
const pointsScale = 100; // pitch points x 100 go on each player's game total

const superAfter = 3; // the 99.7% vote comes after this many rounds
const superMotion = {
  text: 'Your CEO wants super-voting shares: 100 votes for every share they own, about 99.7% of all shareholder votes. Shareholders elect the board, so the CEO could replace any director, and the board could never fire the CEO.',
  approve: { ceo: 2, board: -1, effect: 'The CEO can no longer lose points for getting caught.' },
  reject: { ceo: 0, board: 1 },
  real: 'The real Theranos board approved it. After that, the board could not hold Holmes accountable: she controlled the votes that elect the board.',
};

// The run of show. The host's Next button walks this list. The phone game covers Activity #1 only;
// Activity #2 is on paper. (The old phone versions of Activity #2 and the quiz are in git history.)
const phases = [
  { id: 'lobby', type: 'lobby', section: 'Join' },
  { id: 'w0', type: 'vote', motion: 0, section: 'Activity #1' },
  // Activity #1: "The Pitch" (CEO vs. board). The old five-motion version is kept in git history.
  { id: 'rules', type: 'pitchRules', section: 'Activity #1' },
  { id: 'ceos', type: 'ceoAssign', section: 'Activity #1' },
  ...pitchRounds.flatMap((_, i) => [
    ...(i === superAfter ? [{ id: 'super', type: 'superVote', section: 'Activity #1' }] : []),
    { id: 'r' + (i + 1), type: 'pitchRound', round: i, section: 'Activity #1' },
  ]),
  { id: 'standings', type: 'pitchStandings', section: 'Activity #1' },
  { id: 'truth', type: 'pitchTruth', section: 'Activity #1' },
  { id: 'callback', type: 'callback', section: 'Activity #1' },
];

module.exports = { ACTIVITY2_ON_PHONES, pitchRounds, kindLabel, pitchPoints, verifyTokens, unanimousBonus, pointsScale, superAfter, superMotion, motions, packetA, pitch, packetB, lenses, companies, companyOrder, revealOrder, quiz, scoring, groups, phases };
