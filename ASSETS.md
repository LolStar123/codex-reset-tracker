# Tibo artwork

Final website assets:

- `public/images/tibo-chibi.webp`: generated fan illustration, 400 by 600 pixels,
  transparent WebP, 33,786 bytes. Previous illustration, retained as the edit reference.
- `public/images/tibo-avatar.jpg`: public X profile portrait, used to identify the
  feed author. Reference URL:
  https://pbs.twimg.com/profile_images/2093807917833281537/2yBgpwVV_200x200.jpg

The illustration used the built-in image-generation tool, not an API/CLI fallback.
Original output is retained in the generation directory and in the ignored
`output/tibo-chibi-original.png`. The image was resized and encoded as WebP for
the website; its alpha channel was retained. It is unofficial fan art.

Generation prompt:

Create a single polished website mascot asset, transparent PNG with genuine alpha
and no background. Reference photo identifies Tibo (Thibault Sottiaux): friendly
adult man with short dark brown hair, dark eyebrows, clean-shaven smiling face,
black crewneck t-shirt. Make a cute tasteful chibi version with large head, tiny
body, recognizable hairline, warm smile, not a generic bearded developer. Pose:
full body seated casually on an invisible ledge, one hand waving, other holding
a small cobalt-blue laptop with only a >_ terminal symbol. Front/three-quarter
view, face unobstructed. Soft 3D clay/vinyl toy illustration with creamy matte
surfaces, gentle natural shading, crisp readable silhouette. The clothing is a
black t-shirt, dark charcoal trousers, small off-white sneakers. Palette should
complement an ink-navy and periwinkle/cobalt developer website, with warm natural
skin. No words, no labels, no watermark, no surrounding scene, no ground plane,
no white rectangle, no duplicate characters. Isolate the whole character with
comfortable transparent padding, all feet and hair visible. This is a playful
unofficial fan illustration, not a photo.

## Scribble revision, 22 September 2026

Current asset: `public/images/tibo-doodle.webp`, 400 by 601 pixels, transparent
WebP, 95,634 bytes. It replaces the chibi beside the key and in the empty state.
Generated with the built-in imagegen tool, using the previous chibi as the edit
target; original output retained at `output/tibo-doodle-original.png` (ignored)
and in the generation directory. Alpha retained during WebP encoding.

Final prompt:

Edit this website mascot into a MUCH MORE CARTOONY, loosely scribble-drawn pen
doodle. Preserve the same friendly young adult man Tibo, short dark tousled hair,
black T-shirt, tiny seated legs and white sneakers, waving with a cobalt blue
laptop displaying a small >_ terminal symbol. Dramatically simplify the face into
cute dot eyes, little curved nose, broad goofy grin and rosy scribble cheeks.
Huge head and tiny chibi body. Strong uneven navy ink contours, visible energetic
double-drawn wobbly lines, loose scribbly hair, little crosshatching, flat
hand-colored pencil fills of cobalt, charcoal, off-white and peach. Looks drawn
quickly by a talented human in a notebook margin, charming and slightly wonky.
Entire figure readable at only 100 pixels tall. No realistic rendering, no
realistic facial texture, no 3D, no gradients, no glossy plastic, no airbrushing.
Isolated full-body character with true transparent alpha background, no paper
rectangle or floor, no text caption. Give breathing room around the silhouette.

## Recorded keyboard sound

Self-hosted `public/audio/cream-press.mp3` and `cream-release.mp3` are the
GENERIC_R2 downstroke and GENERIC upstroke from Mechvibes' Full Creamy Goodness
pack (`src/audio/cream-travel`). Pinned upstream revision:
`326252a13e7bef4f1c35d08ef0189b5af6f8ba02`.

Source: https://github.com/hainguyents13/mechvibes/tree/326252a13e7bef4f1c35d08ef0189b5af6f8ba02/src/audio/cream-travel
Repository MIT license retained at `public/audio/MECHVIBES-LICENSE.txt`.
Each file is 2,088 bytes. Downstroke is 71.497ms, mono, 44.1kHz.
These replace the synthesized falling bass oscillator. There is no microphone
access or autoplay; mute persists locally. Press and release play independently.
The cartoon burst is local SVG geometry, not another generated bitmap.
