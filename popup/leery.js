const options = document.querySelector('.options');
const warnings = document.querySelector('.warnings');

document.querySelector('.clear-data').onclick = () => {
    browser.storage.local.set({ data: {} });
    browser.browserAction.setBadgeText({
        text: ''
    });
    window.close();
};

function hideElement(el) {
    el.classList.add('hidden');
}

function showElement(el) {
    el.classList.remove('hidden');
}

function isElementHidden(el) {
    return el.classList.contains('hidden');
}

document.querySelector('.toggle-options').onclick = () => {
    if (isElementHidden(options)) {
        showElement(options);
        hideElement(warnings);
    } else {
        hideElement(options);
        showElement(warnings);
    }
};

function addWarning(description, linkUrl, warningsList) {
    const listItem = document.createElement("li");
    warningsList.appendChild(listItem);
    const descItem = document.createElement('span');
    descItem.innerHTML = description;
    listItem.appendChild(descItem   );
    const link = document.createElement('a');
    link.setAttribute('href', linkUrl);
    link.setAttribute('target', '_blanks');
    link.innerHTML = '?';
    listItem.appendChild(link);
}

browser.storage.local.get().then((store) => {

    const warningsList = document.querySelector('.warnings-list');
    
    browser.tabs.query({ currentWindow: true, active: true }).then(tabs => {

        const tabUrl = normalizeUrl(tabs[0].url);
        const data = store.data != null && store.data[tabUrl] != null ? store.data[tabUrl] : {};
    
        const noWarnings = document.querySelector('.no-warnings');
        if (Object.keys(data).length === 0) {
            noWarnings.classList.remove('hidden');
            return;
        }
        noWarnings.classList.add('hidden');

        if (data['cors-star']) {
            addWarning('API call with Access-Control-Allow-Origin: *', 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Origin', warningsList);
        }
        if (data.clickjack) {
            addWarning('No X-Frame-Options present', 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options', warningsList);
        }
        if (data.referrerLeak) {
            addWarning('Unsafe or missing referrer policy', 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referer', warningsList);
        }
        if (data.hsts) {
            addWarning('No Strict-Transport-Security header', 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security', warningsList);
        }
        if (data.mimeSniffing) {
            addWarning('X-Content-Type-Options: nosniff missing', 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options', warningsList);
        }
        if (data.server) {
            addWarning('Server header might reveal server software', 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Server', warningsList);
        }

    }).catch((err) => {
        console.log('Error querying tabs', err);
    });

});
