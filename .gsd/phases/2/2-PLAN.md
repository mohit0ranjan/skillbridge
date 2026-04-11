---
phase: 2
plan: 2
wave: 1
---

# Plan 2.1: Primary Component Refinement

## Objective
Standardize the Hero, Navbar, Footer, and Trust components to remove hardcoded template CSS (like excessive box-shadows, arbitrary colors), applying the `card` and primary token variables.

## Context
- `globals.css`
- `Hero.tsx`, `Navbar.tsx`, `Footer.tsx`, `Trust.tsx`

## Tasks
<task type="auto">
  <name>Refine Hero Component</name>
  <files>src/components/Hero.tsx</files>
  <action>
    - Remove hardcoded generic backgrounds (e.g. `bg-[...bg-gradient...]`).
    - Change decorative floating cards to use the standardized `card` class.
    - Set Typography to rely on `font-sans` or inherit, instead of `var(--font-display)`.
    - Change button to use `btn-primary`.
  </action>
  <verify>No raw shadow-[...] syntax exists</verify>
  <done>Hero uses clean components.</done>
</task>
