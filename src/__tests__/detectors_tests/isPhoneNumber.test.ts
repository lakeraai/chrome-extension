import { isPhoneNumber } from '../../prompt'

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
  })

  describe('False positives', () => {})

  describe('True negatives', () => {
    test('phone number with less than 11 digits', () => {
      expect(isPhoneNumber('+4174758725').pii).toBe(false)
    })

    test('phone number without country code', () => {
      expect(isPhoneNumber('747587256').pii).toBe(false)
    })

    test('phone number with 41 country code and random characters', () => {
      expect(isPhoneNumber('41 asdadsa-747-587-256').pii).toBe(false)
    })

    test('phone number with +41 country code and random characters', () => {
      expect(isPhoneNumber('+41 asdadsa-747-587-256').pii).toBe(false)
    })

    test('phone number with split digits', () => {
      expect(
        isPhoneNumber(
          'I wrote +1 essays once and I got 1234 reviewers on them, then others came and were 134561'
        ).pii
      ).toBe(false)
    })
  })

  describe('False negatives', () => {})
})
