# Hero videos

The home page hero (`components/VideoHero.js`) plays these files, in this order, as the visitor scrolls:

| File | Scene |
|---|---|
| `laundry.mp4` | Laundry |
| `mechanic.mp4` | Mechanic |
| `babysitter.mp4` | Babysitter |
| `gardener.mp4` | Gardener |
| `cleaner.mp4` | Cleaner |

A missing file shows a striped "video needed" placeholder instead of breaking the page.

Keep each clip short (5–10 s, it loops), muted, 1280×720 or 1920×1080 H.264, ideally under 5 MB.
Shrink one with: `ffmpeg -i in.mp4 -an -vf scale=1280:-2 -c:v libx264 -crf 28 -preset slow -movflags +faststart out.mp4`

## Current clips (temporary placeholders)

Free stock footage from [Pexels](https://www.pexels.com/license/) (free for commercial use, no credit required),
cut to 8 s, 1280×720, no audio. Chosen to show hands and tools rather than faces until we have our own
footage of Rwandan workers.

| File | Source |
|---|---|
| `laundry.mp4` | https://www.pexels.com/video/set-of-white-clothes-spinning-inside-a-washing-machine-8756639/ |
| `mechanic.mp4` | https://www.pexels.com/video/person-repairing-a-car-engine-8469674/ |
| `babysitter.mp4` | https://www.pexels.com/video/people-playing-with-toys-4267875/ |
| `gardener.mp4` | https://www.pexels.com/video/man-mowing-lawn-12215821/ |
| `cleaner.mp4` | https://www.pexels.com/video/floor-being-mopped-6195524/ |

To replace one, drop a new file with the same name here.
