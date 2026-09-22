# Design verification — September 23, 2026

Final result: passed. Subjective art direction remains open to user review.

## References and interpretation

The supplied portrait is an artistic reference for About, not a full-page mockup. Its offset silhouette, disrupted middle, and soft dark edges were translated to the existing low-poly astronaut. The result deliberately remains a polygonal astronaut rather than a photographic portrait. Default rendering is monochrome, with gradual colour on hover/focus and a touch toggle.

Latest feedback drove removal of the navbar, section index, intro coordinates, extra labels and slogan. Intro now contains the name, role and scroll arrow. About uses short text and a cropped, fading model rather than a floating full-body figure. Work contains Visa and Openreach only. The two cards use a pointer-controlled scan reveal instead of a continuous carousel. Contact uses actual Libraries.dev components with smooth, muted mascot shading.

## Evidence

Combined source/implementation comparison: `artifacts/reference-comparison.png`. The portrait-only reference has a different aspect ratio and subject, so this is an art-direction comparison, not a pixel match. Desktop and mobile detail captures were also inspected at full size.

Typography: locally loaded Manrope and IBM Plex Mono; restrained name and section hierarchy with no clipped headings. The reference does not prescribe website fonts. Spacing: short left text balances the large right portrait; mobile stacks the two. Colours: monochrome charcoal replaces the source's teal intentionally, per the user's direction. Image quality: ghost offset, disrupted middle and fading crop are present; polygonal helmet contours remain intentionally low-poly. Copy: short introduction, two companies, dated contributions and working contact actions; no fabricated employment. Remaining photographic softness differences are expected from the requested low-poly asset.

Resolved P2 findings: initial mobile ghost projection extended the viewport by about 3px (contained by the composition); initial scanner reveal exposed empty space because decorative lines were too short (extended the lines across the card). Revised mobile and scanner captures verify both fixes.

- Desktop 1440 × 900: `artifacts/hero-final.png`, `about-final.png`, `work-scan.png`, `contact-final.png`.
- Mobile 390 × 844: `artifacts/mobile-hero.png`, `mobile-about.png`, `mobile-work.png`, `mobile-projects.png`, `mobile-contact.png`.
- Browser verification found no uncaught page errors and no horizontal overflow at mobile width after correcting the astronaut container.
- Both work disclosures opened successfully. Email returned its fixed link; WeChat produced the unsupported-channel response; résumé produced a download link and the PDF returned HTTP 200.
- Production build completed successfully. No live deployment or external messages were sent.

## Limits

Contact classification is a local preview, not AI. Existing model provenance is unresolved. Canvas effects depend on WebGL; a text fallback exists if the astronaut fails to load. Visual checks used Chromium/Edge, not Safari or Firefox. The preexisting dependency tree reports npm audit findings; this design pass did not perform breaking framework upgrades.
