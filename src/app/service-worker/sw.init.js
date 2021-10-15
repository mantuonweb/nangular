async function registerServiceWorker() {
    const CURRENT_VERSION = "version-2.0";
    let OLD_TO_UPDATE
    let reg
    const registration = await navigator.serviceWorker.register('service-worker.js?v=1').then((registration) => {
        reg = registration;
        // Registration was successful
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }, (err) => {
        // registration failed :(
        console.log('ServiceWorker registration failed: ', err);
    });

    navigator.serviceWorker.addEventListener('message', event => {
        // event is a MessageEvent object
        console.log(`The service worker sent me a message:`,event.data);
        if (event.data && event.data.type === "CHECK_VERSION") {
            OLD_TO_UPDATE = event.data.payload;
            if (CURRENT_VERSION !== OLD_TO_UPDATE) {
                reg.update();
            }
        }
    });

    navigator.serviceWorker.ready.then(registration => {
        registration.active.postMessage({
            type: 'CHECK_VERSION',
        });
    });
}

registerServiceWorker();