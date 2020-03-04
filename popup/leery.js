browser.storage.local.get().then(store => {

    browser.tabs.query({ currentWindow: true, active: true })
        .then((tabs) => {
            const behaviors = document.getElementById('behaviors');

            const data = store.data[tabs[0].url];
            const justFine = document.getElementById('just-fine');
            if (!data) {
                justFine.classList.remove('hidden');
                return;
            }
            
            justFine.classList.add('hidden');
            
            if (data.includes('cors-star')) {
                const listItem = document.createElement("li");
                listItem.textContent = 'Site calls an API with Access-Control-Allow-Origin: *';
                behaviors.appendChild(listItem);
            }

        });

});
