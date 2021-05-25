"use strict";
/* global test, expect */
const _ = require("lodash");
const futile = require(".");

test("canonize", () => {
  /* eslint-disable no-magic-numbers */
  const test_cases = [
    "abc",
    73,
    true,
    false,
    { a: 7, b: 8 },
    { b: 8, a: 7 },
    [{ b: 8, a: 7 }],
    [{ b: 8, c: 1, a: 7 }],
    [{ b: 8, c: [1, { z: 1, Z: 3, a: 2, A: 4 }], a: 7 }],
    [{ a: 7, c: [1, { a: 2, A: 4, z: 1, Z: 3 }], b: 8 }],
    [5, 5, 5],
    { "0": 5, "1": 5, "2": 5 },
  ];
  /* eslint-enable no-magic-numbers */
  for (const value1 of test_cases) {
    expect(value1).toEqual(JSON.parse(futile.canonize(value1)));
    for (const value2 of test_cases) {
      if (_.isEqual(value1, value2)) {
        expect(futile.canonize(value1)).toBe(futile.canonize(value2));
      } else {
        expect(futile.canonize(value1)).not.toBe(futile.canonize(value2));
      }
    }
  }
  expect(futile.canonize(new Date("2021-05-24T15:44Z"))).toBe('"2021-05-24T15:44:00.000Z"');
});

test("interval", () => {
  /* eslint-disable no-magic-numbers */
  const ms = 1;
  const s = 1000 * ms;
  const min = 60 * s;
  const h = 60 * min;
  const test_cases = [
    ["5 ms", 5 * ms],
    ["7 s", 7 * s],
    ["18 min", 18 * min],
    ["23 h", 23 * h],
  ];
  /* eslint-enable no-magic-numbers */
  for (const [text, ms_value] of test_cases) {
    expect(futile.interval(text)).toBe(ms_value);
  }
});
