---
name: motion-react
description: "Guides the agent to use motion/react (formerly Framer Motion) for smooth, modern, performant animations in React. Covers the motion component, AnimatePresence, layout animations, gestures, transitions, accessibility/reduced motion, performance, and Motion Values. Use this skill whenever building or modifying any UI in this project that involves animation, transitions, hover effects, scroll effects, entrance/exit animations, or drag interactions."
---

# Motion for React — Animation Skill

**Motion for React** (package: `motion`, import from `"motion/react"`) is the canonical animation library for this project. Do **not** introduce alternative animation libraries (GSAP, react-spring, Framer Motion legacy imports, anime.js, etc.) unless the user explicitly asks.

- Official docs: https://motion.dev/docs/react
- Install: `npm install motion`
- Import: `import { motion, AnimatePresence, ... } from "motion/react"`

> **Note**: The package is `motion` (not `framer-motion`). Old `framer-motion` imports still work but new code must use `motion/react`.

---

## When to Apply This Skill

Activate whenever the task touches any of the following:

- Adding or modifying enter/exit animations, fade-ins, slide-ins
- Hover, tap, focus, or drag interactions
- Page/route transitions
- Layout shift animations (reordering, expanding, collapsing)
- Scroll-linked animations
- Staggered list or grid animations
- Gesture-based UI (draggable cards, sliders)
- Reduced-motion / accessibility compliance

---

## 1. The `<motion />` Component

### Basics

Prefix any HTML or SVG tag with `motion.` to unlock animation props:

```tsx
import { motion } from "motion/react"

// Basic fade-in on mount
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
/>

// Enter + hover + tap in one component
<motion.button
  initial={{ y: 10, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
/>
```

### Key Animation Props

| Prop | Purpose |
|---|---|
| `initial` | Starting state (before mount animation). Set to `false` to skip enter animation. |
| `animate` | Target state; re-animates whenever values change |
| `exit` | State when element leaves DOM (requires `AnimatePresence` wrapper) |
| `whileHover` | Applied while mouse is hovering |
| `whileTap` | Applied while element is pressed |
| `whileFocus` | Applied while element has focus |
| `whileDrag` | Applied while dragging |
| `whileInView` | Applied while element is in the viewport |
| `transition` | Controls the animation type, duration, easing, delay, stagger |

### Animatable Values

Motion can animate **any CSS property**, including values browsers cannot normally tween (e.g. `background-image`, `mask-image`).

**Shorthand transform values** (set directly, no CSS string required):

```tsx
// Translate
animate={{ x: 100, y: -20, z: 0 }}

// Scale (independent axes)
animate={{ scale: 1.1, scaleX: 1.2 }}

// Rotate
animate={{ rotate: 90, rotateX: 15, rotateY: -15 }}

// Skew
animate={{ skewX: 5, skewY: 0 }}
```

Prefer shorthand transforms (`x`, `y`, `scale`, `rotate`) over raw `transform` strings — they are independently interpolatable and hardware-accelerated.

### Keyframes

Pass an array to animate through multiple values:

```tsx
<motion.div animate={{ x: [0, 100, 0] }} />

// Control timing with "times" in transition
<motion.div
  animate={{ opacity: [0, 1, 0.5, 1] }}
  transition={{ times: [0, 0.2, 0.6, 1], duration: 2 }}
/>
```

---

## 2. Variants

Use **variants** to orchestrate animations across component trees, enable stagger, and keep props clean.

```tsx
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,   // children animate one after another
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

function List({ items }) {
  return (
    <motion.ul variants={containerVariants} initial="hidden" animate="visible">
      {items.map((item) => (
        <motion.li key={item.id} variants={itemVariants}>
          {item.label}
        </motion.li>
      ))}
    </motion.ul>
  )
}
```

**Rules:**
- Parent variant names propagate to children automatically — children do not need `initial`/`animate` if variant names match.
- Use `staggerChildren`, `delayChildren`, and `when` inside the parent's `transition` to orchestrate.

---

## 3. Transitions

Control how an animation plays with the `transition` prop:

