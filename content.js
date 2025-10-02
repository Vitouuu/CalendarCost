// ====================================================================
// CONFIGURATION
// ====================================================================
const config = {
  costPerHour: 50,
  selectors: {
    dialog: 'div[role="dialog"][aria-modal="true"]',
    // --- View Card Selectors ---
    view: {
      idealAnchor: '[nowhiteboardinfo="true"]',
      fallbackAnchor: 'div[jscontroller][jsaction]',
      attendeeChip: 'div[data-participant-chip]',
    },
    // --- Creation Card Selectors ---
    creation: {
      // Use autofocus input to reliably identify the creation card
      identifier: 'input[autofocus]',
      contentArea: 'div[jscontroller][jsaction]',
      attendeeLocator: '[data-hovercard-id][role="treeitem"]',
      startDate: 'span[data-key="startDate"]',
      startTime: 'span[data-key="startTime"]',
      endTime: 'span[data-key="endTime"]',
    },
  },
  timeRegex: /\b(\d{1,2}:\d{2}(?:\s?[AP]M)?)\b/g,
  guestCountRegex: /\b(\d+)\s+guest(s)?\b/i, // Regex to find "X guests"
  debounceDelay: 300,
};

// ====================================================================
// HELPER FUNCTIONS
// ====================================================================

function removeExistingCostUI() {
  document.getElementById('meeting-cost-container')?.remove();
}

function parseDurationToHours(dateStr, startTimeStr, endTimeStr) {
  if (!dateStr || !startTimeStr || !endTimeStr) return 0;
  try {
    const fullDateString = dateStr.includes(',') ? dateStr : `${dateStr}, ${new Date().getFullYear()}`;
    const startDateTime = new Date(`${fullDateString} ${startTimeStr}`);
    let endDateTime = new Date(`${fullDateString} ${endTimeStr}`);
    if (endDateTime <= startDateTime) endDateTime.setDate(endDateTime.getDate() + 1);
    return (endDateTime - startDateTime) / 3600000;
  } catch (e) {
    return 0;
  }
}

function formatCost(amount) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

// ====================================================================
// RENDER FUNCTIONS
// ====================================================================

function renderViewCost(dialog) {
  let timeContainer = null;
  const potentialRows = dialog.querySelectorAll('div');
  for (const row of potentialRows) {
    const foundTimes = row.textContent.match(config.timeRegex);
    if (foundTimes && foundTimes.length >= 2) {
      timeContainer = row;
      break;
    }
  }
  if (!timeContainer) return;

  const duration = parseDurationToHours(new Date().toDateString(), ...timeContainer.textContent.match(config.timeRegex));
  if (duration === 0) return;

  // More reliable way to find the total guest count
  let totalInvitees = 0;
  const allTextDivs = dialog.querySelectorAll('div.UfeRlc');
  for (const div of allTextDivs) {
    const match = div.textContent.match(config.guestCountRegex);
    if (match && match[1]) {
      totalInvitees = parseInt(match[1], 10);
      break; // Stop after finding the first match
    }
  }

  const attendeeChips = dialog.querySelectorAll(config.selectors.view.attendeeChip);
  // Fallback if the regex fails, to ensure it always has a value
  if (totalInvitees === 0) {
      totalInvitees = Math.max(1, attendeeChips.length);
  }

  let acceptingInvitees = 0;
  if (attendeeChips.length === 0) {
      acceptingInvitees = 1; // It's just you
  } else {
      attendeeChips.forEach(chip => {
          const status = (chip.getAttribute('aria-label') || '').toLowerCase();
          if (!status.includes('declined') && !status.includes('no (')) {
              acceptingInvitees++;
          }
      });
  }

  const totalCost = totalInvitees * config.costPerHour * duration;
  const acceptingCost = Math.max(1, acceptingInvitees) * config.costPerHour * duration;

  removeExistingCostUI();
  const html = `
    <div id="meeting-cost-container" style="padding: 15px 16px; border-top: 1px solid #eee; margin-top: 15px;">
      <div style="font-size: 11px; color: #70757a; margin-bottom: 8px;">($${config.costPerHour}/hr/person)</div>
      <div style="display: flex; justify-content: space-between; font-size: 14px; color: #3c4043; align-items: center; margin-bottom: 4px;">
        <span style="font-weight: 500;">All invitees (${totalInvitees} people):</span>
        <span style="font-weight: 700; font-size: 15px;">${formatCost(totalCost)}</span>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 14px; color: #3c4043; align-items: center;">
        <span style="font-weight: 500;">Accepting attendees (Yes/Maybe, ${acceptingInvitees} people):</span>
        <span style="font-weight: 700; font-size: 15px;">${formatCost(acceptingCost)}</span>
      </div>
    </div>`;

  const idealAnchor = dialog.querySelector(config.selectors.view.idealAnchor);
  const fallbackAnchor = dialog.querySelector(config.selectors.view.fallbackAnchor);
  if (idealAnchor) {
    const idealHtml = html.replace('border-top: 1px solid #eee; margin-top: 15px;', 'border-bottom: 1px solid #eee; margin-bottom: 15px; padding: 0 16px 15px;');
    idealAnchor.insertAdjacentHTML('beforebegin', idealHtml);
  } else if (fallbackAnchor) {
    fallbackAnchor.insertAdjacentHTML('beforeend', html);
  }
}

function renderCreationCost(dialog) {
  const injectionPoint = dialog.querySelector(config.selectors.creation.contentArea);
  const startDateEl = dialog.querySelector(config.selectors.creation.startDate);

  // Guard clause to prevent initial render error.
  // Waits for the date/time elements to be populated before running.
  if (!injectionPoint || !startDateEl || !startDateEl.textContent) {
    return;
  }

  const startDateStr = startDateEl.textContent;
  const startTimeStr = dialog.querySelector(config.selectors.creation.startTime)?.textContent;
  const endTimeStr = dialog.querySelector(config.selectors.creation.endTime)?.textContent;
  const duration = parseDurationToHours(startDateStr, startTimeStr, endTimeStr);

  removeExistingCostUI();
  if (duration === 0) return;

  const attendees = dialog.querySelectorAll(config.selectors.creation.attendeeLocator);
  const totalAttendees = Math.max(1, attendees.length);
  const totalCost = totalAttendees * config.costPerHour * duration;
  const costText = formatCost(totalCost);

  const html = `
    <div id="meeting-cost-container" style="padding: 0 16px 15px; border-bottom: 1px solid #eee; margin-bottom: 15px; order: -1;">
      <div style="display: flex; justify-content: space-between; font-size: 14px; color: #3c4043; align-items: center;">
        <span style="font-weight: 500;">Estimated Cost:</span>
        <span style="font-weight: 700; font-size: 15px;">${costText}</span>
      </div>
    </div>`;

  injectionPoint.insertAdjacentHTML('afterbegin', html);
}

// ====================================================================
// STABLE AUTOMATIC OBSERVER (ROUTER)
// ====================================================================

let debounceTimer;

function handleDOMChange() {
  const dialogElement = document.querySelector(config.selectors.dialog);
  if (dialogElement) {
    // Use the reliable 'autofocus' input to identify the creation card
    if (dialogElement.querySelector(config.selectors.creation.identifier)) {
      renderCreationCost(dialogElement);
    } else {
      renderViewCost(dialogElement);
    }
  } else {
    removeExistingCostUI();
  }
}

const observer = new MutationObserver(() => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(handleDOMChange, config.debounceDelay);
});

observer.observe(document.body, { childList: true, subtree: true });

console.log("[Meeting Cost] Script is running.");