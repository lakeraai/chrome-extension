import { isAddress } from '../../prompt'

describe('Addresses', () => {
  describe('True positives', () => {
    test('US address with Avenue', () => {
      expect(
        isAddress('1177 Avenue of the Americas, Fl 7, New York, New York 10036, US')
          .pii
      ).toBe(true)
    })

    test('US address with Apt.', () => {
      expect(isAddress('789 Maple Street Apt. 5B New York, New York 10001').pii).toBe(
        true
      )
    })

    test('US address with no street number', () => {
      expect(isAddress('Main St. New York, NY 10001').pii).toBe(true)
    })

    test('US address in context', () => {
      expect(
        isAddress(
          'I delivered the package at the following address: 123 Main St. New York, NY 10001.  It was a great day!'
        ).pii
      ).toBe(true)
    })

    test('US address in context, mixed with other PII data', () => {
      expect(
        isAddress(
          'John prefers using his credit card, which ends in XXXX-XXXX-XXXX-1234. You can reach him at john@email.com or call him at +1 (970) 391-1147. They currently reside at 123 Main St. New York, NY 10001.'
        ).pii
      ).toBe(true)
    })
  })

  describe('False positives', () => {})

  describe('True negatives', () => {
    test('not a US address', () => {
      expect(
        isAddress(
          'I delivered the package at the following address: 76-78 Av. des Champs-Élysées, 75008 Paris, France. It was a great day!'
        ).pii
      ).toBe(false)
    })

    test('US address with no city', () => {
      expect(isAddress('123 Main St. NY 10001').pii).toBe(false)
    })

    test('US address with no state', () => {
      expect(isAddress('123 Main St. Chicago, 10001').pii).toBe(false)
    })

    test('no address', () => {
      expect(
        isAddress(
          'Mystical Forest Whispered To Be Home To Magical Beings One Morning While Exploring A Sunlit Glade Lily Stumbled Upon An Ancient Weathered Book Hidden Among The Roots Of A Towering Oak Tree Intrigued She Dusted Off The Cover And Traced Her Fingers Over The Ornate Engravings Little Did She Know That This Book Held The Secrets To A Longlost Kingdom As Lily Opened The Book She Was Greeted By Swirling Letters And Enchanting Illustrations That Seemed To Come Alive Before Her Eyes The Pages Revealed Tales Of A Kingdom Called Avaloria Where Magic Flowed Freely And Wonders Were Commonplace Driven By Curiosity Lily Immersed Herself in'
        ).pii
      ).toBe(false)
    })
  })

  describe('False negatives', () => {})
})
