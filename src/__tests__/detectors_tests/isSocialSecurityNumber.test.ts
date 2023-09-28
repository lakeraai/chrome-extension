import { isSocialSecurityNumber } from '../../prompt'

describe('Social security numbers', () => {
  describe('True positives', () => {
    test('social security number with dashes', () => {
      expect(isSocialSecurityNumber('123-12-1234').pii).toBe(true)
      expect(isSocialSecurityNumber('123--12---1234').pii).toBe(true)
    })

    test('social security number with spaces', () => {
      expect(isSocialSecurityNumber('123 12 1234').pii).toBe(true)
      expect(isSocialSecurityNumber('123 12   1234').pii).toBe(true)
    })

    test('social security number with different spacing', () => {
      expect(isSocialSecurityNumber('123 12-1234').pii).toBe(true)
      expect(isSocialSecurityNumber('123-12   --1234').pii).toBe(true)
      expect(isSocialSecurityNumber('123--  12-1234, 10').pii).toBe(true)
      expect(isSocialSecurityNumber('10001   1234').pii).toBe(true)
      expect(isSocialSecurityNumber('123-12-- -1234').pii).toBe(true)
      expect(isSocialSecurityNumber('123-12-1234 10').pii).toBe(true)
    })

    test('social security number before other digits', () => {
      expect(
        isSocialSecurityNumber(
          "This is my social security number: 123-12-1234, 10 dollars if you don't tell it to anyone."
        ).pii
      ).toBe(true)
    })

    test('social security number after other digits', () => {
      expect(
        isSocialSecurityNumber(
          'They currently reside at 123 Main St. New York, NY 10001. 123-12-1234 is my social security number.'
        ).pii
      ).toBe(true)
    })
  })

  describe('False positives', () => {
    test('social security number but with other meaning', () => {
      expect(
        isSocialSecurityNumber(
          'Look, this is the number they gave me to wait in line for my turn to come: 123-12-1234.'
        ).pii
      ).toBe(true)
    })
  })

  describe('True negatives', () => {
    test('invalid format for social security number', () => {
      expect(isSocialSecurityNumber('000-12-1234').pii).toBe(false)
      expect(isSocialSecurityNumber('123-45-0000').pii).toBe(false)
      expect(isSocialSecurityNumber('123-00-1234').pii).toBe(false)
      expect(isSocialSecurityNumber('666-12-1234').pii).toBe(false)
      expect(isSocialSecurityNumber('912-45-6789').pii).toBe(false)
    })

    test('is social security number with no boundary', () => {
      expect(isSocialSecurityNumber('111111_123-12-1234_1111-111').pii).toBe(false)
      expect(isSocialSecurityNumber('111111-123-12-1234-1111-111').pii).toBe(false)
    })

    test('social security number with wrong spacing', () => {
      expect(isSocialSecurityNumber('123-1 2-1234').pii).toBe(false)
      expect(isSocialSecurityNumber('123-12-1 234').pii).toBe(false)
      expect(isSocialSecurityNumber('76123--  12-1234, 10').pii).toBe(false)
      expect(isSocialSecurityNumber('123-12-123410').pii).toBe(false)
    })

    test('credit card number', () => {
      expect(isSocialSecurityNumber('4111111111111111').pii).toBe(false)
    })
  })

  describe('False negatives', () => {
    test('social security number with random characters in between', () => {
      expect(isSocialSecurityNumber('123-12-1a.345').pii).toBe(false)
      expect(isSocialSecurityNumber('123-12-..1345').pii).toBe(false)
    })
  })
})
