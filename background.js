// set notification when switching to a new tab
browser.tabs.onActivated.addListener((activeInfo) => {
    browser.tabs.query({ currentWindow: true, active: true })
        .then((tabs) => {
            setText(tabs[0].url);
        });
});

// set notification text if site has abnormalities
function setText(url) {
    browser.storage.local.get().then(store => {
        const data = store.data != null && store.data[url] != null ? store.data[url] : {};
        const text = Object.keys(data).length === 0 ? '' : '!';
        browser.browserAction.setBadgeText({
            text
        });
    });
}

function onHeadersReceived(requestDetails) {

    browser.storage.local.get().then(store => {

        // ensure that data object always exists so other code doesn't blow up
        if (!store.data) {
            store = {
                data: {}
            };
        }

        // if site has no existing data, add an empty data object
        if (store.data[requestDetails.originUrl] == null) {
            store.data[requestDetails.originUrl] = {};
        }

        handleHeaders(requestDetails, store);

        browser.tabs.query({ currentWindow: true, active: true })
            .then((tabs) => {
                if (tabs[0].url == requestDetails.originUrl) {
                    setText(tabs[0].url);
                }
            });

    });

}

function ajaxRequest(requestDetails) {
    return requestDetails.type === 'xmlhttprequest';
}

function handleCors(requestDetails, store) {
    if (!ajaxRequest(requestDetails)) {
        return;
    }

    const corsHeader = requestDetails.responseHeaders.find(h => h.name.toLowerCase() == 'access-control-allow-origin')
    if (corsHeader != null && corsHeader.value == '*') {
        store.data[requestDetails.originUrl]['cors-star'] = true;
        browser.storage.local.set(store);
    }
}

// set site data based on header abnormalities
function handleHeaders(requestDetails, store) {

    handleCors(requestDetails, store);

}

browser.webRequest.onHeadersReceived.addListener(
    onHeadersReceived,
    { urls: ["<all_urls>"] },
    ["responseHeaders"]);
