# [LexiFlow](https://lexiflow.vercel.app/)
## TOC Project
### By - [Mithil Patidar] (S20240010143, Section-3)

An interactive visualizer and conversion engine designed to bridge the gap between Regular Expressions, Finite Automata, and Context-Free Grammars. This tool allows users to input complex regular expressions, visualize the resulting NFA using Thompson's Construction, and explore the equivalent Right-Linear Grammar through an animated derivation engine.

## Key Features

- **Thompson's Construction Engine**: Automatically parses standard Regular Expressions (including `*`, `+`, `?`, `|`, and concatenation) and generates a topologically correct Non-deterministic Finite Automaton (NFA).
- **NFA-to-CFG Mapping**: Instantly derives a Right-Linear Context-Free Grammar from the NFA structure. Each NFA state becomes a non-terminal, and transitions are mapped to production rules (`Qi → a Qj`).
- **Interactive NFA Canvas**: A professional workspace grid featuring interactive node positioning, zoom/pan controls, and state highlighting built on top of a specialized React Flow integration.
- **Formal Transition Table (δ)**: A mathematical grid view that represents the automaton's transition function. It supports non-deterministic transitions, clearly highlighting start and accept states.
- **Animated Derivation Engine**: A granular playback engine for testing strings against the generated grammar. Step forwards, backwards, or pause the derivation trace to see exactly how the grammar rules are applied.

## Technology Stack

- **Framework**: React 18 ecosystem and TypeScript.
- **Visualization**: React Flow (NFA Canvas)
- **State Management**: Zustand (App Store)
- **Animations**: Framer Motion
- **Styling**: Tailored Vanilla CSS / Tailwind Modern Utilities
- **Build Tool**: Vite

## How to Use

1. **Input Regular Expression**: Enter your RegEx in the top navigation bar (e.g., `(a|b)*abb`).
2. **Explore the Logic**:
   - **NFA Canvas**: Interact with the generated automaton in the central workspace.
   - **Logic Sidebar**: Toggle between **Rules View** (production format) and **Table View** (formal transition matrix) to understand the mathematical mapping.
3. **Test a String**: Type a string in the "Test String" field in the bottom panel (e.g., `aabb`).
4. **Interactive Playback**: Hit **Derive**. Use the playback pill at the bottom of the trace panel to scrub through the derivation steps visually and verify the acceptance of the string.
