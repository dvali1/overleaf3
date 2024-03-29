/* eslint-disable
    no-undef
*/
// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { expect, assert } from 'chai'
import esmock from 'esmock'

describe('ASpell', function () {
  beforeEach(async function () {
    this.ASpell = await esmock('../../../app/js/ASpell', {
      '@overleaf/metrics': {
        gauge() {},
        inc() {},
      },
    })
  })

  describe('a correctly spelled word', function () {
    beforeEach(function (done) {
      return this.ASpell.checkWords('en', ['word'], (error, result) => {
        if (error) return done(error)
        this.result = result
        return done()
      })
    })

    return it('should not correct the word', function () {
      return this.result.length.should.equal(0)
    })
  })

  describe('a misspelled word', function () {
    beforeEach(function (done) {
      return this.ASpell.checkWords('en', ['bussines'], (error, result) => {
        if (error) return done(error)
        this.result = result
        return done()
      })
    })

    return it('should correct the word', function () {
      this.result.length.should.equal(1)
      return this.result[0].suggestions.indexOf('business').should.not.equal(-1)
    })
  })

  describe('multiple words', function () {
    beforeEach(function (done) {
      return this.ASpell.checkWords(
        'en',
        ['bussines', 'word', 'neccesary'],
        (error, result) => {
          if (error) return done(error)
          this.result = result
          return done()
        }
      )
    })

    return it('should correct the incorrect words', function () {
      this.result[0].index.should.equal(0)
      this.result[0].suggestions.indexOf('business').should.not.equal(-1)
      this.result[1].index.should.equal(2)
      return this.result[1].suggestions
        .indexOf('necessary')
        .should.not.equal(-1)
    })
  })

  describe('without a valid language', function () {
    beforeEach(function (done) {
      return this.ASpell.checkWords('notALang', ['banana'], (error, result) => {
        this.error = error
        this.result = result
        return done()
      })
    })

    return it('should return an error', function () {
      return expect(this.error).to.exist
    })
  })

  describe('when there are no suggestions', function () {
    beforeEach(function (done) {
      return this.ASpell.checkWords(
        'en',
        ['asdkfjalkdjfadhfkajsdhfashdfjhadflkjadhflajsd'],
        (error, result) => {
          this.error = error
          this.result = result
          return done()
        }
      )
    })

    return it('should return a blank array', function () {
      this.result.length.should.equal(1)
      return assert.deepEqual(this.result[0].suggestions, [])
    })
  })

  return describe('when the request times out', function () {
    beforeEach(function (done) {
      const words = __range__(0, 1000, true).map(i => 'abcdefg' + i)
      this.ASpell.setTimeout(1)
      this.start = Date.now()
      return this.ASpell.checkWords('en', words, (error, result) => {
        expect(error).to.exist
        this.result = result
        return done()
      })
    })

    // Note that this test fails on OS X, due to differing pipe behaviour
    // on killing the child process. It can be tested successfully on Travis
    // or the CI server.
    return it('should return in reasonable time', function () {
      const delta = Date.now() - this.start
      return delta.should.be.below(1000)
    })
  })
})

function __range__(left, right, inclusive) {
  const range = []
  const ascending = left < right
  const end = !inclusive ? right : ascending ? right + 1 : right - 1
  for (let i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
    range.push(i)
  }
  return range
}
