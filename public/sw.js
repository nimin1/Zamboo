// Zamboo Service Worker for PWA functionality

const CACHE_NAME = 'zamboo-v1.0.0'
const STATIC_CACHE = 'zamboo-static-v1.0.0'
const RUNTIME_CACHE = 'zamboo-runtime-v1.0.0'

// Files to cache for offline functionality
const STATIC_FILES = [
  '/',
  '/create',
  '/templates',
  '/game',
  '/manifest.json',
  // Add your key assets here when they're available
  // '/icons/icon-192x192.png',
  // '/icons/icon-512x512.png'
]

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker')
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static files')
        return cache.addAll(STATIC_FILES)
      })
      .catch((error) => {
        console.error('[SW] Failed to cache static files:', error)
      })
  )
  
  // Skip waiting to activate immediately
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker')
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== RUNTIME_CACHE) {
            console.log('[SW] Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  
  // Claim all clients immediately
  self.clients.claim()
})

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }
  
  // Skip external domains (except for fonts and APIs we control)
  if (!url.origin.includes(self.location.origin) && 
      !url.origin.includes('fonts.googleapis.com') &&
      !url.origin.includes('fonts.gstatic.com')) {
    return
  }
  
  // Handle API routes differently
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request))
    return
  }
  
  // Handle static assets and pages
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          console.log('[SW] Serving from cache:', request.url)
          return cachedResponse
        }
        
        // Not in cache, fetch from network
        return fetch(request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response
            }
            
            // Cache successful responses
            const responseToCache = response.clone()
            caches.open(RUNTIME_CACHE)
              .then((cache) => {
                console.log('[SW] Caching new resource:', request.url)
                cache.put(request, responseToCache)
              })
            
            return response
          })
          .catch((error) => {
            console.error('[SW] Fetch failed:', error)
            
            // Try to serve a cached fallback for navigation requests
            if (request.mode === 'navigate') {
              return caches.match('/')
                .then((fallback) => fallback || new Response('Offline - No cached content available'))
            }
            
            throw error
          })
      })
  )
})

// Handle API requests with special offline logic
async function handleApiRequest(request) {
  try {
    // Always try network first for API calls
    const networkResponse = await fetch(request)
    
    // Cache successful API responses (with expiration)
    if (networkResponse.ok) {
      const cache = await caches.open(RUNTIME_CACHE)
      const responseToCache = networkResponse.clone()
      
      // Add timestamp for cache expiration
      const response = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: {
          ...responseToCache.headers,
          'sw-cache-timestamp': Date.now().toString()
        }
      })
      
      await cache.put(request, response)
      return networkResponse
    }
    
    return networkResponse
  } catch (error) {
    console.log('[SW] API request failed, checking cache:', request.url)
    
    // Try to serve from cache if network fails
    const cachedResponse = await caches.match(request)
    
    if (cachedResponse) {
      // Check if cached response is not too old (1 hour)
      const cacheTimestamp = cachedResponse.headers.get('sw-cache-timestamp')
      const isExpired = cacheTimestamp && (Date.now() - parseInt(cacheTimestamp)) > 3600000
      
      if (!isExpired) {
        console.log('[SW] Serving API response from cache:', request.url)
        return cachedResponse
      }
    }
    
    // Return a helpful offline response for API calls
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Offline - This feature requires an internet connection',
        offline: true,
        suggestions: [
          'Check your internet connection',
          'Try again when you\'re online',
          'Use template games which work offline'
        ]
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }
}

// Handle background sync for game saves
self.addEventListener('sync', (event) => {
  if (event.tag === 'save-game') {
    event.waitUntil(syncSavedGames())
  }
})

// Sync saved games when back online
async function syncSavedGames() {
  try {
    // Get pending saves from IndexedDB or localStorage
    const pendingSaves = JSON.parse(localStorage.getItem('pendingGameSaves') || '[]')
    
    for (const save of pendingSaves) {
      try {
        await fetch('/api/saveGame', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(save)
        })
        
        // Remove from pending saves on success
        const updatedPending = pendingSaves.filter(item => item.id !== save.id)
        localStorage.setItem('pendingGameSaves', JSON.stringify(updatedPending))
      } catch (error) {
        console.error('[SW] Failed to sync game save:', error)
      }
    }
  } catch (error) {
    console.error('[SW] Background sync failed:', error)
  }
}

// Show notification for app updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

// Push notifications (for future features)
self.addEventListener('push', (event) => {
  if (!event.data) return
  
  const data = event.data.json()
  
  const options = {
    body: data.body || 'New update available!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: data.data || {},
    actions: [
      {
        action: 'open',
        title: 'Open Zamboo',
        icon: '/icons/icon-96x96.png'
      },
      {
        action: 'close',
        title: 'Close'
      }
    ]
  }
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'Zamboo Update', options)
  )
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      self.clients.openWindow('/')
    )
  }
})