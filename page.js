/**
 * Fetching the actual email headers requires the user's cookies, so we need to execute this in the page contents.
 *
 * This script simply waits for a message from the content script, executes the HTTP request
 * (and regex to avoid passing the entire body as JSON) and returns the resulting message id.
 */
const regex = /Message-ID: &lt;(.*)&gt;/i;

window.addEventListener("message", function(event) {
	if (event.source != window) {
		return;
	}
	
	if (event.data.type != 'FETCH_ATTACHMENT') {
		return;
	}
	
	fetch('https://mail.google.com/mail/u/0/?ui=2&ik=' + GLOBALS[9] + '&view=om&th=' + event.data.id, {credentials: 'include'}).then(function (r) {
		return r.text();
	}).then(function (r) {
		var m = regex.exec(r);
		if (m) {
			window.postMessage({type: 'FETCH_RESULT', result: m[1]}, "*");
		} else {
			window.postMessage({type: 'FETCH_ERROR'}, "*");
		}
	});
}, false);
