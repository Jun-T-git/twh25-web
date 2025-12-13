# UI Design Document: Game Screen

Based on `docs/guidelines/design-guideline.md`.

## Overview
This document details the UI components and their states for the main game screen of "Our Bed Town".

## Color Palette (Tailwind)
- **Background:** `bg-gray-50` (Light Gray/White)
- **Text:** `text-gray-900` (Dark Gray)
- **Primary:** `text-sky-500`, `bg-sky-500`
- **Alert:** `text-red-500`, `bg-red-500`

## Component Breakdown

### 1. GameHeader (Zone 1)
- **Layout:** Fixed top, full width. Flexbox `justify-between`.
- **Elements:**
    - **Turn Counter:** `text-sm font-bold tracking-widest` (e.g., "TURN 3/10")
    - **Stats Bar:** Row of 6 icons/bars.
        - **Stat Item:** Icon + Small Bar or Circular Progress.
        - **State - Warning:** If value < 30%, apply `animate-pulse` and `text-red-500`.

### 2. PlayerStatus (Zone 2)
- **Layout:** Below header. Horizontal list (`flex-row`, `justify-center`, `gap-4`).
- **Elements:**
    - **Avatar Circle:** 48x48px rounded-full.
    - **Status Indicator:**
        - **Waiting:** Opacity 50%, no badge.
        - **Voted:** Opacity 100%, Green check badge or "VOTED" label.

### 3. PolicyCardCarousel (Zone 3)
- **Layout:** Centered main area. Large height.
- **Interaction:** Horizontal scroll or Snap Carousel.
- **Card Design:**
    - **Container:** White card, `rounded-xl`, `shadow-lg`.
    - **Image:** Top half, placeholder or isometric illustration.
    - **Content:** Bottom half, Title (`font-bold text-lg`) + Description (`text-sm text-gray-600`).
- **Active State:** The center card is slightly larger (scale 1.05) to focus attention.

### 4. GameFooter (Zone 4)
- **Layout:** Fixed bottom. Grid or Flex (`h-20`).
- **Elements:**
    - **Secret Identity (Left):**
        - **Interaction:** `onPointerDown`/`onPointerUp` (Long Press).
        - **Visual:** "ID Card" icon.
        - **Feedback:** Modal/Tooltip appears while held.
    - **Vote Button (Right):**
        - **Style:** Large, `bg-sky-500 text-white rounded-full`.
        - **Size:** `w-full` logic or 60% width.
        - **State - Disabled:** Gray background, "Waiting..." text.

## Tech Stack Strategy
- **Icons:** `lucide-react` (clean, standard).
- **Animation:** `framer-motion` for:
    - Card swipe gestures.
    - "Secret Identity" long-press reveal (spring animation).
    - Stat danger pulsing.
