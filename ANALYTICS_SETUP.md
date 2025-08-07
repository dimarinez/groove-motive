# Google Analytics Setup

## Step 1: Get Your Google Analytics Measurement ID
1. Go to [Google Analytics](https://analytics.google.com)
2. Create a new property or use an existing one
3. Copy your Measurement ID (starts with "G-")

## Step 2: Update the HTML File
1. Open `index.html`
2. Replace `GA_MEASUREMENT_ID` with your actual Measurement ID in both places:
   ```html
   <script async src="https://www.googletagmanager.com/gtag/js?id=YOUR_GA_ID"></script>
   <script>
     window.dataLayer = window.dataLayer || [];
     function gtag(){dataLayer.push(arguments);}
     gtag('js', new Date());
     gtag('config', 'YOUR_GA_ID');
   </script>
   ```

## What We're Tracking

### Key Conversion Events
- **Purchase Intent**: When users click buy buttons (both in 3D gallery and releases page)
- **Track Plays**: When users start playing music previews
- **Scene Entry**: When users enter the 3D gallery experience

### Engagement Events
- **Artwork Approach**: When users get close to framed artwork in 3D space
- **Track Pauses**: When users pause music with play duration
- **Orientation Permission**: When users grant/deny device orientation permissions

### Technical Events
- **Device Type**: Mobile vs desktop detection
- **Session Duration**: How long users spend in the experience

## Google Analytics 4 Events

All events are sent as GA4 custom events with these parameters:
- `event_category`: engagement, conversion, music, permissions, technical
- `event_label`: Specific item (album title, action type, etc.)
- `value`: Numeric value where applicable (duration, count)

### Key Metrics to Monitor

1. **Conversion Funnel**:
   - Scene Entry → Artwork Approach → Track Play → Buy Click

2. **Music Engagement**:
   - Play Rate: `track_play` events
   - Listen Duration: Average play time from `track_pause` events
   - Completion Rate: Users who listen to full previews

3. **Technical Performance**:
   - Mobile vs Desktop usage
   - Orientation permission grant rate
   - Session durations

### Custom Dimensions (Recommended)
Set up these custom dimensions in GA4:
- Track Name (from event_label)
- Source (3d_gallery vs releases_page)
- Device Type (mobile vs desktop)
- User Journey Stage

### Goals and Conversions
Set up these conversions in GA4:
1. **Primary**: `purchase_intent` and `begin_checkout` events
2. **Secondary**: `track_play` events (engagement conversion)
3. **Micro**: `artwork_approach` events (interest indicator)

## Testing
After setup, test by:
1. Entering the 3D gallery
2. Approaching artwork
3. Playing a track
4. Clicking buy buttons
5. Check GA4 real-time reports for events