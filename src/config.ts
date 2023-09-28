export const CREDIT_CARD_DIGITS = 16
export const GROUP_CREDIT_CARD_DIGITS = 4
// The regexp uses positive lookahead to check if the string contains at least ${creditCardDigits} digits and allows as many spaces and/or dashes after a digit, as well at most 1 character (after each digit) that is different from digits, spaces and dashes anywhere in the string. The last \d is used to make sure overlapping substrings are matched and that characters are consumed one by one by the regexp
export const CREDIT_CARD_REGEX_STR = `(?=((\\d[-\\s]*[^\\s\\d-]{0,1}[-\\s]*){${CREDIT_CARD_DIGITS}}))\\d`

export const LAST_SSN_DIGITS = 4
// The regexp uses negative lookahead to exclude invalid SSNs (ex: starting with 666 or 000 or 9XX, where X is any digit). It uses negative lookbehind to check for word-character or dash (as word boundary) before the matched substring and negative lookahead (same use-case) to check the first character after the matched substring. Also, it is allowing spaces or/and dashes between the 3 groups of digits and checking for the correct number of digits for each group (3, 2 and 4)
export const SSN_REGEX: RegExp =
  /(?<![\w-])((?!666|000|9\d{2})\d{3}[- ]*(?!00)\d{2}[- ]*(?!0{4})\d{4})(?![\w-])/

const SECRET_KEY_THRESHOLD = 20
// The regexp uses positive lookahead to check for at least one uppercase letter, one lowercase letter and one digit and allow any other character, also making sure that the string is at least ${apiKeyThreshold} characters long
const SECRET_KEY_REGEX_STR: string = `^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d).{${SECRET_KEY_THRESHOLD},}$`
export const SECRET_KEY_REGEX: RegExp = new RegExp(SECRET_KEY_REGEX_STR)

export const LAST_CHARS_ADDRESS = 200
export const CHAR_LIMIT_RECOMMENDED = 2000
export const CHAR_LIMIT_SUPPORT = 20000

export const RETRY_TIMEOUT = 500
