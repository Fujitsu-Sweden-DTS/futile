# Fujitsu Sweden Utils

## What is it

A utility library, mainly used by other packages by [Fujitsu Sweden](https://www.npmjs.com/org/fujitsusweden).

## Usage

```js
const futile = require("@fujitsusweden/futile");
```

### canonize(value)

```js
> futile.canonize({ c: { d: 1, a: 2 }, b: 3, e: 4 })
'{"b":3,"c":{"a":2,"d":1},"e":4}'
```

Like JSON.stringify except object keys are sorted.
This serialization is JSON compatible, meaning that `_.isEqual(a, JSON.parse(canonize(a)))` is always true, just like `_.isEqual(a, JSON.parse(JSON.stringify(a)))`.
It also provides a canonization, meaning that `canonize(a) === canonize(b)` if and only if `_.isEqual(a,b)`.
Note that JSON.stringify does not provide a canonization w.r.t. `_.isEqual`.
For example, `canonize({a:1,b:2}) === canonize({b:2,a:1})` but `JSON.stringify({a:1,b:2}) !== JSON.stringify({b:2,a:1})`.
One use case for a canonizing serialization is property names for indexing on the contents of objects.

### diffIntDiff(data1, data2)

A fast way to compute `[_.differenceWith(data1,data2,_.isEqual),_.intersectionWith(data1,data2,_.isEqual),_.differenceWith(data2,data1,_.isEqual)]`.

In other words, given two lists of values, use the same definition of equality as `_.isEqual` and compute

- A list of values only found in the first source list
- A list of values found in both source lists
- A list of values only found in the second source list

### err(message, object)

Makes it easier to pass meta-data in an error.

```js
throw futile.err("Error message", {metadata1: value1, otherthing2: value2})
```

### interval(intervalString)

Convert a temporal interval from a string representation to the number of milliseconds as an integer.
Supported units are `ms`, `s`, `min`, `h`.

```js
> futile.interval('5 s')
5000
> futile.interval('2 min')
120000
```

### now()

Returns a date object that represents now.

### reqMock(hint)

Return an object similar to an ExpressJS `req` object.

### since(date)

Returns the number of milliseconds between `date` and now.

### sleep(delay)

Asynchronous delay function.
Accepts delay in milliseconds or in `futile.interval` format.

Example to wait 5 seconds:

```js
await futile.sleep('5 s');
```

### xor(...args)

Returns true if an odd number of arguments are truthy, otherwise false.

## Development

Run `./script` without arguments for help
