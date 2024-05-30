import addresser from 'addresser'
import nlp from 'compromise'
import luhn from 'luhn'
import phone from 'phone'
import {
  CHAR_LIMIT_RECOMMENDED,
  CHAR_LIMIT_SUPPORT,
  CREDIT_CARD_REGEX_STR,
  GROUP_CREDIT_CARD_DIGITS,
  LAST_CHARS_ADDRESS,
  LAST_SSN_DIGITS,
  SECRET_KEY_REGEX,
  SSN_REGEX
} from './config'
import {
  countTriggeredDetectors,
  getDetectorsMessage,
  getTriggeredDetectors,
  type Pii,
  registerDetectors
} from './detectorsRegistry'

export function isCreditCardNumber (promptText: string): Pii {
  let match: RegExpExecArray | null
  // creating a new RegExp object for each prompt as the lastIndex property of the RegExp object is modified after each match
  const CREDIT_CARD_REGEX: RegExp = new RegExp(CREDIT_CARD_REGEX_STR, 'g')

  while ((match = CREDIT_CARD_REGEX.exec(promptText)) !== null) {
    const creditCard = match[1].replace(/\D/g, '')
    if (luhn.validate(creditCard)) {
      return {
        pii: true,
        message: `<br><div align="left">• <strong>credit card number</strong> ending with *${creditCard.slice(
          -GROUP_CREDIT_CARD_DIGITS
        )}</div>`
      }
    }
  }

  return { pii: false, message: '' }
}

export function isName (promptText: string): Pii {
  const doc = nlp(promptText)
  const people = doc.people().out('array')

  if (people.length > 0) {
    const name = people[0]
    return {
      pii: true,
      message: `<br><div align="left">• <strong>Name</strong>: "${name}"</div>`
    }
  }

  return { pii: false, message: '' }
}

export function isEmail (promptText: string): Pii {
  const doc = nlp(promptText)
  const emails = doc.emails().out('array')

  if (emails.length > 0) {
    const email = emails[0]
    return {
      pii: true,
      message: `<br><div align="left">• <strong>E-mail</strong>: "${email}"</div>`
    }
  }

  return { pii: false, message: '' }
}

export function isPhoneNumber (promptText: string): Pii {
  const splitPromptText: string[] = promptText.split(/[^\d\s-()]{1,}/)

  for (const text of splitPromptText) {
    const sanitizedPromptText = text.replace(/\D/g, '')
    const phoneNumber = '+'.concat(sanitizedPromptText)
    if (phone(phoneNumber).isValid) {
      return {
        pii: true,
        message: `<br><div align="left">• <strong>Phone Number</strong>: "${phoneNumber}"</div>`
      }
    }
  }

  return { pii: false, message: '' }
}

export function isAddress (promptText: string): Pii {
  const splitPromptText: string[] = promptText.split(/\s/)
  let currentSanitizedAddress: string = ''
  let currentUnsanitizedAddress: string = ''

  for (const text of splitPromptText) {
    const sanitizedText = text.replace(/[^a-zA-Z\d]/g, '')
    currentSanitizedAddress += sanitizedText + ' '
    currentUnsanitizedAddress += text + ' '
    try {
      addresser.parseAddress(currentSanitizedAddress.trim())
      currentUnsanitizedAddress = currentUnsanitizedAddress.trim()
      return {
        pii: true,
        message: `<br><div align="left">• <strong>Address</strong> in the following phrase: "${currentUnsanitizedAddress.slice(
          -LAST_CHARS_ADDRESS
        )}"</div>`
      }
    } catch (error: any) {}
  }

  return { pii: false, message: '' }
}

// SSN is considered to be any string that is 9 digits long and is in the format XXX-XX-XXXX or XXXXXXXXX or XXX XX XXXX (or any other combination of spaces and dashes between the 3 groups of digits)
export function isSocialSecurityNumber (promptText: string): Pii {
  const ssnMatch = promptText.match(SSN_REGEX)
  if (ssnMatch?.index !== undefined) {
    const ssn = ssnMatch[0]
    return {
      pii: true,
      message: `<br><div align="left">• <strong>KRA PIN number</strong> ending with *${ssn.slice(
        -LAST_SSN_DIGITS
      )}</div>`
    }
  }

  return { pii: false, message: '' }
}

