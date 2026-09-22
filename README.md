My Portfolio Website: [vinamra-portfolio-beta.vercel.app](https://vinamra-portfolio-beta.vercel.app/)

## 2026 redesign

Run `npm install` and `npm run dev`, then open http://localhost:3000. `npm run build` creates a production build. Development uses `.next-dev` so building does not invalidate the running preview.

Five scroll sections: a personal introduction over a mountain photograph, a monochrome astronaut portrait, two company cards, projects/contributions, and a full-width contact terminal. The base palette is black/white; blue appears on interaction. The previous components are preserved in `archive/2024`. Commit `14080ff` preserves the version before the mountain and terminal revision.

Content lives in `lib/content.js` and comes from the supplied résumé. The internship is omitted from the displayed work. Update the public PDF alongside any résumé edits.

The contact desk uses Libraries.dev `bot-avatars` and `thinking-orbs`. Requests currently use local keyword matching and fixed destinations; no LLM, API key, or backend is connected. Replace `resolveContactIntent` with a server adapter later, retaining the fixed action keys and unsupported-request fallback. The short pending state is a local interaction preview.

The scanner reveal is an original CSS implementation inspired by [BL/S Studio’s Card Beam Animation](https://codepen.io/blacklead-studio/full/xbwaqxE), adapted to two readable cards. It responds to pointer position and keyboard focus; touch users can tap to read the work. Decorative pseudo-code is not company source code.

The mountain uses Canvas 2D with monochrome pixels and a soft pointer-radius blue glitch reveal. Photograph: Les Anderson, [Tall snow-capped mountain peak](https://commons.wikimedia.org/wiki/File:Tall_snow-capped_mountain_peak_(Unsplash).jpg), CC0, downloaded from Wikimedia Commons. The astronaut reuses the existing `public/Models/low_poly_astro.glb`; its original author/license was not supplied. Its mirrored translucent ghost remains monochrome while hover illuminates the glitch band blue. Fonts are locally served Manrope and IBM Plex Mono from Google Fonts. Scenes skip rendering off-screen and respect the system's reduced-motion preference, also passed to the avatar and orb. The previous floating playback control has been removed.

Visual and interaction checks are recorded in `design-qa.md`. No deployment was performed.

Latest refinement: the introduction shares one left edge and the name uses a short stepped typing reveal (disabled for reduced motion). Mountain interaction now reveals scattered strips rather than a filled circular tint. The astronaut is shown in opposing side profiles with multicolour edge fringes on hover. Work cards have rounded corners and a luminous scanner with particle detail. `ProjectGallery.js` contains three original conceptual illustrations for the projects, with locally rendered liquid displacement and chromatic separation; these are not screenshots of the products. The terminal remains unchanged.
