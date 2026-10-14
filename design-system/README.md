CatMut makes cutting-mat wallpapers: a measured grid, a ruler edge and a few lines of type, exported as SVG or PNG. The interface stays quiet so the mat is the only loud thing on screen.

## Content fundamentals

- Interface copy is Thai, short and direct. Labels name the thing ("ขนาดช่อง", "ใส่เงาทาบ"), buttons name the action ("ดาวน์โหลด SVG").
- Wallpaper text is English, in the voice of a workshop: "Stay Sharp." and "Dull tools make tired hands. Rest, sharpen your skills, and return to the work with an edge that makes the hard parts feel easy."
- The vertical label is uppercase and reads `CAT MUT - CUT MAT WALLPAPER PACK` then `{ratio} ASPECT RATIO - {year}`. `{ratio}`, `{year}` and `{size}` are filled in automatically.
- The site name is written `CatMut` in the interface and `CAT MUT` in the label.
- No emoji. No exclamation marks.

## Visual foundations

- **Two surfaces.** The page is `bg`, the control column is `panel`, inputs sit on `field`. Dividers and borders are 1px `line`. Primary text is `ink`, secondary text is `mute`.
- **One accent.** `accent` marks the single selected or primary thing: a pressed chip, the primary button, an on switch, the focus ring. Text on it is `accent-ink`. Never use `accent` for decoration.
- **Type.** Section headings use `section-label` (mono, uppercase, tracked) in `mute`. Controls use `body` and `button`. Readouts and hex values use `readout`. The site name and the wallpaper text use `title`, the Newsreader serif.
- **Shape.** Controls use `radius-md`. Only the switch track uses `radius-pill`. Cards are not used; sections are separated by a divider, not boxed.
- **Elevation.** The wallpaper preview alone carries `shadow-mat`. Nothing else has a shadow.
- **Spacing.** 16px page gutter (`space-5`), 18px between control sections (`space-6`), 12px between rows (`space-4`), 6px between chips (`space-2`).
- **Focus.** A 2px solid `accent` ring with 2px offset on every focusable element.
- **Motion.** The switch thumb and track change in 150ms. Nothing else moves.
- **Themes.** Light and dark follow the viewer. The wallpaper never changes with the theme; its colors are the fixed `mat-*` presets.

## The wallpaper

- Choose a background from the five presets (`mat-green` is the default) or any hex. Line and text color is chosen automatically: `mat-ink-dark` on light backgrounds, `mat-ink-light` on dark ones. A preset also sets line intensity (charcoal 50, plum 75, others 100).
- Bottom layers stack and multi-select: grid, millimetre, quilt 45°, triangle 60°, circle, dots, cross, Fibonacci (left or right), angle lines 15°–75°, vertical label, frame, edge ruler. The vertical label lives with these, in the top-left strip.
- Top layer is text: quote at the centre, paragraph at the bottom right. All text uses one font, chosen once.
- A text plate (background-colored rectangle) hides the grid behind text. Its edges snap outward to grid lines and are inset by half the thickest line (`mat-line-major` / 2 plus a little) so no line is cut. The quote itself stays exactly centred.
- Sizes: 16:10, 16:9, 21:9, 3:2, 4:3, 1:1, 19.5:9, portrait or landscape, or custom pixels. Default 2560 × 1600. Cell size defaults to 95%.
- Shadow is off by default. When on: stripes, blinds (with cords), window, leaves or gradient, at 70%.

## Iconography

None. The interface uses text chips and a switch; there is no icon set and no logo mark. Set the name in `title`.
