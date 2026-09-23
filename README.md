# Vinamra's portfolio

A black, minimalist portfolio with a scroll-driven galaxy, astronaut portrait, two company cards, project artwork and a contact terminal.

## Development

Run `npm install`, then `npm run dev`. Open http://localhost:3000. Use `npm run build` for production and `npm start` to serve it. Development builds use `.next-dev`, separate from production `.next`.

## Structure

- `pages/`: page composition and application entry.
- `components/`: galaxy, decoding name, astronaut, work cards, project gallery and contact terminal.
- `lib/content.js`: experience, project and contact details.
- `styles/global.css`: responsive styling.
- `public/`: active astronaut model, resume, favicon and locally served fonts.

Headings use Space Grotesk, body text uses Manrope, and the terminal uses IBM Plex Mono. The palette is predominantly monochrome, with subtle blue, amber and red stars and colour on interaction. Canvas effects respect reduced motion and limit rendering work.

The contact terminal uses Libraries.dev `bot-avatars` and `thinking-orbs`. It uses local keyword matching and fixed destinations; no LLM or backend is connected. Project artwork is original conceptual imagery, not product screenshots. The work scanner is inspired by [BL/S Studio's Card Beam Animation](https://codepen.io/blacklead-studio/full/xbwaqxE).

Update `lib/content.js` and `public/Vinamra-Mishra-Resume.pdf` when career details change. The existing astronaut model's author/license was not supplied.

## History and verification

Commit `9245480` preserves the full pre-cleanup repository, including the retired 2024 website, duplicate assets and mountain experiment. These unused files are removed from the active tree. Temporary screenshots, one-off scripts, and historical QA notes have been removed. No deployment was performed.
