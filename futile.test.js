"use strict";
/* global describe, test, expect */
const _ = require("lodash");
const futile = require(".");

/* eslint-disable no-magic-numbers */
const positive_integers = [73, 3000, 1];
const integers = [...positive_integers, 0, -1, -25135];
const strings = ["", "abc", "'", '"', "Eee\x1b("];
const objects = [
  {},
  { a: 7, b: 8 },
  { b: 8, a: 7 },
  { "0": 5, "1": 5, "2": 5 },
];
const arrays = [
  [],
  [{ b: 8, a: 7 }],
  [{ b: 8, c: 1, a: 7 }],
  [{ b: 8, c: [1, { z: 1, Z: 3, a: 2, A: 4 }], a: 7 }],
  [{ a: 7, c: [1, { a: 2, A: 4, z: 1, Z: 3 }], b: 8 }],
  [5, 5, 5],
  [{ a: 7 }],
  [{ a: 7 }, { a: 7 }],
  [{ a: 7 }, { a: 7 }, { a: 7 }],
  [{ a: 7 }, { a: 7 }, { a: 7 }, { a: 7, b: 8 }],
  [{ a: 7 }, { a: 7 }, { a: 7 }, { a: 8, b: 8 }],
  [{ a: 7 }, { a: 7 }, { a: 7 }, { a: 7, b: 8 }, { a: 8, b: 8 }, { a: 8, b: 8, c: 5 }],
];
const dates = [new Date("2021-05-24T15:44Z")];
/* eslint-enable no-magic-numbers */

test("canonize", () => {
  const test_cases = [
    ...strings,
    ...integers,
    ...objects,
    ...arrays,
    true,
    false,
    null,
  ];
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
  for (const value of dates) {
    expect(futile.canonize(value)).toBe(JSON.stringify(value));
  }
});

test("diffIntDiff", () => {
  for (const data1 of arrays) {
    for (const data2 of arrays) {
      expect(futile.diffIntDiff(data1, data2)).toEqual(
        [
          _.differenceWith(data1, data2, _.isEqual),
          _.intersectionWith(data1, data2, _.isEqual),
          _.differenceWith(data2, data1, _.isEqual),
        ],
      );
    }
  }
});

test("err", () => {
  for (const message of strings) {
    for (const object of objects) {
      const err = futile.err(message, object);
      expect(err instanceof Error).toBeTruthy();
      expect(err.message).toBe(message);
      expect(_.pick(err, _.keys(object))).toEqual(object);
    }
  }
});

test("interval", () => {
  const suffixes = {};
  /* eslint-disable no-magic-numbers */
  suffixes.ms = 1;
  suffixes.s = 1000 * suffixes.ms;
  suffixes.min = 60 * suffixes.s;
  suffixes.h = 60 * suffixes.min;
  /* eslint-enable no-magic-numbers */
  for (const suffix in suffixes) {
    for (const amount of positive_integers) {
      const text = `${amount} ${suffix}`;
      const ms_value = amount * suffixes[suffix];
      expect(text).toMatch(/^[0-9]+ [a-z]+$/u);
      expect(_.isInteger(ms_value)).toBeTruthy();
      expect(futile.interval(text)).toBe(ms_value);
    }
  }
});

const small_amount_of_time = 200;
test("now", () => {
  const now = futile.now();
  const now2 = new Date();
  const interval = now2 - now;
  expect(now instanceof Date).toBeTruthy();
  expect(now2 instanceof Date).toBeTruthy();
  expect(_.isInteger(interval)).toBeTruthy();
  expect(0 <= interval).toBeTruthy();
  expect(interval <= small_amount_of_time).toBeTruthy();
});

test("reqMock", () => {
  const req = futile.reqMock("testhint");
  expect(req).toEqual(
    {
      hint: "testhint",
      originalUrl: null,
      path: null,
      res: { locals: { } },
    },
  );
});

test("since", () => {
  for (const date of dates) {
    const since1 = new Date() - date;
    const since2 = futile.since(date);
    const since3 = new Date() - date;
    expect(_.isInteger(since1)).toBeTruthy();
    expect(_.isInteger(since2)).toBeTruthy();
    expect(_.isInteger(since3)).toBeTruthy();
    expect(since1 <= since2).toBeTruthy();
    expect(since2 <= since3).toBeTruthy();
  }
});

describe("sleep", () => {
  const intervals = [
    "1 s",
    "78 ms",
    "2 s",
  ];
  for (const interval of intervals) {
    test(interval, async () => {
      const before = futile.now();
      await futile.sleep(interval);
      const after = futile.now();
      const actual_interval = after - before;
      const interval_diff = actual_interval - futile.interval(interval);
      expect(_.isInteger(interval_diff)).toBeTruthy();
      expect(0 <= interval_diff).toBeTruthy();
      expect(interval_diff <= small_amount_of_time).toBeTruthy();
    });
  }
});

/* eslint-disable-next-line no-magic-numbers */
const alternate_xor_1 = (...args) => (args.filter(_.identity).length % 2) === 1;
function alternate_xor_2(...args) {
  let nof_truthy = 0;
  for (const arg of args) {
    if (arg) {
      nof_truthy += 1;
    }
  }
  /* eslint-disable-next-line no-bitwise */
  return [false, true][nof_truthy & 1];
}
describe("xor", () => {
  /* eslint-disable-next-line no-magic-numbers */
  const values = [-5, 0, 7, "", "abc", {}, { a: 1 }, [], [2], true, false, null, {}.undef];
  const test_cases = [[]];
  for (const value1 of values) {
    test_cases.push([value1]);
    for (const value2 of values) {
      test_cases.push([value1, value2]);
      for (const value3 of values) {
        test_cases.push([value1, value2, value3]);
      }
    }
  }
  for (const test_case of test_cases) {
    test(JSON.stringify(test_case), () => {
      expect(futile.xor(...test_case)).toBe(alternate_xor_1(...test_case));
      expect(futile.xor(...test_case)).toBe(alternate_xor_2(...test_case));
    });
  }
});
