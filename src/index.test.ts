import * as assert from 'assert'
import * as fs from 'fs'
import * as path from 'path'
import { rmdir } from '@gradealabs/fs-utils'
import genji from './index'

describe('genji', function () {
  afterEach(function () {
    return rmdir('.genji')
  })

  it('should compile .ts and .js files into one bundle', function (done) {
    this.timeout(4000)

    genji(
      [
        'src/_fixtures/other.js',
        'src/_fixtures/index.ts'
      ],
      '.genji/out.js',
      {
        minify: true,
        sourceMaps: true,
        project: './tsconfig.test.json'
      }
    ).then(() => {
      assert.ok(fs.existsSync('.genji/out.js'))
      assert.ok(fs.existsSync('.genji/out.js.map'))
    }).then(done, done)
  })

  it('should compile a library bundle and expose a module', function (done) {
    this.timeout(8000)

    genji(
      [ 'react' ],
      '.genji/react.js',
      {
        minify: true,
        sourceMaps: true,
        project: './tsconfig.test.json',
        expose: [ 'react' ]
      }
    ).then(() => {
      assert.ok(fs.existsSync('.genji/react.js'))
      assert.ok(fs.existsSync('.genji/react.js.map'))
    }).then(() => {
      return genji(
        [ 'src/_fixtures/libuser.js' ],
        '.genji/libuser.js',
        {
          minify: true,
          sourceMaps: true,
          project: './tsconfig.test.json',
          external: [ 'react' ]
        }
      )
    }).then(() => {
      assert.ok(fs.existsSync('.genji/libuser.js'))
      assert.ok(fs.existsSync('.genji/libuser.js.map'))
    }).then(done, done)
  })
})
