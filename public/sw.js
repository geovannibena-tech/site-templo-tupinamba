const CACHE='meu-templo-shell-v4';
const SHELL=['/manifest.webmanifest','/app-icon.svg','/app-icon-192.svg','/app-icon-512.svg'];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).catch(()=>{}));
  self.skipWaiting();
});

self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin) return;

  const isStatic = url.pathname.startsWith('/assets/') ||
    url.pathname==='/manifest.webmanifest' ||
    url.pathname.startsWith('/app-icon');

  if(!isStatic){
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(caches.match(event.request).then(cached=>cached || fetch(event.request).then(response=>{
    if(response && response.ok){
      const copy=response.clone();
      caches.open(CACHE).then(cache=>cache.put(event.request,copy)).catch(()=>{});
    }
    return response;
  })));
});
