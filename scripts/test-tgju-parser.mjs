import assert from "node:assert/strict";
import { parseCurrentRate, parseLocalizedNumber } from "../lib/tgju.js";

const cases = [
  ["<div>نرخ فعلی:: 4,034.69 0.67</div>", 4034.69],
  ["<span>نرخ فعلی:</span><strong>183,053,000</strong>", 183053000],
  ["<p>نرخ فعلی : ۱,۸۸۰,۰۰۰</p>", 1880000],
  ["<p>نرخ فعلی&#58; ۴٬۰۳۴٫۶۹</p>", 4034.69]
];

for (const [html, expected] of cases) {
  assert.equal(parseCurrentRate(html), expected);
}

assert.equal(parseLocalizedNumber("۱۲۳٬۴۵۶٫۷"), 123456.7);
assert.throws(() => parseCurrentRate("<p>قیمت موجود نیست</p>"));

console.log("TGJU parser: 6 checks passed");
