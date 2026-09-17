-- Zone Quiz Content Seeding
-- Beginner-friendly, compliance-safe questions for all 7 zones

-- Zone 1: Nodal Hub (already has quizzes, add more if needed)
-- Zone 2: Staking Vault (already has quizzes, add more if needed)

-- Zone 3: Lite Node Station - 3 new questions
INSERT INTO quizzes (zoneId, name, description) VALUES 
(3, 'Lite Node Basics', 'Learn about Lite Node participation in the NodalWaves ecosystem');

SET @quiz_id_zone3 = LAST_INSERT_ID();

INSERT INTO questions (quizId, question, options, correctIndex, explanation) VALUES
(@quiz_id_zone3, 
 'What is the primary purpose of a Lite Node in the NodalWaves ecosystem?',
 '["To provide a beginner-friendly entry point for ecosystem participation", "To guarantee daily income for node operators", "To replace Founder Nodes entirely", "To control the network treasury"]',
 0,
 'Lite Nodes are designed as an accessible entry point for users to participate in the ecosystem without the deeper commitment of a Founder Node. They support ecosystem participation, not guaranteed income.'),

(@quiz_id_zone3,
 'How does Lite Node participation differ from Founder Node participation?',
 '["Lite Nodes have a lower entry barrier and less commitment than Founder Nodes", "Lite Nodes earn guaranteed profits while Founder Nodes do not", "Lite Nodes require more capital investment", "There is no difference between them"]',
 0,
 'Lite Nodes offer a more accessible path for users to participate in the ecosystem compared to Founder Nodes, which require deeper commitment and capital.'),

(@quiz_id_zone3,
 'What should you consider before participating in a Lite Node?',
 '["Your ability to afford the participation amount and your long-term interest in the ecosystem", "The guaranteed daily returns you will receive", "That you will definitely profit from the investment", "That Lite Nodes are risk-free"]',
 0,
 'Before participating in any node type, consider your financial capacity and genuine interest in supporting the ecosystem. No participation is risk-free or guaranteed to profit.');

-- Zone 4: Founder Tower - 3 new questions
INSERT INTO quizzes (zoneId, name, description) VALUES 
(4, 'Founder Node Essentials', 'Understand Founder Node participation and early supporter benefits');

SET @quiz_id_zone4 = LAST_INSERT_ID();

INSERT INTO questions (quizId, question, options, correctIndex, explanation) VALUES
(@quiz_id_zone4,
 'What role do Founder Nodes play in the NodalWaves ecosystem?',
 '["They represent early supporter participation with deeper ecosystem involvement", "They guarantee fixed daily income for all holders", "They give holders control over all treasury decisions", "They are temporary and will be discontinued"]',
 0,
 'Founder Nodes represent early supporters with a deeper commitment to the ecosystem. They are not guaranteed income sources, but rather a way to participate meaningfully in ecosystem growth.'),

(@quiz_id_zone4,
 'How is a Founder Node different from a Lite Node?',
 '["Founder Nodes require greater commitment and capital but offer deeper ecosystem participation", "Founder Nodes are guaranteed to be more profitable", "Founder Nodes are easier to obtain than Lite Nodes", "There is no meaningful difference"]',
 0,
 'Founder Nodes represent a stronger, longer-term commitment to the ecosystem compared to Lite Nodes. They are not guaranteed to be more profitable.'),

(@quiz_id_zone4,
 'What should you understand before becoming a Founder Node holder?',
 '["That you are making a long-term commitment to ecosystem participation, not a guaranteed investment", "That you will receive daily guaranteed returns", "That your investment is risk-free", "That you will automatically become wealthy"]',
 0,
 'Founder Node participation is a long-term commitment to the ecosystem. Like all investments, it carries risks and does not guarantee returns.');

-- Zone 5: Node Vault Chamber - 3 new questions
INSERT INTO quizzes (zoneId, name, description) VALUES 
(5, 'Node Vault Participation', 'Learn about Node Vault as a premium commitment layer');

SET @quiz_id_zone5 = LAST_INSERT_ID();

