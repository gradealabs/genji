# Genji

Compiles .ts/.tsx/.js/.jsx files into a bundle suitable for the browser.

## Quick Start

    npm install @gradealabs/genji -S

To use the API:

    import genji from '@gradealabs/genji'

    genji([ 'src/index.ts' ], 'dest/out.js', {
      minify: true,
      sourceMaps: true,
      standalone: true
    })
      .then(() => console.log('done!'))
      .catch(error => console.error(error))

To use the CLI:

    {
      "scripts": {
        "build:scripts": "genji -M -S --standalone -O dest/out.js src/index.ts"
      }
    }

## CLI

    Usage: genji [options] file.ts file.js file.jsx file.tsx ...

    Options:
    --config          Path to JSON config file
    --verbose, -V     Determines if elapsed time will be logged          [boolean]
    --watch, -W       Watch the entry files for changes [boolean] [default: false]
    --minify, -M      Minify the generated bundle       [boolean] [default: false]
    --sourcemaps, -S  Generate source maps              [boolean] [default: false]
    --outfile, -O     The bundle output file                            [required]
    --standalone      Generate a UMD bundle for this export name
    --project, -P     The directory containing or path to your tsconfig.json
                                                            [string] [default: "."]
    --expose, -E      The exposed module identifiers for each entry file   [array]
    --external, -X    External module identfiers to treat as external modules
                                                                            [array]
    --help            Show help                                          [boolean]

Example:

    node ./node_modules/.bin/genji -M -S -O dest/out.js src/index.jsx

Or in a `package.json` (installed locally):

    {
      "scripts": {
        "build:scripts": "genji -M -S -O dest/out.js src/index.js"
      }
    }

If `--standalone` is truthy then the globally exported UMD module name will be
the same as the value of the `name` field in your `./package.json` file.

    genji -M -S -O dest/out.js --standalone src/index.jsx

Alternatively, `--standalone` can be set to a custom UMD module name as well.

genji -M -S --standalone MyModule -O dest/out.js src/index.jsx

## Compiling Libraries

You can use Genji to compile code libraries by leveraging browserify's `expose`
and `external` options.

    genji lib/mylib.js react react-dom -E mylib react react-dom -O dest/lib.js
    genji src/index.js -X mylib react react-dom -O dest/index.js

This example will compile a `dest/lib.js` bundle that contains `lib/mylib.js`,
`react` and `react-dom` (exposed as module IDs `mylib`, `react` and `react-dom`).
Then it will compile a `dest/index.js` bundle that externalizes the module IDs
`mylib`, `react` and `react-dom` (i.e. they won't be included in the bundle). To
load `dest/index.js` you will have to ensure that `dest/lib.js` is loaded first
in the browser.

    <script src="/dest/lib.js"></script>
    <script src="/dest/index.js"></script>

*Why do this?*

There are a few benefits:

1) Reduce compilation time since bundles only ever need to be re-compiled unless
   their source files change. So you could compile a bundle for modules in
   `node_modules` just once.

2) Since, not all source will be changing with the same frequency, your users
   can cache library bundle code for much longer periods, thereby reducing the
   amount of bytes they have to download when code does change.

However, there is now overhead in managing this code-library relationship,
ensuring that the appropirate library bundles are loaded first.

## API

**genji(entryFiles, outFileName, options)**

Compile and bundle the entry files into a single file suitable for the browser.

Supported options:

- `watch` {default: false} Watch the source modules and re-compile when they change
- `minify` {default: false} Minify the output bundle
- `sourceMaps` {default: false} Generate a separate source map file
- `standalone` {default: ''} The name of the UMD global export
- `project` {default: '.'} The directory or file path to a tsconfig.json
- `expose` The exposed module identifiers for each entry file
- `external` External module identfiers to treat as external modules

*NOTE: When `watch` is true, the promise returned will never be resolved.*

Example:

    import genji from '@gradealabs/genji'

    genji([ 'src/index.ts' ], 'dest/out.js', {
      minify: true,
      sourceMaps: true,
      standalone: 'MyModule',
      project: 'tsconfig.json'
    })
      .then(() => console.log('done!'))
      .catch(error => console.error(error))

## Building

To build the source

    npm run build
    npm run build:node

To clean all generated folders

    npm run clean

## Testing

Unit tests are expected to be colocated next to the module/file they are testing
and have the following suffix `.test.js`.

To run unit tests through [istanbul](https://istanbul.js.org/) and
[mocha](http://mochajs.org/)

    npm test

## Maintainence

To check what modules in `node_modules` is outdated

    npm run audit

To update outdated modules while respecting the semver rules in the package.json

    npm update

To update a module to the latest major version (replacing what you have)

    npm install themodule@latest -S (if to save in dependencies)
    npm install themodule@latest -D (if to save in devDependencies)
