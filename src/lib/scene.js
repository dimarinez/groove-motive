import * as THREE from "three";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import gsap from "gsap";

const albums = [
  {
    title: "Luke Andy x Sophiegrophy",
    cover:
      "https://5ndhpj66kbzege6f.public.blob.vercel-storage.com/GM001%20Cover%20Art.jpg",
    previewUrl:
      "https://5ndhpj66kbzege6f.public.blob.vercel-storage.com/Luke%20Andy%20%26%20Sophiegrophy%20-%20My%20Side%20%28Radio%20Edit%29%5BGroove%20Motive%5D.mp3",
    buyUrl: "https://example.com/buy1",
  },
  {
    title: "KiRiK",
    cover:
      "https://5ndhpj66kbzege6f.public.blob.vercel-storage.com/GM002.jpg",
    previewUrl:
      "https://5ndhpj66kbzege6f.public.blob.vercel-storage.com/KiRiK%20-%20Truth_Groove%20Motive%20%5BRadio%20Master%5D.mp3",
    buyUrl: "https://example.com/buy2",
  },
  {
    title: "Dateless",
    cover:
      "https://5ndhpj66kbzege6f.public.blob.vercel-storage.com/GM003.jpg",
    previewUrl:
      "https://5ndhpj66kbzege6f.public.blob.vercel-storage.com/Dateless%20-%20Like%20Me_Groove%20Motive.mp3",
    buyUrl: "https://example.com/buy3",
  },
  {
    title: "BRN",
    cover:
      "https://5ndhpj66kbzege6f.public.blob.vercel-storage.com/GM004_Machines.jpg",
    previewUrl:
      "https://5ndhpj66kbzege6f.public.blob.vercel-storage.com/BRN%20-%20Machines%20%28Radio%29%28FW%20MASTER%201%29.mp3",
    buyUrl: "https://example.com/buy3",
  },
];

let scene, camera, renderer, controls;
let moveForward = false,
  moveBackward = false,
  moveLeft = false,
  moveRight = false;
let velocity = new THREE.Vector3();
let direction = new THREE.Vector3();
const clock = new THREE.Clock();
let audio,
  currentAlbum = null,
  isPreviewing = false;
let mixer, putVinylAction, spinAction, vinyl;
let animatedRecordPlayer = null;
let audioTimeout = null;

let ui, albumTitle, enterButton, galleryCanvas, galleryScreen;
let moveUpButton, moveDownButton, moveLeftButton, moveRightButton;
let isMobile = false;
// Device orientation state for smooth camera control
let deviceOrientation = { alpha: 0, beta: 0, gamma: 0 };
let initialOrientation = null;
let smoothedOrientation = { yaw: 0, pitch: 0 };
let orientationSmoothingFactor = 0.3; // Increased for faster response, especially pitch
let orientationSensitivity = 1.0; // Increased sensitivity for better response
// Simplified orientation tracking - remove complex filtering that causes jitter
let previousSmoothedOrientation = { yaw: 0, pitch: 0 };
const deadZoneThreshold = 0.005; // Increased deadzone to reduce jitter
let clickToLockHandler = null;
let previewInstruction = null;
let previewAnimationId = null;
let mainAnimationId = null;

// Asset loading tracking
let assetsLoaded = 0;
let totalAssets = 0;
let loadingIndicator = null;
let progressBar = null;
let progressText = null;
let orientationStatus = null;
let orientationIndicator = null;
let orientationText = null;
let orientationValues = null;
let alphaValue = null;
let betaValue = null;
let gammaValue = null;
let audioPreloaded = false;
let orientationDebugLogged = false;

// Asset loading helpers
function updateLoadingProgress() {
  if (loadingIndicator) {
    const progress = (assetsLoaded / totalAssets) * 100;
    console.log(`Loading progress: ${assetsLoaded}/${totalAssets} (${progress.toFixed(1)}%)`);
    
    // Update progress bar
    if (progressBar) {
      progressBar.style.width = `${progress}%`;
    }
    
    // Update progress text
    if (progressText) {
      progressText.textContent = `${Math.round(progress)}%`;
    }
    
    if (assetsLoaded >= totalAssets) {
      loadingIndicator.style.display = 'none';
      if (enterButton) {
        enterButton.disabled = false;
        enterButton.style.opacity = '1';
      }
    } else {
      loadingIndicator.style.display = 'flex';
      if (enterButton) {
        enterButton.disabled = true;
        enterButton.style.opacity = '0.5';
      }
    }
  }
}

function onAssetLoaded() {
  assetsLoaded++;
  updateLoadingProgress();
}

// Orientation status helpers
function updateOrientationStatus(status, text) {
  if (orientationIndicator && orientationText) {
    orientationIndicator.className = `orientation-indicator ${status}`;
    orientationText.textContent = text;
    
    switch(status) {
      case 'granted':
        orientationIndicator.textContent = '✅';
        break;
      case 'denied':
        orientationIndicator.textContent = '❌';
        break;
      case 'not-requested':
        orientationIndicator.textContent = '⚠️';
        break;
    }
  }
}

// Preload audio files after entering gallery
function preloadAudioFiles() {
  if (audioPreloaded) return;
  audioPreloaded = true;
  
  console.log('Starting audio preloading...');
  albums.forEach((album, index) => {
    const audio = new Audio();
    audio.addEventListener('canplaythrough', () => {
      console.log(`Preview audio loaded: ${album.title}`);
    });
    audio.addEventListener('error', (error) => {
      console.error(`Error loading preview audio for ${album.title}:`, error);
    });
    audio.preload = 'auto';
    audio.src = album.previewUrl;
  });
}

