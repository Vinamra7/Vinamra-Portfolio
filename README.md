My Portfolio Website: [vinamra-portfolio-beta.vercel.app](https://vinamra-portfolio-beta.vercel.app/)

## 2026 redesign

Run `npm install` and `npm run dev`, then open http://localhost:3000. `npm run build` creates a production build. Development uses `.next-dev` so building does not invalidate the running preview.

Five scroll sections: a minimal name and architectural corridor, a monochrome astronaut portrait, two company cards, projects/contributions, and an interactive contact desk. The previous components are preserved in `archive/2024`.

Content lives in `lib/content.js` and comes from the supplied résumé. The internship is omitted from the displayed work. Update the public PDF alongside any résumé edits.

The contact desk uses Libraries.dev `bot-avatars` and `thinking-orbs`. Requests currently use local keyword matching and fixed destinations; no LLM, API key, or backend is connected. Replace `resolveContactIntent` with a server adapter later, retaining the fixed action keys and unsupported-request fallback. The short pending state is a local interaction preview.

The scanner reveal is an original CSS implementation inspired by [BL/S Studio’s Card Beam Animation](https://codepen.io/blacklead-studio/full/xbwaqxE), adapted to two readable cards. It responds to pointer position and keyboard focus; touch users can tap to read the work. Decorative pseudo-code is not company source code.

The corridor is built from simple Three.js geometry. The astronaut reuses the existing `public/Models/low_poly_astro.glb`; its original author/license was not supplied. Fonts are locally served Manrope and IBM Plex Mono from Google Fonts. Both 3D scenes render only near the viewport, cap pixel ratio and frame rate, and respect the motion control. Avatar and orb also receive the pause state.

Visual and interaction checks are recorded in `design-qa.md`. No deployment was performed.
