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
})

async function cacheFirst(request) {
    return await caches.match(request) || fetch(request);
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