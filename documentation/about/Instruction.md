Act as an expert frontend engineer specialized in Next.js, TypeScript, and Tailwind CSS. I am building a prototype for a hackathon project called "APBD Tracker" (Local Government Budget Tracker)[cite: 34, 187]. This version will be a pure Web2 frontend mockup with dummy data, placeholder functions, and realistic layouts, without any real smart contracts or AI integrations for now[cite: 161, 241].

Please initialize and generate a clean Next.js architecture using TypeScript and Tailwind CSS with the following requirements[cite: 187]:

1. Global Architecture & Project Setup:
   - Configure a clean directory structure using the App Router.
   - Set up Tailwind CSS with a modern, high-trust dashboard aesthetic (deep slate dark mode or a very clean, professional professional banking interface)[cite: 170, 203, 205].
   - Provide interactive mockup states using simple React hooks (`useState`) to simulate data updates and component switching[cite: 169].

2. Page 1: Public Dashboard (Citizen View) [cite: 203]
   - A prominent central "Natural Language Search Bar" mimicking a Web2 search tool[cite: 51, 206]. Include realistic placeholder prompts like "Search for borehole projects in District A..."[cite: 206, 207].
   - An "APBD Health Score" widget visualized as a large, beautiful circular speedometer chart or radial progress bar[cite: 208]. Create interactive mock toggles to change the state between Green (Safe), Yellow (Warning), and Red (High Risk) to preview how the UI responds[cite: 209, 210, 211].
   - An Active Project Feed grid displaying mock cards[cite: 212]. Each card must cleanly present a project name, total allocated dummy budget, simulated physical progress percentage, and an AI risk badge status[cite: 43, 45, 164, 213].

3. Page 2: Internal Gateway (The Invisible Onboarding PWA Face) [cite: 203, 214]
   - Design a minimal, clean login page featuring a single prominent "Sign in with Google" button[cite: 215].
   - Bypass conventional Web3 'Connect Wallet' jargon completely[cite: 215]. Add a smooth loading state simulation that demonstrates the user journey: clicking the Google button dynamically generates an absolute abstraction background layer[cite: 126, 217].

4. Page 3: Vendor & Department Dashboard (Internal Management Portal) [cite: 203, 214]
   - A Vendor Project Management interface detailing active infrastructure contracts[cite: 219].
   - A Sub-contractor Whitelist Registration form containing simple inputs for Company Name, Sub-contractor Type, and Google Email Address[cite: 83, 221].
   - A Milestone Payment Claim section featuring a mock file uploader (simulating submission to decentralized storage) and a primary web2-style button titled "Claim 50% Milestone Fund"[cite: 177, 223, 224]. Clicking this should invoke a simulated transaction process[cite: 108].

Generate modular, fully typesafe, and componentized React code (`.tsx`) for these views. Keep all backend logic encapsulated as clean frontend mock functions for fast iteration.