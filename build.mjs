import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import ot from 'opentype.js';

const load = name => {
  const b = fs.readFileSync(`source-fonts/${name}-Regular.ttf`);
  return ot.parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength));
};
const latin = load('NotoSans'), runic = load('NotoSansRunic');
assert.equal(latin.unitsPerEm, 1000);
assert.equal(runic.unitsPerEm, 1000);
const cap = 714, oldX = 536, oldAscender = 760;
const codepoints = [
  ...Array.from({length: 95}, (_, i) => i + 32),
  ...Array.from({length: 96}, (_, i) => i + 0x16a0).filter(cp => runic.charToGlyphIndex(String.fromCodePoint(cp))),
];
fs.mkdirSync('fonts', {recursive: true});
const reports = [];
for (const [name, ratio] of [['Reference', null], ['A', .88], ['B', .92]]) {
  const mapY = y => {
    if (ratio === null || y <= 0) return y;
    const target = Math.round(cap * ratio);
    return y <= oldX ? y * target / oldX : target + (y - oldX) * (cap - target) / (oldAscender - oldX);
  };
  const glyphs = [new ot.Glyph({name: '.notdef', advanceWidth: 600, path: new ot.Path()})];
  for (const cp of codepoints) {
    const char = String.fromCodePoint(cp), source = cp >= 0x16a0 ? runic : latin;
    const original = source.charToGlyph(char), path = new ot.Path();
    const lowercase = cp >= 97 && cp <= 122;
    path.commands = original.path.commands.map(command => Object.fromEntries(
      Object.entries(command).map(([key, value]) => [key, lowercase && /^y[12]?$/.test(key) ? mapY(value) : value])
    ));
    glyphs.push(new ot.Glyph({name: `uni${cp.toString(16).toUpperCase().padStart(4, '0')}`, unicode: cp,
      advanceWidth: original.advanceWidth, path}));
  }
  const font = new ot.Font({familyName: `Northline Study ${name}`, styleName: 'Regular',
    unitsPerEm: 1000, ascender: 1069, descender: -293, glyphs,
    copyright: 'Copyright 2018 The Noto Project Authors. Modifications 2026 GenesisOne.',
    license: 'SIL Open Font License 1.1; see OFL.txt. A limited design study, not a production font.',
    licenseURL: 'https://openfontlicense.org/',
  });
  const bytes = Buffer.from(font.toArrayBuffer()), filename = `fonts/NorthlineStudy-${name}.otf`;
  fs.writeFileSync(filename, bytes);
  // Read the compiled font back, independently of the in-memory construction.
  const parsed = ot.parse(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
  assert.equal(parsed.glyphs.length, codepoints.length + 1);
  for (const cp of codepoints) assert(parsed.charToGlyphIndex(String.fromCodePoint(cp)), `Missing U+${cp.toString(16)}`);
  const extent = c => parsed.charToGlyph(c).getBoundingBox();
  const xHeight = extent('x').y2;
  assert.equal(extent('H').y2, cap);
  assert.equal(extent('ᚠ').y2, cap);
  assert(Math.abs(xHeight - (ratio === null ? oldX : Math.round(cap * ratio))) <= 1);
  assert(extent('g').y1 < -200, 'Keep descenders');
  assert.equal(extent('h').y2, ratio === null ? oldAscender : cap);
  reports.push({filename,sha256:createHash('sha256').update(bytes).digest('hex'),glyphCount:parsed.glyphs.length,
    codepoints:codepoints.length,xHeight,capHeight:cap,lowercaseAscender:extent('h').y2,descender:extent('g').y1});
}
fs.writeFileSync('validation.json',JSON.stringify({at:new Date().toISOString(),reports,
  scope:'Compiled OTF coverage and geometry checks only. No kerning, hinting, diacritic or full-language QA implied.'},null,2));
console.log(JSON.stringify(reports));
