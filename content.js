// Utility for writing to the clipboard
const writeClipboard = (str) => {
	var copyFrom = document.createElement("textarea");
	copyFrom.textContent = str;
	document.body.appendChild(copyFrom);
	copyFrom.select();
	document.execCommand('copy');
	document.body.removeChild(copyFrom);
}

// Initialize the InboxSDK
InboxSDK.load('1', 'sdk_gmail-id-copy_457e9be754').then(function(sdk){
	var barMessage;

	// Whenever a message is loaded, add a menu button to the More menu
	sdk.Conversations.registerMessageViewHandler(function(messageView) {
		messageView.addToolbarButton({
			section: 'MORE',
			title: 'Copy message ID',
			onClick: function () {
				// When it's clicked, send a message to page.js
				barMessage = sdk.ButterBar.showSaving({text: "Loading...", confirmationText: "Message ID copied to clipboard!"});
				window.postMessage({type: 'FETCH_ATTACHMENT', id: messageView.getMessageID()}, "*");
			},
			orderHint: 0
		});
	});

	// Handlers for message id success and failure
	window.addEventListener("message", function(event) {
		if (event.source != window || event.data.type != 'FETCH_RESULT') {
			return;
		}

		writeClipboard('rfc822msgid:' + event.data.result);
		barMessage.resolve();
	});

	window.addEventListener("message", function(event) {
		if (event.source != window || event.data.type != 'FETCH_ERROR') {
			return;
		}

		barMessage.reject();
		sdk.ButterBar.showError({text: "Unable to find message ID"});
	});
});

/**
 * Inject the page script.
 *
 * See page.js for why we need to do this
 */
var s = document.createElement('script');
s.src = chrome.extension.getURL('page.js');
s.onload = function () {
	this.parentNode.removeChild(this);
};
(document.head || document.documentElement).appendChild(s);
