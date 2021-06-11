const Handlers = {};

(function () {

    function isSiteRootRequest(requestDetails) {
        return requestDetails.type === 'main_frame';
    }

    function ajaxRequest(requestDetails) {
        return requestDetails.type === 'xmlhttprequest';
    }

    Handlers.handleCors = async (requestDetails, setTextCallback) => {
        const store = await browser.storage.local.get();

        if (!ajaxRequest(requestDetails)) {
            return;
        }

        const documentOrigin = new URL(isChrome ? requestDetails.initiator : requestDetails.documentUrl).origin;

        const corsHeader = requestDetails.responseHeaders.find(h => h.name.toLowerCase() == 'access-control-allow-origin');
        if (corsHeader != null && corsHeader.value == '*') {
            const normalizedUrl = normalizeUrl(documentOrigin);
            store.data[normalizedUrl]['cors-star'] = true;
            await browser.storage.local.set(store);
            await setTextCallback(normalizedUrl);
        }
    }

    Handlers.handleClickJacking = async (requestDetails, setTextCallback) => {
        const store = await browser.storage.local.get();

        if (isSiteRootRequest(requestDetails)) {
            const xFrameOptionsHeader = requestDetails.responseHeaders.find(h => h.name.toLowerCase() === 'x-frame-options');
            if (!xFrameOptionsHeader) {
                const normalizedUrl = normalizeUrl(requestDetails.url);
                if (store.data[normalizedUrl] == null) {
                    store.data[normalizedUrl] = {};
                }
                store.data[normalizedUrl].clickjack = true;
                await browser.storage.local.set(store);
                await setTextCallback(normalizedUrl);
            }
        }
    }

    const unsafeReferrerValues = ['unsafe-url', 'origin', 'origin-when-cross-origin'];
    Handlers.handleReferrer = async (requestDetails, setTextCallback) => {
        const store = await browser.storage.local.get();

        if (isSiteRootRequest(requestDetails)) {
            const referrerPolicyHeader = requestDetails.responseHeaders.find(h => h.name.toLowerCase() === 'referrer-policy');
            if (!referrerPolicyHeader || unsafeReferrerValues.includes(referrerPolicyHeader.value.toLowerCase())) {
                const normalizedUrl = normalizeUrl(requestDetails.url);
                if (store.data[normalizedUrl] == null) {
                    store.data[normalizedUrl] = {};
                }
                store.data[normalizedUrl].referrerLeak = true;
                await browser.storage.local.set(store);
                await setTextCallback(normalizedUrl);
            }
        }
    }

    Handlers.handleMimeSniffing = async (requestDetails, setTextCallback) => {
        const store = await browser.storage.local.get();

        if (isSiteRootRequest(requestDetails)) {
            const xContentTypeOptionsHeader = requestDetails.responseHeaders.find(h => h.name.toLowerCase() === 'x-content-type-options');
            if (!xContentTypeOptionsHeader || !xContentTypeOptionsHeader.value.toLowerCase().includes('nosniff')) {
                const normalizedUrl = normalizeUrl(requestDetails.url);
                if (store.data[normalizedUrl] == null) {
                    store.data[normalizedUrl] = {};
                }
                store.data[normalizedUrl].mimeSniffing = true;
                await browser.storage.local.set(store);
                await setTextCallback(normalizedUrl);
            }
        }
    }

    Handlers.handleHSTS = async (requestDetails, setTextCallback) => {
        const store = await browser.storage.local.get();

        if (isSiteRootRequest(requestDetails)) {
            const hstsHeader = requestDetails.responseHeaders.find(h => h.name.toLowerCase() === 'strict-transport-security');
            if (!hstsHeader) {
                const normalizedUrl = normalizeUrl(requestDetails.url);
                if (store.data[normalizedUrl] == null) {
                    store.data[normalizedUrl] = {};
                }
                store.data[normalizedUrl].hsts = true;
                await browser.storage.local.set(store);
                await setTextCallback(normalizedUrl);
            }
        }
    }

})();
