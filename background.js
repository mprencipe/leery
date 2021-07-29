(function () {

    // ensure other code doesn't blow up
    async function initializeStore() {
        const store = await browser.storage.local.get();
        if (!store) {
            store = {};
        }
        if (!store.data) {
            store.data = {};
        }
        if (!store.options) {
            store.options = {};
        }
        await browser.storage.local.set(store);
    }

    function getOriginUrl(requestDetails) {
        if (isChrome) {
            return normalizeUrl(requestDetails.initiator ?? requestDetails.url);
        }
        return normalizeUrl(requestDetails.originUrl ?? requestDetails.url);
    }

    // set notification text if site has warnings
    async function setNotificationText(url) {
        const store = await browser.storage.local.get();
        const data = store.data[url] ?? {};
        const warnings = Object.keys(data).length;
        const text = warnings === 0 ? '' : `${warnings}`;
        browser.browserAction.setBadgeText({
            text
        });
    }

    async function handleHeaders(requestDetails) {
        await Handlers.handleCors(requestDetails, setNotificationText);
        await Handlers.handleClickJacking(requestDetails, setNotificationText);
        await Handlers.handleReferrer(requestDetails, setNotificationText);
        await Handlers.handleHSTS(requestDetails, setNotificationText);
        await Handlers.handleMimeSniffing(requestDetails, setNotificationText);
        await Handlers.handleServer(requestDetails, setNotificationText);
    }

    async function onHeadersReceived(requestDetails) {
        const originUrl = getOriginUrl(requestDetails);

        const store = await browser.storage.local.get();

        // if site has no existing data, add an empty data object
        if (store.data[originUrl] == null) {
            store.data[originUrl] = {};
        }
        await browser.storage.local.set(store);

        await handleHeaders(requestDetails);

        try {
            const tabs = await browser.tabs.query({ currentWindow: true, active: true })
            if (tabs && tabs.length && normalizeUrl(tabs[0].url) == originUrl) {
                await setNotificationText(normalizeUrl(tabs[0].url));
            }
        } catch (err) {
            console.log('Error querying tabs', err);
        }
    }

    initializeStore();

    // set notification when switching to a new tab
    browser.tabs.onActivated.addListener(async (activeInfo) => {
        setTimeout(async () => {
            try {
                const tabs = await browser.tabs.query({ currentWindow: true, active: true });
                if (tabs.length) {
                    await setNotificationText(normalizeUrl(tabs[0].url));
                }
            } catch (err) {
                console.log('Error querying tabs', err);
            }
        }, 100);
    });

    browser.webRequest.onHeadersReceived.addListener(
        onHeadersReceived,
        { urls: ["<all_urls>"] },
        ["responseHeaders"]);

})();
