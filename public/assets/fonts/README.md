# Fonts

AlYamama is self-hosted. The file currently in the repo lives one level up:

    public/assets/Alyamama Regular.ttf     (weight 400)

That is the **only** weight installed, and it is what `@font-face` in
`src/index.css` declares.

## Adding Bold / SemiBold

Drop the licensed files in this folder, then add a matching `@font-face` block
in `src/index.css` for each — e.g. `AlYamama-Bold.woff2` at `font-weight: 700`.

Do not declare a weight whose file is missing. Font matching picks the face
first and the fetch second, so a broken `src:` makes the browser fall through
to the next *family* in the stack rather than to another AlYamama weight — the
headline silently loses AlYamama entirely.

`.woff2` is roughly 30-50% smaller than `.ttf` over the wire; convert if you
were supplied `.otf`/`.ttf`.

Everything else (Manrope, Reem Kufi, Tajawal) loads from Google Fonts via the
`<link>` in `index.html` and needs nothing here.
