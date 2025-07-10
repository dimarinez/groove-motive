import * as THREE from 'three';

/**
 * Simple Device Orientation Controls
 * A simplified alternative to Three.js DeviceOrientationControls
 * Provides smooth camera rotation based on device orientation
 */
export class SimpleDeviceOrientationControls {
  constructor(camera) {
    this.camera = camera;
    this.enabled = false;
    
    // Orientation state
    this.deviceOrientation = { alpha: 0, beta: 0, gamma: 0 };
    this.initialOrientation = null;
    this.smoothedOrientation = { yaw: 0, pitch: 0 };
    
    // Smoothing settings
    this.smoothingFactor = 0.15;
    this.sensitivity = 1.0;
    
    // Limits for pitch (up/down rotation)
    this.minPitch = THREE.MathUtils.degToRad(-60);
    this.maxPitch = THREE.MathUtils.degToRad(60);
    
    // Bind methods
    this.onDeviceOrientationChange = this.onDeviceOrientationChange.bind(this);
    this.onScreenOrientationChange = this.onScreenOrientationChange.bind(this);
    
    // Check if device orientation is available
    this.isAvailable = typeof DeviceOrientationEvent !== 'undefined';
    
    console.log('SimpleDeviceOrientationControls initialized', {
      available: this.isAvailable,
      userAgent: navigator.userAgent
    });
  }
  
  /**
   * Enable the controls and start listening to device orientation
   */
  connect() {
    if (!this.isAvailable) {
      console.warn('Device orientation not available');
      return false;
    }
    
    this.enabled = true;
    
    // Add event listeners
    window.addEventListener('deviceorientation', this.onDeviceOrientationChange, false);
    window.addEventListener('orientationchange', this.onScreenOrientationChange, false);
    screen.orientation?.addEventListener('change', this.onScreenOrientationChange, false);
    
    console.log('Device orientation controls connected');
    return true;
  }
  
  /**
   * Disable the controls and stop listening to device orientation
   */
  disconnect() {
    this.enabled = false;
    
    // Remove event listeners
    window.removeEventListener('deviceorientation', this.onDeviceOrientationChange, false);
    window.removeEventListener('orientationchange', this.onScreenOrientationChange, false);
    screen.orientation?.removeEventListener('change', this.onScreenOrientationChange, false);
    
    console.log('Device orientation controls disconnected');
  }
  
  /**
   * Handle device orientation change events
   */
  onDeviceOrientationChange(event) {
    if (!this.enabled) return;
    
    const { alpha, beta, gamma } = event;
    
    // Update device orientation (handle null values)
    this.deviceOrientation = {
      alpha: alpha !== null ? alpha : 0,
      beta: beta !== null ? beta : 0,
      gamma: gamma !== null ? gamma : 0
    };
    
    // Set initial orientation on first valid reading
    if (!this.initialOrientation && alpha !== null && beta !== null && gamma !== null) {
      this.calibrate();
    }
  }
  
  /**
   * Handle screen orientation changes
   */
  onScreenOrientationChange() {
    // Reset calibration when screen orientation changes
    setTimeout(() => {
      this.calibrate();
    }, 500);
  }
  
  /**
   * Calibrate the controls to current device orientation
   */
  calibrate() {
    if (!this.deviceOrientation) return;
    
    this.initialOrientation = { ...this.deviceOrientation };
    this.smoothedOrientation = {
      yaw: this.camera.rotation.y,
      pitch: this.camera.rotation.x
    };
    
    console.log('Orientation calibrated:', {
      initial: this.initialOrientation,
      camera: {
        yaw: THREE.MathUtils.radToDeg(this.camera.rotation.y).toFixed(1),
        pitch: THREE.MathUtils.radToDeg(this.camera.rotation.x).toFixed(1)
      }
    });
  }
  
  /**
   * Update camera rotation based on device orientation
   */
  update() {
    if (!this.enabled || !this.initialOrientation) return;
    
    // Calculate relative orientation changes
    const deltaAlpha = this.deviceOrientation.alpha - this.initialOrientation.alpha;
    const deltaBeta = this.deviceOrientation.beta - this.initialOrientation.beta;
    const deltaGamma = this.deviceOrientation.gamma - this.initialOrientation.gamma;
    
    // Handle alpha wraparound (0-360 degrees)
    let normalizedDeltaAlpha = deltaAlpha;
    if (Math.abs(deltaAlpha) > 180) {
      normalizedDeltaAlpha = deltaAlpha > 0 ? deltaAlpha - 360 : deltaAlpha + 360;
    }
    
    // Convert to radians and apply sensitivity
    const targetYaw = -THREE.MathUtils.degToRad(normalizedDeltaAlpha) * this.sensitivity;
    const targetPitch = THREE.MathUtils.degToRad(deltaBeta) * this.sensitivity;
    
    // Apply smoothing
    this.smoothedOrientation.yaw = THREE.MathUtils.lerp(
      this.smoothedOrientation.yaw,
      targetYaw,
      this.smoothingFactor
    );
    
    this.smoothedOrientation.pitch = THREE.MathUtils.lerp(
      this.smoothedOrientation.pitch,
      targetPitch,
      this.smoothingFactor
    );
    
    // Clamp pitch to prevent over-rotation
    this.smoothedOrientation.pitch = THREE.MathUtils.clamp(
      this.smoothedOrientation.pitch,
      this.minPitch,
      this.maxPitch
    );
    
    // Apply rotation to camera
    this.camera.rotation.y = this.smoothedOrientation.yaw;
    this.camera.rotation.x = this.smoothedOrientation.pitch;
    this.camera.rotation.z = 0; // Keep roll locked
  }
  
  /**
   * Set sensitivity for orientation changes
   * @param {number} sensitivity - Sensitivity multiplier (default: 1.0)
   */
  setSensitivity(sensitivity) {
    this.sensitivity = Math.max(0.1, Math.min(3.0, sensitivity));
  }
  
  /**
   * Set smoothing factor for orientation changes
   * @param {number} factor - Smoothing factor between 0 and 1 (default: 0.15)
   */
  setSmoothing(factor) {
    this.smoothingFactor = Math.max(0.01, Math.min(1.0, factor));
  }
  
  /**
   * Set pitch limits
   * @param {number} minDegrees - Minimum pitch in degrees
   * @param {number} maxDegrees - Maximum pitch in degrees
   */
  setPitchLimits(minDegrees, maxDegrees) {
    this.minPitch = THREE.MathUtils.degToRad(minDegrees);
    this.maxPitch = THREE.MathUtils.degToRad(maxDegrees);
  }
  
  /**
   * Get current orientation data for debugging
   */
  getOrientationData() {
    return {
      device: this.deviceOrientation,
      initial: this.initialOrientation,
      smoothed: {
        yaw: THREE.MathUtils.radToDeg(this.smoothedOrientation.yaw),
        pitch: THREE.MathUtils.radToDeg(this.smoothedOrientation.pitch)
      },
      camera: {
        yaw: THREE.MathUtils.radToDeg(this.camera.rotation.y),
        pitch: THREE.MathUtils.radToDeg(this.camera.rotation.x),
        roll: THREE.MathUtils.radToDeg(this.camera.rotation.z)
      }
    };
  }
  
  /**
   * Check if controls are enabled and working
   */
  get isEnabled() {
    return this.enabled && this.initialOrientation !== null;
  }
  
  /**
   * Dispose of the controls
   */
  dispose() {
    this.disconnect();
    this.camera = null;
    this.deviceOrientation = null;
    this.initialOrientation = null;
    this.smoothedOrientation = null;
  }
}