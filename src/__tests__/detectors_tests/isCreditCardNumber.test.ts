import { isCreditCardNumber } from '../../prompt'

describe('Credit card numbers', () => {
  describe('True positives', () => {
    test('is valid credit card number', () => {
      expect(isCreditCardNumber('4111111111111111').pii).toBe(true)
    })

    test('is valid credit card number with spaces', () => {
      expect(isCreditCardNumber('4111 1111 1111 1111').pii).toBe(true)
    })

    test('is valid credit card number with random spaces', () => {
      expect(isCreditCardNumber('411 1   111 1 1111 11 11').pii).toBe(true)
    })

    test('is valid credit card number with dashes', () => {
      expect(isCreditCardNumber('4111-1111-1111-1111').pii).toBe(true)
    })

    test('is valid credit card number with random dashes', () => {
      expect(isCreditCardNumber('411-1---111-1-1111-11-11').pii).toBe(true)
    })

    test('is valid credit card number with random spaces and one random character in between', () => {
      expect(isCreditCardNumber('41 11 11111111 11 a 11').pii).toBe(true)
    })

    test('is valid credit card number and other characters in the input', () => {
      expect(
        isCreditCardNumber('This is my credit card number: 4111111111111111').pii
      ).toBe(true)
    })

    test('is invalid credit card number and another valid credit card number', () => {
      expect(isCreditCardNumber('4111111111111112 4111111111111111').pii).toBe(true)
    })

    test('is invalid credit card number and another valid credit card number and random characters in between and one random character for the valid credit card number', () => {
      expect(
        isCreditCardNumber('41 xx 1111    1111 sa 111112 4111111 1111 1111 a1').pii
      ).toBe(true)
    })

    test('is valid credit card number', () => {
      expect(isCreditCardNumber('4111111111111111 1').pii).toBe(true)
    })
  })

  describe('False positives', () => {})

  describe('True negatives', () => {
    test('is invalid credit card number', () => {
      expect(isCreditCardNumber('4111111111111112').pii).toBe(false)
    })

    test('is invalid credit card number with spaces', () => {
      expect(isCreditCardNumber('411111111    1111 112').pii).toBe(false)
    })

    test('is invalid credit card number with random spaces', () => {
      expect(isCreditCardNumber('41 1111 1 11 11 111 12').pii).toBe(false)
    })

    test('is invalid credit card number with random numbers in context', () => {
      expect(
        isCreditCardNumber(
          'I wanted to buy 41 eggs, but suddenly I saw 1111 beers, so I thought that 1 package of milk would be more efficient than 11 bottles of wine, then I bought 11 of those and came back later for only 111 beers, but the store was already closed as it was 12'
        ).pii
      ).toBe(false)
    })

    test('is invalid credit card number with dashes', () => {
      expect(isCreditCardNumber('4111-1111-1111-1112').pii).toBe(false)
    })

    test('is invalid credit card number with random dashes', () => {
      expect(isCreditCardNumber('41-1111-1-11-11-111-12').pii).toBe(false)
    })

    test('is valid credit card number with random spaces and multiple random characters in between', () => {
      expect(isCreditCardNumber('41 11 11111111 11 ab 11').pii).toBe(false)
    })

    test('is invalid credit card number with random spaces and one random character in between', () => {
      expect(isCreditCardNumber('41 1111 1 11 11 111 a  12').pii).toBe(false)
    })

    test('is invalid credit card number and other characters in the input', () => {
      expect(
        isCreditCardNumber('This is my credit card number: 4111111111111112').pii
      ).toBe(false)
    })

    test('is invalid credit card number and another valid credit card number and random characters in between and multiple random character for the valid credit card number', () => {
      expect(
        isCreditCardNumber('41 xx 1111    1111 sa 111112 4111111 1111 1111 ab1').pii
      ).toBe(false)
    })
  })

  describe('False negatives', () => {})
})
