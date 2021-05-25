"use strict";
/* global test, expect */
/* eslint no-magic-numbers: ["error", { ignore: [0, 1, 2, 3] }] */
const _ = require("lodash");
const futile = require(".");
const fs = require("fs");
const README_md = `${fs.readFileSync("./README.md")}`;

const headings = README_md.split("\n").filter(x => x.match(/^#/u));

test("headings", () => {
  const heading_re = /^(#+) (.*)$/u;
  let last_heading_1 = null,
    last_heading_2 = null;
  for (const heading of headings) {
    expect(heading).toMatch(heading_re);
    const heading_match = heading.match(heading_re);
    const level = heading_match[1].length,
      title = heading_match[2];
    expect(0 < level && level <= 3).toBeTruthy();
    if (level === 1) {
      last_heading_1 = title;
    }
    if (level === 2) {
      last_heading_2 = title;
    }
    if (level === 3) {
      // Third-level headings only allowed under "Fujitsu Sweden Utils" > "Usage"
      expect(last_heading_1).toBe("Fujitsu Sweden Utils");
      expect(last_heading_2).toBe("Usage");
      expect(title).toMatch(/^futile\.([A-Za-z]+)\(.*\)$/u);
    }
  }
});

const usage_names = [];
for (const heading of headings) {
  const usage_match = heading.match(/^### futile\.([A-Za-z]+)\(.*\)/u);
  if (usage_match) {
    usage_names.push(usage_match[1]);
  }
}

test("Usage names ordered alphabetically", () => {
  const usage_names_sorted = _.sortBy(usage_names);
  expect(usage_names).toEqual(usage_names_sorted);
});

test("All module symbols documented", () => {
  const set_of_documented_symbols = new Set(usage_names);
  const set_of_exported_symbols = new Set(_.keys(futile));
  expect(set_of_documented_symbols).toEqual(set_of_exported_symbols);
});
