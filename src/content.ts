import { RETRY_TIMEOUT } from 'config'
import { isPii, countTriggeredDetectorsWrapper } from './prompt'
import Swal from 'sweetalert2'

interface PromptElements {
  textarea: HTMLTextAreaElement | null
  button: HTMLButtonElement | null
}
let promptElements: PromptElements = { textarea: null, button: null }

async function delay (ms: number): Promise<void> {
  await new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

// we use a recursive function to fetch the textarea and button elements because the DOM is not always ready when the content script is injected and we wait with a delay of 500 ms between each fetch attempt (in order to give the DOM time to load the elements)
async function fetchDomElements (): Promise<PromptElements> {
  const textarea: HTMLTextAreaElement | null = document.getElementById(
    'prompt-textarea'
  ) as HTMLTextAreaElement | null
  const button: HTMLButtonElement | null =
    textarea?.parentElement?.parentElement?.querySelector(':scope > button') ?? null

  if (textarea !== null && button !== null) {
    return { textarea, button }
  } else {
    await delay(RETRY_TIMEOUT)
    return await fetchDomElements()
  }
}

function setExtensionBadge (piiDetections: number): void {
  chrome.runtime.sendMessage({ detections: piiDetections })
}

async function shouldProceed (textarea: HTMLTextAreaElement | null): Promise<boolean> {
  const { pii, message } = await isPii(textarea)
  if (pii) {
    const alert = await Swal.fire({
      backdrop: false,
      title: 'Lakera',
      html: message,
      imageUrl: `${chrome.runtime.getURL('../icon-128.png')}`,
      imageHeight: 80,
      imageWidth: 80,
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonColor: '#19C37D',
      cancelButtonColor: '#DA2700',
      confirmButtonText: 'Back to editing',
      cancelButtonText: 'Proceed anyway',
      footer:
        'Built with ❤️ by <a href="https://www.lakera.ai/" target="_blank"><strong>Lakera</strong></a>'
    })

    if (alert.isConfirmed) {
      return false
    } else if (alert.isDismissed && alert.dismiss === Swal.DismissReason.cancel) {
      return true
    } else {
      return false
    }
  }
  return true
}

// storage.onChanged will listen for changes in the storage (when a detector gets toggled on/off) and will update the extension badge accordingly
chrome.storage.onChanged.addListener(function () {
  void (async () => {
    if (promptElements.textarea !== null) {
      const triggeredDetectors = await countTriggeredDetectorsWrapper(
        promptElements.textarea
      )
      setExtensionBadge(triggeredDetectors)
    }
  })()
})

// the listener receives a message from the popup script and sends back the number of triggered detectors
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  async function sendTriggeredDetectorsAsync (): Promise<void> {
    const triggeredDetectors = await countTriggeredDetectorsWrapper(
      promptElements.textarea
    )
    sendResponse({ triggeredDetectors })
  }

  if (promptElements.textarea !== null && request.triggeredDetectors !== undefined) {
    void sendTriggeredDetectorsAsync()
    // we need to return true in order to keep the message channel open for sendResponse - https://developer.chrome.com/docs/extensions/mv3/messaging/#:~:text=sendResponse()%2C%20add-,return,-true%3B%20to
    return true
  }
})

async function fetchButton (textarea: HTMLTextAreaElement | null): Promise<HTMLButtonElement> {
  const button: HTMLButtonElement | null =
    textarea?.parentElement?.parentElement?.querySelector(':scope > button') ?? null

  if (button !== null) {
    return button
  } else {
    await delay(RETRY_TIMEOUT)
    return await fetchButton(textarea)
  }
}

function addEventListenersToButton (textarea: HTMLTextAreaElement | null, button: HTMLButtonElement | null): void {
  button?.addEventListener('click', (event) => {
    void (async () => {
      if (event.isTrusted) {
        event.stopPropagation()
        event.preventDefault()
        const proceed = await shouldProceed(textarea)
        if (proceed) {
          button?.click()
          // send message to background script to remove the badge because the prompt was submitted
          chrome.runtime.sendMessage({ detections: 0 })
        }
      }
    })()
  })
}

