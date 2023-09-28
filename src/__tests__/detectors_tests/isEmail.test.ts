import { isEmail } from '../../prompt'

describe('Emails', () => {
  describe('True positives', () => {
    test('email with .com domain', () => {
      expect(isEmail('john@google.com').pii).toBe(true)
    })

    test('email with .uk domain', () => {
      expect(isEmail('alex@bloomberg.uk').pii).toBe(true)
    })

    test('email with .ch domain', () => {
      expect(isEmail('anna@coop.ch').pii).toBe(true)
    })

    test('email with .org domain', () => {
      expect(isEmail('lakera@ai.org').pii).toBe(true)
    })

    test('email at the beggining of the context', () => {
      expect(isEmail('gandalf@gmail.fr is my friend').pii).toBe(true)
    })

    test('email in the middle of the context', () => {
      expect(
        isEmail('This is my email address: gandalf@lakera.ai, please contact me!').pii
      ).toBe(true)
    })

    test('email at the end of the context', () => {
      expect(isEmail('My best friend is sandalf@outlook.de').pii).toBe(true)
    })
  })

  describe('False positives', () => {})

  describe('True negatives', () => {
    test('email without domain', () => {
      expect(isEmail('john@google').pii).toBe(false)
    })

    test('email without organization and domain', () => {
      expect(isEmail('mike@').pii).toBe(false)
    })

    test('no email', () => {
      expect(isEmail('bogdan').pii).toBe(false)
    })

    test('email with double @', () => {
      expect(isEmail('bogdan@@gmail.com').pii).toBe(false)
    })

    test('email at the beggining of the context', () => {
      expect(isEmail('sandalf@yoda is my friend').pii).toBe(false)
    })

    test('email in the middle of the context', () => {
      expect(
        isEmail('This is my email address: gandalf@lakera, please contact me!').pii
      ).toBe(false)
    })

    test('email at the end of the context', () => {
      expect(isEmail('My best friend is gandalf@r2d2.').pii).toBe(false)
    })
  })

  describe('False negatives', () => {})
})
