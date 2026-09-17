-- ─────────────────────────────────────────────────────────────────────────────
-- Seed: Quiz content for Zones 3–9
-- Zone 7 (Security Lab) already has quiz id=3 with 5 questions — skip
-- Zones 3, 4, 5, 6, 8, 9 get new quizzes + 3 questions each
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Zone 3: Lite Node Station ─────────────────────────────────────────────────
INSERT INTO quizzes (zoneId, title, description, timeLimitSeconds, xpReward, passingScore)
VALUES (3, 'Lite Node Basics Quiz', 'Test your understanding of Lite Nodes in the NodalWaves ecosystem.', 120, 50, 60);

SET @q3 = LAST_INSERT_ID();

INSERT INTO quiz_questions (quizId, question, options, correctIndex, explanation, `order`) VALUES
(@q3, 'What is a Lite Node in the NodalWaves ecosystem?',
 '["A type of bank account","A lightweight network participant that helps support the NodalWaves ecosystem","A guaranteed income product","A social media profile"]',
 1, 'A Lite Node is a lightweight participant role in the NodalWaves ecosystem. It is designed to support network activity, not to function as a financial product or guaranteed income source.', 1),

(@q3, 'Which of the following best describes the purpose of running a Lite Node?',
 '["To receive a fixed daily salary","To support ecosystem participation and learn about decentralized networks","To guarantee token profits","To control other users\' wallets"]',
 1, 'Lite Nodes are designed to support ecosystem participation. They are not salary-paying or profit-guaranteeing instruments. Always review official documentation before participating.', 2),

(@q3, 'What should you do before deciding to participate in any node program?',
 '["Invest all your savings immediately","Read the official documentation, understand the risks, and make an informed decision","Ask a stranger on social media","Ignore the terms and conditions"]',
 1, 'Responsible participation always starts with reading official documentation and understanding the risks. Never invest more than you can afford to lose in any ecosystem activity.', 3);

-- ── Zone 4: Founder Tower ─────────────────────────────────────────────────────
INSERT INTO quizzes (zoneId, title, description, timeLimitSeconds, xpReward, passingScore)
VALUES (4, 'Founder Node Knowledge Quiz', 'Learn what Founder Nodes represent in the NodalWaves ecosystem.', 120, 50, 60);

SET @q4 = LAST_INSERT_ID();

INSERT INTO quiz_questions (quizId, question, options, correctIndex, explanation, `order`) VALUES
(@q4, 'What is the primary role of a Founder Node in the NodalWaves ecosystem?',
 '["To print unlimited tokens","To represent a deeper level of ecosystem commitment and participation","To guarantee monthly income","To replace traditional banks"]',
 1, 'Founder Nodes represent a higher-tier participation role in the NodalWaves ecosystem. They are designed to support ecosystem growth, not to guarantee income or replace financial institutions.', 1),

(@q4, 'How are Founder Node purchases typically aligned in the NodalWaves ecosystem?',
 '["Funds go directly to the founding team as personal income","Purchases are designed to support the ecosystem treasury and long-term growth","Funds are used to buy luxury items","There is no transparency about fund usage"]',
 1, 'NodalWaves is designed as a community-first ecosystem. Node-related activity is aligned with supporting the ecosystem treasury and long-term sustainability, not personal enrichment of the founding team.', 2),

(@q4, 'Which statement about Founder Nodes is accurate?',
 '["They guarantee a fixed monthly return forever","They are a risk-free investment","They represent an ecosystem participation role with associated risks that users should research carefully","They are only for professional traders"]',
 2, 'All ecosystem participation involves risk. Founder Nodes are participation roles, not risk-free investments. Always research carefully and only participate with funds you can afford to lose.', 3);

-- ── Zone 5: Node Vault Chamber ────────────────────────────────────────────────
INSERT INTO quizzes (zoneId, title, description, timeLimitSeconds, xpReward, passingScore)
VALUES (5, 'Node Vault Basics Quiz', 'Understand the Node Vault and Node-Linked Vault concepts.', 120, 50, 60);

SET @q5 = LAST_INSERT_ID();

INSERT INTO quiz_questions (quizId, question, options, correctIndex, explanation, `order`) VALUES
(@q5, 'What is a Node Vault (or Node-Linked Vault) in the NodalWaves ecosystem?',
 '["A physical safe for storing cash","A vault-style ecosystem feature linked to node participation","A guaranteed savings account with fixed interest","A government-regulated bank product"]',
 1, 'A Node Vault is an ecosystem feature linked to node participation in NodalWaves. It is not a bank product, not government-regulated, and does not guarantee fixed returns.', 1),

(@q5, 'Which of the following is a responsible way to think about Node Vault participation?',
 '["It is guaranteed to double my money","It is a risk-free way to earn passive income","It is an ecosystem feature I should research thoroughly before participating, understanding all associated risks","It is the same as a fixed deposit at a bank"]',
 2, 'Responsible participation means researching thoroughly, understanding the risks, and never treating ecosystem features as equivalent to regulated financial products.', 2),

(@q5, 'What should you NEVER do when considering any vault or staking product in Web3?',
 '["Read the documentation","Ask questions in the community","Invest money you cannot afford to lose based on promises of guaranteed returns","Check the official website"]',
 2, 'Never invest based on promises of guaranteed returns. In Web3, all participation carries risk. Guaranteed return claims are a major red flag and often indicate scams.', 3);