function addEventListeners (
  textarea: HTMLTextAreaElement | null,
  button: HTMLButtonElement | null
): void {
  textarea?.addEventListener('keydown', (event) => {
    void (async () => {
      if (event.isTrusted && event.code === 'Enter' && !event.shiftKey) {
        // this stops the event from being propagated to the button and back to its ancestors
        event.stopPropagation()
        // this stops the "enter" event from being triggered on the alert
        event.preventDefault()
        const proceed = await shouldProceed(textarea)
        if (proceed) {
          // button needs to be fetched again as it might have been rerendered
          button = await fetchButton(textarea)
          button?.click()
          // send message to background script to remove the badge because the prompt was submitted
          chrome.runtime.sendMessage({ detections: 0 })
        }
      }
    })()
  })

  // we use input event instead of keydown because the keydown event is triggered before the textarea value is updated
  textarea?.addEventListener('input', () => {
    void (async () => {
      const triggeredDetectors = await countTriggeredDetectorsWrapper(textarea)
      setExtensionBadge(triggeredDetectors)
    })()
  })

  button?.addEventListener('click', (event) => {
    void (async () => {
      if (event.isTrusted) {
        event.stopPropagation()
        event.preventDefault()
        const proceed = await shouldProceed(textarea)
        if (proceed) {
          button?.click()
          // send message to background script to remove the badge because the prompt was submitted
          chrome.runtime.sendMessage({ detections: 0 })
        }
      }
    })()
  })

  if (textarea !== null && button !== null) {
    // we add a dataset attribute to the textarea and button to check if the event listeners have already been added
    textarea.dataset.eventListeners = true.toString()
    button.dataset.eventListeners = true.toString()
  }
}

function addMutationObserver (textarea: HTMLTextAreaElement | null): void {
  const config = { attributes: false, childList: true, subtree: true }

  const callback = (
    mutationsList: MutationRecord[],
    observer: MutationObserver
  ): void => {
    if (!document.body.contains(textarea)) {
      observer.disconnect()
      // send message to background script to remove the badge because the textarea is no longer present
      chrome.runtime.sendMessage({ detections: 0 })
      void manageFetchDomElements()
    } else if (!document.body.contains(promptElements.button)) {
      void (async () => {
        // we need to fetch the button again because it might have been rerendered
        const button = await fetchButton(textarea)
        if (promptElements.button !== button) {
          promptElements.button = button
          addEventListenersToButton(textarea, button)
        }
      })()
    }
  }

  const mutationObserver = new MutationObserver(callback)
  mutationObserver.observe(document.body, config)
}

// creates a critical section in the manageFetchDomElements function in order to prevent multiple fetchDomElements() calls at the same time
let fetchInProgress: boolean = false

async function manageFetchDomElements (): Promise<void> {
  if (!fetchInProgress) {
    fetchInProgress = true

    promptElements = await fetchDomElements()
    // if the event listeners have already been added, that means we fetched the same textarea and button elements, so we should not add other event listeners or another mutation observer to the same elements
    // ex: textarea is not contained in the document anymore (ex: user changed conversation) and there are 2 events in the event loop related to the mutation observer (both wait to be executed because they noticed a mutation of the DOM, and both of them notice that the textarea is not contained in the document anymore) and both of them will try at some point to call manageFetchDomElements(), but they will execute the mutation observer callback one after the other (they cannot run in true paralellism due to JavaScript single threaded nature) - however, if the first event finishes before the second one starts (so the fetchDomElements() of the first event call is not intertwined with operations from the second event and the control is not yielded back to the event loop at any point during fetchDomElements() execution), the second event will then enter the manageFetchDomElements function (because the first event finished and the fetchInProgress is false now) and fetch the same textarea and button elements, so we need to check if the event listeners have already been added (through the dataset attributes) - this is what the dataset.eventListeners check protects from (we still fetch them again, but at least we don't add the event listeners and the mutation observer again on the same elements)
    // what fetchInProgress protects from: on the other hand, what could happen is that the first event starts execution of the mutation observer callback, calls the manageFetchDomElements(), encounters the await fetchDomElements(), control is yielded back to the event loop at some point, the second event starts execution of the mutation observer callback, calls the manageFetchDomElements() function, but it cannot get to the await fetchDomElements() line because the fetchInProgress variable is true now (because the first event did not finish execution yet, and therefore it didn't finish fetching the textarea and the button) - if we did not use the fetchInProgress variable then we would start another fetchDomElements() call in the same time when there is already an ongoing call for that function (and this is not restricted to 2 events in the event loop only, this can happen for any number of events that want to call the manageFetchDomElements function and after that to call the fetchDomElements function, so that variable protects from this concurrency issue)
    if (
      promptElements.textarea?.dataset.eventListeners !== true.toString() &&
      promptElements.button?.dataset.eventListeners !== true.toString()
    ) {
      addEventListeners(promptElements.textarea, promptElements.button)
      addMutationObserver(promptElements.textarea)
    }

    fetchInProgress = false
  }
}

void manageFetchDomElements()
