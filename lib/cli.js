#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const yargs = require("yargs");
const index_1 = require("./index");
if (require.main === module) {
    yargs(process.argv.slice(2))
        .usage('Usage: genji [options] file.ts file.js file.jsx file.tsx ...')
        .env('GENJI')
        .config()
        .options({
        'verbose': {
            alias: 'V',
            type: 'boolean',
            describe: 'Determines if elapsed time will be logged'
        },
        'watch': {
            alias: 'W',
            type: 'boolean',
            default: false,
            describe: 'Watch the entry files for changes'
        },
        'minify': {
            alias: 'M',
            type: 'boolean',
            default: false,
            describe: 'Minify the generated bundle'
        },
        'sourcemaps': {
            alias: 'S',
            type: 'boolean',
            default: false,
            describe: 'Generate source maps'
        },
        'outfile': {
            alias: 'O',
            type: ['string', 'array'],
            demandOption: true,
            describe: 'The bundle output file'
        },
        'standalone': {
            type: ['string', 'boolean'],
            describe: 'Generate a UMD bundle for this export name'
        },
        'project': {
            alias: 'P',
            type: 'string',
            default: '.',
            describe: 'The directory containing or path to your tsconfig.json'
        },
        'expose': {
            alias: 'E',
            type: 'array',
            defaultValue: [],
            describe: 'The exposed module identifiers for each entry file'
        },
        'external': {
            alias: 'X',
            type: 'array',
            defaultValue: [],
            describe: 'External module identfiers to treat as external modules'
        }
    })
        .help();
    const argv = yargs.argv;
    if (argv._.length === 0) {
        yargs.showHelp();
    }
    else {
        const start = new Date().getTime();
        let standalone = argv.standalone;
        if (standalone === true) {
            standalone = JSON.parse(fs.readFileSync('package.json', 'utf8')).name;
        }
        index_1.default(argv._, [].concat(argv.outfile).pop(), {
            minify: argv.minify,
            watch: argv.watch,
            standalone,
            sourceMaps: argv.sourcemaps,
            project: argv.project,
            expose: argv.expose,
            external: argv.external
        })
            .then(() => new Date().getTime() - start)
            .then(elapsed => {
            if (argv.verbose) {
                console.log('Genji complete!', (elapsed / 1000).toFixed(2), 'seconds');
            }
        })
            .catch(error => console.error(error));
    }
}
else {
    throw new Error('genji is only meant to be run at the command line');
}
