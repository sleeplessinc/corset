
// Copyright 2013 Sleepless Inc. All Rights Reserved

settings = lsGet("corset_settings");

function init() {

	host = settings.host || "";

    chrome.browserAction.setBadgeText({ text:host });


    //show options page on icon click
	function showOptions() {
		chrome.tabs.create({ url:chrome.extension.getURL('/options.html') });
	}
    chrome.browserAction.onClicked.removeListener(showOptions);
    chrome.browserAction.onClicked.addListener(showOptions);


	function onHeadersReceivedHandler(info) {
		var hdrs = info.responseHeaders;
		// XXX hdrs.push({name:"Access-Control-Allow-Origin", value:"*"});
		return { responseHeaders:hdrs };
	}

	function onBeforeSendHeadersHandler(info) {
		var hdrs = info.requestHeaders;
		var url = "http://"+host;
		var clipped = info.url.substring(0, url.length);
		if(url == clipped) {
			hdrs.forEach(function(hdr) {
				if(hdr.name.toLowerCase() == "origin") {
					hdr.value = url;
				}
			});
		}
		return {requestHeaders: hdrs};
	}


	// remove listeners
    if (chrome.webRequest.onHeadersReceived.hasListener(onHeadersReceivedHandler)) {
        chrome.webRequest.onHeadersReceived.removeListener(onHeadersReceivedHandler)
    }
    if (chrome.webRequest.onHeadersReceived.hasListener(onBeforeSendHeadersHandler)) {
        chrome.webRequest.onHeadersReceived.removeListener(onBeforeSendHeadersHandler)
    }

	if(host) {
		// re-add listeners
		var url = "http://" + host + "/*";
		chrome.webRequest.onHeadersReceived.addListener(
			onHeadersReceivedHandler, { urls:[url] }, ["blocking", "responseHeaders"]
		);
		chrome.webRequest.onBeforeSendHeaders.addListener(
			onBeforeSendHeadersHandler, {urls:[url]}, ["blocking", "requestHeaders"]
		);
	}

}


// listen for updates from options page
chrome.extension.onRequest.addListener(function (request, sender, sendResponse) {
	settings.host = request.host;
	lsSet("corset_settings", settings);
    init();
    sendResponse("Saved host: "+host);
});


init();


