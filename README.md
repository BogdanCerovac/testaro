# testaro

Accessibility test automation

## Summary

Testaro (Esperanto for “collection of tests”) is a collection of web accessibility tests.

The purpose of Testaro is to provide programmatic access to over 600 accessibility tests defined in several test packages and in Testaro itself.

Calling Testaro requires telling it which operations (including tests) to perform and which URLs to perform them on. Testaro outputs progress and error messages to the console and, if it is not interrupted by an error, returns a JavaScript object containing a report, which can be further processed programmatically.

## Origin

Testaro is derived from [Autotest](https://github.com/jrpool/autotest). Autotest contains additional tests, procedures, and data not included in Testaro.

The additional tests in Autotest are inspection-oriented: They output results intended to be inspected by the user. The tests in Testaro are automation-oriented, intended for the programmatic derivation of scores and other processing.

The additional procedures in Autotest perform:
- previous versions of scoring
- operations that processed data for scoring discounts
- file operations for score aggregation, report revision, and HTML reporting

The additional data in Autotest are tabulations of duplications between test packages (two test packages finding the same issues).

## System requirements

Version 14 or later of [Node.js](https://nodejs.org/en/).

## Technologies

Testaro uses the [Playwright](https://playwright.dev/) package to launch browsers, perform user actions in them, and perform tests, and uses [pixelmatch](https://www.npmjs.com/package/pixelmatch) to measure motion.

Testaro combines its own collection of tests with tests made available in other packages and APIs:
- [accessibility-checker](https://www.npmjs.com/package/accessibility-checker) (the IBM Equal Access Accessibility Checker)
- [alfa](https://alfa.siteimprove.com/) (Siteimprove alfa)
- [Automated Accessibility Testing Tool](https://www.npmjs.com/package/aatt) (Paypal AATT, running HTML CodeSniffer)
- [axe-playwright](https://www.npmjs.com/package/axe-playwright) (Deque Axe-core)
- [WAVE API](https://wave.webaim.org/api/) (WebAIM WAVE)

As of January 2022, the counts of tests in the packages referenced above were:
- AATT: 98
- Alfa: 103
- Axe-core: 138
- Equal Access: 163
- WAVE: 110
- subtotal: 612
- Testaro tests: 15
- grand total: 627

## Code organization

Some of the files of code are located at the root of the package directory.

The main subdirectories of the package directory containing other code files are:
- `tests`: files containing the code defining particular tests
- `procs`: shared procedures
- `validation`: code and artifacts for the validation of tests

## Installation

```bash
npm install testaro
```

## Configuration

Successful installation depends on the scoped registry declaration for `@siteimprove` in the `.npmrc` file.

Use of WAVE requires you to have a WAVE API key (see the link above under “Technologies”).

## Specification

To use Testaro, you must specify what it should do. You do this by creating at least one script, and optionally one or more batches.

## Scripts

### Introduction

When you run Testaro, you provide a **script** to it. The script contains **commands**. Testaro performs those commands.

A script is a JSON file with the properties:

```json
{
  "what": "string: description of the script",
  "strict": "boolean: whether redirections should be treated as failures",
  "commands": "array of objects: the commands to be performed"
}
```

### Example

Here is an example of a script:

```json
{
  "what": "Test example.com with alfa",
  "strict": true,
  "commands": [
    {
      "type": "launch",
      "which": "chromium",
      "what": "Chromium browser"
    },
    {
      "type": "url",
      "which": "https://example.com/",
      "what": "page with a few accessibility defects"
    },
    {
      "type": "test",
      "which": "alfa",
      "what": "Siteimprove alfa package"
    }
  ]
}
```

This script tells Testaro to open a page in the Chromium browser, navigate to `example.com`, and perform the tests in the `alfa` package on that URL.

### Strictness

If the `strict` property is `true`, Testaro will accept redirections that add or subtract a final slash, but otherwise will treat redirections as failures.

### Commands

#### Commands in general

The `commands` property’s value is an array of commands, each formatted as an object.

Each command has a `type` property and optionally has a `name` property (used in branching, described below). It must or may have other properties, depending on the value of `type`.

You can look up the command types and their required and optional properties in the `commands.js` file. That file defines two objects, named `etc` and `tests`.

The properties of the `etc` object specify what is required for commands to be valid. Consider this command:

```json
{
  "type": "link",
  "which": "warming",
  "what": "article on climate change"
}
```

Here is the applicable property of the `etc` object in `commmands.js`:

```js
link: [
  'Click a link',
  {
    which: [true, 'string', 'hasLength', 'substring of the link text'],
    what: [false, 'string', 'hasLength', 'comment']
  }
]
```

As this example illustrates, to find the requirements for a `link`-type command, you look up the `link` property of the `etc` object. Its value is an array with two elements: a string describing the command and an object containing requirements for any command of that type.

A requirement, such as `which: [true, 'string', 'hasLength', 'substringc of the link text']`, has a property key as its key. In this case, it specifies what is required for the `which` property of a `link`-type command. The requirement takes the form of an array:
- 0. Is the property (here `which`) required (`true` or `false`)?
- 1. What format must the property value have (`'string'`, `'array'`, `'boolean'`, or `'number'`)?
- 2. What other validity criterion applies (if any)? (Empty string if none.)
- 3. Description.

That other validity criterion may be any of these:
- `'hasLength'`: is not a blank string
- `'isURL`': is a string starting with `http`, `https`, or `file`, then `://`, then ending with 1 or more non-whitespace characters
- `'isBrowserType'`: is `'chromium'`, `'firefox'`, or `'webkit'`
- `'isFocusable'`: is `'a'`, `'button'`, `'input'`, `'select'`, or `'option'`
- `'isState'`: is `'loaded'` or `'idle'`
- `'isTest'`: is the name of a test
- `'isWaitable'`: is `'url'`, `'title'`, or `'body'`
- `'areStrings'`: is an array of strings

#### Command sequence

The first two commands in any script have the types `launch` and `url`, respectively, as shown in the example above. They launch a browser and then use it to visit a URL. For example:

```json
{
  "type": "launch",
  "which": "chromium",
  "what": "Open a page in a Chromium browser"
}
```

```json
{
  "type": "url",
  "which": "https://en.wikipedia.org/wiki/Main_Page",
  "what": "English Wikipedia home page"
}
```

#### Command types

The subsequent commands can tell Testaro to perform any of:
- moves (clicks, text inputs, hovers, etc.)
- navigations (browser launches, visits to URLs, waits for page conditions, etc.)
- alterations (changes to the page)
- tests (whether in dependency packages or defined within Testaro)
- scoring (aggregating test results into total scores)
- branching (continuing from a command other than the next one)

##### Moves

An example of a **move** is:

```json
{
  "type": "radio",
  "which": "No",
  "index": 2,
  "what": "No, I am not a smoker"
}
```

In this case, Testaro checks the third radio button whose text includes the string “No” (case-insensitively).

In identifying the target element for a move, Testaro matches the `which` property with the texts of the elements of the applicable type (such as radio buttons). It defines the text of an `input` element as the concatenated texts of its implicit label or explicit labels, if any, plus, for the first input in a `fieldset` element, the text content of the `legend` element of that `fieldset` element. For any other element, Testaro defines the text as the text content of the element.

When multiple elements of the same type have indistinguishable texts, you can include an `index` property to specify the index of the target element, among all those that will match.

##### Navigations

An example of a **navigation** is the command of type `url` above.

Once you have included a `url` command in a script, you do not need to add more `url` commands unless you want the browser to visit a different URL.

However, some tests modify web pages. In those cases, Testaro inserts additional `url` commands into the `script` property of the `options` object, after those tests, to ensure that changes made by one test do not affect subsequent acts.

Another navigation example is:

```json
{
  "type": "wait",
  "which": "travel",
  "what": "title"
}
```

In this case, Testaro waits until the page title contains the string “travel” (case-insensitively).

##### Alterations

An example of an **alteration** is:

```json
{
  "type": "reveal",
  "what": "make everything visible"
}
```

This command causes Testaro to alter the `display` and `visibility` style properties of all elements, where necessary, so those properties do not make any element invisible.

##### Tests

###### Examples

An example of a **packaged test** is:

```json
{
  "type": "test",
  "which": "wave",
  "reportType": 1,
  "what": "WAVE summary"
}
```

In this case, Autosest runs the WAVE test with report type 1.

An example of a **Testaro-defined** test is:

```json
{
  "type": "test",
  "which": "motion",
  "delay": 1500,
  "interval": 2000,
  "count": 5,
  "what": "test for motion on the page"
}
```

In this case, Testaro runs the `motion` test with the specified parameters.

Near the top of the `index.js` file is an object named `tests`. It describes all available tests.

###### Validation

Commands of type `test` may have additional validity requirements. They must always conform to the `test` object in `etc`, namely:

```js
test: [
  'Perform a test (which: test name; what: description)',
  {
    which: [true, 'string', 'isTest', 'test name'],
    what: [false, 'string', 'hasLength', 'comment']
  }
]
```

Thus, each `test`-type command must have a `which` property and may have a `what` property. (As stated above, it may also have a `name` property.)

The `commands.js` file also has a `tests` object. Its properties provide additional validity requirements for some tests. For example, one property of `tests` is:

```js
motion: [
  'Perform a motion test',
  {
    delay: [true, 'number', '', 'ms to wait before first screen shot'],
    interval: [true, 'number', '', 'ms between screen shots'],
    count: [true, 'number', '', 'count of screen shots to make']
  }
]
```

This property says that any `motion`-type test must, in addition to the required and optional properties of all tests, also have `delay`, `interval`, and `count` properties with number values.

There are two exceptions:
- `withItems`. For this property, the requirements array is always `[true, 'boolean']`. This means that the command must include a `withItems` property specifying whether or not item details should be included in the report.
- `expect`. Any `test` command that will validate the test must contain an `expect` property. The value of that property states an array of expected results. If an `expect` property is present in a `test` command, the report will tabulate and identify the expectations that are fulfilled or are violated by the results. For example, a `test` command might have this `expect` property:

```json
"expect": [
  ["total.links", "=", 5],
  ["total.links.underlined", "<", 6],
  ["total.links.outlined"],
  ["docLang", "!", "es-ES]
]
```

That would state the expectation that the `result` property of the report will have a `total.links` property with the value 5, a `total.links.underlined` property with a value less than 6, **no** `total.links.outlined` property, and a `docLang` property with a value different from `es-ES`.

The second item in each array, if there are 3 items in the array, is an operator, drawn from:
- `<`: less than
- `=`: equal to
- `>`: greater than
- `!`: unequal to

For each of the non-package tests defined in Testaro, a validating script and some files tested by it are also provided. They are in the `validation` directory. A module that you can use to execute those scripts is also there, named `validator.js`.

For example, to execute the `focOp.json` validation script, you can enter `node validation/validator focOp`. The `validator.js` module outputs the report to the console.

##### Scoring

An example of a **scoring** command is:

```json
{
  "type": "score",
  "which": "asp09",
  "what": "5 packages and 16 custom tests, with duplication discounts"
}
```

In this case, Testaro executes the procedure specified in the `asp09` score proc (in the `procs/score` directory) to compute a total score for the script or (if there is a batch) the host. The proc is a JavaScript module whose `scorer` function returns an object containing a total score and the itemized scores that yield the total.

The `scorer` function inspects the script report to find the required data, applies specific weights and formulas to yield the itemized scores, and combines the itemized scores to yield the total score.

The data for scores can include not only test results, but also log statistics. Testaro includes in each report the properties:
- `logCount`: how many log items the browser generated
- `logSize`: how large the log items were in the aggregate, in characters
- `prohibitedCount`: how many log items contain (case-insensitively) `403` and `status`, or `prohibited`
- `visitTimeoutCount`: how many times an attempt to visit a URL timed out
- `visitRejectionCount`: how many times a URL visit got an HTTP status other than 200 or 304

##### Branching

An example of a **branching** command is:

```json
{
  "type": "next",
  "if": ["totals.invalid", ">", 0],
  "jump": -4,
  "what": "redo search if any invalid elements"
}
```

This command checks the result of the previous act to determine whether its `result.totals.invalid` property has a positive value. If so, it changes the next command to be performed, specifying the command 4 commands before this one.

A `next`-type command can use a `next` property instead of a `jump` property. The value of the `next` property is a command name. It tells Testaro to continue performing commands starting with the command having that value as the value of its `name` property.

## Batches

There are two ways to use a script to give instructions to Testaro:
- The script can be the complete specification of the job.
- The script can specify the operations to perform, and a _batch_ can specify which pages to perform them on.

A batch is a JSON file with this format:

```json
{
  "what": "Accessibility standards",
  "hosts": [
    {
      "which": "https://www.w3.org/TR/WCAG21/",
      "what": "WCAG 2.1"
    },
    {
      "which": "https://www.w3.org/WAI/standards-guidelines/aria/",
      "what": "W3C WAI-ARIA"
    }
  ]
}
```

When you combine a script with a batch, Testaro performs the script, replacing the `which` and `what` properties of all `url` commands with the values in the first object in the `hosts` array, then again with the values in the second object, and so on. Those replacements also occur in the inserted extra `url` commands mentioned above.

A batch offers an efficient way to perform a uniform set of commands on every host in a set of hosts. In this way you can run the same set of tests on multiple web pages.

A no-batch script offers a way to carry out a complex operation, which can include navigating from one host to another, which is not possible with a batch. Any `url` commands are performed as-is, without changes to their URLs.

## Reports

Testaro produces reports as JavaScript objects. They contain detailed results.

When you run Testaro with a no-batch script, Testaro returns the report.

When you use a batch, Testaro writes one report per host into the `reports` directory in JSON format. Testaro also returns a list of the names of the files containing the reports.

## Execution

Testaro is executed with a statement in this format:

`node index options`

In this statement, `options` is an options object with a `script` property, whose value is the script object, and optionally a `withBatch` property, whose value is an object with a`what` property (a string describing the batch) and a `batch` property (the batch object).

The values of the required `script` and the optional `batch` properties are a script and a batch, respectively, not references to them.

If the script includes execution of the `wave` test, a WAVE API key must exist as the value of the environment variable `WAVE_KEY`.

## Contribution

You can define additional Testaro commands and functionality. Contributions are welcome.

## Accessibility principles

Testaro allows other tests to be defined, which can detect accessibility properties not discovered by any of the packages.

The rationales motivating tests can be found in comments within the files of those tests, in the `tests` directory.

### Future work

Further development is contemplated, is taking place, or is welcomed, on:
- links with href="#"
- links and buttons styled non-distinguishably
- first focused element not first focusable element in DOM
- never-visible skip links
- buttons with no text content
- modal dialogs
- autocomplete attributes

Additional test packages may be integratable into Testaro. The [`bbc-a11y`](https://github.com/bbc/bbc-a11y) package has been considered, but it has not been updated since 2018 and has vulnerable dependencies.

## Testing challenges

### Activation

Testing to determine what happens when a control or link is activated is straightforward, except in the context of a comprehensive set of tests of a single page. There, activating a control or link can change the page or navigate away from it, interfering with the remaining planned tests of the page.

The Playwright “Receives Events” actionability check does **not** check whether an event is dispatched on an element. It checks only whether a click on the location of the element makes the element the target of that click, rather than some other element occupying the same location.

### Test-package duplication

Test packages sometimes do redundant testing, in that two or more packages test for the same issues. But the testing and reporting are not necessarily identical. Therefore, the scoring procs currently made available by Testaro do not select a single package to test for a single issue. Instead, they allow all packages to test for all the issues they can test for, but decrease the weights placed on issues that multiple packages test for. The more packages test for an issue, the smaller the weight placed on each package’s finding of that issue.

## Repository exclusions

The files in the `temp` directory are presumed ephemeral and are not tracked by `git`. When tests require temporary files to be written, Testaro writes them there.

## More information

The `doc` directory may contain additional information.
