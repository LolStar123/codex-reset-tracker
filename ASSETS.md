# Tibo artwork

Final website assets:

- `public/images/tibo-chibi.webp`: generated fan illustration, 400 by 600 pixels,
  transparent WebP, 33,786 bytes. Used beside the reset key and in the empty feed.
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

The mechanical key audio is generated locally by Web Audio on explicit presses:
a falling low sine tone and a short low-pass contact transient. It uses no
recording, microphone, external sound file or autoplay. Mute is stored locally.
