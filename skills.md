# Project Skills

Use these skills as reusable operating modes when working on this repo.

## startup-product-engineer

Use for all product-facing frontend work across landing pages, dashboards, auth, event flows, admin tools, and user experiences.

- Build like a funded startup product, not an academic project.
- Prioritize polished, premium, conversion-focused UX.
- Every screen should feel production-grade, modern, and investor-demo ready.
- Default stack mindset:
  - React
  - TypeScript-friendly patterns even in JS
  - Tailwind CSS
  - Responsive mobile-first design
  - Clean SaaS dashboard aesthetics
  - Accessibility-first interactions
- Optimize for:
  - Clear hierarchy
  - Fast comprehension
  - Frictionless onboarding
  - Trust signals
  - Smooth state transitions
- Prefer modular reusable components over page-specific hacks.
- Keep interfaces intuitive enough that a first-time user understands the core action instantly.
- Design for both student users and admin operators with equal polish.

---

## premium-frontend-implementation

Use for React components, pages, layouts, navigation, and interactions.

- Read surrounding components before editing.
- Maintain architectural consistency with existing patterns unless upgrading globally.
- Keep route logic organized and scalable.
- Use Tailwind theme tokens, CSS variables, and design system primitives instead of random utility clutter.
- Prioritize:
  - Premium spacing
  - Strong visual hierarchy
  - Clean typography
  - Intentional CTA placement
  - Mobile ergonomics
- Every interaction must account for:
  - Loading
  - Skeleton states
  - Empty states
  - Success
  - Failure
  - Disabled states
- Avoid clunky forms; prefer guided flows.
- Reduce cognitive load aggressively.

---

## startup-ui-polish

Use for visual refinement, motion, responsiveness, and product perception.

- UI should resemble modern products like Linear, Notion, Stripe, Framer, or Ramp.
- Use restrained sophistication:
  - Soft shadows
  - Layered surfaces
  - Balanced whitespace
  - Clean contrast
  - Minimal noise
- Maintain current design token system unless strategically upgrading it.
- Prefer subtle motion, hover confidence, and transition smoothness over flashy animation.
- Eliminate:
  - Student-project visuals
  - Crowded cards
  - Over-rounded containers
  - Inconsistent spacing
  - Weak CTA hierarchy
- Ensure:
  - Long names never break layout
  - Tables remain usable on mobile
  - Admin dashboards feel operationally powerful
  - Empty states still feel premium
- Every page should look screenshot-worthy.

---

## conversion-auth-experience

Use for login, onboarding, registration, and trust-building experiences.

- Auth pages should feel premium, secure, and high-trust.
- Optimize for immediate clarity:
  - Who is this for
  - What action to take
  - Why it is credible
- Make Google sign-in seamless.
- Admin login should feel distinct, secure, and elevated.
- Use split layouts, modern backgrounds, trust indicators, and startup-style presentation where appropriate.
- Reduce friction while preserving security.
- Treat first impressions as product-defining.

---

## scalable-firebase-product-flow

Use for auth, Firestore, registrations, teams, invites, and admin systems.

- Confirm all client behavior aligns with Firestore rules.
- Protect data integrity over speed.
- Use transactions for race-prone flows:
  - Capacity
  - Registrations
  - Team limits
  - Waitlists
  - Invite acceptance
- Preserve explicit error handling with polished user messaging.
- User-facing errors should feel clear and product-grade, never raw.
- Maintain reliable mobile-first auth persistence.
- Build backend flows as if scaling to thousands of users.

---

## launch-ready-pwa-web

Use for deployment, performance, installability, and production web readiness.

- Treat deployment like a real SaaS launch.
- Preserve SPA rewrites and direct-route reliability.
- Keep installability clean and trustworthy.
- Cache conservatively:
  - Fast shell
  - Safe updates
  - No stale critical data
- Firestore/Auth remains online-first.
- Prioritize:
  - Speed
  - Stability
  - SEO-friendly structure where relevant
  - Smooth repeat visits

---

## founder-level-validation

Use before handing work back.

- Run:
  - npm run lint
  - npm run build
- Validate:
  - Responsiveness
  - Mobile polish
  - Overflow edge cases
  - Loading state quality
  - Visual consistency
- Flag anything that feels unfinished, clunky, or “student-made.”
- Final output should feel shippable to real users immediately.
- If something cannot be validated, explicitly state why.
- Never ship avoidable rough edges.

---

## product-standard

Global mindset for this repo:

- Think like product owner + senior engineer + startup designer.
- Prioritize elegance, trust, and usability.
- Make users feel the product is credible within seconds.
- Every implementation should improve:
  - Perceived quality
  - Real usability
  - Brand trust
  - Retention potential
- Good enough is not enough.
- Build toward “this could genuinely launch.”