INSERT INTO questions (quizId, question, options, correctIndex, explanation) VALUES
(@quiz_id_zone5,
 'What is a Node Vault in the NodalWaves ecosystem?',
 '["A premium commitment layer linked to node ownership for ecosystem participation", "A guaranteed income account that pays daily returns", "A way to store cryptocurrency safely", "A replacement for traditional banks"]',
 0,
 'A Node Vault is a premium participation mechanism for node owners. It is not a guaranteed income source, but rather a way for committed participants to engage more deeply with the ecosystem.'),

(@quiz_id_zone5,
 'How does Node Vault differ from general staking?',
 '["Node Vault is a node-linked premium layer, while general staking is broader ecosystem participation", "Node Vault guarantees higher returns than staking", "Node Vault is risk-free while staking is risky", "They are identical"]',
 0,
 'Node Vault represents a specialized, node-linked participation mechanism, distinct from general staking. Both involve risks and do not guarantee returns.'),

(@quiz_id_zone5,
 'What should you know about Node Vault rewards?',
 '["Rewards are dynamic and depend on ecosystem conditions, not guaranteed", "Rewards are fixed and guaranteed daily", "Rewards increase automatically over time", "Rewards are paid in fiat currency"]',
 0,
 'Node Vault rewards are dynamic and depend on various ecosystem factors. They are not guaranteed and can fluctuate based on participation levels and ecosystem performance.');

-- Zone 6: Treasury Hall - 3 new questions
INSERT INTO quizzes (zoneId, name, description) VALUES 
(6, 'Treasury and Ecosystem Growth', 'Understand how the NodalWaves treasury supports ecosystem development');

SET @quiz_id_zone6 = LAST_INSERT_ID();

INSERT INTO questions (quizId, question, options, correctIndex, explanation) VALUES
(@quiz_id_zone6,
 'What is the primary purpose of the NodalWaves treasury?',
 '["To support ecosystem development, marketing, liquidity, education, and future utility", "To provide guaranteed income to the team", "To enrich the founders at the expense of the community", "To replace the need for node participation"]',
 0,
 'The NodalWaves treasury is designed to support ecosystem treasury and long-term growth, including development, marketing, education, and future features. It is not a founder/team pocket-first model.'),

(@quiz_id_zone6,
 'How is the treasury aligned with the community?',
 '["Treasury resources are allocated to support ecosystem growth and community benefit", "The treasury only benefits the founding team", "Treasury decisions are made without community input", "The treasury has no impact on the community"]',
 0,
 'The NodalWaves treasury is designed to support the entire ecosystem and community, not just the founding team. It funds development, education, and long-term ecosystem growth.'),

(@quiz_id_zone6,
 'What does it mean that the treasury is $NODAL-based?',
 '["Treasury participation and allocation are tied to Nodal Token and ecosystem health", "$NODAL tokens guarantee daily income", "Only the team can access the treasury", "The treasury is separate from the Nodal Token"]',
 0,
 'The treasury operates on $NODAL-based principles, meaning its resources and allocation are tied to the health and growth of the $NODAL ecosystem, not individual profit guarantees.');

-- Zone 7: Security Lab - 3 new questions
INSERT INTO quizzes (zoneId, name, description) VALUES 
(7, 'Web3 Security Essentials', 'Master security practices to protect your crypto assets');

SET @quiz_id_zone7 = LAST_INSERT_ID();

INSERT INTO questions (quizId, question, options, correctIndex, explanation) VALUES
(@quiz_id_zone7,
 'What is the most critical rule for protecting your crypto assets?',
 '["Never share your seed phrase or private key with anyone, under any circumstances", "Share your seed phrase only with trusted friends", "Your seed phrase can be stored in a text file on your computer", "Seed phrases are not important for security"]',
 0,
 'Your seed phrase and private keys are the keys to your assets. Never share them with anyone, regardless of who asks. If someone has your seed phrase, they can access and steal your funds.'),

(@quiz_id_zone7,
 'How can you protect yourself from phishing attacks?',
 '["Always verify URLs carefully, never click suspicious links, and use official channels only", "Click links from emails that look official", "Share your login credentials with support staff", "Phishing attacks are not a real threat"]',
 0,
 'Phishing attacks are a major threat in Web3. Always verify URLs, avoid clicking suspicious links, and use only official channels. Legitimate support will never ask for your private keys or seed phrases.'),

