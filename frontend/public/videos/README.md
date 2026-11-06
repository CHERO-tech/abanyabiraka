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
