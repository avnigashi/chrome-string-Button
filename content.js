// Create the button list container
const buttonList = document.createElement('div');
buttonList.id = 'button-list-overlay';
document.body.appendChild(buttonList);

// Create the minimize button
const minimizeBtn = document.createElement('button');
minimizeBtn.textContent = '-';
minimizeBtn.id = 'minimize-btn';
buttonList.appendChild(minimizeBtn);

// Create the button container
const buttonContainer = document.createElement('div');
buttonContainer.id = 'button-container';
buttonList.appendChild(buttonContainer);

// Create the "Add Button" form
const addButtonForm = document.createElement('div');
addButtonForm.id = 'add-button-form';
addButtonForm.style.display = 'none'; // Initially hidden
addButtonForm.innerHTML = `
  <h3>Add New Button</h3>
  <label for="button-name">Name:</label>
  <input type="text" id="button-name" placeholder="Button Name">
  <label for="button-value">Value:</label>
  <input type="text" id="button-value" placeholder="Button Value">
  <label for="button-color">Color:</label>
  <input type="color" id="button-color" value="#4CAF50">
  <div style="margin-top: 10px;">
    <button id="save-button">Save</button>
    <button id="cancel-button">Cancel</button>
  </div>
`;
buttonContainer.appendChild(addButtonForm);

// Create the "New Button" button
const newButtonBtn = document.createElement('button');
newButtonBtn.textContent = 'New Button';
newButtonBtn.id = 'new-button-btn';
buttonContainer.appendChild(newButtonBtn);


// Variable to store the last focused input element
let lastFocusedInput = null;

// Event listener to track the last focused input element
document.addEventListener('focus', (event) => {
  if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
    lastFocusedInput = event.target;
  }
}, true);

// Function to create a new button
function createButton(name, text, bgColor) {
  const button = document.createElement('button');
  button.textContent = name;
  button.title = text; // Use title attribute to store the text content
  button.style.backgroundColor = bgColor || '#4CAF50'; // Default background color
  button.style.color = '#ffffff'; // Default text color
  button.addEventListener('click', () => {
    if (lastFocusedInput) {
      const start = lastFocusedInput.selectionStart;
      const end = lastFocusedInput.selectionEnd;
      const currentValue = lastFocusedInput.value;
      lastFocusedInput.value = currentValue.substring(0, start) + text + currentValue.substring(end);
      lastFocusedInput.setSelectionRange(start + text.length, start + text.length);
      lastFocusedInput.focus();
    } else {
      alert('Please select an input field first.');
    }
  });
  buttonContainer.insertBefore(button, newButtonBtn);
}

// Event listener for the "New Button" button
newButtonBtn.addEventListener('click', () => {
  addButtonForm.style.display = 'block';
});

// Event listener for the "Save" button in the form
document.getElementById('save-button').addEventListener('click', () => {
  const name = document.getElementById('button-name').value;
  const text = document.getElementById('button-value').value;
  const bgColor = document.getElementById('button-color').value;
  
  if (name && text) {
    createButton(name, text, bgColor);
    // Save the new button to storage
    chrome.storage.sync.get('buttons', (data) => {
      const buttons = data.buttons || [];
      buttons.push({ name, text, bgColor });
      chrome.storage.sync.set({ buttons });
    });

    // Reset the form and hide it
    document.getElementById('button-name').value = '';
    document.getElementById('button-value').value = '';
    document.getElementById('button-color').value = '#4CAF50';
    addButtonForm.style.display = 'none';
  } else {
    alert('Please fill out both the name and value fields.');
  }
});

// Event listener for the "Cancel" button in the form
document.getElementById('cancel-button').addEventListener('click', () => {
  // Reset the form and hide it
  document.getElementById('button-name').value = '';
  document.getElementById('button-value').value = '';
  document.getElementById('button-color').value = '#4CAF50';
  addButtonForm.style.display = 'none';
});

// Load saved buttons from storage
chrome.storage.sync.get('buttons', (data) => {
  const buttons = data.buttons || [];
  buttons.forEach(button => createButton(button.name, button.text, button.bgColor));
});