export function initScene() {
  // Check if we're in a browser environment
  try {
    if (!globalThis.window || !globalThis.document || !globalThis.navigator) {
      console.error("Browser environment not available");
      return;
    }
  } catch (error) {
    console.error("Error checking browser environment:", error);
    return;
  }

  // Initialize mobile detection
  isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // Add UI element for preview/stop instruction
  if (!previewInstruction) {
    previewInstruction = document.createElement("div");
    previewInstruction.id = "preview-instruction";
    previewInstruction.style.cssText =
      'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; background: rgba(0, 0, 0, 0.9); padding: 20px 30px; border-radius: 12px; font-size: 18px; font-weight: 600; text-align: center; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3); backdrop-filter: blur(10px); border: 2px solid rgba(255, 255, 255, 0.2); z-index: 1000; display: none; font-family: "Suisse", -apple-system, BlinkMacSystemFont, sans-serif; letter-spacing: 0.5px; white-space: nowrap; max-width: 90vw; overflow: hidden;';
    previewInstruction.innerHTML =
      'Press <span style="background: rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 6px; font-weight: 700; white-space: nowrap;">G</span> to stop the music';
    document.body.appendChild(previewInstruction);
  }

  // DOM elements
  ui = document.getElementById("ui");
  albumTitle = document.getElementById("album-title");
  enterButton = document.getElementById("enter-button");
  galleryCanvas = document.getElementById("gallery-canvas");
  galleryScreen = document.getElementById("gallery-screen");
  moveUpButton = document.getElementById("move-up");
  moveDownButton = document.getElementById("move-down");
  moveLeftButton = document.getElementById("move-left");
  moveRightButton = document.getElementById("move-right");
  loadingIndicator = document.getElementById("loading-indicator");
  progressBar = document.getElementById("progress-bar");
  progressText = document.getElementById("progress-text");
  orientationStatus = document.getElementById("orientation-status");
  orientationIndicator = document.getElementById("orientation-indicator");
  orientationText = document.getElementById("orientation-text");
  orientationValues = document.getElementById("orientation-values");
  alphaValue = document.getElementById("alpha-value");
  betaValue = document.getElementById("beta-value");
  gammaValue = document.getElementById("gamma-value");

  if (!galleryCanvas || !enterButton) {
    console.error("Required DOM elements not found.");
    return;
  }

  // Debug logging for mobile UI element
  if (isMobile) {
    console.log("UI element found during init:", ui);
    console.log("Album title element found during init:", albumTitle);
  }

  // Mobile button event listeners
  if (isMobile) {
    moveUpButton.addEventListener("touchstart", () => {
      moveBackward = true;
    });
    moveUpButton.addEventListener("touchend", () => {
      moveBackward = false;
    });
    moveDownButton.addEventListener("touchstart", () => {
      moveForward = true;
    });
    moveDownButton.addEventListener("touchend", () => {
      moveForward = false;
    });
    moveLeftButton.addEventListener("touchstart", () => {
      moveRight = true;
    });
    moveLeftButton.addEventListener("touchend", () => {
      moveRight = false;
    });
    moveRightButton.addEventListener("touchstart", () => {
      moveLeft = true;
    });
    moveRightButton.addEventListener("touchend", () => {
      moveLeft = false;
    });

    // Mobile action button event listeners
    const mobilePreviewButton = document.getElementById("mobile-preview");
    const mobileBuyButton = document.getElementById("mobile-buy");

    if (mobilePreviewButton) {
      mobilePreviewButton.addEventListener("touchstart", () => {
        if (isPreviewing) {
          stopPreview();
        } else if (currentAlbum) {
          startPreview(currentAlbum);
        }
      });
    }

    if (mobileBuyButton) {
      mobileBuyButton.addEventListener("touchstart", () => {
        if (currentAlbum) {
          try {
            if (globalThis.window) {
              window.open(currentAlbum.buyUrl, "_blank");
            }
          } catch (error) {
            console.warn("Could not open buy URL on mobile:", error);
          }
        }
      });
    }
  }

  // Scene setup
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f0f0);

  // Ensure proper canvas sizing by using parent dimensions
  const rightPanel = document.getElementById("right-panel");
  const canvasWidth = rightPanel
    ? rightPanel.clientWidth
    : galleryCanvas.clientWidth;
  const canvasHeight = rightPanel
    ? rightPanel.clientHeight
    : galleryCanvas.clientHeight;

  camera = new THREE.PerspectiveCamera(
    75,
    canvasWidth / canvasHeight,
    0.1,
    1000
  );
  camera.position.set(0, 1.6, -2);
  
  // Set initial camera orientation for mobile devices
  if (isMobile) {
    // Start with slight downward tilt for natural viewing
    const initialPitch = THREE.MathUtils.degToRad(-15);
    camera.rotation.x = initialPitch;
    camera.rotation.y = 0;
    camera.rotation.z = 0;
  }

  renderer = new THREE.WebGLRenderer({
    canvas: galleryCanvas,
    antialias: true,
  });
  renderer.setSize(canvasWidth, canvasHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;

  controls = new PointerLockControls(camera, galleryCanvas);
  
  // Expose controls to global scope for hamburger menu access
  try {
    if (globalThis.window) {
      window.controls = controls;
    }
  } catch (error) {
    console.warn("Could not expose controls to global scope:", error);
  }
  
  controls.addEventListener("lock", () => {
    document.body.style.cursor = "none";
    ui.style.display = "none";
    if (isMobile) {
      const mobileControls = document.getElementById("mobile-controls");
      if (mobileControls) {
        mobileControls.style.display = "flex";
        console.log("Mobile controls shown");
      } else {
        console.warn("Mobile controls element not found");
      }
    }
  });
  controls.addEventListener("unlock", () => {
    document.body.style.cursor = "auto";
    const container = document.getElementById("container");
    if (container) container.style.display = "flex";
    if (isMobile)
      document.getElementById("mobile-controls").style.display = "none";
  });

  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("keyup", onKeyUp);

  // Setup device orientation for mobile
  if (isMobile) {
    setupDeviceOrientationControls();
  }

  // Initialize asset loading (count: logo texture, record player GLB, album covers)
  totalAssets = 1 + 1 + albums.length; // logo + record player + album covers
  updateLoadingProgress();
  
  // Hide orientation status and values on all devices
  if (orientationStatus) {
    orientationStatus.style.display = 'none';
  }
  if (orientationValues) {
    orientationValues.style.display = 'none';
  }

  // Materials
  const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0xe0e0e0,
    roughness: 0.8,
    metalness: 0.1,
  });
  const wallMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.6,
    metalness: 0,
  });
  const ceilingMaterial = new THREE.MeshStandardMaterial({
    color: 0xf0f0f0,
    roughness: 0.6,
    metalness: 0,
  });
  const windowMaterial = new THREE.MeshStandardMaterial({
    color: 0x87ceeb,
    transparent: true,
    opacity: 0.7,
  });

  // Floor
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.01;
  floor.userData.isWall = true;
  scene.add(floor);

  // Carpet with logo
  const logoTexture = new THREE.TextureLoader().load(
    "https://5ndhpj66kbzege6f.public.blob.vercel-storage.com/GM_Wordmark_CLEAR_BLACK.png",
    (texture) => {
      texture.encoding = THREE.sRGBEncoding;
      texture.needsUpdate = true;
      const aspect = texture.image.width / texture.image.height;
      const carpetWidth = 4;
      const carpetHeight = 4 / aspect;
      carpet.geometry = new THREE.PlaneGeometry(carpetWidth, carpetHeight);
      texture.repeat.set(1, 1);
      texture.offset.set(0, 0);
      onAssetLoaded(); // Logo texture loaded
    }
  );
  const carpetMaterial = new THREE.MeshStandardMaterial({
    map: logoTexture,
    transparent: true,
    roughness: 0.9,
    metalness: 0,
  });
  const carpet = new THREE.Mesh(new THREE.PlaneGeometry(4, 4), carpetMaterial);
  carpet.rotation.x = -Math.PI / 2;
  carpet.position.set(0, 0, 0);
  carpet.userData.isWall = false;
  scene.add(carpet);

  // Ceiling
  const ceiling = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    ceilingMaterial
  );
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = 5;
  ceiling.userData.isWall = true;
  scene.add(ceiling);

  // Walls
  const walls = [
    new THREE.Mesh(new THREE.PlaneGeometry(20, 5), wallMaterial),
    new THREE.Mesh(new THREE.PlaneGeometry(20, 5), wallMaterial),
    new THREE.Mesh(new THREE.PlaneGeometry(20, 5), wallMaterial),
    new THREE.Mesh(new THREE.PlaneGeometry(20, 5), wallMaterial),
  ];
  walls[0].position.set(0, 2.5, -10);
  walls[1].position.set(0, 2.5, 10);
  walls[1].rotation.y = Math.PI;
  walls[2].position.set(-10, 2.5, 0);
  walls[2].rotation.y = Math.PI / 2;
  walls[3].position.set(10, 2.5, 0);
  walls[3].rotation.y = -Math.PI / 2;
  walls.forEach((wall) => {
    wall.userData.isWall = true;
    scene.add(wall);
  });

  // Window on front wall
  const window = new THREE.Mesh(new THREE.PlaneGeometry(4, 2), windowMaterial);
  window.position.set(0, 2.5, 10.1);
  window.userData.isWall = false;
  scene.add(window);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
  scene.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.8);
  directionalLight.position.set(5, 10, 5);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.set(1024, 1024);
  scene.add(directionalLight);
  const windowLight = new THREE.PointLight(0x87ceeb, 1.0, 10);
  windowLight.position.set(0, 2.2, 3);
  scene.add(windowLight);
  const pointLight = new THREE.PointLight(0xfff5e6, 20, 1.0);
  pointLight.position.set(0, 3, -8);
  scene.add(pointLight);

  // Record player
  const gltfLoader = new GLTFLoader();
  gltfLoader.load(
    "https://5ndhpj66kbzege6f.public.blob.vercel-storage.com/vinyl_record_player.glb",
    (gltf) => {
      animatedRecordPlayer = gltf.scene;
      animatedRecordPlayer.position.set(0, 0, -6);
      animatedRecordPlayer.scale.set(0.05, 0.05, 0.05);
      animatedRecordPlayer.visible = true;
      scene.add(animatedRecordPlayer);

      animatedRecordPlayer.traverse((child) => {
        if (child.isMesh && child.material) {
          if (child.material.map) {
            child.material.map.encoding = THREE.sRGBEncoding;
            child.material.needsUpdate = true;
          }
        }
      });

      mixer = new THREE.AnimationMixer(animatedRecordPlayer);
      const animations = gltf.animations;
      const putVinylClip =
        THREE.AnimationClip.findByName(animations, "put_vinyl") ||
        animations[0];
      const spinClip =
        THREE.AnimationClip.findByName(animations, "spin") ||
        animations[1] ||
        putVinylClip;

      putVinylAction = mixer.clipAction(putVinylClip);
      spinAction = mixer.clipAction(spinClip);

      putVinylAction.setLoop(THREE.LoopOnce);
      putVinylAction.clampWhenFinished = true;
      spinAction.setLoop(THREE.LoopRepeat);

      vinyl =
        animatedRecordPlayer.getObjectByName("vinyl") ||
        findVinylMesh(animatedRecordPlayer);
      if (vinyl) {
        vinyl.scale.set(0.6, 0.6, 0.6);
      } else {
        console.error("No vinyl mesh found in GLB model");
      }
      
      onAssetLoaded(); // Record player GLB loaded
    },
    undefined,
    (error) => {
      console.error("Error loading GLB model:", error);
      onAssetLoaded(); // Still count as loaded even if failed
    }
  );

  // Albums
  albums.forEach((album, index) => createAlbumMesh(album, index));

  audio = new Audio();
  audio.addEventListener("ended", () => []);

  try {
    if (globalThis.window) {
      window.addEventListener("resize", onWindowResize);
      window.addAlbum = addAlbum;
    }
  } catch (error) {
    console.warn("Could not add window event listeners:", error);
  }

  // Force initial render and ensure proper sizing
  renderer.render(scene, camera);

  // Ensure proper canvas sizing after DOM is fully loaded
  setTimeout(() => {
    const rightPanel = document.getElementById("right-panel");
    if (rightPanel && galleryCanvas) {
      const canvasWidth = rightPanel.clientWidth;
      const canvasHeight = rightPanel.clientHeight;
      camera.aspect = canvasWidth / canvasHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(canvasWidth, canvasHeight);
      renderer.render(scene, camera);
    }
  }, 100);
}

