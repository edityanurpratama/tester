/**
 * Service Worker untuk ML Diabetes Classifier PWA
 * Kelompok 02 5D - Micro Project 3
 * 
 * Dioptimalkan untuk sinkronisasi dengan app.js dan HTML
 */

// ===========================
// Cache Configuration
// ===========================

const CACHE_VERSION = '1.0.0';
const STATIC_CACHE = `ml-demo-static-v${CACHE_VERSION}`;
const DATA_CACHE = `ml-demo-data-v${CACHE_VERSION}`;
const RUNTIME_CACHE = `ml-demo-runtime-v${CACHE_VERSION}`;

// Cache expiry (24 hours)
const CACHE_EXPIRY = 24 * 60 * 60 * 1000;

// App Shell - sesuai dengan file yang ada di HTML
const APP_SHELL_FILES = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/diabetes.csv'
];

// External resources yang digunakan di HTML
const EXTERNAL_RESOURCES = [
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Semua file untuk di-cache
const STATIC_FILES = [...APP_SHELL_FILES, ...EXTERNAL_RESOURCES];

// Routes untuk data yang perlu network-first
const DATA_ROUTES = [
  /\.csv$/,
  /\/api\//,
  /\/data\//
];

// ===========================
// Utility Functions
// ===========================

function log(message, data = '') {
  const timestamp = new Date().toISOString();
  console.log(`[SW ${timestamp}] ${message}`, data);
}

function isDataRequest(request) {
  return DATA_ROUTES.some(route => route.test(request.url));
}

function isStaticAsset(request) {
  const url = new URL(request.url);
  return url.pathname.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/);
}

function isCacheExpired(response) {
  if (!response) return true;
  
  const cachedTime = response.headers.get('sw-cached-time');
  if (!cachedTime) return true;
  
  const age = Date.now() - parseInt(cachedTime);
  return age > CACHE_EXPIRY;
}

function addCacheTimestamp(response) {
  const responseClone = response.clone();
  const headers = new Headers(responseClone.headers);
  headers.set('sw-cached-time', Date.now().toString());
  
  return new Response(responseClone.body, {
    status: responseClone.status,
    statusText: responseClone.statusText,
    headers: headers
  });
}

// ===========================
// Offline Fallbacks
// ===========================

