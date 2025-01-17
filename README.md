# testaro

Federated accessibility test automation

## Summary

Testaro is a collection of collections of web accessibility tests.

The purpose of Testaro is to provide programmatic access to 1075 accessibility tests defined in several test packages and in Testaro itself.

## System requirements

Version 14 or later of [Node.js](https://nodejs.org/en/).

## Dependencies

Testaro uses:
- [Playwright](https://playwright.dev/) to launch browsers, perform user actions in them, and perform tests
- [pixelmatch](https://www.npmjs.com/package/pixelmatch) to measure motion

Testaro includes some of its own accessibility tests. In addition, it performs the tests in:
- [accessibility-checker](https://www.npmjs.com/package/accessibility-checker) (the IBM Equal Access Accessibility Checker)
- [alfa](https://alfa.siteimprove.com/) (Siteimprove alfa)
- [Continuum Community Edition](https://www.webaccessibility.com/tools/)
- [HTML CodeSniffer](https://www.npmjs.com/package/html_codesniffer) (Squiz HTML CodeSniffer)
- [axe-playwright](https://www.npmjs.com/package/axe-playwright) (Deque Axe-core)
- [Tenon](https://tenon.io/documentation/what-tenon-tests.php) (Level Access)
- [WAVE API](https://wave.webaim.org/api/) (WebAIM WAVE)

As of this version, the counts of tests in the packages referenced above were:
- Alfa: 103
- Axe-core: 138
- Continuum Community Edition: 267
- Equal Access: 163
- HTML CodeSniffer: 98
- Tenon: 180
- WAVE: 110
- subtotal: 612
- Testaro tests: 16
- grand total: 1075

## Code organization

The main directories containing code files are:
- package root: main code files
- `tests`: files containing the code defining particular tests
- `procs`: shared procedures
- `validation`: code and artifacts for the validation of Testaro

## Installation

Some of the dependencies of Testaro are published as Github packages. Installing Testaro therefore requires you to be authorized to read Github packages. If you do not yet have that authorization, you can give it to yourself as follows:
- Log in at [Github](https://github.com).
- From your avatar in the upper-right corner, choose “Settings”.
- In the left sidebar, choose “Developer settings”.
- In the left sidebar, choose “Personal access tokens”.
- Activate the button “Generate new token”.
- Give the new token a descriptive note.
- Select an expiration date.
- Check the checkbox `read:packages`.
- Activate the button “Generate token”.
- Copy the generated token (you can use the copy icon next to it).
- In the local directory of the project into which you will install Testaro, create a file named `.npmrc`, unless it already exists.
- Populate the `.npmrc` file with the following statements, replacing `abc` with your Github username and `xyz` with the token that you copied:

    ```bash
    @siteimprove:registry=https://npm.pkg.github.com
    //npm.pkg.github.com/:username=abc
    //npm.pkg.github.com/:_authToken=xyz
    ```

Once you have done that, you can install Testaro as you would install any `npm` package.

## Payment

All of the tests that Testaro can perform are free of cost, except those in the Tenon and WAVE packages. The owner of each of those packages gives new registrants a free allowance of credits before it becomes necessary to pay for use of the API of the package. The required environment variables for authentication and payment are described below under “Environment variables”.

## Specification

To use Testaro, you must specify what it should do. You do this with a script and optionally a batch.

## Scripts

### Introduction

To use Testaro, you provide a **script** to it. The script contains **commands**. Testaro _runs_ the script, i.e. performs the commands in it and writes a report of the results.

A script is a JSON file with the properties:

```json
{
  "what": "string: description of the script",
  "strict": "boolean: whether redirections should be treated as failures",
  "timeLimit": "number: limit in seconds on the execution of this script",
  "commands": "array of objects: the commands to be performed"
}
```

The `timeLimit` property is optional. If it is omitted, a default of 300 seconds (5 minutes) is set.

### Example

Here is an example of a script:

```javascript
{
  what: 'Test example.com with alfa',
  strict: true,
  timeLimit: 15,
  commands: [
    {
      type: 'launch',
      which: 'chromium',
      what: 'Chromium browser'
    },
    {
      type: 'url',
      which: 'https://example.com/',
      what: 'page with a few accessibility defects'
    },
    {
      type: 'test',
      which: 'alfa',
      what: 'Siteimprove alfa package'
    }
  ]
}
```

This script tells Testaro to open a page in the Chromium browser, navigate to `example.com`, and perform the tests in the `alfa` package on that URL.

### Strictness

If the `strict` property is `true`, Testaro will accept redirections that add or subtract a final slash, but otherwise will treat redirections as failures.

### Commands

#### Introduction

The `commands` property’s value is an array of command objects.

Each command has a `type` property and optionally has a `name` property (used in branching, described below). It must or may have other properties, depending on the value of `type`.

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

###### Introduction

The possible commands of type `test` are enumerated in the `tests` object defined in the `index.js` file.

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

In this case, Testaro runs the WAVE test with report type 1.

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

###### Tenon

The `tenon` test requires two commands:
- A command of type `tenonRequest`.
- A command of type `test` with `tenon` as the value of `which`.

Example:

```json
  {
    "type": "tenonRequest",
    "id": "a",
    "withNewContent": true,
    "what": "Tenon API version 2 test request"
  }
  ```

  followed by

```json
  {
    "type": "test",
    "which": "tenon",
    "id": "a",
    "what": "Tenon API version 2 result retrieval"
  }
```

The reason for this is that the Tenon API operates asynchronously. You ask it to perform a test, and it puts your request into a queue. To learn whether Tenon has completed your test, you make a status request. You can continue making status requests until Tenon replies that your test has been completed. Then you submit a request for the test result, and Tenon replies with the result. (As of May 2022, status requests were observed to misreport still-running tests as completed. The `tenon` test works around that by requesting only the result and using the response to determine whether the tests have been completed.)

Tenon says that tests are typically completed in 3 to 6 seconds but that the latency can be longer, depending on demand.

Therefore, you can include a `tenonRequest` command early in your script, and a `tenon` test command late in your script. Tenon will move your request through its queue while Testaro is processing your script. When Testaro reaches your `tenon` test command, Tenon will most likely have completed your test. If not, the `tenon` test will wait and then make a second request before giving up.

Thus, a `tenon` test actually does not perform any test; it merely collects the result. The page that was active when the `tenonRequest` command was performed is the one that Tenon tests.

In case you want to perform more than one `tenon` test with the same script, you can do so. Just give each pair of commands a distinct `id` property, so each `tenon` test command will request the correct result.

Tenon recommends giving it a public URL rather than giving it the content of a page, if possible. So, it is best to give the `withNewContent` property of the `tenonRequest` command the value `true`, unless the page is not public.

###### HTML CodeSniffer

The `htmlcs` test makes use of the`htmlcs/HTMLCS.js` file. That file was created, and can be recreated if necessary, as follows:

1. Clone the (HTML CodeSniffer package)[https://github.com/squizlabs/HTML_CodeSniffer].
1. Make that package’s directory the active directory.
1. Install the HTML CodeSniffer dependencies by executing `npm install`.
1. Build the HTML CodeSniffer auditor by executing `grunt build`.
1. Copy the `build/HTMLCS.js` and `build/licence.txt` files into the `htmlcs` directory of Testaro.
1. Edit the Testaro copy of `htmlcs/HTMLCS.js` to produce the changes shown below.

The changes in `htmlcs/HTMLCS.js` are:

```diff
479a480
>     '4_1_2_attribute': 'attribute',
6482a6484
>     var messageStrings = new Set();
6496d6497
<         console.log('done');
6499d6499
<         console.log('done');
6500a6501
>       return Array.from(messageStrings);
6531c6532,6534
<       console.log('[HTMLCS] ' + typeName + '|' + msg.code + '|' + nodeName + '|' + elementId + '|' + msg.msg + '|' + html);
---
>       messageStrings.add(
>         typeName + '|' + msg.code + '|' + nodeName + '|' + elementId + '|' + msg.msg + '|' + html
>       );
```

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

#### Commands file

##### Introduction

The `commands.js` file contains rules governing commands. The rules determine whether a command is valid.

##### Rule format

The rules in `commands.js` are organized into two objects, `etc` and `tests`. The `etc` object contains rules for commands of all types. The `tests` object contains additional rules that apply to some commands of type `test`, depending on the values of their `which` properties, namely which tests they perform.

Here is an example of a command:

```json
{
  "type": "link",
  "which": "warming",
  "what": "article on climate change"
}
```

And here is the applicable property of the `etc` object in `commmands.js`:

```js
link: [
  'Click a link',
  {
    which: [true, 'string', 'hasLength', 'substring of the link text'],
    what: [false, 'string', 'hasLength', 'comment']
  }
]
```

The rule is an array with two elements: a string ('Click a link') describing the command and an object containing requirements for any command of type `link`.

The requirement `which: [true, 'string', 'hasLength', 'substring of the link text']` specifies what is required for the `which` property of a `link`-type command. The requirement is an array.

In most cases, the array has length 4:
- 0. Is the property (here `which`) required (`true` or `false`)? The value `true` here means that every `link`-type command **must** contain a `which` property.
- 1. What format must the property value have (`'string'`, `'array'`, `'boolean'`, or `'number'`)?
- 2. What other validity criterion applies (if any)? (Empty string if none.) The `hasLength` criterion means that the string must be at least 1 character long.
- 3. Description of the property. Here, the value of `which` is some substring of the text content of the link that is to be clicked. Thus, a `link` command tells Testaro to find the first link whose text content has this substring and click it.

The validity criterion named in item 2 may be any of these:
- `'hasLength'`: is not a blank string
- `'isURL`': is a string starting with `http`, `https`, or `file`, then `://`, then ending with 1 or more non-whitespace characters
- `'isBrowserType'`: is `'chromium'`, `'firefox'`, or `'webkit'`
- `'isFocusable'`: is `'a'`, `'button'`, `'input'`, `'select'`, or `'option'`
- `'isState'`: is `'loaded'` or `'idle'`
- `'isTest'`: is the name of a test
- `'isWaitable'`: is `'url'`, `'title'`, or `'body'`
- `'areStrings'`: is an array of strings

When `commands.js` specifies a `withItems` requirement for a `test`-type command, that requirement is an array of length 2, and is always `[true, 'boolean']`. That means that this `test`-type command must have a `withItems` property, whose value must be `true` or `false`. That property tells Testaro whether to itemize the results of that test.

Any `test` command can also (in addition to the requirements in `commands.js`) contain an `expect` requirement. If it does, that requirement has a different format: an array of any non-0 length. The items in that array specify expectations about the results of the test.

For example, a `test` command might have this `expect` property:

```json
"expect": [
  ["total.links", "=", 5],
  ["total.links.underlined", "<", 6],
  ["total.links.outlined"],
  ["docLang", "!", "es-ES]
]
```

That would state the expectation that the `result` property of the `acts` item for that test in the report will have a `total.links` property with the value 5, a `total.links.underlined` property with a value less than 6, **no** `total.links.outlined` property, and a `docLang` property with a value different from `es-ES`.

The second item in each array, if there are 3 items in the array, is an operator, drawn from:
- `<`: less than
- `=`: equal to
- `>`: greater than
- `!`: unequal to

A typical use for an `expect` property is checking the correctness of a Testaro test. Thus, the validation scripts in the `validation/tests/scripts` directory all contain `test` commands with `expect` properties. See the “Validation” section below.

## Batches

You may wish to have Testaro perform the same sequence of tests on multiple web pages. In that case, you can create a _batch_, with the following structure:

```javascript
{
  what: 'Web leaders',
  hosts: {
    id: 'w3c',
    which: 'https://www.w3.org/',
    what: 'W3C'
  },
  {
    id: 'wikimedia',
    which: 'https://www.wikimedia.org/',
    what: 'Wikimedia'
  }
}
```

With a batch, you can execute a single statement to run a script multiple times, one per host. On each call, Testaro takes one of the hosts in the batch and substitutes it for each host specified in a `url` command of the script. The result is a _host script_. Testaro sequentially runs all of those host scripts.

Therefore, you cannot use a batch with a script that changes URLs.

## Samples

The `samples` directory contains examples of scripts and batches. If you wish to use them in their current locations, you can give `SCRIPTDIR` the value `'samples/scripts'` and `BATCHDIR` the value `'samples/batches'`. Then execute `node high sss` to run the `sss` script alone or `node high sss bbb` to run the `sss` script with the `bbb` batch (e.g., `node create simple weborgs`). The `high` module will create a job, run the script or host scripts, and save the report(s) in the directory that you have specified with the `REPORTDIR` environment variable.

## Execution

### Invocation

There are three methods for using Testaro.

#### Low-level

A module in this package can invoke Testaro with this pattern:

```javascript
const report = {
  script: {…},
  log: [],
  acts: []
};
const {handleRequest} = require('./run');
handleRequest(report)
.then(() => …);
```

Replace `{…}` with a script object, like the example script shown above. The low-level method does not allow the use of batches.

The argument of `require` is a path relative to the directory of the module in which this code appears. If the module is in a subdirectory, `./run` will need to be revised. In an executor within `validation/executors`, it must be revised to `../../run`.

Another Node.js package that has Testaro as a dependency can execute the same statements, except changing `'./run'` to `'testaro/run'`.

Testaro will run the script and populate the `log` and `acts` arrays of the `report` object. When Testaro finishes, the `log` and `acts` properties will contain the results. The final statement can further process the `report` object as desired in the `then` callback.

#### High-level

Make sure that you have defined these environment variables, with absolute or relative paths to directories as their values:
- `SCRIPTDIR`
- `BATCHDIR`
- `REPORTDIR`

Relative paths must be relative to the Testaro project directory. For example, if the script directory is `scripts` in a `testing` directory that is a sibling of the Testaro directory, then a relative-path `SCRIPTDIR` must have the value `../testing/scripts`.

Also ensure that Testaro can read all those directories and write to `REPORTDIR`.

Place a script into `SCRIPTDIR` and, optionally, a batch into `BATCHDIR`. Each should be named `idvalue.json`, where `idvalue` is replaced with the value of its `id` property. That value must consist of only lower-case ASCII letters and digits.

Then execute the statement `node high scriptID` or `node high scriptID batchID`, replacing `scriptID` and `batchID` with the `id` values of the script and the batch, respectively.

The `high` module will call the `runJob` function of the `create` module, which in turn will call the `handleRequest` function of the `run` module. The results will be saved in report files in the `REPORTDIR` directory.

If there is no batch, the report file will be named with a unique timestamp, suffixed with a `.json` extension. If there is a batch, then the base of each report file’s name will be the same timestamp, suffixed with `-hostid`, where `hostid` is the value of the `id` property of the `host` object in the batch file. For example, if you execute `node create script01 wikis`, you might get these report files deposited into `REPORTDIR`:
- `enp46j-wikipedia.json`
- `enp45j-wiktionary.json`
- `enp45j-wikidata.json`

#### Watch

In watch mode, Testaro periodically checks for a job to be run by it, containing a script and, optionally, a batch. When such a job exists, Testaro runs the script, or uses the batch to create a set of host scripts and sequentially runs them. After running the script or each host script, Testaro converts the report to JSON and disposes of it as specified.

Testaro checks periodically. The interval between checks, in seconds, is specified by an `INTERVAL` environment variable.

After Testaro starts watching, its behavior depends on the environment variable `WATCH_FOREVER`. If its value is `true`, watching continues indefinitely. If its value is `false` or it has no value, watching stops after the first job is found and run.

To make Testaro start watching, execute the statement `node watch`.

There are two ways for Testaro to watch for jobs.

##### Directory watch

With directory watch, Testaro checks whether a particular directory in its host’s filesystem contains a job file. A job file is a JSON-format file named `abc.json` representing an object like this:

```json
{
  "script": {…},
  "batch": {…}
}
```

The `batch` property is optional. The value `abc` may be replaced with any string of lower-case ASCII letters and digits.

When Testaro finds job files in the directory, Testaro runs the first job, writes the report(s) into the report directory, and moves the job file into the ex-jobs directory.

Testaro suspends checking while it is running any job. Therefore, even though the currently running job file remains in `JOBDIR`, Testaro will not try to run it again.

Since Testaro runs the first job (i.e. the job whose name is first in ASCII order), whoever populates the directory with job files has control over the order in which Testaro runs them. For example, to force a new job to be run before the already waiting jobs, one can give it a filename that comes before that of the first waiting job.

In order to make directory watching possible, you must define these environment variables:
- `WATCH_TYPE=dir`
- `INTERVAL`
- `WATCH_FOREVER` (`=true` or `=false`)
- `REPORTDIR`
- `JOBDIR`
- `EXJOBDIR`

##### Network watch

With network watch, Testaro asks a particular API whether it has any jobs for the current instance of Testaro, identified by an authorization code. If the response is a JSON representation of an object satisfying the same requirements as given above under “Directory watch”, Testaro runs the job and sends the report(s) to the API.

Thus, if there are multiple jobs queued for the Testaro instance, the API is responsible for choosing one of them to send in response.

When the API receives the reports, it can dispose of them as desired. Each report is a JSON representation of an object, which has these identification properties:
- `jobID`
- `timeStamp`
- `id`

The `jobID` property can be used for an association between each report and the job that it arose from. The `timeStamp` property can be used for an association of all the reports in a batched job. And the `id` property (which begins with the time stamp) is unique to each report.

In order to make network watching possible, you must define these environment variables:
- `WATCH_TYPE=net`
- `INTERVAL`
- `WATCH_FOREVER` (`=true` or `=false`)
- `PROTOCOL` (`=http` or `=https`)
- `JOB_URL` (not including the authorization code)
- `REPORT_URL` (not including the authorization code)

### Environment variables

As mentioned above, using the high-level method to run Testaro jobs requires `SCRIPTDIR`, `BATCHDIR`, and `REPORTDIR` environment variables.

If a `tenon` test is included in the script, environment variables named `TENON_USER` and `TENON_PASSWORD` must exist, with your Tenon username and password, respectively, as their values.

If a `wave` test is included in the script, an environment variable named `WAVE_KEY` must exist, with your WAVE API key as its value.

The `text` command can interpolate the value of an environment variable into text that it enters on a page, as documented in the `commands.js` file.

Before executing a Testaro script, you can optionally also set the environment variables `DEBUG` (to `'true'` or anything else) and/or `WAITS` (to a non-negative integer). The effects of these variables are described in the `index.js` file.

You may store these environment variables in an untracked `.env` file if you wish, and Testaro will recognize them.

## Validation

### Validators

Testaro and its custom tests can be validated with the _executors_ located in the `validation/executors` directory.

The executors are:

- `low`: validates low-level invocation
- `high1`: validates high-level invocation of a script without a batch
- `high2`: validates high-level invocation of a script with a batch
- `watchDir`: validates directory watching
- `watchNet`: validates network watching
- `tests`: validates all the custom tests (not the test packages)

To execute any executor `xyz`, call it with the statement `node validation/executors/xyz`.

The `tests` executor makes use of the scripts in the `validation/tests/scripts` directory, and they, in turn, run tests on HTML files in the `validation/tests/targets` directory.

## Contribution

You can define additional Testaro commands and functionality. Contributions are welcome.

Please report any issues, including feature requests, at the [repository](https://github.com/jrpool/testaro/issues).

## Accessibility principles

The rationales motivating the Testaro-defined tests can be found in comments within the files of those tests, in the `tests` directory. Unavoidably, each test is opinionated. Testaro itself, however, can accommodate other tests representing different opinions. Testaro is intended to be neutral with respect to questions such as the criteria for accessibility, the severities of accessibility issues, whether accessibility is binary or graded, and the distinction between usability and accessibility.

## Testing challenges

### Abnormal termination

On rare occasions a test throws an error that terminates the Node process and cannot be handled with a `try`-`catch` structure. It has been observed, for example, that the `ibm` test does this when run on the host at `https://zenythgroup.com/index` or `https://monsido.com`.

If a single process performed all of the commands in a batch-based script, the process could perform tens of thousands of commands, and such an error could stop the process at any point.

To handle this risk, Testaro processes batch-based jobs by forking a new process for each host. If such an error occurs, it crashes the child process, preventing a report for that host from being written. The parent process waits for the report to appear in the `REPORTDIR` directory until the time limit. When it fails to appear, the parent process continues to the next host.

If you are using high-level invocation, your terminal will show the standard output of the parent process and, if there is a batch, the current child process, too. If you interrupt the process with `CTRL-c`, you will send a `SIGINT` signal to the parent process, which will handle it by sending a message to the child process telling it to terminate itself, and then the parent process will terminate by skipping the remaining hosts.

### Activation

Testing to determine what happens when a control or link is activated is straightforward, except in the context of a comprehensive set of tests of a single page. There, activating a control or link can change the page or navigate away from it, interfering with the remaining planned tests of the page.

The Playwright “Receives Events” actionability check does **not** check whether an event is dispatched on an element. It checks only whether a click on the location of the element makes the element the target of that click, rather than some other element occupying the same location.

### Test-package duplication

Test packages sometimes do redundant testing, in that two or more packages test for the same issues, although such duplications are not necessarily perfect. This fact creates three problems:
- One cannot be confident in excluding some tests of some packages on the assumption that they perfectly duplicate tests of other packages.
- The Testaro report from a script documents each package’s results separately, so a single difect may be documented in multiple locations within the report, making the consumption of the report inefficient.
- An effort to aggregate the results into a single score may distort the scores by inflating the weights of defects that happen to be discovered by multiple packages.

The tests provided with Testaro do not exclude any apparently duplicative tests from packages.

To deal with the above problems, you can:
- revise package `test` commands to exclude tests that you consider duplicative
- create derivative reports that organize results by defect types rather than by package
- take duplication into account when defining scoring rules

Some measures of these kinds are included in the scoring and reporting features of the Testilo package.

## Repository exclusions

The files in the `temp` directory are presumed ephemeral and are not tracked by `git`.

## Related packages

[Testilo](https://www.npmjs.com/package/testilo) is an application that:
- produces scores and adds them to the JSON report files of Testaro
- produces human-oriented HTML digests from scored reports
- produces human-oriented HTML reports comparing the scores of hosts

Testaro is derived from [Autotest](https://github.com/jrpool/autotest).

Testaro omits some functionalities of Autotest, such as:
- tests producing results intended to be human-inspected
- scoring (performed now by Testilo)
- file operations for score aggregation, report revision, and HTML reports
- a web user interface

## Code style

The JavaScript code in this project generally conforms to the ESLint configuration file `.eslintrc`. However, the `htmlcs/HTMLCS.js` file implements an older version of JavaScript. Its style is regulated by the `htmlcs/.eslintrc.json` file.

## Origin

Work on the custom tests in this package began in 2017, and work on the multi-package federation that Testaro implements began in early 2018. These two aspects were combined into the [Autotest](https://github.com/jrpool/autotest) package in early 2021 and into the more single-purpose packages, Testaro and Testilo, in January 2022.

## Etymology

“Testaro” means “collection of tests” in Esperanto.
