// Analytics utility for tracking user interactions
// Replace GA_MEASUREMENT_ID with your actual Google Analytics Measurement ID

// Helper function to safely send events
function sendEvent(eventName, parameters = {}) {
  if (typeof gtag !== 'undefined') {
    gtag('event', eventName, parameters);
    console.log(`Analytics Event: ${eventName}`, parameters);
  } else {
    console.warn('Google Analytics not loaded');
  }
}

// Scene and navigation events
export function trackSceneEntry() {
  sendEvent('scene_entry', {
    event_category: 'engagement',
    event_label: 'gallery_entered',
    value: 1
  });
}

export function trackSceneExit() {
  sendEvent('scene_exit', {
    event_category: 'engagement',
    event_label: 'gallery_exited'
  });
}

// Music interaction events
export function trackTrackPlay(albumTitle, trackUrl) {
  sendEvent('track_play', {
    event_category: 'music',
    event_label: albumTitle,
    track_url: trackUrl,
    value: 1
  });
}

export function trackTrackPause(albumTitle, playDuration) {
  sendEvent('track_pause', {
    event_category: 'music',
    event_label: albumTitle,
    play_duration: Math.round(playDuration),
    value: Math.round(playDuration)
  });
}

export function trackTrackComplete(albumTitle, totalDuration) {
  sendEvent('track_complete', {
    event_category: 'music',
    event_label: albumTitle,
    total_duration: Math.round(totalDuration),
    value: 1
  });
}

// Purchase/conversion events
export function trackBuyButtonClick(albumTitle, buyUrl, source = '3d_gallery') {
  // This is a key conversion event
  sendEvent('purchase_intent', {
    event_category: 'conversion',
    event_label: albumTitle,
    buy_url: buyUrl,
    source: source,
    value: 1
  });
  
  // Also send as a GA4 recommended ecommerce event
  sendEvent('begin_checkout', {
    currency: 'USD',
    items: [{
      item_name: albumTitle,
      item_category: 'music',
      item_variant: source
    }]
  });
}

// Artwork interaction events
export function trackArtworkApproach(albumTitle) {
  sendEvent('artwork_approach', {
    event_category: 'engagement',
    event_label: albumTitle,
    value: 1
  });
}

export function trackArtworkView(albumTitle, viewDuration) {
  sendEvent('artwork_view', {
    event_category: 'engagement',
    event_label: albumTitle,
    view_duration: Math.round(viewDuration),
    value: Math.round(viewDuration)
  });
}

// Video interaction events
export function trackVideoClick(videoTitle, videoUrl, videoId) {
  sendEvent('video_click', {
    event_category: 'video',
    event_label: videoTitle,
    video_url: videoUrl,
    video_id: videoId,
    value: 1
  });
}

export function trackArtistClick(artistName, artistUrl, source = 'unknown') {
  sendEvent('artist_click', {
    event_category: 'artist',
    event_label: artistName,
    artist_url: artistUrl,
    source: source,
    value: 1
  });
}

// Enhanced music tracking with specific track details
export function trackTrackPlayDetailed(albumTitle, artistName, trackUrl, source = '3d_gallery') {
  sendEvent('track_play', {
    event_category: 'music',
    event_label: albumTitle,
    artist_name: artistName,
    track_url: trackUrl,
    source: source,
    value: 1
  });
}

export function trackTrackPauseDetailed(albumTitle, artistName, playDuration) {
  sendEvent('track_pause', {
    event_category: 'music',
    event_label: albumTitle,
    artist_name: artistName,
    play_duration: Math.round(playDuration),
    value: Math.round(playDuration)
  });
}

export function trackPurchaseByTrack(albumTitle, artistName, buyUrl, source = '3d_gallery') {
  // Track the specific track being purchased
  sendEvent('purchase_intent', {
    event_category: 'conversion',
    event_label: albumTitle,
    artist_name: artistName,
    buy_url: buyUrl,
    source: source,
    value: 1
  });
  
  // GA4 enhanced ecommerce event
  sendEvent('begin_checkout', {
    currency: 'USD',
    items: [{
      item_name: albumTitle,
      item_category: 'music',
      item_variant: source,
      price: 1.99 // Typical track price, adjust as needed
    }]
  });
}

export function trackDeviceType() {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || 
                   ('ontouchstart' in window) || 
                   (navigator.maxTouchPoints > 0);
  
  sendEvent('device_type', {
    event_category: 'technical',
    event_label: isMobile ? 'mobile' : 'desktop',
    value: 1
  });
}

// User journey tracking
export function trackMilestone(milestone) {
  sendEvent('user_milestone', {
    event_category: 'journey',
    event_label: milestone,
    value: 1
  });
}

// Session timing
let sessionStartTime = Date.now();

export function trackSessionDuration() {
  const duration = (Date.now() - sessionStartTime) / 1000; // in seconds
  sendEvent('session_duration', {
    event_category: 'engagement',
    value: Math.round(duration),
    event_label: `${Math.round(duration / 60)} minutes`
  });
}

// Initialize analytics
export function initializeAnalytics() {
  // Track device type on load
  trackDeviceType();
  
  // Track session duration when user leaves
  window.addEventListener('beforeunload', trackSessionDuration);
  
  console.log('Analytics initialized');
}