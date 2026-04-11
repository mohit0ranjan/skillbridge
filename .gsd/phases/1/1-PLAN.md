---
phase: 1
plan: 1
wave: 1
---

# Plan 1.1: Establish Global Design System

## Objective
Implement typography, optimal brand color palette, and a consistent 8px generic spacing grid across `globals.css` and the Next.js setup. We need to prepare the CSS environment for the user's provided exact color palette + font combo.

## Context
- .gsd/SPEC.md
- src/app/globals.css
- src/app/layout.tsx

## Tasks

<task type="checkpoint:decision">
  <name>Collect Exact Design Values</name>
  <files></files>
  <action>
    Ask the user for the exact color palette (hex codes), specific typography combination (e.g., Font A for headings, Font B for body), and any component design system parameters.
  </action>
  <verify>Output from user providing specifics.</verify>
  <done>We have the precise hex codes and font families.</done>
</task>

<task type="auto">
  <name>Configure Global CSS Basics</name>
  <files>
    src/app/globals.css
    src/app/layout.tsx
  </files>
  <action>
    - Update `@theme` block in `src/app/globals.css` to remove legacy properties (like generic green). 
    - Strip noisy CSS and enforce a minimalistic design token structure (primary, secondary, neutral, text colors).
    - If user provided fonts, update `next/font/google` imports in `src/app/layout.tsx` to utilize them across `html` and `body` rules.
  </action>
  <verify>Run the dev server, navigate to `http://localhost:3000` and visually confirm layout.</verify>
  <done>Typography and color variables are properly configured in `globals.css` without legacy noise.</done>
</task>

## Success Criteria
- [ ] User provides exact branding assets.
- [ ] Global styling reflects a unified modern template ready for component usage.