```tsx
// Spring (default for transform values)
<motion.div
  animate={{ x: 100 }}
  transition={{ type: "spring", stiffness: 300, damping: 20 }}
/>

// Tween (default for opacity, color, etc.)
<motion.div
  animate={{ opacity: 1 }}
  transition={{ type: "tween", duration: 0.4, ease: "easeOut" }}
/>

// Inertia (for flick/momentum)
<motion.div
  animate={{ x: 0 }}
  transition={{ type: "inertia", velocity: 500 }}
/>
```

### Common Transition Options

| Option | Description |
|---|---|
| `type` | `"spring"` (default for transforms), `"tween"`, `"inertia"` |
| `duration` | Seconds (tween only) |
| `ease` | `"easeIn"`, `"easeOut"`, `"easeInOut"`, `"linear"`, cubic bezier array |
| `delay` | Seconds before animation starts |
| `stiffness` | Spring stiffness (higher = faster) |
| `damping` | Spring damping (lower = more bounce) |
| `mass` | Spring mass (affects oscillation speed) |
| `repeat` | Number of repeats (`Infinity` for looping) |
| `repeatType` | `"loop"`, `"mirror"`, `"reverse"` |

### Per-value Transitions

```tsx
<motion.div
  animate={{ x: 100, opacity: 1 }}
  transition={{
    x: { type: "spring", stiffness: 200 },
    opacity: { duration: 0.3 },
  }}
/>
```

---

## 4. AnimatePresence — Exit Animations

Wrap conditionally rendered or list-keyed components with `AnimatePresence` to enable exit animations:

```tsx
import { motion, AnimatePresence } from "motion/react"

function Modal({ isOpen, onClose }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="modal"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", duration: 0.3 }}
        >
          <button onClick={onClose}>Close</button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

**Rules:**
- Each child **must have a unique `key`** prop.
- `AnimatePresence` must be a direct parent or ancestor — it watches its immediate children.
- Use `mode="wait"` to fully complete exit before enter: `<AnimatePresence mode="wait">`.
- Use `mode="popLayout"` to pop exiting elements from layout before replacing them.

### Page/Route Transitions

```tsx
// In your router outlet or layout
<AnimatePresence mode="wait">
  <motion.main
    key={pathname}
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.25 }}
  >
    {children}
  </motion.main>
</AnimatePresence>
```

---

## 5. Layout Animations

Motion can automatically animate any layout change (size, position, flexbox reflow) using the `layout` prop:

```tsx
// Animate layout change when state changes
<motion.div layout>
  {isExpanded && <p>More content...</p>}
</motion.div>

// Only animate a specific axis
<motion.div layout="position" />   // position only
<motion.div layout="size" />       // size only
<motion.div layout="preserve-aspect" />

// Smooth list reordering
{items.map(item => (
  <motion.li key={item.id} layout>
    {item.name}
  </motion.li>
))}
```

### layoutId — Shared Element Transitions

Animate elements between positions/components using `layoutId`:

```tsx
// The element morphs between its two render positions
{isSelected ? (
  <motion.div layoutId="card-expand" className="card--expanded" />
) : (
  <motion.div layoutId="card-expand" className="card--thumbnail" />
)}
```

### LayoutGroup

When multiple components contain `layout` elements that affect each other, wrap them in `LayoutGroup`:

```tsx
import { LayoutGroup } from "motion/react"

<LayoutGroup>
  <Accordion />
  <Accordion />
</LayoutGroup>
```

---

## 6. Gestures

Motion provides cross-device gesture recognisers that work reliably on both pointer and touch events.

### Hover

```tsx
<motion.button
  whileHover={{ scale: 1.05, backgroundColor: "#f0f0f0" }}
  transition={{ type: "spring", stiffness: 400, damping: 17 }}
/>
```

### Tap / Press

```tsx
<motion.button
  whileTap={{ scale: 0.95 }}
/>
```

### Focus

```tsx
<motion.input
  whileFocus={{ boxShadow: "0 0 0 3px rgba(66, 153, 225, 0.6)" }}
