import { isPhoneNumber } from '../../prompt'

// some extra test case numbers from Phone Number
// GitHub Issue: https://github.com/lakeraai/chrome-extension/issues/1
const testNumbersUS = [
  '+1 (617) 867-5309',
  '+1-617-867-5309',
  '+1.617.867.5309',
  '+1 617 867 5309',
  '617-867-5309',
  '617.867.5309',
  '617 867 5309',
  '(617) 867-5309',
  '00(617) 867-5309'
]

// some formats that are just kind of broken and hard to parse
const testNonNumbersUS = ['00617 867 5309', '00617-867-5309', '00617.867.5309']

// we'll default to the Swiss locale for these tests
const navigator = { language: 'de-CH' }

Object.defineProperty(globalThis, 'navigator', {
  value: navigator,
  writable: true,
  configurable: true
})

afterEach(() => {
  navigator.language = 'de-CH'
})

describe('Phone numbers', () => {
  describe('True positives', () => {
    test('phone number with 41 country code', () => {
      expect(isPhoneNumber('41747587256').pii).toBe(true)
    })

    test('phone number with +41 country code', () => {
      expect(isPhoneNumber('+41747587256').pii).toBe(true)
    })

    test('phone number with 41 country code and spaces', () => {
      expect(isPhoneNumber('41 747 587 256').pii).toBe(true)
    })

    test('phone number with +41 country code and spaces', () => {
      expect(isPhoneNumber('+41 747 587 256').pii).toBe(true)
    })

    test('phone number with 41 country code and dashes', () => {
      expect(isPhoneNumber('41-747-587-256').pii).toBe(true)
    })

    test('phone number with +41 country code and dashes', () => {
      expect(isPhoneNumber('+41-747-587-256').pii).toBe(true)
    })

    test('phone number with 41 country code and parentheses', () => {
      expect(isPhoneNumber('41(747)587256').pii).toBe(true)
    })

    test('phone number with +41 country code and parentheses', () => {
      expect(isPhoneNumber('+41(747)587256').pii).toBe(true)
    })

    test('phone number with 41 country code and parentheses and spaces and dashes', () => {
      expect(isPhoneNumber('41 (747)--587-256').pii).toBe(true)
    })

    test('phone number with +41 country code and parentheses and spaces', () => {
      expect(isPhoneNumber('+41-(747) 587--256').pii).toBe(true)
    })

    test('phone number with 41 country code and in context', () => {
      expect(isPhoneNumber('I texted my friend at 41747587256').pii).toBe(true)
    })

    test('phone number with +41 country code and in context', () => {
      expect(isPhoneNumber('I texted my friend at +41747587256').pii).toBe(true)
    })

    describe('US phone number with dashes instead of parentheses', () => {
      test('user locale is CH', () => {
        expect(isPhoneNumber('617-867-5309').pii).toBe(true)
      })

      test('user locale is US', () => {
        navigator.language = 'en-US'
        expect(isPhoneNumber('617-867-5309').pii).toBe(true)
      })
    })

    describe('Extra test cases', () => {
      test.each(testNumbersUS)('Test: %s', (num) => {
        navigator.language = 'en-US'
        expect(isPhoneNumber(num).pii).toBe(true)
      })

      test.each(testNonNumbersUS)('Test: %s', (num) => {
        navigator.language = 'en-US'
        expect(isPhoneNumber(num).pii).toBe(false)
      })
    })
  })

  describe('False positives', () => {})

  describe('True negatives', () => {
    test('phone number with split digits', () => {
      expect(
        isPhoneNumber(
          'I wrote +1 essays once and I got 1234 reviewers on them, then others came and were 134561'
        ).pii
      ).toBe(false)
    })
  })

  describe('Edge cases', () => {
    test('Swiss phone number with 41 country code and random characters', () => {
      expect(isPhoneNumber('41 asdadsa-747-587-256').pii).toBe(true)
    })

    test('phone number with +41 country code and random characters', () => {
      expect(isPhoneNumber('+41 asdadsa-747-587-256').pii).toBe(true)
    })

    test('phone number without country code', () => {
      expect(isPhoneNumber('747587256').pii).toBe(true)
    })

    test('phone number with less than 11 digits', () => {
      expect(isPhoneNumber('+4174758725').pii).toBe(false)
    })
  })
})