// API key is considered to be any string that is at least 20 characters long and contains at least one uppercase letter, one lowercase letter and one digit
export function isSecretKey (promptText: string): Pii {
  const splitPromptText: string[] = promptText.split(/\s/)

  for (const text of splitPromptText) {
    if (text.match(SECRET_KEY_REGEX) !== null) {
      return {
        pii: true,
        message: `<br><div align="left">• <strong>Secret key</strong>: "${text}"</div>`
      }
    }
  }

  return { pii: false, message: '' }
}

export function isOverLimit (promptText: string): boolean {
  if (promptText.length > CHAR_LIMIT_RECOMMENDED) {
    return true
  }
  return false
}

export function isOverSupport (promptText: string): boolean {
  if (promptText.length > CHAR_LIMIT_SUPPORT) {
    return true
  }
  return false
}

function addDetectorsToRegistry (): void {
  // the toggleIdentifiers represent the ids of the popup.html button elements
  const detectors = [
    { detect: isCreditCardNumber, toggleIdentifier: 'credit-card-number' },
    { detect: isName, toggleIdentifier: 'name' },
    { detect: isEmail, toggleIdentifier: 'email-address' },
    { detect: isPhoneNumber, toggleIdentifier: 'phone-number' },
    { detect: isAddress, toggleIdentifier: 'address' },
    {
      detect: isSocialSecurityNumber,
      toggleIdentifier: 'social-security-number'
    },
    { detect: isSecretKey, toggleIdentifier: 'secret-key' }
  ]

  registerDetectors(detectors)
}

addDetectorsToRegistry()

function extractPromptText (textarea: HTMLTextAreaElement | null): string {
  const promptText: string | undefined = textarea?.value
  return promptText ?? ''
}

const standardMessage: string = 'Umbrella Detected Private Information in your Prompt:<br>'

const overLimitMessage = (promptText: string): string => {
  return `<br><div align="left">• character limit recommended is <strong>${CHAR_LIMIT_RECOMMENDED}</strong>, your input has <strong>${promptText.length}</strong> characters</div>`
}

const overSupportMessage = (promptText: string): string => {
  return `<br><div align="left">• character limit supported by Umbrella is <strong>${CHAR_LIMIT_SUPPORT}</strong>, your input has <strong>${promptText.length}</strong> characters. No detectors are run over the supported limit!</div>`
}

export async function isPii (textarea: HTMLTextAreaElement | null): Promise<Pii> {
  const promptText: string = extractPromptText(textarea)
  let piiMessage: string = standardMessage

  // if the prompt text is not over the supported character limit, then run the detectors, otherwise don't
  if (!isOverSupport(promptText)) {
    if (isOverLimit(promptText)) {
      piiMessage += overLimitMessage(promptText)
    }
    piiMessage += await getDetectorsMessage(promptText)
  } else {
    piiMessage += overSupportMessage(promptText)
  }

  // if other messages than the standard one have been added, then we alert the user to take action
  if (piiMessage !== standardMessage) {
    piiMessage += '<br><br>Please Remove Your Personal Information to proceed;'
    return { pii: true, message: piiMessage }
  }
  return { pii: false, message: '' }
}

export async function countTriggeredDetectorsWrapper (
  textarea: HTMLTextAreaElement | null
): Promise<number> {
  const promptText: string = extractPromptText(textarea)
  const triggeredDetectors: number = await countTriggeredDetectors(promptText)

  return triggeredDetectors
}

export async function getTriggeredDetectorsWrapper (
  textarea: HTMLTextAreaElement | null
): Promise<string[]> {
  const promptText: string = extractPromptText(textarea)
  const triggeredDetectors: string[] = await getTriggeredDetectors(promptText)

  return triggeredDetectors
}