/>
```

### Drag

```tsx
// Free drag
<motion.div drag />

// Constrained to an axis
<motion.div drag="x" />

// With elastic boundaries (dragConstraints)
<motion.div
  drag
  dragConstraints={{ left: -100, right: 100, top: -50, bottom: 50 }}
  dragElastic={0.2}   // 0 = hard constraint, 1 = no constraint
  dragMomentum={false}
/>
```

### Event Handlers

```tsx
<motion.div
  onHoverStart={(event, info) => {}}
  onHoverEnd={(event, info) => {}}
  onTap={(event, info) => {}}
  onDrag={(event, info) => console.log(info.point, info.delta)}
  onDragEnd={(event, info) => {}}
/>
```

---

## 7. Scroll Animations

### whileInView

Animate when an element enters the viewport:

```tsx
<motion.section
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, amount: 0.3 }}
  transition={{ duration: 0.5 }}
/>
```

`viewport` options: `once` (animate only once), `amount` (0-1 fraction visible to trigger), `margin` (rootMargin-style expansion).

### Scroll-linked Motion Values

```tsx
import { useScroll, useTransform } from "motion/react"

function ParallaxHeader() {
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 300], [0, -100])

  return <motion.div style={{ y }} />
}
```

`useScroll` returns `scrollY`, `scrollX`, `scrollYProgress` (0-1), `scrollXProgress` (0-1).

---

## 8. Motion Values

Motion Values are reactive values that power animations outside the React render cycle (no re-renders):

```tsx
import { useMotionValue, useTransform, useSpring } from "motion/react"

function Card() {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-30, 30])
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0])

  return (
    <motion.div
      style={{ x, rotate, opacity }}
      drag="x"
    />
  )
}
```

Use `useSpring` to add spring physics to any Motion Value:

```tsx
const smoothX = useSpring(rawX, { stiffness: 300, damping: 30 })
```

---

## 9. Accessibility and Reduced Motion

**This is mandatory** — always respect the user's reduced motion preference.

### useReducedMotion Hook

```tsx
import { useReducedMotion } from "motion/react"

function AnimatedCard() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.4 }}
    />
  )
}
```

### MotionConfig — Global Reduced Motion

Apply reduced-motion behaviour globally across the entire app:

```tsx
import { MotionConfig } from "motion/react"

// In your root layout
<MotionConfig reducedMotion="user">
  {/* All motion components inside respect prefers-reduced-motion */}
  <App />
</MotionConfig>
```

`reducedMotion` values: `"user"` (respect OS setting), `"always"` (always reduce), `"never"` (ignore OS setting).

### Accessibility Rules

- **Always** use `reducedMotion="user"` on `MotionConfig` at the app root, or check `useReducedMotion()` individually.
- When motion is reduced: keep `opacity` transitions (non-distracting), remove `x`/`y`/`scale`/`rotate` animations.
- Do not rely on animation alone to convey information — ensure content is accessible without motion.
- Avoid animations on elements with `role="alert"` or live regions.

---

## 10. Performance Guidelines

### Prefer GPU-accelerated Properties

Always animate `transform` (via `x`, `y`, `scale`, `rotate`) and `opacity` — they run on the compositor thread and do not trigger layout or paint.

Prefer:
```tsx
animate={{ x: 100, opacity: 0 }}
```

Avoid (triggers layout/paint):
```tsx
animate={{ width: 200, top: 50, left: 0, marginTop: 20 }}
```

Use the `layout` prop instead of animating `width`/`height`/`top`/`left`.

### LazyMotion — Bundle Size Optimisation

Use `LazyMotion` with `domAnimation` to reduce the initial bundle (~18kb instead of ~34kb):

```tsx
import { LazyMotion, domAnimation, m } from "motion/react"

// Use "m" instead of "motion" inside LazyMotion
<LazyMotion features={domAnimation}>
  <m.div animate={{ x: 100 }} />
</LazyMotion>
```

For async load (further splits bundle):
```tsx
import { LazyMotion, m } from "motion/react"

