import { isName } from '../../prompt'

describe('Names', () => {
  describe('True positives', () => {
    test('English name', () => {
      expect(isName('John').pii).toBe(true)
    })

    test('English name with last name', () => {
      expect(isName('John Smith').pii).toBe(true)
    })

    test('English name with last name and suffix', () => {
      expect(isName('John Smith Jr.').pii).toBe(true)
    })

    test('English name with middle name and last name', () => {
      expect(isName('John Michael Smith').pii).toBe(true)
    })

    test('Australian name', () => {
      expect(isName('Bruce').pii).toBe(true)
    })

    test('Slavic name', () => {
      expect(isName('Ivan').pii).toBe(true)
    })

    test('German name', () => {
      expect(isName('Hans').pii).toBe(true)
    })
  })

  describe('False positives', () => {})

  describe('True negatives', () => {})

  describe('False negatives', () => {
    test('Spanish name', () => {
      expect(isName('Juan').pii).toBe(true)
    })

    test('Italian name', () => {
      expect(isName('Giovanni').pii).toBe(true)
    })

    test('Chinese name', () => {
      expect(isName('Chen').pii).toBe(true)
    })

    test('Arabic name', () => {
      expect(isName('Ahmed').pii).toBe(true)
    })

    test('Turkish name', () => {
      expect(isName('Ahmet').pii).toBe(true)
    })

    test('Romanian name', () => {
      expect(isName('Ion').pii).toBe(false)
    })

    test('Hungarian name', () => {
      expect(isName('János').pii).toBe(false)
    })

    test('Indian name', () => {
      expect(isName('Rajesh').pii).toBe(false)
    })

    test('Japanese name', () => {
      expect(isName('Taro').pii).toBe(false)
    })

    test('French name', () => {
      expect(isName('Jean').pii).toBe(false)
    })

    test('Swedish name', () => {
      expect(isName('Bjorn').pii).toBe(false)
    })

    test('Finnish name', () => {
      expect(isName('Jussi').pii).toBe(false)
    })

    test('Tanzanian name', () => {
      expect(isName('Neema').pii).toBe(false)
    })
  })
})