// Function to apply settings
function applySettings(settings) {
    buttonList.style.position = 'fixed';
    buttonList.style[settings.overlayPosition] = '0';
    buttonList.style.top = '0';
    buttonList.style.bottom = '0';
    buttonList.style.width = settings.overlayWidth + 'px';
    buttonList.style.backgroundColor = settings.backgroundColor;
    buttonList.style.color = settings.textColor;
    buttonList.style.fontSize = settings.fontSize + 'px';
    buttonList.style.padding = '10px';
    buttonList.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.1)';
    buttonList.style.display = 'flex';
    buttonList.style.flexDirection = 'column';
    buttonList.style.zIndex = '9999';
    buttonList.style.opacity = settings.opacity;
    buttonList.style.transition = 'all 0.3s ease';

    if (settings.displayMode === 'sidebar') {
        adjustPageContent(settings.overlayPosition, settings.overlayWidth);
    } else {
        resetPageContent();
    }

    if (settings.minimizeUntilHover) {
        minimizeOverlay(true, settings);
        buttonList.addEventListener('mouseenter', () => maximizeOverlay(true, settings));
        buttonList.addEventListener('mouseleave', () => minimizeOverlay(true, settings));
    } else {
        buttonList.removeEventListener('mouseenter', () => maximizeOverlay(true, settings));
        buttonList.removeEventListener('mouseleave', () => minimizeOverlay(true, settings));
        if (settings.isMinimized) {
            minimizeOverlay(false, settings);
        } else {
            maximizeOverlay(false, settings);
        }
    }
}

function adjustPageContent(position, width) {
    document.body.style.transition = 'margin 0.3s ease';
    document.body.style[`margin${position.charAt(0).toUpperCase() + position.slice(1)}`] = `${width}px`;
}

function resetPageContent() {
    document.body.style.marginLeft = '';
    document.body.style.marginRight = '';
}

// Function to minimize the overlay
function minimizeOverlay(isHoverMode, settings) {
    buttonContainer.style.display = 'none';
    if (settings.displayMode === 'overlay') {
        buttonList.style.width = '30px';
    } else {
        // For sidebar mode, keep a small strip visible
        buttonList.style.width = '10px';
        resetPageContent();
    }
    minimizeBtn.textContent = '+';
    if (!isHoverMode) {
        chrome.storage.sync.set({ isMinimized: true });
    }
}

// Function to maximize the overlay
function maximizeOverlay(isHoverMode, settings) {
    buttonContainer.style.display = 'flex';
    buttonList.style.width = settings.overlayWidth + 'px';
    if (settings.displayMode === 'sidebar') {
        adjustPageContent(settings.overlayPosition, settings.overlayWidth);
    }
    minimizeBtn.textContent = '-';
    if (!isHoverMode) {
        chrome.storage.sync.set({ isMinimized: false });
    }
}

// Event listener for the minimize button
minimizeBtn.addEventListener('click', () => {
    chrome.storage.sync.get(['isMinimized', 'minimizeUntilHover', 'displayMode', 'overlayPosition', 'overlayWidth'], (data) => {
        if (data.minimizeUntilHover) {
            chrome.storage.sync.set({ minimizeUntilHover: false }, () => {
                applySettings({ ...data, minimizeUntilHover: false });
            });
        } else if (data.isMinimized) {
            maximizeOverlay(false, data);
        } else {
            minimizeOverlay(false, data);
        }
    });
});

// Load and apply settings
chrome.storage.sync.get({
    displayMode: 'sidebar',
    overlayPosition: 'left',
    overlayWidth: 150,
    backgroundColor: '#f0f0f0',
    textColor: '#000000',
    fontSize: 14,
    opacity: 1,
    isMinimized: true,
    minimizeUntilHover: true
}, applySettings);

// Listen for settings changes
chrome.storage.onChanged.addListener(function(changes, namespace) {
    if (namespace === 'sync') {
        chrome.storage.sync.get({
            displayMode: 'sidebar',
            overlayPosition: 'left',
            overlayWidth: 150,
            backgroundColor: '#f0f0f0',
            textColor: '#000000',
            fontSize: 14,
            opacity: 1,
            isMinimized: true,
            minimizeUntilHover: true
        }, applySettings);
    }
});
