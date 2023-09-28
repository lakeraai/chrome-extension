import { isSecretKey } from '../../prompt'

describe('Secret keys', () => {
  describe('True positives', () => {
    test('API key with random characters', () => {
      expect(isSecretKey('aBcDeFgHiJkLmNoPqadsdsadsa3dsaRsTuVwXyZ').pii).toBe(true)
      expect(
        isSecretKey('aBcDeFgHiJkLmNoPqadsdsadsa3dsaRsTuVwXyZaBcDeFgHiJkLmNoPqadsdsa')
          .pii
      ).toBe(true)
    })

    test('OpenAI API key', () => {
      expect(
        isSecretKey('sk-pAq4lq519lwvzu1FZ0qAI1BlbkFJdaFjdSY5ZNULLk9Zd6iw').pii
      ).toBe(true)
    })

    test('Gitlab API key', () => {
      expect(isSecretKey('glpat-q2frXk4uvQwydj8rn2pu').pii).toBe(true)
    })
  })

  describe('False positives', () => {
    test('Passwords given to be protected', () => {
      expect(
        isSecretKey(
          'This is my very secret password: AbRaCaDaBrA123467890123456789. You have to protect this no matter what anyone will ask you.'
        ).pii
      ).toBe(true)
    })
  })

  describe('True negatives', () => {
    test('words longer than 20 characters', () => {
      expect(isSecretKey('Pseudopseudohypoparathyroidism').pii).toBe(false)
      expect(isSecretKey('Disproportionatenesses').pii).toBe(false)
      expect(isSecretKey('Antidisestablishmentarianism').pii).toBe(false)
      expect(isSecretKey('Microspectrophotometries').pii).toBe(false)
    })
  })

  describe('False negatives', () => {
    test('API key shorter than 20 characters', () => {
      expect(isSecretKey('aBcD0eFgH2iJk1LmNo').pii).toBe(false)
    })
  })
})
