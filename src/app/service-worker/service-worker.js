//https://medium.com/commencis/what-is-service-worker-4f8dc478f0b9
const VERSION = "version-1.0";
const NAME = "SAMPLE";
const SW_CACHE_INSTANCE = NAME + '-' + VERSION;
const PRECACHED_FILES = ["./", "./noconnection.json"];

self.addEventListener('install', async (e) => {
    console.log('Service worker Installed');
    const cache = await caches.open(SW_CACHE_INSTANCE);
    cache.addAll(PRECACHED_FILES)
});

self.addEventListener('activate', async (e) => {
    console.log('Service worker Activated');
    deleteUnusedObject();
});

self.addEventListener('fetch', (e) => {
    const request = e.request;
    const url = new URL(request.url);
    if (url.pathname === "/" || (url.pathname.includes('.js') || url.pathname.includes('.css'))) {
        e.respondWith(cacheFirst(request));
    } else if(!url.pathname.includes('sockjs-node')) { //to avoid dev sever url
        e.respondWith(networkFirst(request));
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