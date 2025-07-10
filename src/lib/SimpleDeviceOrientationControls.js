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
    this.smoothedOrientation = { yaw: 0, pitch: 0, roll: 0 };
    
    // Enhanced gyro and tilt settings for immediate response
    this.smoothingFactor = 0.25; // Much more responsive
    this.sensitivity = 1.8; // Higher sensitivity for immediate response
    this.tiltSensitivity = 1.5; // High sensitivity for tilt
    this.gyroSensitivity = 1.6; // High sensitivity for gyro rotation
    
    // Limits for pitch and roll
    this.minPitch = THREE.MathUtils.degToRad(-75);
    this.maxPitch = THREE.MathUtils.degToRad(75);
    this.maxRoll = THREE.MathUtils.degToRad(30); // Allow some roll for natural feel
    
    // Enhanced response settings
    this.enableTiltResponse = true; // Enable gamma (left/right tilt) response
    this.enableGyroResponse = true; // Enable alpha (compass/yaw) response
    this.invertPitch = false; // Option to invert pitch direction
    this.invertYaw = false; // Option to invert yaw direction
    this.directMode = true; // Enable direct tracking mode for immediate response
    
    // Bind methods
    this.onDeviceOrientationChange = this.onDeviceOrientationChange.bind(this);
    this.onScreenOrientationChange = this.onScreenOrientationChange.bind(this);
    
    // Check if device orientation is available
    this.isAvailable = typeof DeviceOrientationEvent !== 'undefined';
    
    console.log('Enhanced SimpleDeviceOrientationControls initialized', {
      available: this.isAvailable,
      userAgent: navigator.userAgent,
      tiltEnabled: this.enableTiltResponse,
      gyroEnabled: this.enableGyroResponse
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
      pitch: this.camera.rotation.x,
      roll: this.camera.rotation.z
    };
    
    console.log('Enhanced orientation calibrated:', {
      initial: this.initialOrientation,
      camera: {
        yaw: THREE.MathUtils.radToDeg(this.camera.rotation.y).toFixed(1),
        pitch: THREE.MathUtils.radToDeg(this.camera.rotation.x).toFixed(1),
        roll: THREE.MathUtils.radToDeg(this.camera.rotation.z).toFixed(1)
      }
    });
  }
  
  /**
   * Update camera rotation based on device orientation with enhanced gyro and tilt
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
    
    // Calculate target rotations with individual sensitivities
    let targetYaw = 0;
    let targetPitch = 0;
    let targetRoll = 0;
    
    // Gyro response (compass/yaw rotation - alpha)
    if (this.enableGyroResponse) {
      targetYaw = -THREE.MathUtils.degToRad(normalizedDeltaAlpha) * this.gyroSensitivity;
      if (this.invertYaw) targetYaw = -targetYaw;
    }
    
    // Pitch response (up/down tilt - beta)
    targetPitch = THREE.MathUtils.degToRad(deltaBeta) * this.sensitivity;
    if (this.invertPitch) targetPitch = -targetPitch;
    
    // Tilt response (left/right tilt - gamma)
    if (this.enableTiltResponse) {
      // Use gamma for more pronounced natural movement
      const tiltInfluence = THREE.MathUtils.degToRad(deltaGamma) * this.tiltSensitivity;
      
      // More pronounced roll effect for immediate visual feedback
      targetRoll = tiltInfluence * 0.6;
      
      // Strong tilt influence on yaw for intuitive turning
      targetYaw += tiltInfluence * 0.8;
    }
    
    // Apply smoothing - use direct mode for immediate response or smoothed for stability
    if (this.directMode) {
      // Direct mode: minimal smoothing for immediate response
      this.smoothedOrientation.yaw = THREE.MathUtils.lerp(
        this.smoothedOrientation.yaw,
        targetYaw,
        0.8 // Very high response rate
      );
      
      this.smoothedOrientation.pitch = THREE.MathUtils.lerp(
        this.smoothedOrientation.pitch,
        targetPitch,
        0.9 // Extremely high response rate for pitch
      );
      
      this.smoothedOrientation.roll = THREE.MathUtils.lerp(
        this.smoothedOrientation.roll,
        targetRoll,
        0.7 // High response rate for roll
      );
    } else {
      // Smoothed mode: enhanced smoothing with high responsiveness
      this.smoothedOrientation.yaw = THREE.MathUtils.lerp(
        this.smoothedOrientation.yaw,
        targetYaw,
        this.smoothingFactor * 1.1
      );
      
      this.smoothedOrientation.pitch = THREE.MathUtils.lerp(
        this.smoothedOrientation.pitch,
        targetPitch,
        this.smoothingFactor * 1.3
      );
      
      this.smoothedOrientation.roll = THREE.MathUtils.lerp(
        this.smoothedOrientation.roll,
        targetRoll,
        this.smoothingFactor * 1.0
      );
    }
    
    // Apply limits
    this.smoothedOrientation.pitch = THREE.MathUtils.clamp(
      this.smoothedOrientation.pitch,
      this.minPitch,
      this.maxPitch
    );
    
    this.smoothedOrientation.roll = THREE.MathUtils.clamp(
      this.smoothedOrientation.roll,
      -this.maxRoll,
      this.maxRoll
    );
    
    // Apply rotation to camera with enhanced natural movement
    this.camera.rotation.order = 'YXZ'; // Proper rotation order for camera
    this.camera.rotation.y = this.smoothedOrientation.yaw;
    this.camera.rotation.x = this.smoothedOrientation.pitch;
    this.camera.rotation.z = this.smoothedOrientation.roll;
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
   * Set separate sensitivities for different types of movement
   * @param {number} gyro - Gyro (yaw) sensitivity
   * @param {number} tilt - Tilt (gamma) sensitivity
   * @param {number} pitch - Pitch (beta) sensitivity
   */
  setEnhancedSensitivity(gyro = 1.0, tilt = 0.8, pitch = 1.2) {
    this.gyroSensitivity = Math.max(0.1, Math.min(3.0, gyro));
    this.tiltSensitivity = Math.max(0.1, Math.min(3.0, tilt));
    this.sensitivity = Math.max(0.1, Math.min(3.0, pitch));
  }
  
  /**
   * Enable or disable specific orientation responses
   * @param {boolean} gyro - Enable gyroscope (yaw) response
   * @param {boolean} tilt - Enable tilt (roll) response
   */
  setOrientationModes(gyro = true, tilt = true) {
    this.enableGyroResponse = gyro;
    this.enableTiltResponse = tilt;
    console.log('Orientation modes updated:', { gyro, tilt });
  }
  
  /**
   * Set roll limits for tilt response
   * @param {number} maxDegrees - Maximum roll in degrees
   */
  setRollLimits(maxDegrees) {
    this.maxRoll = THREE.MathUtils.degToRad(Math.abs(maxDegrees));
  }
  
  /**
   * Invert specific axes
   * @param {boolean} pitch - Invert pitch direction
   * @param {boolean} yaw - Invert yaw direction
   */
  setInversions(pitch = false, yaw = false) {
    this.invertPitch = pitch;
    this.invertYaw = yaw;
    console.log('Inversions updated:', { pitch, yaw });
  }
  
  /**
   * Enable or disable direct tracking mode
   * @param {boolean} enabled - Use direct mode for immediate response
   */
  setDirectMode(enabled = true) {
    this.directMode = enabled;
    console.log('Direct mode:', enabled ? 'enabled (immediate response)' : 'disabled (smoothed)');
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
        pitch: THREE.MathUtils.radToDeg(this.smoothedOrientation.pitch),
        roll: THREE.MathUtils.radToDeg(this.smoothedOrientation.roll)
      },
      camera: {
        yaw: THREE.MathUtils.radToDeg(this.camera.rotation.y),
        pitch: THREE.MathUtils.radToDeg(this.camera.rotation.x),
        roll: THREE.MathUtils.radToDeg(this.camera.rotation.z)
      },
      settings: {
        gyroEnabled: this.enableGyroResponse,
        tiltEnabled: this.enableTiltResponse,
        gyroSensitivity: this.gyroSensitivity,
        tiltSensitivity: this.tiltSensitivity,
        pitchSensitivity: this.sensitivity,
        invertPitch: this.invertPitch,
        invertYaw: this.invertYaw
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