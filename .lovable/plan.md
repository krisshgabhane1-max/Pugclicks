# Homepage category article sections

## What will change
- Load the complete published article list on the homepage instead of limiting it to 24.
- Keep the featured article at the top, then group every published article under its matching category heading.
- Show only categories that currently contain published articles, with a link to each full category page.
- Use responsive article grids: one column on phones, two on tablets, three on larger screens.
- Adjust article thumbnail frames so the full uploaded image remains visible and scales automatically without cropping.

## Technical details
- Update the homepage article query and replace the limited “Latest Guides” block with category-grouped sections derived from the existing category definitions.
- Reuse the existing article card and media fallback behavior; refine its stable aspect ratio and image fitting.
- Preserve the featured area, tools, ads, newsletter, SEO metadata, routes, and admin behavior.
- Verify the homepage on mobile and desktop and check the latest build diagnostics.
