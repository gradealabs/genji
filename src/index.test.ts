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
})
