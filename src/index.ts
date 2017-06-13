import * as fs from 'fs'
import * as path from 'path'
import * as browserify from 'browserify'
import * as exorcist from 'exorcist'
import * as tsify from 'tsify'
import * as uglifyify from 'uglifyify'
import * as watchify from 'watchify'
import * as UglifyJs from 'uglify-js'
import { mkdir } from '@gradealabs/fs-utils'

/**
 * Bundles the specified entry script files.
 */
export default function genji (entries: string[], outFileName: string, { standalone = '', project = '.', sourceMaps = false, minify = false, watch = false, expose = [], external = [] } = {}): Promise<void> {
  return mkdir(path.dirname(outFileName)).then(() => {
    const b = browserify({
      standalone,
      cache: {},
      packageCache: {},
      debug: sourceMaps
    })

    if (Array.isArray(expose) && expose.length) {
      if (expose.length === entries.length) {
        entries.forEach((f, i) => b.require(f, { expose: expose[i] }))
      } else {
        return Promise.reject(Object.assign(
          new Error('Expose must be explicitly specified for each entry file'),
          { code: 'EINVALIDEXPOSE' }
        ))
      }
    } else if (Array.isArray(external) && external.length) {
      b.add(entries)
      external.forEach(n => b.external(n))
    } else {
      b.add(entries)
    }

    b.plugin(tsify, { 'project': project })

    if (watch) {
      // See: https://www.npmjs.com/package/watchify#options
      b.plugin(watchify, {
        delay: 250,
        ignoreWatch: '**/node_modules/**',
        poll: false
      })
    }

    // NOTE: As usual there's a module that doesn't play nice with the others.
    // uglifyify appears to have problems with source maps.
    // if (minify) {
    //   b.transform(uglifyify)
    // }

    function bundle () {
      if (watch) {
        console.log('Genji bundle started...')
      }

      return new Promise((resolve, reject) => {
        const outFileStream = fs.createWriteStream(outFileName)
        let stream = b.bundle()
          .on('error', error => reject(error))

        if (sourceMaps && !minify) {
          stream = stream.pipe(exorcist(outFileName + '.map'))
        }

        stream.pipe(outFileStream)
          .on('close', () => {
            if (minify) {
              uglify(outFileName, { sourceMaps })
                .then(() => {
                  if (watch) {
                    console.log('Genji bundle complete')
                  }
                  resolve()
                }, reject)
            } else {
              console.log('Genji bundle complete')
              resolve()
            }
          })
      })
    }

    if (watch) {
      b.on('update', () => {
        bundle().catch(error => console.error(error))
      })
      bundle().catch(error => console.error(error))
      return new Promise((resolve, reject) => {
        // long running task so we never call resolve()
      })
    } else {
      return bundle()
    }
  })
}

/**
 * Uglify a file and overwrite it with the minified version. If source maps are
 * enabled then expects the source map to be inlined in the file being minified,
 * but will save the final source map next to the minified file.
 *
 * @param {string} fileName
 * @return {Promise<void>}
 */
function uglify (fileName, { sourceMaps = false } = {}) {
  return new Promise((resolve, reject) => {
    fs.readFile(fileName, 'utf8', (error, code) => {
      error ? reject(error) : resolve(code)
    })
  })
  .then(code => {
    const result = UglifyJs.minify(code, {
      mangle: true,
      compress: { passes: 1 },
      sourceMap: sourceMaps
        ? {
          content: 'inline',
          filename: path.basename(fileName),
          url: path.basename(fileName) + '.map'
        }
        : undefined
    })
    if (result.error) {
      return Promise.reject(result.error)
    } else {
      return result
    }
  })
  .then(({ code, map }) => {
    return Promise.all([
      new Promise((resolve, reject) => {
        fs.writeFile(fileName, code, 'utf8', error => {
          error ? reject(error) : resolve()
        })
      }),
      sourceMaps && new Promise((resolve, reject) => {
        fs.writeFile(
          fileName + '.map',
          map.toString(),
          'utf8',
          error => error ? reject(error) : resolve()
        )
      })
    ])
  })
}