// Request device orientation permission with user interaction
async function requestDeviceOrientationPermission() {
  console.log('=== Starting orientation permission request ===');
  console.log('User agent:', navigator.userAgent);
  console.log('DeviceOrientationEvent available:', typeof DeviceOrientationEvent !== 'undefined');
  console.log('DeviceOrientationEvent.requestPermission available:', typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function');
  
  // Check if we need to request permission (iOS 13+)
  if (typeof DeviceOrientationEvent !== 'undefined' && 
      typeof DeviceOrientationEvent.requestPermission === 'function') {
    
    try {
      console.log('Requesting device orientation permission...');
      
      // Create a user interaction button that triggers permission request
      const permissionButton = document.createElement('button');
      permissionButton.textContent = 'Enable Device Orientation';
      permissionButton.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 10000;
        background: #007AFF;
        color: white;
        border: none;
        padding: 15px 30px;
        border-radius: 8px;
        font-size: 16px;
        cursor: pointer;
      `;
      
      document.body.appendChild(permissionButton);
      
      // Wait for user to click the button
      const permissionResult = await new Promise((resolve) => {
        permissionButton.addEventListener('click', async () => {
          try {
            console.log('User clicked permission button, requesting...');
            const result = await DeviceOrientationEvent.requestPermission();
            console.log('Permission result:', result);
            resolve(result);
          } catch (error) {
            console.error('Error in permission request:', error);
            resolve('error');
          }
        });
      });
      
      // Remove the button
      document.body.removeChild(permissionButton);
      
      if (permissionResult === 'granted') {
        console.log('Device orientation permission granted');
        setupDeviceOrientationControls();
      } else if (permissionResult === 'denied') {
        console.log('Device orientation permission denied');
      } else {
        console.log('Device orientation permission error:', permissionResult);
      }
      
    } catch (error) {
      console.error('Error requesting device orientation permission:', error);
    }
  } else {
    // Android or older iOS - no permission required
    console.log('No permission required for device orientation');
    setupDeviceOrientationControls();
  }

  // Request motion permission if available
  if (typeof DeviceMotionEvent !== 'undefined' && 
      typeof DeviceMotionEvent.requestPermission === 'function') {
    try {
      console.log('Requesting device motion permission...');
      const motionPermission = await DeviceMotionEvent.requestPermission();
      console.log('Device motion permission:', motionPermission);
    } catch (error) {
      console.warn('Error requesting device motion permission:', error);
    }
  }
}

/**
 * Device orientation handling for mobile camera control
 * Optimized for portrait mode with smooth navigation
 */
function setupDeviceOrientationControls() {
  if (!isMobile) {
    console.log('Not mobile device, skipping orientation setup');
    return;
  }

  console.log('🚀 Setting up device orientation controls...');

  // Reset orientation data
  deviceOrientation = { alpha: 0, beta: 0, gamma: 0 };
  initialOrientation = null;
  smoothedOrientation = { yaw: 0, pitch: 0 };
  previousSmoothedOrientation = { yaw: 0, pitch: 0 };

  // Keep orientation values hidden
  if (orientationValues) {
    orientationValues.style.display = 'none';
  }

  /**
   * Device orientation event handler for portrait mode
   * Maps phone orientation to camera rotation for intuitive navigation
   */
  window.addEventListener('deviceorientation', function(event) {
    // Debug: Log when orientation events are received
    if (Math.random() < 0.005) {
      console.log('Device orientation event received:', {
        alpha: event.alpha,
        beta: event.beta,
        gamma: event.gamma
      });
    }
    
    // Process orientation data for camera control
    if (event.alpha !== null && event.beta !== null && event.gamma !== null) {
      // Store raw orientation values - no filtering to reduce complexity
      deviceOrientation = {
        alpha: event.alpha,    // Compass heading (0-360°)
        beta: event.beta,      // Front-to-back tilt (-180° to 180°)
        gamma: event.gamma     // Left-to-right tilt (-90° to 90°)
      };

      // Set initial orientation when device is held in natural viewing position
      // Account for phone being held slightly tilted down (natural viewing angle)
      if (!initialOrientation) {
        initialOrientation = {
          alpha: deviceOrientation.alpha,
          beta: deviceOrientation.beta + 15, // Offset for natural downward tilt
          gamma: deviceOrientation.gamma
        };
        
        // Set initial camera orientation to match device position
        const initialYaw = THREE.MathUtils.degToRad(0); // Start facing forward
        const initialPitch = THREE.MathUtils.degToRad(-15); // Slight downward tilt for natural view
        
        smoothedOrientation.yaw = initialYaw;
        smoothedOrientation.pitch = initialPitch;
        
        // Apply initial orientation to camera
        if (camera) {
          const quaternion = new THREE.Quaternion();
          quaternion.setFromEuler(new THREE.Euler(initialPitch, initialYaw, 0, 'YXZ'));
          camera.quaternion.copy(quaternion);
        }
        
        console.log('✅ Initial orientation calibrated:', {
          alpha: initialOrientation.alpha.toFixed(1),
          beta: initialOrientation.beta.toFixed(1),
          gamma: initialOrientation.gamma.toFixed(1),
          cameraYaw: THREE.MathUtils.radToDeg(initialYaw).toFixed(1),
          cameraPitch: THREE.MathUtils.radToDeg(initialPitch).toFixed(1)
        });
      }
    } else {
      if (Math.random() < 0.001) {
        console.log('⚠️ Device orientation event with null values:', event);
      }
    }
  });
  
  console.log('Device orientation controls initialized for portrait mode');
  
  // Verify orientation events are working
  setTimeout(() => {
    if (!initialOrientation) {
      console.warn('No device orientation events received - check permissions');
      updateOrientationStatus('denied', 'Orientation: No events');
    } else {
      console.log('Device orientation active and calibrated');
    }
  }, 2000);
}

/**
 * Updates camera rotation based on device orientation for smooth navigation
 * Designed for portrait mode with full 360° horizontal and vertical range
 * Uses quaternions to avoid gimbal lock and handles orientation discontinuities
 */
function updateCameraFromOrientation() {
  if (!deviceOrientation || !initialOrientation) return;

  // Calculate relative rotation from initial upright portrait position
  let relativeAlpha = deviceOrientation.alpha - initialOrientation.alpha;
  let relativeBeta = deviceOrientation.beta - initialOrientation.beta;
  let relativeGamma = deviceOrientation.gamma - initialOrientation.gamma;

  // Handle 360° wraparound for alpha (compass heading) with hysteresis
  if (relativeAlpha > 180) relativeAlpha -= 360;
  if (relativeAlpha < -180) relativeAlpha += 360;

  // Phone-tilt mapping for portrait mode - immediate response
  // Gamma controls horizontal rotation (left/right tilt) - keep as is, works fine
  let targetYaw = THREE.MathUtils.degToRad(relativeGamma) * orientationSensitivity;
  
  // Beta controls vertical rotation (forward/back tilt) - fix direction
  let targetPitch = THREE.MathUtils.degToRad(relativeBeta) * orientationSensitivity;
  
  // Clamp upward pitch more aggressively to prevent spiral
  const maxUpwardPitch = THREE.MathUtils.degToRad(45); // Much more restrictive upward limit
  const maxDownwardPitch = THREE.MathUtils.degToRad(-75); // Allow more downward range
  
  // If tilting up, clamp it heavily
  if (targetPitch > 0) {
    targetPitch = Math.min(targetPitch, maxUpwardPitch);
  } else {
    targetPitch = Math.max(targetPitch, maxDownwardPitch);
  }
  
  // Apply orientation directly to camera for immediate response
  // No smoothing - user wants immediate reaction to tilts
  smoothedOrientation.yaw = targetYaw;
  smoothedOrientation.pitch = targetPitch;

  // Apply rotation with heavy smoothing on vertical only to prevent spiral
  if (controls && controls.getObject) {
    const cameraObject = controls.getObject();
    // Horizontal (yaw) - immediate response, works perfectly
    cameraObject.rotation.y = smoothedOrientation.yaw;
    
    // Vertical (pitch) - add heavy smoothing to prevent spiral
    const currentPitch = cameraObject.rotation.x;
    cameraObject.rotation.x = THREE.MathUtils.lerp(currentPitch, smoothedOrientation.pitch, 0.05);
    cameraObject.rotation.z = 0;
  } else {
    camera.rotation.y = smoothedOrientation.yaw;
    const currentPitch = camera.rotation.x;
    camera.rotation.x = THREE.MathUtils.lerp(currentPitch, smoothedOrientation.pitch, 0.05);
    camera.rotation.z = 0;
  }

  // Debug logging to check if orientation is working
  if (Math.random() < 0.02) { // Log occasionally to check movement
    console.log('Orientation update:', {
      rawGamma: deviceOrientation.gamma.toFixed(1),
      rawBeta: deviceOrientation.beta.toFixed(1),
      relativeGamma: relativeGamma.toFixed(1),
      relativeBeta: relativeBeta.toFixed(1),
      targetYaw: THREE.MathUtils.radToDeg(targetYaw).toFixed(1),
      targetPitch: THREE.MathUtils.radToDeg(targetPitch).toFixed(1),
      immediateYaw: THREE.MathUtils.radToDeg(smoothedOrientation.yaw).toFixed(1),
      immediatePitch: THREE.MathUtils.radToDeg(smoothedOrientation.pitch).toFixed(1),
      hasInitial: !!initialOrientation
    });
  }
}


/**
 * Recalibrates device orientation to current position
 * Useful for resetting the "center" position during navigation
 */
function recalibrateOrientation() {
  if (isMobile && deviceOrientation) {
    initialOrientation = { ...deviceOrientation };
    smoothedOrientation = { yaw: 0, pitch: 0 };
    console.log('Orientation recalibrated to current position:', {
      alpha: initialOrientation.alpha.toFixed(1),
      beta: initialOrientation.beta.toFixed(1),
      gamma: initialOrientation.gamma.toFixed(1)
    });
  }
}

// Clean up orientation listeners
function cleanupDeviceOrientation() {
  window.removeEventListener('deviceorientation', () => {});
  document.removeEventListener('deviceorientation', () => {});
  window.removeEventListener('devicemotion', () => {});
  document.removeEventListener('devicemotion', () => {});
  
  // Reset orientation state
  deviceOrientation = { alpha: 0, beta: 0, gamma: 0 };
  initialOrientation = null;
  smoothedOrientation = { yaw: 0, pitch: 0 };
}

function resetToInitialState() {
  // Stop any music preview
  if (isPreviewing) {
    stopPreview();
  }

  // Reset UI elements
  ui.style.display = "none";
  currentAlbum = null;
  albumTitle.textContent = "";

  // Move instructions back to right panel
  const instructionsGroup = document.getElementById("instructions-group");
  if (instructionsGroup) {
    instructionsGroup.classList.remove("show");
    instructionsGroup.style.position = "";
    instructionsGroup.style.zIndex = "";
    const rightPanel = document.getElementById("right-panel");
    if (rightPanel) {
      rightPanel.appendChild(instructionsGroup);
    }
  }

  // Reset cursor
  document.body.style.cursor = "auto";

  // Remove body class to hide mobile menu
  document.body.classList.remove("gallery-entered");

  // Show container with panels
  const container = document.getElementById("container");
  if (container) {
    container.style.display = "flex";
  }

  // Hide mobile controls
  if (isMobile) {
    const mobileControls = document.getElementById("mobile-controls");
    if (mobileControls) mobileControls.style.display = "none";
  }

  // Hide hamburger menu
  const hamburgerMenu = document.querySelector(".hamburger-menu");
  if (hamburgerMenu) {
    hamburgerMenu.classList.remove("show");
  }

  // Restore panel animations
  gsap.fromTo(
    "#left-panel",
    { opacity: 0, x: -50 },
    { opacity: 1, x: 0, duration: 0.8, ease: "power2.out" }
  );
  gsap.to("#right-panel", {
    opacity: 1,
    duration: 0.8,
    ease: "power2",
    delay: 0.2,
  });

  // Reset camera to initial position
  camera.position.set(0, 1.6, -2);
  
  // Set proper initial orientation for mobile
  if (isMobile) {
    // Reset with natural downward tilt
    const initialPitch = THREE.MathUtils.degToRad(-15);
    camera.rotation.set(initialPitch, 0, 0);
    smoothedOrientation = { yaw: 0, pitch: initialPitch };
  } else {
    camera.rotation.set(0, 0, 0);
    camera.lookAt(0, 1.6, -6);
  }

  // Reset device orientation
  if (isMobile) {
    initialOrientation = null;
    deviceOrientation = { alpha: 0, beta: 0, gamma: 0 };
    cleanupDeviceOrientation();
  }

  // Remove fullscreen canvas if it exists
  if (document.body.contains(renderer.domElement)) {
    document.body.removeChild(renderer.domElement);
  }

  // Restore to preview canvas
  const rightPanel = document.getElementById("right-panel");
  if (rightPanel) {
    const canvasContainer =
      rightPanel.querySelector(".canvas-container") || rightPanel;
    canvasContainer.appendChild(renderer.domElement);
    renderer.domElement.id = "gallery-canvas";
    renderer.domElement.style.pointerEvents = "none";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    galleryCanvas = renderer.domElement;

    // Resize to preview size
    renderer.setSize(rightPanel.clientWidth, rightPanel.clientHeight);
    camera.aspect = rightPanel.clientWidth / rightPanel.clientHeight;
    camera.updateProjectionMatrix();
  }

  // Reset controls
  controls.dispose();
  controls = new PointerLockControls(camera, renderer.domElement);
  
  // Re-expose controls to global scope
  try {
    if (globalThis.window) {
      window.controls = controls;
    }
  } catch (error) {
    console.warn("Could not re-expose controls to global scope:", error);
  }

  // Re-add control event listeners
  controls.addEventListener("lock", () => {
    document.body.style.cursor = "none";
    ui.style.display = "none";
    if (isMobile) {
      const mobileControls = document.getElementById("mobile-controls");
      if (mobileControls) {
        mobileControls.style.display = "flex";
        console.log("Mobile controls shown in resetToInitialState");
      } else {
        console.warn(
          "Mobile controls element not found in resetToInitialState"
        );
      }
    }
  });
  controls.addEventListener("unlock", () => {
    // Clean up click-to-lock handler
    if (clickToLockHandler) {
      document.removeEventListener("click", clickToLockHandler);
      clickToLockHandler = null;
    }

    // Reset to initial state
    resetToInitialState();
  });

  // Stop main animation loop
  if (mainAnimationId) {
    cancelAnimationFrame(mainAnimationId);
    mainAnimationId = null;
  }

  // Force render and restart preview animation
  renderer.render(scene, camera);

  // Restart preview animation
  setTimeout(() => {
    if (!controls.isLocked) {
      animatePreview();
    }
  }, 100);

  // Trigger resize
  setTimeout(() => {
    onWindowResize();
  }, 100);
}

export function enterGallery() {
  const container = document.getElementById("container");
  if (container) container.style.display = "none";

  // Add body class for mobile menu
  document.body.classList.add("gallery-entered");

  // Stop preview animation
  if (previewAnimationId) {
    cancelAnimationFrame(previewAnimationId);
    previewAnimationId = null;
  }

  // Request device orientation permission when entering gallery (user interaction)
  if (isMobile) {
    requestDeviceOrientationPermission();
    
    // Calibrate orientation to match current camera position after a short delay
    setTimeout(() => {
      if (deviceOrientation.alpha !== 0 || deviceOrientation.beta !== 0 || deviceOrientation.gamma !== 0) {
        console.log('Calibrating orientation to match current camera position');
        initialOrientation = {
          alpha: deviceOrientation.alpha,
          beta: deviceOrientation.beta + 15, // Account for natural tilt
          gamma: deviceOrientation.gamma
        };
        
        // Set smoothed values to current camera rotation
        smoothedOrientation.yaw = camera.rotation.y;
        smoothedOrientation.pitch = camera.rotation.x;
        
        console.log('Orientation calibrated after entering gallery:', {
          cameraYaw: THREE.MathUtils.radToDeg(camera.rotation.y).toFixed(1),
          cameraPitch: THREE.MathUtils.radToDeg(camera.rotation.x).toFixed(1)
        });
      }
    }, 1000);
  }
  
  // Start preloading audio files after entering gallery
  preloadAudioFiles();

  // Move instructions to body for fullscreen
  const instructionsGroup = document.getElementById("instructions-group");
  if (instructionsGroup) {
    document.body.appendChild(instructionsGroup);
    instructionsGroup.classList.add("show");
    instructionsGroup.style.position = "fixed";
    instructionsGroup.style.zIndex = "950";
  }

  document.body.appendChild(renderer.domElement);
  try {
    if (globalThis.window) {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    }
  } catch (error) {
    console.warn("Could not resize renderer for fullscreen:", error);
  }
  controls.dispose();
  controls = new PointerLockControls(camera, renderer.domElement);
  
  // Re-expose controls to global scope
  try {
    if (globalThis.window) {
      window.controls = controls;
    }
  } catch (error) {
    console.warn("Could not re-expose controls to global scope:", error);
  }

  // Add unlock event listener
  controls.addEventListener("unlock", () => {
    // Clean up click-to-lock handler
    if (clickToLockHandler) {
      document.removeEventListener("click", clickToLockHandler);
      clickToLockHandler = null;
    }

    // Clean up orientation listeners
    cleanupDeviceOrientation();

    // Reset to initial state
    resetToInitialState();
  });


  // Clean up any existing click-to-lock handler
  if (clickToLockHandler) {
    document.removeEventListener("click", clickToLockHandler);
  }

  // Enable click-to-lock
  clickToLockHandler = (event) => {
    if (event.target.id !== "enter-button" && !controls.isLocked) {
      try {
        controls.lock();
      } catch (error) {
        console.warn("Pointer lock failed:", error);
      }
    }
  };
  document.addEventListener("click", clickToLockHandler);

  // Force render
  renderer.render(scene, camera);

  // Initial lock
  setTimeout(() => {
    if (!controls.isLocked) {
      try {
        controls.lock();
      } catch (error) {
        console.warn("Initial pointer lock failed:", error);
      }
    }

    // Ensure mobile controls visible
    if (isMobile) {
      const mobileControls = document.getElementById("mobile-controls");
      if (mobileControls) {
        mobileControls.style.display = "flex";
        console.log("Mobile controls ensured visible in enterGallery");
      }
    }
  }, 100);
}

function findVinylMesh(object) {
  let vinylMesh;
  object.traverse((child) => {
    if (
      child.isMesh &&
      (child.name.toLowerCase().includes("vinyl") ||
        child.name.toLowerCase().includes("record"))
    ) {
      vinylMesh = child;
    }
  });
  return vinylMesh;
}

function createAlbumMesh(album, index) {
  const texture = new THREE.TextureLoader().load(
    album.cover,
    () => onAssetLoaded(), // Album cover loaded
    undefined,
    (error) => {
      console.error("Error loading album cover:", error);
      onAssetLoaded(); // Still count as loaded even if failed
    }
  );
  const material = new THREE.MeshBasicMaterial({ map: texture });
  const albumMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  albumMesh.position.set(-8 + index * 4, 2.5, -9.8);
  albumMesh.userData = { album };
  scene.add(albumMesh);
}

function addAlbum(title, cover, previewUrl, buyUrl) {
  const newAlbum = { title, cover, previewUrl, buyUrl };
  albums.push(newAlbum);
  createAlbumMesh(newAlbum, albums.length - 1);
}

function applyVinylTexture(album) {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.encoding = THREE.sRGBEncoding;
  texture.needsUpdate = true;

  if (animatedRecordPlayer) {
    animatedRecordPlayer.traverse((child) => {
      if (child.isMesh && child.material && child.material.name === "album") {
        child.material.map = texture;
        child.material.needsUpdate = true;
      }
    });
  }
}

function applyCoverTexture(album, onComplete) {
  const textureLoader = new THREE.TextureLoader();
  textureLoader.load(
    album.cover,
    (texture) => {
      texture.encoding = THREE.sRGBEncoding;
      if (animatedRecordPlayer) {
        animatedRecordPlayer.traverse((child) => {
          if (
            child.isMesh &&
            child.material &&
            child.material.name === "album_cover"
          ) {
            const geometry = child.geometry;
            geometry.computeBoundingBox();
            const width =
              geometry.boundingBox.max.x - geometry.boundingBox.min.x;
            const height =
              geometry.boundingBox.max.y - geometry.boundingBox.min.y;
            const aspectTexture = texture.image.width / texture.image.height;
            const aspectGeometry = width / height;
            const shrinkFactor = 1.95;
            let repeatX = shrinkFactor;
            let repeatY = shrinkFactor * (aspectGeometry / aspectTexture);
            if (aspectTexture > aspectGeometry) {
              repeatX = shrinkFactor * (aspectTexture / aspectGeometry);
              repeatY = shrinkFactor;
            }
            texture.offset.set((1.1 - repeatX) / 2, (2.8 - repeatY) / 2);
            texture.repeat.set(repeatX, repeatY);
            texture.center.set(0.5, 0.5);
            texture.needsUpdate = true;
            child.material.map = texture;
            child.material.needsUpdate = true;
          }
        });
      }
      if (onComplete) onComplete();
    },
    undefined,
    (error) => console.error("Error loading texture:", error)
  );
}

function startPreview(album) {
  if (!isPreviewing && animatedRecordPlayer) {
    isPreviewing = true;
    currentAlbum = album;
    
    applyVinylTexture(album);
    applyCoverTexture(album, () => {
      
      // Mobile-friendly audio setup
      audio.src = album.previewUrl;
      audio.preload = 'auto';
      
      // Clear any previous audio state
      audio.currentTime = 0;
      audio.pause();
      
      // Force load for mobile compatibility
      audio.load();
      
      // Unified audio approach - wait for audio to be ready then play
      let audioPlayAttempted = false;
      
      const tryPlayAudio = () => {
        if (audioPlayAttempted || !isPreviewing) return;
        audioPlayAttempted = true;
        
        console.log('Attempting to play audio:', album.title, 'readyState:', audio.readyState);
        
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            console.log('Audio playback started successfully');
          }).catch(error => {
            console.warn('Audio play failed, will retry:', error);
            audioPlayAttempted = false;
            
            // Retry after short delay
            setTimeout(() => {
              if (isPreviewing && !audioPlayAttempted) {
                tryPlayAudio();
              }
            }, 800);
          });
        }
      };
      
      // Listen for multiple audio ready events
      const onAudioReady = () => {
        console.log('Audio ready event fired, readyState:', audio.readyState);
        
        // Clean up listeners
        audio.removeEventListener('canplay', onAudioReady);
        audio.removeEventListener('canplaythrough', onAudioReady);
        audio.removeEventListener('loadeddata', onAudioReady);
        
        // Start record player animation now that audio is ready
        animatedRecordPlayer.visible = true;
        if (putVinylAction) {
          putVinylAction.stop();
          putVinylAction.setLoop(THREE.LoopOnce);
          putVinylAction.clampWhenFinished = true;
          putVinylAction.timeScale = 1;
          putVinylAction.reset();
          putVinylAction.play();
        }
        
        // Start audio timer from when record animation begins
        setTimeout(() => {
          if (isPreviewing && !audioPlayAttempted) {
            tryPlayAudio();
          }
        }, 4800); // 4800ms after record animation starts
      };
      
      // Multiple event listeners for better compatibility
      audio.addEventListener('canplay', onAudioReady);
      audio.addEventListener('canplaythrough', onAudioReady);
      audio.addEventListener('loadeddata', onAudioReady);
      
      // Fallback timer - start animation even if audio not ready
      audioTimeout = setTimeout(() => {
        console.log('Audio loading timeout - starting animation anyway');
        
        // Start animation even if audio isn't ready
        animatedRecordPlayer.visible = true;
        if (putVinylAction) {
          putVinylAction.stop();
          putVinylAction.setLoop(THREE.LoopOnce);
          putVinylAction.clampWhenFinished = true;
          putVinylAction.timeScale = 1;
          putVinylAction.reset();
          putVinylAction.play();
        }
        
        // Try to play audio after animation
        setTimeout(() => {
          if (isPreviewing && !audioPlayAttempted) {
            tryPlayAudio();
          }
        }, 4800);
        
      }, 3000); // Wait max 3 seconds for audio to load
      
      previewInstruction.style.display = "block";

      // Animate camera to face record player from further back
      gsap.to(camera.position, {
        x: 0,
        y: 1.8,
        z: -1.5,
        duration: 1,
        ease: "power2.inOut",
        onUpdate: () => {
          camera.lookAt(0, 1.2, -6);
        },
        onComplete: () => {
          controls.update();
        },
      });
    });
  }
}

function stopPreview() {
  if (!animatedRecordPlayer) return;
  isPreviewing = false;
  audio.pause();
  if (audioTimeout) {
    clearTimeout(audioTimeout);
    audioTimeout = null;
  }
  if (putVinylAction) {
    putVinylAction.stop();
    putVinylAction.timeScale = -1;
    putVinylAction.paused = false;
    putVinylAction.play();
  }
  previewInstruction.style.display = "none";
}

function onKeyDown(event) {
  switch (event.code) {
    case "ArrowDown":
      moveForward = true;
      break;
    case "ArrowUp":
      moveBackward = true;
      break;
    case "ArrowRight":
      moveLeft = true;
      break;
    case "ArrowLeft":
      moveRight = true;
      break;
    case "Escape":
      if (controls.isLocked) {
        controls.unlock();
      }
      break;
    case "KeyG":
      if (isPreviewing) {
        stopPreview();
      } else if (currentAlbum) {
        startPreview(currentAlbum);
      }
      break;
    case "KeyB":
      if (currentAlbum) {
        try {
          if (globalThis.window) {
            window.open(currentAlbum.buyUrl, "_blank");
          }
        } catch (error) {
          console.warn("Could not open buy URL:", error);
        }
      }
      break;
  }
}

function onKeyUp(event) {
  switch (event.code) {
    case "ArrowDown":
      moveForward = false;
      break;
    case "ArrowUp":
      moveBackward = false;
      break;
    case "ArrowRight":
      moveLeft = false;
      break;
    case "ArrowLeft":
      moveRight = false;
      break;
  }
}

function onWindowResize() {
  try {
    if (!globalThis.window) return;

    if (controls.isLocked) {
      // Fullscreen mode
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    } else {
      // Preview mode
      const rightPanel = document.getElementById("right-panel");
      if (rightPanel) {
        const canvasWidth = rightPanel.clientWidth;
        const canvasHeight = rightPanel.clientHeight;
        camera.aspect = canvasWidth / canvasHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(canvasWidth, canvasHeight);
      }
    }
  } catch (error) {
    console.warn("Error in onWindowResize:", error);
  }
}

function checkCollision(newPosition) {
  const raycaster = new THREE.Raycaster();
  const directions = [
    new THREE.Vector3(1, 0, 0),
    new THREE.Vector3(-1, 0, 0),
    new THREE.Vector3(0, 0, 1),
    new THREE.Vector3(0, 0, -1),
  ];
  let canMove = true;
  directions.forEach((direction) => {
    raycaster.set(newPosition, direction);
    raycaster.far = 0.5;
    const intersects = raycaster.intersectObjects(
      scene.children.filter((obj) => obj.userData.isWall)
    );
    if (intersects.length > 0 && intersects[0].distance < 0.5) {
      canMove = false;
    }
  });
  return canMove;
}

export function animatePreview() {
  if (!controls.isLocked && renderer && scene && camera) {
    const time = clock.getElapsedTime();
    camera.position.x = Math.sin(time * 0.2) * 5;
    camera.position.z = -5 + Math.cos(time * 0.2) * 3;
    camera.lookAt(0, 1.6, -6);
    renderer.render(scene, camera);
    previewAnimationId = requestAnimationFrame(animatePreview);
  }
}

// Expose functions to global scope for hamburger menu
try {
  if (globalThis.window) {
    window.animatePreview = animatePreview;
    window.resetToInitialState = resetToInitialState;
  }
} catch (error) {
  console.warn("Could not expose functions to global scope:", error);
}

export function animate() {
  mainAnimationId = requestAnimationFrame(animate);
  const delta = clock.getDelta();
  if (mixer) mixer.update(delta);

  if (
    putVinylAction &&
    putVinylAction.isRunning() &&
    putVinylAction.time >= putVinylAction.getClip().duration &&
    putVinylAction.timeScale > 0 &&
    isPreviewing
  ) {
    putVinylAction.setLoop(THREE.LoopRepeat, Infinity);
    putVinylAction.clampWhenFinished = false;
    putVinylAction.time = Math.max(0, putVinylAction.getClip().duration - 2);
    putVinylAction.play();
  }

  if (!moveForward && !moveBackward && !moveLeft && !moveRight) {
    velocity.set(0, 0, 0);
  } else {
    direction.z = Number(moveForward) - Number(moveBackward);
    direction.x = Number(moveRight) - Number(moveLeft);
    direction.normalize();
    if (moveForward || moveBackward) velocity.z = -direction.z * 400.0 * delta;
    if (moveLeft || moveRight) velocity.x = -direction.x * 400.0 * delta;
  }

  // Check collision separately for each axis
  const newPositionX = camera.position.clone();
  newPositionX.x += velocity.x * delta;
  const newPositionZ = camera.position.clone();
  newPositionZ.z += velocity.z * delta;

  // Allow movement in X direction if no collision
  if (checkCollision(newPositionX)) {
    controls.moveRight(velocity.x * delta);
  }

  // Allow movement in Z direction if no collision
  if (checkCollision(newPositionZ)) {
    controls.moveForward(velocity.z * delta);
  }

  // Apply device orientation for mobile camera control (portrait mode)
  if (isMobile) {
    // Debug: Check orientation state
    if (Math.random() < 0.01) {
      console.log('Orientation check:', {
        isMobile,
        hasDeviceOrientation: !!(deviceOrientation && (deviceOrientation.alpha !== 0 || deviceOrientation.beta !== 0 || deviceOrientation.gamma !== 0)),
        hasInitialOrientation: !!initialOrientation,
        deviceOrientation,
        initialOrientation
      });
    }
    
    if (deviceOrientation && initialOrientation) {
      updateCameraFromOrientation();
    }
  }

  camera.position.x = THREE.MathUtils.clamp(camera.position.x, -9, 9);
  camera.position.z = THREE.MathUtils.clamp(camera.position.z, -8.5, 9);
  camera.position.y = 1.6;

  // Album popups
  const container = document.getElementById("container");
  const isInGalleryMode =
    controls.isLocked ||
    (isMobile && container && container.style.display === "none");

  if (isInGalleryMode) {
    let closestAlbum = null;
    let closestDistance = Infinity;

    scene.children.forEach((child) => {
      if (child.userData.album) {
        const distance = camera.position.distanceTo(child.position);
        if (distance < 3 && distance < closestDistance) {
          closestDistance = distance;
          closestAlbum = child.userData.album;
        }
      }
    });

    if (isMobile && closestAlbum) {
      console.log(
        "Found closest album on mobile:",
        closestAlbum.title,
        "Distance:",
        closestDistance
      );
    }

    if (closestAlbum && closestAlbum !== currentAlbum) {
      currentAlbum = closestAlbum;
      albumTitle.textContent = currentAlbum.title;
      if (ui.style.display !== "block") {
        ui.style.display = "block";
        if (isMobile) {
          console.log("Showing album popup on mobile:", currentAlbum.title);
          console.log("UI element found:", ui);
        }
        gsap.fromTo(
          "#ui",
          { opacity: 0, scale: 0.8 },
          { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.4)" }
        );
      }
      ui.classList.add("visible");
    } else if (!closestAlbum && currentAlbum) {
      currentAlbum = null;
      if (isMobile) {
        console.log("Hiding album popup on mobile");
      }
      gsap.to("#ui", {
        opacity: 0,
        scale: 0.8,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
          ui.style.display = "none";
          ui.classList.remove("visible");
        },
      });
    }
  } else if (currentAlbum) {
    currentAlbum = null;
    ui.style.display = "none";
    ui.classList.remove("visible");
  }

  renderer.render(scene, camera);
}