const loadFeatures = () => import("motion/react").then(res => res.domAnimation)

<LazyMotion features={loadFeatures} strict>
  <m.div animate={{ opacity: 1 }} />
</LazyMotion>
```

### Other Performance Tips

- Set `will-change: transform` via CSS only when an element **will** animate (remove it afterwards).
- Use `AnimatePresence` carefully — do not wrap static, always-mounted content.
- For scroll animations on long lists, consider `useInView` with conditional rendering rather than animating hundreds of elements simultaneously.
- Avoid animating `filter: blur()` on large elements — very expensive on mobile.
- Batch stagger animations: use `staggerChildren` instead of per-item `delay`.

---

## 11. MotionConfig — Global Settings

Wrap your app or a section with `MotionConfig` to set defaults for all descendant motion components:

```tsx
import { MotionConfig } from "motion/react"

<MotionConfig
  transition={{ type: "spring", stiffness: 300, damping: 25 }}
  reducedMotion="user"
>
  <App />
</MotionConfig>
```

---

## 12. Hooks Reference

| Hook | Description |
|---|---|
| `useAnimate()` | Imperative animation API with a scope ref |
| `useScroll()` | Returns scroll position and progress Motion Values |
| `useTransform(value, input, output)` | Map one Motion Value to another |
| `useSpring(value, config)` | Spring-physics Motion Value |
| `useMotionValue(initial)` | Create a raw Motion Value |
| `useMotionTemplate` | Combine Motion Values into a CSS template string |
| `useReducedMotion()` | Returns true if user prefers reduced motion |
| `useInView(ref, options)` | Returns boolean when element enters viewport |
| `useVelocity(motionValue)` | Derives velocity from a Motion Value |

---

## 13. Common Copy-Paste Patterns

### Fade + Slide In on Mount

```tsx
<motion.div
  initial={{ opacity: 0, y: 16 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ type: "spring", stiffness: 260, damping: 20 }}
/>
```

### Button Press Feedback

```tsx
<motion.button
  whileHover={{ scale: 1.04 }}
  whileTap={{ scale: 0.96 }}
  transition={{ type: "spring", stiffness: 400, damping: 17 }}
/>
```

### Staggered List

```tsx
const list = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
}
const item = { hidden: { opacity: 0, x: -16 }, visible: { opacity: 1, x: 0 } }

<motion.ul variants={list} initial="hidden" animate="visible">
  {items.map(i => (
    <motion.li key={i.id} variants={item}>{i.name}</motion.li>
  ))}
</motion.ul>
```

### Toast / Notification

```tsx
<AnimatePresence>
  {toast && (
    <motion.div
      key="toast"
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
    />
  )}
</AnimatePresence>
```

### Accordion / Expandable Panel

```tsx
<motion.div
  layout
  initial={false}
  style={{ overflow: "hidden" }}
>
  <AnimatePresence initial={false}>
    {isOpen && (
      <motion.div
        key="content"
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* expandable content */}
      </motion.div>
    )}
  </AnimatePresence>
</motion.div>
```

### Scroll Progress Bar

```tsx
function ScrollProgressBar() {
  const { scrollYProgress } = useScroll()
  return (
    <motion.div
      style={{
        scaleX: scrollYProgress,
        transformOrigin: "0%",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 4,
        background: "hsl(200 100% 50%)",
      }}
    />
  )
}
```

---

## 14. Anti-Patterns to Avoid

- Do NOT animate layout-triggering properties (`width`, `height`, `top`, `left`, `margin`, `padding`) — use the `layout` prop instead.
- Do NOT create Motion Values inside render without `useMotionValue` — they must be stable references.
- Do NOT use `animate` for instant static state — use `style` or `className` for non-animated values.
- Do NOT forget `key` on `AnimatePresence` children — exit animations will not fire without it.
- Do NOT skip reduced motion — always wrap the app with `<MotionConfig reducedMotion="user">`.
- Do NOT import from `framer-motion` in new code — use `motion/react`.
- Do NOT add other animation libraries — `motion/react` handles everything needed for this project.