-- ── Zone 6: Treasury Hall ─────────────────────────────────────────────────────
INSERT INTO quizzes (zoneId, title, description, timeLimitSeconds, xpReward, passingScore)
VALUES (6, 'Treasury & Ecosystem Quiz', 'Learn how the NodalWaves treasury supports long-term ecosystem health.', 120, 50, 60);

SET @q6 = LAST_INSERT_ID();

INSERT INTO quiz_questions (quizId, question, options, correctIndex, explanation, `order`) VALUES
(@q6, 'What is the purpose of an ecosystem treasury in a Web3 project like NodalWaves?',
 '["To pay the founders\' personal expenses","To support long-term ecosystem development, community initiatives, and sustainability","To guarantee token price increases","To replace government taxation"]',
 1, 'An ecosystem treasury is designed to fund long-term development, community programs, and ecosystem sustainability — not for personal enrichment of founders or to guarantee token prices.', 1),

(@q6, 'How does community-first treasury management benefit ecosystem participants?',
 '["It guarantees everyone will make money","It ensures resources are directed toward ecosystem growth and community value rather than short-term speculation","It eliminates all risks","It makes the token price go up every day"]',
 1, 'Community-first treasury management prioritizes ecosystem health and long-term value creation. It does not eliminate risk or guarantee returns, but it aligns incentives toward sustainable growth.', 2),

(@q6, 'Which of the following is a healthy sign of treasury transparency in a Web3 ecosystem?',
 '["No information is shared about how funds are used","The team spends funds on personal luxury items","Regular community updates about treasury usage and governance","Promising guaranteed returns from treasury funds"]',
 2, 'Transparency through regular community updates about treasury usage is a healthy sign of responsible ecosystem management. Lack of transparency or guaranteed return promises are red flags.', 3);

-- ── Zone 8: Community Arena ───────────────────────────────────────────────────
INSERT INTO quizzes (zoneId, title, description, timeLimitSeconds, xpReward, passingScore)
VALUES (8, 'Community & Education Quiz', 'Explore the role of community education in the NodalWaves ecosystem.', 120, 50, 60);

SET @q8 = LAST_INSERT_ID();

INSERT INTO quiz_questions (quizId, question, options, correctIndex, explanation, `order`) VALUES
(@q8, 'Why is community education important in a Web3 ecosystem like NodalWaves?',
 '["It is not important","It helps participants make informed decisions, avoid scams, and contribute positively to the ecosystem","It guarantees everyone will earn tokens","It replaces the need for official documentation"]',
 1, 'Community education empowers participants to make informed decisions, recognize scams, and contribute positively. It is a core pillar of responsible Web3 ecosystem growth.', 1),

(@q8, 'What is the best way to contribute to the NodalWaves community?',
 '["Spread unverified rumors about token prices","Share accurate, helpful information and encourage others to learn responsibly","Promise others guaranteed returns to recruit them","Keep all knowledge to yourself"]',
 1, 'The best community contribution is sharing accurate, verified information and encouraging responsible learning. Never promise guaranteed returns or spread unverified claims.', 2),

(@q8, 'What does the NodalQuest platform reward users for?',
 '["Guaranteed token earnings","Learning, completing quests, earning XP, and climbing leaderboards through skill and knowledge","Recruiting the most people with income promises","Spending the most money"]',
 1, 'NodalQuest rewards learning, quest completion, XP accumulation, and leaderboard performance. It is an educational platform — not a guaranteed earning or income program.', 3);

-- ── Zone 9: Future Utility Zone ───────────────────────────────────────────────
INSERT INTO quizzes (zoneId, title, description, timeLimitSeconds, xpReward, passingScore)
VALUES (9, 'Future Utility & Web3 Quiz', 'Explore the future utility layer and broader Web3 concepts in NodalWaves.', 120, 50, 60);

SET @q9 = LAST_INSERT_ID();

INSERT INTO quiz_questions (quizId, question, options, correctIndex, explanation, `order`) VALUES
(@q9, 'What does "utility" mean in the context of a Web3 token like $NODAL?',
 '["The token can only be used to buy physical goods","The token has specific use cases within the ecosystem such as participation, governance, or access to features","The token guarantees a fixed income","The token is backed by gold"]',
 1, 'Utility in Web3 refers to specific use cases within an ecosystem — such as participation rights, governance voting, or feature access. It does not imply guaranteed income or commodity backing.', 1),

(@q9, 'Which of the following best describes responsible Web3 participation?',
 '["Investing all your savings based on social media hype","Researching projects thoroughly, understanding risks, and only participating with funds you can afford to lose","Following anonymous tips for guaranteed profits","Ignoring whitepapers and official documentation"]',
 1, 'Responsible Web3 participation always involves thorough research, risk awareness, and never investing more than you can afford to lose. Hype and anonymous tips are major red flags.', 2),

(@q9, 'What is the NodalWaves ecosystem\'s long-term vision?',
 '["To replace all traditional banks immediately","To build a community-first ecosystem with education, utility, and responsible growth","To guarantee everyone becomes wealthy","To operate without any community involvement"]',
 1, 'NodalWaves\' long-term vision is to build a community-first ecosystem focused on education, responsible utility, and sustainable growth — not to promise wealth or replace traditional finance overnight.', 3);
