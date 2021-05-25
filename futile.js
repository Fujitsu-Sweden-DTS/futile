"use strict";
const _ = require("lodash");
const { promisify } = require("util");

const futile = module.exports;

// See ./README.md for documentation

function canonize(o) {
  switch (typeof o) {
    case "string":
    case "number":
    case "boolean":
      return JSON.stringify(o);
    case "object":
      if (o === null || _.isDate(o)) {
        return JSON.stringify(o);
      } else if (_.isPlainObject(o)) {
        return `{${_.entries(o)
          .sort()
          .map(([k, v]) => `${JSON.stringify(k)}:${canonize(v)}`)
          .join(",")}}`;
      } else if (_.isArray(o)) {
        return `[${_.map(o, canonize).join(",")}]`;
      }
      throw new Error("Don't know how to canonize this weird non-plain object");
    default:
      throw futile.err("Don't know how to canonize a value of this type", { type: typeof o });
  }
}
futile.canonize = canonize;

futile.diffIntDiff = function (data1, data2) {
  const map = {},
    set1 = [],
    set2 = [];
  for (const item of data1) {
    const c = canonize(item);
    set1.push(c);
    map[c] = item;
  }
  for (const item of data2) {
    const c = canonize(item);
    set2.push(c);
    map[c] = item;
  }
  const onlyin1c = _.difference(set1, set2);
  const onlyin2c = _.difference(set2, set1);
  const inbothc = _.intersection(set1, set2);
  return [_.map(onlyin1c, x => map[x]), _.map(inbothc, x => map[x]), _.map(onlyin2c, x => map[x])];
};

futile.err = function (message, obj) {
  // Create a new Error object without any message.
  const err = Error("");
  // Add a message.
  err.message = message;
  // Adjust the stack to look like the error was created at the point where futile.err was called.
  // Since the original stack string was created with an empty error message, we know that it takes only 1 line.
  // So, by removing the top 2 lines and adding back a line with the error message, we get the effect of removing the stack frame for the call to futile.err.
  const discard_lines = 2;
  err.stack = [`Error: ${message}`, ...err.stack.split("\n").slice(discard_lines)].join("\n");
  // Add other parameters to the error
  for (const key in obj) {
    err[key] = obj[key];
  }
  return err;
};

futile.interval = function (text) {
  const m = text.match(/^([0-9]+) (ms|s|min|h)$/u);
  if (!m) {
    throw futile.err("Not a valid interval string", { text });
  }
  return Number.parseInt(m[1]) * { ms: 1, s: 1000, min: 60000, h: 3600000 }[m[2]];
};

futile.now = () => new Date();

futile.reqMock = hint => ({
  originalUrl: null,
  path: null,
  hint,
  res: { locals: { access: {} } },
});

futile.since = x => futile.now() - x;

const _sleep_ms = promisify(setTimeout);
futile.sleep = delay => _sleep_ms(_.isNumber(delay) ? delay : futile.interval(delay));

futile.xor = function (...args) {
  let ret = false;
  for (const item of args) {
    if (item) {
      ret = !ret;
    }
  }
  return ret;
};
