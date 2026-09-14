import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const conn = await mysql.createConnection(process.env.DATABASE_URL);

// Get zone IDs
const [zoneRows] = await conn.execute("SELECT id, slug FROM zones ORDER BY `order`");
const zones = {};
for (const z of zoneRows) zones[z.slug] = z.id;
console.log("Zones:", zones);

// ─── LESSONS ──────────────────────────────────────────────────────────────────
const lessons = [
  // Zone 1: NWS Hub
  { zoneId: zones["nws-hub"], title: "What is NWS Token?", topic: "nws", content: `# What is NWS Token?

NWS is the native utility token of the NodeWaves ecosystem. It powers all core activities within the platform — from staking and node participation to governance and community rewards.

## Key Properties of NWS

**Utility-First Design:** NWS is not just a speculative asset. It is designed to be used within the ecosystem for real activities like staking, node licensing, vault participation, and community governance.

**Fixed Supply:** NWS has a capped total supply, making it a deflationary asset over time as ecosystem activity grows.

**Community-Aligned:** A significant portion of NWS distribution is designed to reward active community members, node operators, and long-term participants.

## How NWS is Used

| Use Case | Description |
|----------|-------------|
| Staking | Lock NWS to earn ecosystem rewards |
| Node Licenses | Required to activate Lite and Founder Nodes |
| Vault Participation | Used in Node-Linked Vault strategies |
| Governance | Future voting rights on ecosystem decisions |
| Community Rewards | XP-linked campaign rewards and events |

## Why NWS Matters

NWS is the economic backbone of NodeWaves. Every ecosystem activity — from running a node to participating in community events — is connected to NWS. Understanding NWS is the first step to understanding the entire NodeWaves ecosystem.

> **Remember:** NWS is a utility token. Its value is tied to ecosystem adoption and usage, not guaranteed returns. Always do your own research before participating.`, xpReward: 50, order: 1 },

  { zoneId: zones["nws-hub"], title: "NWS Tokenomics Explained", topic: "nws", content: `# NWS Tokenomics Explained

Tokenomics refers to the economic design of a token — how it is distributed, used, and managed over time. Understanding NWS tokenomics helps you see the long-term vision of the NodeWaves ecosystem.

## Supply Structure

NWS has a **fixed maximum supply**. This means no new NWS can be created beyond the cap, creating natural scarcity as demand grows.

## Distribution Categories

The NWS supply is allocated across several key categories:

- **Community & Ecosystem Rewards** — The largest allocation, designed to reward active participants
- **Node Operator Incentives** — Rewards for Lite Node and Founder Node operators
- **Treasury Reserve** — Managed by the ecosystem treasury for long-term sustainability
- **Development Fund** — Supports ongoing protocol development
- **Early Community** — Rewards for early adopters and community builders

## Emission Schedule

NWS is released gradually over time through:
1. Staking rewards
2. Node operation rewards
3. Community campaign distributions
4. Quest and education platform rewards

## Treasury Alignment

A key principle of NWS tokenomics is **treasury alignment**. Revenue from node purchases and ecosystem activity flows into the treasury, which is designed to support long-term ecosystem health rather than short-term extraction.

> **Important:** Tokenomics can change as the ecosystem evolves. Always refer to the latest official NodeWaves documentation for current figures.`, xpReward: 60, order: 2 },

  // Zone 2: Staking Vault
  { zoneId: zones["staking-vault"], title: "What is Staking?", topic: "staking", content: `# What is Staking?

Staking is one of the most fundamental concepts in Web3. It involves locking your tokens in a smart contract to support network operations and earn rewards in return.

## How Staking Works

When you stake NWS tokens, you are:

1. **Locking** your tokens in the staking contract for a defined period
2. **Supporting** the ecosystem by reducing circulating supply
3. **Earning** rewards based on your stake size and duration
4. **Contributing** to network security and stability

## Types of Staking in NodeWaves

### General Staking
The simplest form — lock NWS tokens and earn rewards proportional to your stake. No technical setup required.

### Node-Linked Staking
More advanced — your staked NWS is connected to a node license, amplifying your rewards based on node tier.

## Staking vs. Saving

| Feature | Staking | Bank Saving |
|---------|---------|-------------|
| Returns | Variable, ecosystem-based | Fixed, guaranteed |
| Risk | Smart contract & market risk | Minimal |
| Liquidity | Locked for period | Usually accessible |
| Purpose | Ecosystem support | Capital preservation |

## Key Risks of Staking

- **Smart Contract Risk:** Bugs in the contract could affect staked funds
- **Market Risk:** Token value may decrease during the lock period
- **Liquidity Risk:** Staked tokens cannot be used until the lock period ends
- **Protocol Risk:** Changes to the protocol may affect reward rates

> **Always understand the risks before staking. Never stake more than you can afford to lock up.**`, xpReward: 60, order: 1 },

  { zoneId: zones["staking-vault"], title: "General Staking in NodeWaves", topic: "staking", content: `# General Staking in NodeWaves

NodeWaves General Staking is designed to be accessible to all NWS holders, regardless of technical expertise. It is the entry point for ecosystem participation.

## How to Participate in General Staking

1. **Hold NWS** in a compatible wallet
2. **Connect** your wallet to the NodeWaves staking interface
3. **Choose** your staking amount and duration
4. **Confirm** the transaction and begin earning

## Reward Mechanics

Staking rewards in NodeWaves are distributed from the **ecosystem treasury** and **node revenue pool**. The reward rate is:

- **Dynamic** — adjusts based on total staked supply
- **Treasury-aligned** — designed to be sustainable long-term
- **Not fixed** — reward rates are not guaranteed and may change

## Lock Periods

Different lock periods offer different reward multipliers. Longer commitments generally offer higher potential rewards, reflecting the value of long-term ecosystem support.

## Compounding

Some staking configurations allow for automatic compounding, where your earned rewards are automatically re-staked to grow your position over time.

## Important Notes

- Staking rewards are paid in NWS tokens
- Rewards are not guaranteed and depend on ecosystem performance
- Early unstaking may incur penalties
- Always read the current staking terms before participating

> **Staking is not a savings account. It is ecosystem participation with associated risks.**`, xpReward: 70, order: 2 },

  // Zone 3: Lite Node Station
  { zoneId: zones["lite-node-station"], title: "What is a Lite Node?", topic: "lite_node", content: `# What is a Lite Node?

A Lite Node is the entry-level node tier in the NodeWaves ecosystem. It allows community members to participate in the network infrastructure without the full commitment of a Founder Node.

## Lite Node Overview

Lite Nodes are designed for:
- **New ecosystem participants** who want to start contributing
- **Community members** who want to earn node rewards at a lower entry point
- **Learners** who want to understand node operation before scaling up

## How Lite Nodes Work

A Lite Node license grants you the right to operate a lightweight node in the NodeWaves network. The node:

1. Processes transactions and validates data
2. Contributes to network decentralization
3. Earns rewards from the ecosystem reward pool
4. Requires NWS tokens for activation and maintenance

## Lite Node vs. Founder Node

| Feature | Lite Node | Founder Node |
|---------|-----------|--------------|
| Entry Cost | Lower | Higher |
| Reward Multiplier | Up to 1.5x | Up to 5x |
| Network Role | Lightweight | Full |
| Technical Setup | Minimal | Moderate |

## Reward Structure

Lite Node rewards come from:
- Network participation fees
- Ecosystem treasury distributions
- Staking amplification bonuses

> **Note:** Lite Node rewards are variable and not guaranteed. They depend on network activity, total node count, and ecosystem health.`, xpReward: 70, order: 1 },

  // Zone 4: Founder Tower
  { zoneId: zones["founder-tower"], title: "What is a Founder Node?", topic: "founder_node", content: `# What is a Founder Node?

A Founder Node is the premium tier of node participation in the NodeWaves ecosystem. Founder Node operators are core infrastructure providers who receive enhanced rewards and ecosystem benefits.

## Founder Node Overview

Founder Nodes represent a deeper commitment to the NodeWaves ecosystem. They are designed for participants who:

- Want to be **core infrastructure providers**
- Are committed to **long-term ecosystem growth**
- Seek **enhanced reward potential** through higher multipliers
- Want to play a **foundational role** in network development

## Founder Node Tiers

Founder Nodes come in multiple tiers, each with increasing reward multipliers:

| Tier | Multiplier | Description |
|------|-----------|-------------|
| Bronze | 1x | Entry Founder tier |
| Silver | 2x | Established participant |
| Gold | 3x | Core contributor |
| Platinum | 4x | Senior network provider |
| Diamond | 5x (max) | Elite ecosystem pillar |

## Revenue Flow

Revenue from Founder Node purchases is designed to flow into the **ecosystem treasury**, supporting:
- Long-term reward sustainability
- Protocol development
- Community initiatives
- Ecosystem expansion

## Important Considerations

- Founder Nodes require a significant NWS commitment
- Rewards are variable and not guaranteed
- Node purchases support the ecosystem treasury, not individual team wallets
- Always verify current terms and conditions before purchasing

> **Founder Node participation is a long-term ecosystem commitment, not a short-term investment.**`, xpReward: 80, order: 1 },

  // Zone 5: Node Vault Chamber
  { zoneId: zones["node-vault-chamber"], title: "What is Node Vault?", topic: "node_vault", content: `# What is Node Vault / Node-Linked Vault?

The Node Vault, also known as the Node-Linked Vault, is an advanced ecosystem mechanism that connects your staking activity directly to your node operation for amplified participation.

## Concept Overview

The Node-Linked Vault creates a synergy between:
- **Your staked NWS** — providing liquidity and ecosystem support
- **Your node license** — providing network infrastructure
- **The vault mechanism** — amplifying rewards through combined participation

## How It Works

1. **Activate** your node license
2. **Link** your staking position to the vault
3. **Earn** amplified rewards from both staking and node operation
4. **Compound** rewards back into the vault for growth

## Vault Benefits

| Benefit | Description |
|---------|-------------|
| Amplified Rewards | Combined node + staking rewards |
| Compounding | Automatic reward reinvestment option |
| Ecosystem Depth | Deeper protocol integration |
| Community Status | Enhanced leaderboard and community standing |

## Risk Considerations

The Node-Linked Vault combines multiple risk layers:
- Smart contract risk from vault mechanics
- Market risk from NWS price volatility
- Protocol risk from potential changes to vault rules
- Liquidity risk from locked positions

> **The Node Vault is an advanced feature. Fully understand all mechanics and risks before participating.**`, xpReward: 80, order: 1 },

  // Zone 6: Treasury Hall
  { zoneId: zones["treasury-hall"], title: "What is the NodeWaves Treasury?", topic: "treasury", content: `# What is the NodeWaves Treasury?

The NodeWaves Treasury is the ecosystem's financial backbone — a reserve of funds designed to ensure the long-term sustainability and growth of the NodeWaves protocol.

## Treasury Purpose

The treasury serves multiple critical functions:

1. **Sustainability** — Funds ongoing ecosystem rewards without relying on continuous new investment
2. **Development** — Supports protocol upgrades, security audits, and new features
3. **Community** — Funds community initiatives, events, and education programs
4. **Emergency Reserve** — Provides a buffer against unexpected challenges

## How the Treasury is Funded

Treasury funding comes from:
- **Node purchase revenue** — A portion of all node license sales
- **Transaction fees** — Network activity fees
- **Ecosystem partnerships** — Strategic collaborations
- **Staking fee allocations** — Small percentage of staking activity

## Treasury Governance

The treasury is designed to be **community-aligned**, meaning:
- Spending decisions should reflect ecosystem needs
- Transparency is a core principle
- Long-term sustainability takes priority over short-term distributions

## Treasury vs. Team Wallet

A key principle of NodeWaves is that node purchases and ecosystem revenue flow to the **ecosystem treasury**, not directly to the founding team. This design is intended to align incentives with long-term ecosystem health.

> **Note:** Exact treasury wallet addresses, multisig configurations, and governance mechanisms should be verified through official NodeWaves documentation.**`, xpReward: 75, order: 1 },

  // Zone 7: Security Lab
  { zoneId: zones["security-lab"], title: "Wallet Safety Fundamentals", topic: "wallet_safety", content: `# Wallet Safety Fundamentals

Your crypto wallet is your identity and your vault in Web3. Losing access to it or having it compromised can mean permanent loss of funds. This lesson covers the essential principles of wallet safety.

## Types of Wallets

### Hot Wallets (Software)
- Connected to the internet
- Convenient for frequent use
- Higher security risk
- Examples: MetaMask, Trust Wallet

### Cold Wallets (Hardware)
- Offline storage
- Best for large holdings
- Lower convenience
- Examples: Ledger, Trezor

## The Golden Rules of Wallet Safety

### 1. Protect Your Seed Phrase
Your seed phrase (12 or 24 words) is the master key to your wallet. If someone has it, they own your funds.

- **Never** share it with anyone — not even support staff
- **Never** type it into any website or app
- **Write it down** on paper and store in multiple secure locations
- **Never** store it digitally (no photos, no cloud, no notes app)

### 2. Use Strong Passwords
- Unique password for each platform
- Use a password manager
- Enable 2FA everywhere possible

### 3. Verify Before You Sign
- Always read what you are signing in your wallet
- Check the contract address before approving
- Be suspicious of unexpected approval requests

### 4. Use Official Links Only
- Bookmark official websites
- Never click links from DMs or emails
- Verify URLs carefully — scammers use lookalike domains

> **Remember: In Web3, you are your own bank. There is no customer support to recover lost funds.**`, xpReward: 80, order: 1 },

  { zoneId: zones["security-lab"], title: "Scam Protection Guide", topic: "scam_protection", content: `# Scam Protection Guide

The Web3 space is unfortunately full of scams targeting new and experienced users alike. This guide teaches you to recognize and avoid the most common threats.

## Common Scam Types

### 1. Phishing Attacks
Fake websites or emails that look identical to legitimate platforms.

**Signs:**
- Slightly misspelled URLs (nodewaves.com vs n0dewaves.com)
- Urgent messages asking you to "verify" your wallet
- Requests for your seed phrase

### 2. Fake Support Scams
Scammers impersonate official support staff in Telegram, Discord, or Twitter DMs.

**Remember:**
- Official support will NEVER DM you first
- Official support will NEVER ask for your seed phrase
- Official support will NEVER ask you to send funds to "verify"

### 3. Rug Pulls
Projects that raise funds and then disappear with investor money.

**Red Flags:**
- Anonymous team with no verifiable history
- Unrealistic guaranteed returns
- Pressure to invest quickly
- No audited smart contracts

### 4. Approval Scams
Malicious smart contracts that request unlimited token approvals.

**Protection:**
- Use tools like Revoke.cash to check and revoke approvals
- Only approve what you understand
- Revoke approvals after using a DeFi protocol

### 5. Fake Airdrop Scams
"Free tokens" that require you to connect your wallet to a malicious site.

**Rule:** If it seems too good to be true, it probably is.

## The STOP Framework

Before any Web3 action, apply STOP:
- **S**ource — Is this from an official, verified source?
- **T**ransaction — Do I understand exactly what I'm signing?
- **O**utcome — What happens if this goes wrong?
- **P**ause — Am I being rushed? Take your time.

> **The best scam protection is education. You are already taking the right step by learning.**`, xpReward: 90, order: 2 },

  // Zone 8: Community Arena
  { zoneId: zones["community-arena"], title: "NodeWaves Community Structure", topic: "nws", content: `# NodeWaves Community Structure

The NodeWaves community is the heartbeat of the ecosystem. Understanding how the community is organized helps you find your place and maximize your participation.

## Community Pillars

### 1. Learners
New members who are exploring the ecosystem. They:
- Complete quests and lessons
- Earn XP and badges
- Build foundational knowledge
- Participate in community discussions

### 2. Node Operators
Active participants running Lite or Founder Nodes. They:
- Provide network infrastructure
- Earn node rewards
- Have deeper ecosystem stake
- Often mentor newer members

### 3. Community Educators
Members who help others learn. They:
- Create educational content
- Answer questions in community channels
- Participate in the Community Educator Challenge
- Earn recognition and rewards for their contributions

### 4. Ambassadors
Experienced members who represent NodeWaves. They:
- Onboard new community members
- Organize local events
- Create regional communities
- Compete in the Monthly Ambassador Cup

## Community Values

| Value | Description |
|-------|-------------|
| Education First | Learning before earning |
| Transparency | Open communication |
| Long-term Thinking | Ecosystem health over short-term gains |
| Inclusivity | Welcoming to all backgrounds |
| Responsibility | DYOR and informed participation |

## How to Contribute

1. Complete your learning journey on NodeWaves Quest
2. Share knowledge in community channels
3. Refer friends and help them get started
4. Participate in community events and challenges
5. Provide constructive feedback to improve the ecosystem

> **The strongest ecosystems are built by educated, engaged communities. Your participation matters.**`, xpReward: 65, order: 1 },

  // Zone 9: Future Utility Zone
  { zoneId: zones["future-utility-zone"], title: "Future Utility Layer", topic: "nws", content: `# Future Utility Layer

The NodeWaves ecosystem is designed to grow and evolve. The Future Utility Zone represents the roadmap of upcoming features, integrations, and use cases being developed for the NWS token and ecosystem.

## Vision: A Multi-Layer Ecosystem

NodeWaves is building toward a comprehensive Web3 ecosystem where NWS utility expands across multiple layers:

### Layer 1: Foundation (Current)
- NWS Token
- General Staking
- Lite Node & Founder Node
- Node Vault
- Treasury

### Layer 2: Community (In Development)
- NodeWaves Quest (This platform!)
- Community Education Programs
- Ambassador Network
- Skill-to-Win Championships

### Layer 3: Utility Expansion (Planned)
- DeFi integrations
- Cross-chain bridges
- NFT utility layer
- Governance mechanisms
- Partner ecosystem integrations

### Layer 4: Game & Quest Layer (Future)
- Expanded game mechanics
- Metaverse integrations
- Play-to-learn expansions
- Community-created content

## Why This Matters

Each new utility layer increases the demand for NWS tokens and deepens the ecosystem's value proposition. As a learner on NodeWaves Quest, you are building knowledge that will be directly applicable to future ecosystem features.

## Staying Updated

The best way to stay informed about future developments:
- Follow official NodeWaves channels
- Participate in community governance discussions
- Complete all NodeWaves Quest zones to unlock future content
- Join the Community Arena for early announcements

> **The future of NodeWaves is being built by the community. Your learning today prepares you for tomorrow's opportunities.**`, xpReward: 100, order: 1 },
];