function createOfflinePage() {
  const offlineHTML = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Offline - ML Demo</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                margin: 0;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                text-align: center;
                padding: 20px;
            }
            .offline-container {
                max-width: 400px;
                background: rgba(255,255,255,0.1);
                padding: 40px;
                border-radius: 20px;
                backdrop-filter: blur(10px);
            }
            .offline-icon {
                font-size: 64px;
                margin-bottom: 20px;
            }
            .retry-button {
                background: #4CAF50;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                font-size: 16px;
                cursor: pointer;
                margin-top: 20px;
            }
            .features-list {
                margin-top: 20px;
                text-align: left;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="offline-container">
            <div class="offline-icon">📱</div>
            <h1>Mode Offline</h1>
            <p>Anda sedang offline, tetapi aplikasi ML Demo masih dapat digunakan.</p>
            <button class="retry-button" onclick="window.location.reload()">
                🔄 Coba Lagi
            </button>
            
            <div class="features-list">
                <h3>Fitur tersedia offline:</h3>
                <ul>
                    <li>✅ Dataset diabetes default</li>
                    <li>✅ Algoritma ML (Naive Bayes & KNN)</li>
                    <li>✅ Visualisasi scatter plot</li>
                    <li>✅ Task management</li>
                    <li>✅ Filter dan pencarian data</li>
                </ul>
            </div>
        </div>
        
        <script>
            // Auto-retry setiap 30 detik
            setTimeout(() => {
                if (navigator.onLine) {
                    window.location.reload();
                }
            }, 30000);
            
            // Listen untuk online event
            window.addEventListener('online', () => {
                window.location.reload();
            });
        </script>
    </body>
    </html>
  `;
  
  return new Response(offlineHTML, {
    headers: { 'Content-Type': 'text/html' }
  });
}

// Fallback CSV untuk offline
function createOfflineCSV() {
  const fallbackCSV = `glucose,bloodpressure,age,diabetes
148,72,50,1
85,66,31,0
183,64,32,1
89,66,21,0
137,40,33,1
116,74,30,0
78,50,26,1
115,76,36,0
197,70,45,1
125,96,54,0`;
  
  return new Response(fallbackCSV, {
    headers: { 'Content-Type': 'text/csv' }
  });
}

// ===========================
// Caching Strategies
// ===========================

async function cacheFirst(request, cacheName = STATIC_CACHE) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse && !isCacheExpired(cachedResponse)) {
    log(`Cache hit: ${request.url}`);
    return cachedResponse;
  }
  
  try {
    log(`Fetching from network: ${request.url}`);
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const responseWithTimestamp = addCacheTimestamp(networkResponse);
      cache.put(request, responseWithTimestamp.clone());
      return responseWithTimestamp;
    }
    
    // Return stale cache if network fails
    if (cachedResponse) {
      log(`Returning stale cache: ${request.url}`);
      return cachedResponse;
    }
    
    throw new Error(`Network request failed: ${networkResponse.status}`);
    
  } catch (error) {
    log(`Cache first error for ${request.url}:`, error);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page untuk navigation
    if (request.mode === 'navigate') {
      return createOfflinePage();
    }
    
    throw error;
  }
}

async function networkFirst(request, cacheName = DATA_CACHE) {
  const cache = await caches.open(cacheName);
  
  try {
    log(`Network first: ${request.url}`);
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const responseWithTimestamp = addCacheTimestamp(networkResponse);
      cache.put(request, responseWithTimestamp.clone());
      return responseWithTimestamp;
    }
    
    throw new Error(`Network response not ok: ${networkResponse.status}`);
    
  } catch (error) {
    log(`Network first fallback to cache: ${request.url}`, error);
    
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Untuk CSV files, berikan fallback data
    if (request.url.endsWith('.csv')) {
      return createOfflineCSV();
    }
    
    throw error;
  }
}

// ===========================
// Event Listeners
// ===========================

self.addEventListener('install', event => {
  log('Service Worker installing...');
  
  event.waitUntil(
    (async () => {
      try {
        const staticCache = await caches.open(STATIC_CACHE);
        await staticCache.addAll(STATIC_FILES);
        log('App shell cached successfully');
        
        self.skipWaiting();
        
      } catch (error) {
        log('Install event error:', error);
        
        // Try caching files individually
        const staticCache = await caches.open(STATIC_CACHE);
        for (const file of APP_SHELL_FILES) {
          try {
            await staticCache.add(file);
            log(`Cached: ${file}`);
          } catch (fileError) {
            log(`Failed to cache: ${file}`, fileError);
          }
        }
      }
    })()
  );
});

self.addEventListener('activate', event => {
  log('Service Worker activating...');
  
  event.waitUntil(
    (async () => {
      try {
        // Cleanup old caches
        const cacheNames = await caches.keys();
        const validCaches = [STATIC_CACHE, DATA_CACHE, RUNTIME_CACHE];
        
        const deletePromises = cacheNames
          .filter(name => !validCaches.includes(name))
          .map(name => caches.delete(name));
        
        await Promise.all(deletePromises);
        
        // Take control immediately
        await self.clients.claim();
        
        log('Service Worker activated');
        
        // Notify clients
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
          client.postMessage({
            type: 'SW_ACTIVATED',
            version: CACHE_VERSION
          });
        });
        
      } catch (error) {
        log('Activate event error:', error);
      }
    })()
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip cross-origin requests kecuali CDN yang dikenal
  if (url.origin !== location.origin && !url.hostname.includes('cdnjs.cloudflare.com')) {
    return;
  }
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  log(`Fetch intercepted: ${request.url}`);
  
  event.respondWith(
    (async () => {
      try {
        // Navigation requests (HTML pages)
        if (request.mode === 'navigate') {
          return await cacheFirst(request, STATIC_CACHE);
        }
        
        // Static assets (CSS, JS, images)
        if (isStaticAsset(request) || STATIC_FILES.includes(request.url)) {
          return await cacheFirst(request, STATIC_CACHE);
        }
        
        // Data requests (CSV)
        if (isDataRequest(request) || request.url.endsWith('.csv')) {
          return await networkFirst(request, DATA_CACHE);
        }
        
        // External CDN resources (Font Awesome)
        if (url.hostname.includes('cdnjs.cloudflare.com')) {
          return await cacheFirst(request, STATIC_CACHE);
        }
        
        // Default: cache first untuk resources lain
        return await cacheFirst(request, RUNTIME_CACHE);
        
      } catch (error) {
        log(`Fetch error for ${request.url}:`, error);
        
        // Try fallbacks
        if (request.mode === 'navigate') {
          return createOfflinePage();
        }
        
        if (request.url.endsWith('.csv')) {
          return createOfflineCSV();
        }
        
        throw error;
      }
    })()
  );
});

// ===========================
// Message Handling (untuk komunikasi dengan app.js)
// ===========================

self.addEventListener('message', event => {
  const { data } = event;
  log('Message received from client:', data);
  
  switch (data.type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'GET_VERSION':
      event.ports[0].postMessage({
        version: CACHE_VERSION
      });
      break;
      
    case 'CLEAR_CACHE':
      (async () => {
        try {
          const cacheNames = await caches.keys();
          await Promise.all(cacheNames.map(name => caches.delete(name)));
          event.ports[0].postMessage({ success: true });
        } catch (error) {
          event.ports[0].postMessage({ success: false, error: error.message });
        }
      })();
      break;
      
    case 'CACHE_STATS':
      (async () => {
        const cacheNames = await caches.keys();
        const stats = {};
        
        for (const name of cacheNames) {
          const cache = await caches.open(name);
          const keys = await cache.keys();
          stats[name] = keys.length;
        }
        
        event.ports[0].postMessage({ stats });
      })();
      break;
  }
});

// ===========================
// Background Sync (untuk task synchronization)
// ===========================

self.addEventListener('sync', event => {
  log('Background sync triggered:', event.tag);
  
  if (event.tag === 'task-sync') {
    event.waitUntil(
      (async () => {
        try {
          const clients = await self.clients.matchAll();
          
          clients.forEach(client => {
            client.postMessage({
              type: 'SYNC_TASKS'
            });
          });
          
          log('Task sync completed');
          
        } catch (error) {
          log('Background sync error:', error);
        }
      })()
    );
  }
});

// ===========================
// Error Handling
// ===========================

self.addEventListener('error', event => {
  log('Global error in service worker:', event.error);
});

self.addEventListener('unhandledrejection', event => {
  log('Unhandled promise rejection in service worker:', event.reason);
  event.preventDefault(); // Prevent default handling
});

// ===========================
// Startup
// ===========================

log(`Service Worker loaded - Version ${CACHE_VERSION}`);
