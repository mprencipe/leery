// ensure other code doesn't blow up
function initializeStore(store) {
    if (!store) {
        store = {};
    }
    if (!store.data) {
        store.data = {};
    }
    if (!store.options) {
        store.options = {};
    }
    browser.storage.local.set(store);
}

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

function ajaxRequest(requestDetails) {
    return requestDetails.type === 'xmlhttprequest';
}

function onHeadersReceived(requestDetails) {
    if (!ajaxRequest(requestDetails)) {
        return;
    }

    browser.storage.local.get().then(store => {
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

function handleCors(requestDetails, store) {
    const documentOrigin = new URL(requestDetails.documentUrl).origin;
    const requestOrigin = new URL(requestDetails.url).origin;

    if (store.options.corsSameDomain && (documentOrigin !== requestOrigin)) {
        return;
    }

    const corsHeader = requestDetails.responseHeaders.find(h => h.name.toLowerCase() == 'access-control-allow-origin');
    if (corsHeader != null && corsHeader.value == '*') {
        store.data[requestDetails.originUrl]['cors-star'] = true;
        browser.storage.local.set(store);
    }
}

// set site data based on header abnormalities
function handleHeaders(requestDetails, store) {
    handleCors(requestDetails, store);
}

browser.storage.local.get().then(store => {
    initializeStore(store);
});

// initialize listeners
browser.webRequest.onHeadersReceived.addListener(
    onHeadersReceived,
    { urls: ["<all_urls>"] },
    ["responseHeaders"]);