// Insert lessons
for (const lesson of lessons) {
  const slug = lesson.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  await conn.execute(
    "INSERT INTO lessons (zoneId, slug, title, topic, content, xpReward, `order`, isActive) VALUES (?, ?, ?, ?, ?, ?, ?, 1)",
    [lesson.zoneId, slug, lesson.title, lesson.topic, lesson.content, lesson.xpReward, lesson.order]
  );
  console.log(`✅ Lesson: ${lesson.title}`);
}

// Get lesson IDs for quizzes
const [lessonRows] = await conn.execute("SELECT id, title, zoneId FROM lessons ORDER BY id");
const lessonMap = {};
for (const l of lessonRows) lessonMap[l.title] = l.id;

// ─── QUIZZES ──────────────────────────────────────────────────────────────────
const quizzes = [
  {
    zoneId: zones["nws-hub"],
    title: "NWS Token Quiz",
    description: "Test your knowledge of the NWS token and tokenomics",
    timeLimitSeconds: 120,
    xpReward: 100,
    passingScore: 70,
    questions: [
      { question: "What is NWS?", options: ["A social media platform", "The native utility token of NodeWaves", "A hardware wallet brand", "A blockchain network"], correctIndex: 1, explanation: "NWS is the native utility token of the NodeWaves ecosystem, used for staking, nodes, vaults, and governance.", order: 1 },
      { question: "What type of supply does NWS have?", options: ["Unlimited supply", "Fixed maximum supply", "Inflationary supply", "Government-controlled supply"], correctIndex: 1, explanation: "NWS has a fixed maximum supply, creating natural scarcity as ecosystem adoption grows.", order: 2 },
      { question: "Which of these is a use case for NWS?", options: ["Buying physical goods", "Paying electricity bills", "Activating node licenses", "Booking flights"], correctIndex: 2, explanation: "NWS is required to activate Lite and Founder Node licenses within the NodeWaves ecosystem.", order: 3 },
      { question: "What does 'treasury-aligned' mean for NWS?", options: ["The government controls the treasury", "Revenue supports ecosystem sustainability, not team pockets", "The treasury is empty", "Only founders can access the treasury"], correctIndex: 1, explanation: "Treasury-aligned means ecosystem revenue is designed to support long-term sustainability rather than short-term extraction.", order: 4 },
      { question: "What should you do before participating in any Web3 product?", options: ["Trust all social media advice", "Do your own research (DYOR)", "Follow guaranteed profit promises", "Invest all your savings"], correctIndex: 1, explanation: "DYOR (Do Your Own Research) is the fundamental principle of responsible Web3 participation.", order: 5 },
    ]
  },
  {
    zoneId: zones["staking-vault"],
    title: "Staking Knowledge Quiz",
    description: "Test your understanding of staking mechanics",
    timeLimitSeconds: 120,
    xpReward: 100,
    passingScore: 70,
    questions: [
      { question: "What is staking?", options: ["Selling tokens immediately", "Locking tokens to support the network and earn rewards", "Borrowing tokens from others", "Mining new tokens"], correctIndex: 1, explanation: "Staking involves locking tokens in a smart contract to support network operations and earn rewards.", order: 1 },
      { question: "What is a key risk of staking?", options: ["Earning too many rewards", "Smart contract bugs affecting staked funds", "The network becoming too fast", "Too many people staking"], correctIndex: 1, explanation: "Smart contract risk is a key concern — bugs in the staking contract could affect staked funds.", order: 2 },
      { question: "Are staking rewards in NodeWaves guaranteed?", options: ["Yes, always fixed at 20% APY", "Yes, guaranteed by the government", "No, they are variable and depend on ecosystem performance", "Yes, guaranteed by the team"], correctIndex: 2, explanation: "Staking rewards in NodeWaves are variable and not guaranteed — they depend on ecosystem performance.", order: 3 },
      { question: "What happens to staked tokens during the lock period?", options: ["They can be used freely", "They are burned permanently", "They cannot be used until the lock period ends", "They are sent to the team"], correctIndex: 2, explanation: "Staked tokens are locked and cannot be used until the lock period ends, creating liquidity risk.", order: 4 },
      { question: "What does 'compounding' mean in staking?", options: ["Losing your stake gradually", "Automatically reinvesting earned rewards to grow your position", "Staking on multiple chains simultaneously", "Withdrawing rewards daily"], correctIndex: 1, explanation: "Compounding means automatically reinvesting your earned rewards back into the stake to grow your position over time.", order: 5 },
    ]
  },
  {
    zoneId: zones["security-lab"],
    title: "Wallet Safety & Scam Protection Quiz",
    description: "Test your knowledge of Web3 security",
    timeLimitSeconds: 150,
    xpReward: 120,
    passingScore: 70,
    questions: [
      { question: "What should you NEVER share with anyone?", options: ["Your username", "Your seed phrase / recovery phrase", "Your public wallet address", "Your quest score"], correctIndex: 1, explanation: "Your seed phrase is the master key to your wallet. Never share it with anyone — not even official support.", order: 1 },
      { question: "What is a phishing attack?", options: ["A fishing game in Web3", "A fake website or email designed to steal your credentials", "A type of staking strategy", "A network upgrade process"], correctIndex: 1, explanation: "Phishing attacks use fake websites or emails that look identical to legitimate platforms to steal your information.", order: 2 },
      { question: "Official NodeWaves support will NEVER:", options: ["Answer your questions publicly", "Post announcements in official channels", "DM you first and ask for your seed phrase", "Create educational content"], correctIndex: 2, explanation: "Legitimate support teams never DM users first to ask for seed phrases. This is always a scam.", order: 3 },
      { question: "What is the STOP framework?", options: ["A way to stop staking", "Source, Transaction, Outcome, Pause — a security checklist", "A type of node operation", "A trading strategy"], correctIndex: 1, explanation: "STOP stands for Source, Transaction, Outcome, Pause — a framework to evaluate any Web3 action before proceeding.", order: 4 },
      { question: "What is a cold wallet?", options: ["A wallet that is frozen by the government", "An offline hardware wallet for secure storage", "A wallet with very few tokens", "A wallet used only in winter"], correctIndex: 1, explanation: "A cold wallet is an offline hardware device (like Ledger or Trezor) that stores your private keys away from the internet.", order: 5 },
    ]
  },
];

for (const quiz of quizzes) {
  const [result] = await conn.execute(
    "INSERT INTO quizzes (zoneId, title, description, timeLimitSeconds, xpReward, passingScore) VALUES (?, ?, ?, ?, ?, ?)",
    [quiz.zoneId, quiz.title, quiz.description, quiz.timeLimitSeconds, quiz.xpReward, quiz.passingScore]
  );
  const quizId = result.insertId;
  console.log(`✅ Quiz: ${quiz.title} (ID: ${quizId})`);

  for (const q of quiz.questions) {
    await conn.execute(
      "INSERT INTO quiz_questions (quizId, question, options, correctIndex, explanation, `order`) VALUES (?, ?, ?, ?, ?, ?)",
      [quizId, q.question, JSON.stringify(q.options), q.correctIndex, q.explanation, q.order]
    );
  }
  console.log(`   └─ ${quiz.questions.length} questions added`);
}

// Daily quests are handled by the dashboard UI using static definitions
console.log("\u2705 Daily quests are defined in the frontend (no DB table needed)");

await conn.end();
console.log("\n🎉 Content seeding complete!");
