function hideElement(el) {
    el.classList.add('hidden');
}

function showElement(el) {
    el.classList.remove('hidden');
}

function isElementHidden(el) {
    return el.classList.contains('hidden');
}

function setOptionsToggle(options, abnormalities) {
    if (isElementHidden(options)) {
        showElement(options);
        hideElement(abnormalities);
    } else {
        hideElement(options);
        showElement(abnormalities);
    }
}

const sameDomainSwitch = document.querySelector('.cors-same-domain');

browser.storage.local.get().then(store => {

    sameDomainSwitch.checked = store.options.corsSameDomain;

    const abnormalitiesList = document.querySelector('.abnormalities-list');

    browser.tabs.query({ currentWindow: true, active: true })
        .then((tabs) => {
            const data = store.data != null && store.data[tabs[0].url] != null ? store.data[tabs[0].url] : {};
            const justFine = document.querySelector('.just-fine');
            if (Object.keys(data).length === 0) {
                justFine.classList.remove('hidden');
                return;
            }

            justFine.classList.add('hidden');

            if (data['cors-star']) {
                const listItem = document.createElement("li");
                listItem.textContent = 'API call with Access-Control-Allow-Origin: *';
                abnormalitiesList.appendChild(listItem);
            }

        });
});

document.querySelector('.clear-data').onclick = () => {
    // options
    browser.storage.local.set({ data: {} });
    browser.browserAction.setBadgeText({
        text: ''
    });
    window.close();
};

sameDomainSwitch.onclick = () => {
    browser.storage.local.get().then(store => {
        store.options.corsSameDomain = sameDomainSwitch.checked;
        browser.storage.local.set({data: store.data, options: store.options});
    });
};

const abnormalities = document.querySelector('.abnormalities');
const options = document.querySelector('.options');
document.querySelector('.toggle-options').onclick = () => setOptionsToggle(options, abnormalities);