browser.storage.local.get().then(store => {

    browser.tabs.query({ currentWindow: true, active: true })
        .then((tabs) => {
            const behaviors = document.getElementById('behaviors');

            const data = store.data[tabs[0].url];
            console.log(tabs[0].url, data)
            const justFine = document.getElementById('just-fine');
            if (Object.keys(data).length === 0) {
                justFine.classList.remove('hidden');
                return;
            }
            
            justFine.classList.add('hidden');

            if (data['cors-star']) {
                const listItem = document.createElement("li");
                listItem.textContent = 'Site calls an API with Access-Control-Allow-Origin: *';
                behaviors.appendChild(listItem);
            }

        });

});
