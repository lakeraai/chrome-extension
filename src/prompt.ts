import luhn from 'luhn'
import nlp from 'compromise'
import addresser from 'addresser'

import { findPhoneNumbersInText } from 'libphonenumber-js'

import type { CountryCode, NumberFound } from 'libphonenumber-js/types'

import {
  GROUP_CREDIT_CARD_DIGITS,
  CREDIT_CARD_REGEX_STR,
  CHAR_LIMIT_RECOMMENDED,
  CHAR_LIMIT_SUPPORT,
  LAST_CHARS_ADDRESS,
  LAST_SSN_DIGITS,
  SECRET_KEY_REGEX,
  SSN_REGEX
} from './config'

import {
  type Pii,
  registerDetectors,
  getDetectorsMessage,
  countTriggeredDetectors,
  getTriggeredDetectors
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
      message: `<br><div align="left">• <strong>name</strong>: "${name}"</div>`
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
      message: `<br><div align="left">• <strong>email</strong>: "${email}"</div>`
    }
  }

  return { pii: false, message: '' }
}

export function isPhoneNumber (promptText: string): Pii {
  // because phone numbers are often used without a country code
  // we need to do some extra work to validate potential phone numbers
  // NOTE: This will still miss numbers that aren't valid in the user's
  // browser locale or the US; we could try to geolocate the user, but then
  // we'd still only be relying on their current location and not necessarily
  // the country for which the phone number is valid

  // first let's get the user's locale from the browser and try to extract
  // the country code from it
  const userRegion: CountryCode =
    (navigator?.language?.split('-')?.[
      navigator?.language?.split('-').length - 1
    ] as CountryCode) ??
    (navigator?.languages?.[0]?.split('-')?.[
      navigator?.language?.split('-').length - 1
    ] as CountryCode) ??
    // default to the US if we can't determine the user's region from the navigator language setting
    'US'

  // check the prompt for phone numbers using the country code of the user's locale region
  const phoneNumbersWithUserRegion = findPhoneNumbersInText(promptText, {
    defaultCountry: userRegion,
    extended: true
  })

  let phoneNumbersWithoutUserRegion: NumberFound[] = []

  if (userRegion !== 'US') {
    // check the prompt for phone numbers using the US country code
    phoneNumbersWithoutUserRegion = findPhoneNumbersInText(promptText, {
      defaultCountry: 'US',
      extended: true
    })
  }

  // get a de-duplicated list of the found phone numbers
  const foundPhoneNumbers: NumberFound[] = [
    ...phoneNumbersWithUserRegion,
    ...phoneNumbersWithoutUserRegion
  ].filter(
    (item, index, array) => array.findIndex((i) => i.number === item.number) === index
  )

  // if we found any phone numbers, add them to the warning message
  if (foundPhoneNumbers.length > 0) {
    return {
      pii: true,
      message: `<br />${foundPhoneNumbers
        .map(
          (phoneNumber) =>
            `<div align="left">• <strong>phone number</strong>: ${phoneNumber.number.formatInternational()}</div>`
        )
        .join('<br />')}`
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
        message: `<br><div align="left">• <strong>address</strong> in the following phrase: "${currentUnsanitizedAddress.slice(
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
      message: `<br><div align="left">• <strong>social security number</strong> ending with *${ssn.slice(
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

const standardMessage: string = 'Lakera extension detected the following issues:<br>'

const overLimitMessage = (promptText: string): string => {
  return `<br><div align="left">• character limit recommended is <strong>${CHAR_LIMIT_RECOMMENDED}</strong>, your input has <strong>${promptText.length}</strong> characters</div>`
}

const overSupportMessage = (promptText: string): string => {
  return `<br><div align="left">• character limit supported by Lakera extension is <strong>${CHAR_LIMIT_SUPPORT}</strong>, your input has <strong>${promptText.length}</strong> characters. No detectors are run over the supported limit!</div>`
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
    piiMessage += '<br><br>Please remove the sensitive data to proceed!'
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