(@quiz_id_zone7,
 'What is a red flag for a potential scam?',
 '["Promises of guaranteed returns or risk-free income", "Clear documentation and verified team members", "Open source code and transparent operations", "Regular security audits"]',
 0,
 'Guaranteed returns and risk-free income are classic scam red flags. Legitimate projects are transparent about risks. Always be skeptical of promises that sound too good to be true.');

-- Zone 8: Community Arena - 3 new questions
INSERT INTO quizzes (zoneId, name, description) VALUES 
(8, 'Community Learning and Competition', 'Engage with the NodalWaves community through education and skill-based challenges');

SET @quiz_id_zone8 = LAST_INSERT_ID();

INSERT INTO questions (quizId, question, options, correctIndex, explanation) VALUES
(@quiz_id_zone8,
 'What is the focus of the Community Arena?',
 '["Skill-based learning competitions and community education initiatives", "Guaranteed rewards for all participants", "Replacing individual learning with group-only education", "Eliminating competition from the ecosystem"]',
 0,
 'The Community Arena focuses on Learn-to-Qualify → Compete-to-Win → Educate-to-Grow. It is about skill development and community education, not guaranteed rewards.'),

(@quiz_id_zone8,
 'How should you approach referrals in NodalQuest?',
 '["Focus on quality referrals of genuinely interested learners, not spam", "Spam as many people as possible to maximize referrals", "Referrals guarantee daily income", "Referrals are not important in the ecosystem"]',
 0,
 'Referral quality matters more than quantity. Invite people who are genuinely interested in learning about Web3 and the NodalWaves ecosystem. Spam referrals harm the community.'),

(@quiz_id_zone8,
 'What is the Community Educator role in NodalWaves?',
 '["A recognition for active community members who help educate others and complete challenges", "A guaranteed job position with fixed salary", "A role that requires you to sell products", "A way to earn passive income without effort"]',
 0,
 'Community Educators are recognized for their contributions to community learning and participation. It is a recognition of engagement, not a guaranteed income source.');

-- Zone 9: Future Utility Zone - 3 new questions
INSERT INTO quizzes (zoneId, name, description) VALUES 
(9, 'Future Ecosystem Expansion', 'Explore the roadmap for NodalQuest and ecosystem utility');

SET @quiz_id_zone9 = LAST_INSERT_ID();

INSERT INTO questions (quizId, question, options, correctIndex, explanation) VALUES
(@quiz_id_zone9,
 'What should you understand about future NodalWaves features?',
 '["Future features are roadmap-based and not guaranteed to generate financial returns", "All future features will guarantee daily income", "Future features are already fully implemented", "There are no plans for future development"]',
 0,
 'NodalWaves is building a long-term ecosystem with planned features like games, NFTs, and marketplace utility. These are roadmap items, not guaranteed financial return mechanisms.'),

(@quiz_id_zone9,
 'How does the Future Utility Zone relate to ecosystem growth?',
 '["It represents planned expansions that support long-term ecosystem development, not short-term profit", "It guarantees immediate financial returns", "It replaces the need for learning and participation", "It is separate from the main ecosystem"]',
 0,
 'The Future Utility Zone represents NodalWaves' long-term vision for ecosystem expansion. These features are designed to support ecosystem growth, not guarantee short-term profits.'),

(@quiz_id_zone9,
 'What is the best mindset for participating in NodalQuest?',
 '["Genuine interest in learning Web3, participating in the ecosystem, and long-term growth", "Expecting to get rich quickly", "Viewing it as a guaranteed income source", "Participating only for immediate rewards"]',
 0,
 'NodalQuest is designed for users who are genuinely interested in learning Web3 and participating in a growing ecosystem. It is not a get-rich-quick scheme or guaranteed income platform.');

-- Summary query to verify seeding
SELECT 
  z.id as zone_id,
  z.name as zone_name,
  COUNT(DISTINCT q.id) as quiz_count,
  SUM(CASE WHEN qu.id IS NOT NULL THEN 1 ELSE 0 END) as total_questions
FROM zones z
LEFT JOIN quizzes q ON z.id = q.zoneId
LEFT JOIN questions qu ON q.id = qu.quizId
GROUP BY z.id, z.name
ORDER BY z.id;
