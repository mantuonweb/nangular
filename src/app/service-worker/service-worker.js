//https://medium.com/commencis/what-is-service-worker-4f8dc478f0b9
// Testing Version 2.0
const VERSION = "version-2.0";
const NAME = "SAMPLE";
const SW_CACHE_INSTANCE = NAME + '-' + VERSION;
const PRECACHED_FILES = ["./", "./noconnection.json"];

self.addEventListener('install', async (e) => {
    console.log('Service worker Installed');
    const cache = await caches.open(SW_CACHE_INSTANCE);
    cache.addAll(PRECACHED_FILES)
});

self.addEventListener('activate', async (e) => {
    console.log('Service worker Activated2');
    deleteUnusedObject(e);
});

self.addEventListener('fetch', (e) => {
    const request = e.request;
    const url = new URL(request.url);
    if (url.pathname === "/" || (url.pathname.includes('.js') || url.pathname.includes('.css'))) {
        e.respondWith(networkFirst(request));
    } else if (!url.pathname.includes('sockjs-node')) { //to avoid dev sever url
        e.respondWith(cacheFirst(request));
    }
});

self.addEventListener("message", event => {
    if (event.data && event.data.type === 'CHECK_VERSION') {
        self.clients.matchAll({
            includeUncontrolled: true,
            type: 'window',
        }).then((clients) => {
            if (clients && clients.length) {
                // Send a response - the clients
                // array is ordered by last focused
                clients.forEach((client)=>{
                    client.visibilityState === "visible" && client.postMessage({ type: 'CHECK_VERSION', payload: VERSION });
                })
            }
        });
    }
});

async function cacheFirst(request) {
    let resp;
    const cache = await caches.open(SW_CACHE_INSTANCE);
    const staleResp = await caches.match(request);
    if (staleResp) {
        resp = staleResp;
    } else {
        resp = await fetch(request);
        cache.put(request, resp.clone());
    }
    return resp;
}

async function networkFirst(request) {
    const cache = await caches.open(SW_CACHE_INSTANCE);
    try {
        const response = await fetch(request);
        cache.put(request, response.clone());
        return response;
    }
    catch (e) {
        const staleResponse = await caches.match(request);
        return staleResponse || await caches.match("./noconnection.json");
    }
}

async function deleteUnusedObject(event) {
    event.waitUntil(
        (async () => {
            const keys = await caches.keys();
            return keys.map(async (cache) => {
                if (cache !== SW_CACHE_INSTANCE) {
                    console.log('Service Worker: Removing old cache: ' + cache);
                    return await caches.delete(cache);
                }
            })
        })()
    )
}


// Stragies
async function staleAndRefresh(request) {
    let resp;
    const cache = await caches.open(SW_CACHE_INSTANCE);
    const staleResp = await caches.match(request);
    if (staleResp) {
        resp = staleResp;
        try {
            const freshFesp = await fetch(request);
            if (freshFesp) {
                cache.put(request, freshFesp.clone());
            }
        }
        catch (e) {

        }

    } else {
        try {
            resp = await fetch(request);
            cache.put(request, resp.clone());
        } catch (e) {

        }

    }
    return resp;
}