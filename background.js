browser.storage.local.get().then(store => {
    if (!store.data) {
        store = {
            data: {}
        };
    }

    function setText(url) {
        const data = store.data[url] != null ? store.data[url] : [];
        const text = data.length === 0 ? '' : '!';
        browser.browserAction.setBadgeText({
            text
        });
    }
    
    function responseListener(requestDetails) {
        const origin = requestDetails.originUrl;
    
        if (store.data[origin] == null) {
            store.data[origin] = {};
        }
    
        if (requestDetails.type != 'xmlhttprequest') {
            return;
        }
    
        const corsHeader = requestDetails.responseHeaders.find(h => h.name.toLowerCase() == 'access-control-allow-origin')
        if (corsHeader != null && corsHeader.value == '*') {
            store.data[origin]['cors-star'] = true;
            browser.storage.local.set(store);
        }
    
        browser.tabs.query({ currentWindow: true, active: true })
            .then((tabs) => {
                if (tabs[0].url == origin) {
                    setText(tabs[0].url);
                }
            });
    }

    browser.webRequest.onHeadersReceived.addListener(
        responseListener,
        { urls: ["<all_urls>"] },
        ["responseHeaders"]);

    browser.tabs.onActivated.addListener((activeInfo) => {
        browser.tabs.query({ currentWindow: true, active: true })
            .then((tabs) => {
                setText(tabs[0].url);
            });
    });
    // <a target="_blank" href="https://icons8.com/icons/set/detective">Detective icon</a> icon by <a target="_blank" href="https://icons8.com">Icons8</a>
});
