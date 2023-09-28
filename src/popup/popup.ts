import { TIMEOUT_ADD_CLASS, CHATGPT_URL } from './popup_config'

function addEventListenersToToggles (detectorToggles: NodeListOf<Element>): void {
  for (const detector of detectorToggles) {
    detector.addEventListener('click', () => {
      chrome.runtime.sendMessage({ detectorToggle: detector.id })
    })
  }
}

async function addTriggeredDetectorsToDom (): Promise<void> {
  const pageStats = document.getElementById('stats-page')
  const pageTotal = document.getElementById('stats-total')

  const spanStats = document.createElement('span')
  spanStats.classList.add('font-bold', 'py-1')

  const spanTotal = document.createElement('span')
  spanTotal.classList.add('font-bold', 'py-1')

  if (pageStats !== null) {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true })
    if (
      tab.id !== undefined &&
      tab.url !== undefined &&
      tab.url.includes(CHATGPT_URL)
    ) {
      chrome.tabs.sendMessage(
        tab.id,
        { triggeredDetectors: 'GET' },
        function (response) {
          void (async () => {
            // update the triggered detectors counter on the page the user is on
            spanStats.textContent =
              response !== null && response.triggeredDetectors !== undefined
                ? response.triggeredDetectors.toString()
                : '0'
            pageStats.appendChild(spanStats)

            // update the total detections counter
            const query = await chrome.storage.sync.get(['totalDetections'])
            const totalDetections: number = query.totalDetections

            spanTotal.textContent = totalDetections.toString()
            pageTotal?.appendChild(spanTotal)
          })()
        }
      )
    } else {
      // update the triggered detectors counter on the page the user is on
      spanStats.textContent = '0'
      pageStats.appendChild(spanStats)

      // update the total detections counter
      const query = await chrome.storage.sync.get(['totalDetections'])
      const totalDetections: number = query.totalDetections

      spanTotal.textContent = totalDetections.toString()
      pageTotal?.appendChild(spanTotal)
    }
  }
}

async function setCheckedStatusToToggles (
  detectorToggles: NodeListOf<Element>
): Promise<void> {
  for (const detector of detectorToggles) {
    const query: any = await chrome.storage.sync.get([detector.id])
    const detectorState: boolean = query[detector.id]
    const detectorInput: HTMLInputElement | null = detector.querySelector(
      '.detector-toggle-input'
    )
    if (detectorInput !== null) {
      detectorInput.checked = detectorState
    }
  }

  setTimeout(() => {
    for (const detector of detectorToggles) {
      const detectorAnimation = detector.querySelector('.detector-toggle-animation')
      detectorAnimation?.classList.add('after:transition-all')
    }
  }, TIMEOUT_ADD_CLASS)
}

function main (): void {
  const detectorToggles = document.querySelectorAll('.detector-toggle')
  void setCheckedStatusToToggles(detectorToggles)
  addEventListenersToToggles(detectorToggles)
  void addTriggeredDetectorsToDom()
}

main()
