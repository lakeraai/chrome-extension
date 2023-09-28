chrome.runtime.onInstalled.addListener(function (details) {
  void (async () => {
    // https://developer.chrome.com/docs/extensions/reference/runtime/#type-OnInstalledReason
    if (details.reason === 'install') {
      // the keys represent the ids of the popup.html button elements
      const detectors = {
        'credit-card-number': true,
        name: true,
        'email-address': true,
        'phone-number': true,
        address: true,
        'social-security-number': true,
        'secret-key': true
      }

      await chrome.storage.sync.set(detectors)

      // initialize the total detections counter to 0 when the extension is installed
      await chrome.storage.sync.set({ totalDetections: 0 })
    }
  })()
})

chrome.runtime.onMessage.addListener(function (request, sender) {
  void (async () => {
    if (request.detections !== undefined && sender.tab?.id !== undefined) {
      // cast request.detections to number
      const detections: number = request.detections
      // get current badge text
      const badgeText: string = await chrome.action.getBadgeText({
        tabId: sender.tab.id
      })
      // cast badgeText to number
      const badge: number = badgeText !== '' ? parseInt(badgeText) : 0
      // updating the total detections counter if badge changed
      if (badge !== detections && badge < detections) {
        // update the total detections counter
        const query = await chrome.storage.sync.get(['totalDetections'])
        let totalDetections: number = query.totalDetections
        totalDetections += detections - badge
        await chrome.storage.sync.set({ totalDetections })
      }

      void chrome.action.setBadgeBackgroundColor({
        color: '#DA2700'
      })

      void chrome.action.setBadgeText({
        tabId: sender.tab.id,
        text: request.detections > 0 ? request.detections.toString() : ''
      })
    }
  })()
})

chrome.runtime.onMessage.addListener(function (request) {
  void (async () => {
    if (request.detectorToggle !== undefined) {
      const detector = request.detectorToggle
      const query = await chrome.storage.sync.get([detector])
      const detectorState: boolean = query[detector]
      await chrome.storage.sync.set({ [detector]: !detectorState })
    }
  })()
})
