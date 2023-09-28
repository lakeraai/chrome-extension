import { isOverLimit } from '../../prompt'

describe('Character limit', () => {
  describe('True positives', () => {
    test('prompt length below character limit', () => {
      expect(isOverLimit('This is a valid character limit')).toBe(false)
    })
  })

  describe('False positives', () => {})

  describe('True negatives', () => {
    test('prompt length over character limit', () => {
      expect(
        isOverLimit(
          "Title: The Enchanted Forest Once upon a time, in a faraway kingdom, nestled between snow-capped mountains and sparkling rivers, lay an enchanted forest. The townsfolk spoke of this mysterious place with hushed tones, for they believed it was home to mystical creatures and hidden treasures.The forest was dense, with towering trees that seemed to touch the sky. Sunlight filtered through the leaves, painting the forest floor with patches of gold. Legends whispered of a magical portal hidden deep within, accessible only to those with pure hearts and untainted souls. In the nearby village, a young girl named Elara was known for her kindness and compassion. Orphaned at a young age, she was raised by the village elder, a wise woman named Maris. Elara's heart was full of curiosity and adventure, and she yearned to explore the mysteries of the enchanted forest. One morning, as the sun painted the sky in hues of pink and orange, Elara set off on her journey into the forest. Armed with a satchel of food and water, she felt both excitement and trepidation. The villagers warned her of the dangers lurking within the woods, but her determination overpowered her fear. With each step, the forest seemed to come alive. Birds sang melodious tunes, and squirrels chattered in the trees. The air carried a faint scent of magic, igniting a sense of wonder within Elara's heart. As she ventured deeper into the woods, she stumbled upon a peculiar stone arch covered in glowing vines. It was the rumored entrance to the hidden portal. Hesitating for a moment, Elara gathered her courage and stepped through the arch. To her astonishment, she found herself in a breathtaking realm unlike anything she had ever seen. The colors were more vivid, and the air was filled with a melodious hum. A small, luminescent creature with wings fluttered before her. It was a fairy – delicate and enchanting. The fairy introduced herself as Lumi and explained that Elara had passed the test of pure-heartedness, granting her access to the hidden realm."
        )
      ).toBe(true)
    })
  })

  describe('False negatives', () => {})
})
