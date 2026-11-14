# Northline proportion study

A bounded proposal sample for a Latin + Runic font. Not commissioned work or a production-ready font.

Open `index.html` to compare original proportions, an 88% x-height, and a 92% x-height. The fonts are compiled OTFs with printable ASCII and the Runic-block characters supported by the source font. Lowercase contours use a piecewise vertical mapping that retains descenders, increases x-height and brings ascenders to cap height. Capitals and runes keep their source outlines.

This is a geometric study, not an optically finished typeface. Kerning, hinting, diacritics, broader Latin coverage, optical weight corrections, and comprehensive language testing are deliberately outside the sample. The font has no kerning or ligature tables. It does not establish professional experience or client acceptance.

## Reproduce

Node.js 24 was used. Run `npm ci --ignore-scripts`, then `node build.mjs`. `validation.json` records a readback of the compiled fonts, character coverage, cap height, x-height, ascenders and descenders. Browser checks are separately recorded.

## Sources and license

Source files come from the Noto project: [Noto Sans](https://github.com/notofonts/noto-fonts/tree/main/hinted/ttf/NotoSans) and [Noto Sans Runic](https://github.com/notofonts/noto-fonts/tree/main/hinted/ttf/NotoSansRunic). Exact download URLs and SHA-256 hashes are in `provenance.json`.

Original font copyright: Copyright 2018 The Noto Project Authors (github.com/googlei18n/noto-fonts). All included original and modified font software, build script and specimen are distributed under the SIL Open Font License 1.1 in `OFL.txt`. Modified family name: Northline Study. No endorsement by the Noto authors is implied. Any paid proposal concerns custom design/engineering services; OFL font licensing remains intact.

OpenType.js 2.0.0 is a build dependency under its own MIT license, not included in the published sample bundle.
