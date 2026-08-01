import assert from "node:assert/strict";
import { hasCrossedPrice, normalizePriceAlert } from "../lib/priceAlert.js";

assert.equal(hasCrossedPrice({ previous: 99, current: 100, target: 100, direction: "above" }), true);
assert.equal(hasCrossedPrice({ previous: 100, current: 101, target: 100, direction: "above" }), false);
assert.equal(hasCrossedPrice({ previous: 101, current: 100, target: 100, direction: "below" }), true);
assert.equal(hasCrossedPrice({ previous: 100, current: 99, target: 100, direction: "below" }), false);
assert.equal(hasCrossedPrice({ previous: 99, current: 101, target: 0, direction: "above" }), false);
assert.equal(hasCrossedPrice({ previous: Number.NaN, current: 101, target: 100, direction: "above" }), false);

assert.deepEqual(normalizePriceAlert({ enabled: 1, direction: "below", target: 120 }, 100), {
  enabled: true,
  direction: "below",
  target: 120,
  lastTriggeredAt: null
});
assert.equal(normalizePriceAlert({ target: -2, direction: "invalid" }, 100).target, 100);

console.log("Price alert: 8 checks passed");
