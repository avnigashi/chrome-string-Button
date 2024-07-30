document.addEventListener('DOMContentLoaded', function() {
    // Load current settings
    chrome.storage.sync.get({
        displayMode: 'sidebar',
        overlayPosition: 'left',
        overlayWidth: 150,
        backgroundColor: '#f0f0f0',
        textColor: '#000000',
        fontSize: 14,
        opacity: 1,
        minimizeUntilHover: true,
        isMinimized: true,
        buttons: []
    }, function(items) {
        document.querySelector(`input[name="displayMode"][value="${items.displayMode}"]`).checked = true;
        document.getElementById('overlayPosition').value = items.overlayPosition;
        document.getElementById('overlayWidth').value = items.overlayWidth;
        document.getElementById('backgroundColor').value = items.backgroundColor;
        document.getElementById('textColor').value = items.textColor;
        document.getElementById('fontSize').value = items.fontSize;
        document.getElementById('opacity').value = items.opacity;
        document.getElementById('minimizeUntilHover').checked = items.minimizeUntilHover;
        renderButtonList(items.buttons);
    });

    // Save settings
    document.getElementById('saveSettings').addEventListener('click', function() {
        var displayMode = document.querySelector('input[name="displayMode"]:checked').value;
        var overlayPosition = document.getElementById('overlayPosition').value;
        var overlayWidth = document.getElementById('overlayWidth').value;
        var backgroundColor = document.getElementById('backgroundColor').value;
        var textColor = document.getElementById('textColor').value;
        var fontSize = document.getElementById('fontSize').value;
        var opacity = document.getElementById('opacity').value;
        var minimizeUntilHover = document.getElementById('minimizeUntilHover').checked;

        chrome.storage.sync.set({
            displayMode: displayMode,
            overlayPosition: overlayPosition,
            overlayWidth: overlayWidth,
            backgroundColor: backgroundColor,
            textColor: textColor,
            fontSize: fontSize,
            opacity: opacity,
            minimizeUntilHover: minimizeUntilHover
        }, function() {
            alert('Settings saved!');
        });
    });

    // Add new button
    document.getElementById('addButton').addEventListener('click', function() {
        const name = prompt('Enter button name:');
        if (name) {
            const text = prompt('Enter button text:');
            if (text) {
                const bgColor = prompt('Enter button background color (in HEX, e.g., #4CAF50):');
                const textColor = prompt('Enter button text color (in HEX, e.g., #ffffff):');
                chrome.storage.sync.get('buttons', function(data) {
                    const buttons = data.buttons || [];
                    buttons.push({ name, text, bgColor, textColor });
                    chrome.storage.sync.set({ buttons: buttons }, function() {
                        renderButtonList(buttons);
                    });
                });
            }
        }
    });

    function renderButtonList(buttons) {
        const buttonList = document.getElementById('buttonList');
        buttonList.innerHTML = '';
        buttons.forEach((button, index) => {
            const buttonItem = document.createElement('div');
            buttonItem.className = 'button-item';
            buttonItem.innerHTML = `
                <input type="text" value="${button.name}" data-index="${index}" class="button-name">
                <input type="text" value="${button.text}" data-index="${index}" class="button-text">
                <input type="color" value="${button.bgColor}" data-index="${index}" class="button-bgcolor">
                <input type="color" value="${button.textColor}" data-index="${index}" class="button-textcolor">
                <button class="delete-button" data-index="${index}">Delete</button>
            `;
            buttonList.appendChild(buttonItem);
        });

        // Add event listeners for editing and deleting buttons
        document.querySelectorAll('.button-name, .button-text, .button-bgcolor, .button-textcolor').forEach(input => {
            input.addEventListener('change', updateButton);
        });
        document.querySelectorAll('.delete-button').forEach(button => {
            button.addEventListener('click', deleteButton);
        });
    }

    function updateButton(event) {
        const index = event.target.dataset.index;
        const isName = event.target.classList.contains('button-name');
        const isText = event.target.classList.contains('button-text');
        const isBgColor = event.target.classList.contains('button-bgcolor');
        const isTextColor = event.target.classList.contains('button-textcolor');
        chrome.storage.sync.get('buttons', function(data) {
            const buttons = data.buttons;
            if (isName) {
                buttons[index].name = event.target.value;
            } else if (isText) {
                buttons[index].text = event.target.value;
            } else if (isBgColor) {
                buttons[index].bgColor = event.target.value;
            } else if (isTextColor) {
                buttons[index].textColor = event.target.value;
            }
            chrome.storage.sync.set({ buttons: buttons });
        });
    }

    function deleteButton(event) {
        const index = event.target.dataset.index;
        chrome.storage.sync.get('buttons', function(data) {
            const buttons = data.buttons;
            buttons.splice(index, 1);
            chrome.storage.sync.set({ buttons: buttons }, function() {
                renderButtonList(buttons);
            });
        });
    }
});
