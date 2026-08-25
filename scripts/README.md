# Maintenance scripts

Run from the backend root (`portfolio-backend/`) with the `.env` in place.

| Script | What it does | Safe to re-run? |
| --- | --- | --- |
| `node scripts/seedFromResume.js` | Syncs skills, projects, services and the personal block with the CV. Skills and services are replaced wholesale; projects are upserted **by title**, so existing Cloudinary cover images survive. | Yes |
| `node scripts/mergeLegacyProjects.js` | One-time: the CV titles differ from the titles projects were originally saved under, so the seed created duplicates. This carries the cover image over to the CV document and deletes the old one. | Yes (no-ops once merged) |
| `node scripts/attachLocalCovers.js` | Uploads cover images from `portfilio/src/images` to Cloudinary for projects that have none. | Yes (skips projects that already have a cover) |
| `node scripts/setResumeFile.js [filename]` | Points `Personal.resumeUrl` / `resumeFilename` at a PDF that actually exists in `uploads/resume/`. Defaults to `resume_vishal_kumar.pdf`. | Yes |

## Rebuilding the CV PDF

`scripts/resume/resume.html` is the source for the downloadable CV. To regenerate
after editing it:

```sh
chrome --headless=new --disable-gpu --no-pdf-header-footer \
  --print-to-pdf=uploads/resume/resume_vishal_kumar.pdf \
  scripts/resume/resume.html
```

Then copy the same file to `portfilio/public/resume.pdf` — that copy is the
fallback the site uses when the API is unreachable.

`body { zoom: 0.82 }` near the end of the stylesheet is what keeps the CV on a
single A4 page; raise it only if you also remove content.

## Where the CV is served from

- `GET /api/personal/resume/download` — sends the file from `uploads/resume/`
  with a `Content-Disposition: attachment` header so browsers save it.
- `portfilio/public/resume.pdf` — bundled with the frontend build. The hero
  HEAD-probes the API endpoint on load and falls back to this copy, so the
  button still works if the backend is down or its disk was wiped.
