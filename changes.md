# UI and Functionality Upgrades

## 1. Component Restructuring for Layout Fix
- **`App.tsx`**: Completely overhauled the grid layout to follow a linear, top-to-bottom pipeline. 
  - **Top Row**: `<RegexInput>` (Step 1) now spans the full width, centered.
  - **Middle Row**: `<NFAVisualizer>` (Step 2) spans the full width, giving the graph much more room to breathe.
  - **Bottom Row**: Created a 2-column layout. The left column contains `<CFGDisplay>` (Step 3). The right column stacks `<StringInput>` (Step 4) and `<DerivationPanel>` (Step 5) to keep the testing flow grouped logically.
- **`globals.css` & Components**: Tweaked CSS variables (`--shadow-card`, `--radius-card`) and internal padding to make glass panels look more anchored and consistent.

## 2. Zustand Store Updates
- Added `hoveredRule`: Stores the currently hovered CFG rule's signature (e.g., `Q0->a Q1`) to sync with the NFA visualizer.
- Added `setHoveredRule`: Action to update the hovered rule state from the CFG component.
- The derivation synchronization uses existing `currentStep` and `derivationSteps` state, dynamically extracting the active Non-Terminal from the current sentential form.

## 3. React Flow and Framer Motion Changes
- **`NFAVisualizer.tsx`**:
  - Connected to the `hoveredRule`, `currentStep`, and `derivationSteps` store values.
  - Dynamically computes the `activeState` by parsing the leftmost non-terminal from the current derivation step's sentential form.
  - Maps `isActive` and `isHovered` props into the node and edge data before passing them to React Flow.
- **`NFANode.tsx`**:
  - Used `framer-motion` to wrap the node container.
  - Added an animated glowing border (`boxShadow`), color shifts, and a scale effect that triggers when the node is `isActive` (during derivation) or `isHovered` (during CFG rule hover).
- **`NFAEdge.tsx`**:
  - Dynamically changes `strokeWidth`, `stroke` color, and label styling when `isHovered` is true.
  - Added CSS transitions for smooth visual interpolation.
- **`CFGRule.tsx`**:
  - Added `onMouseEnter` and `onMouseLeave` handlers to dispatch the `setHoveredRule` action to Zustand, providing the unique signature of the hovered production.
