"use strict";
/* global test, expect */
const utils = require("./utils.js");

/* eslint-disable no-magic-numbers */
const ms = 1;
const s = 1000 * ms;
const min = 60 * s;
const h = 60 * min;
const interval_test_cases = [
  ["5 ms", 5 * ms],
  ["7 s", 7 * s],
  ["18 min", 18 * min],
  ["23 h", 23 * h],
];
/* eslint-enable no-magic-numbers */

test("interval", () => {
  for (const [text, ms_value] of interval_test_cases) {
    expect(utils.interval(text)).toBe(ms_value);
  }
});
