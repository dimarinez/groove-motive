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
let velocity, direction, clock;
let audio,
  currentAlbum = null,
  isPreviewing = false;
let mixer, putVinylAction, spinAction, vinyl;
let animatedRecordPlayer = null;
let audioTimeout = null;

let ui, albumTitle, enterButton, galleryCanvas, galleryScreen;
let moveUpButton, moveDownButton, moveLeftButton, moveRightButton;
let isMobile = false;
// Device orientation controls
let deviceOrientationControls = null;
let deviceOrientation = { alpha: 0, beta: 0, gamma: 0 };
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
let recordAnimationStarted = false;

// Portrait mode enforcement
let portraitWarning = null;
let isPortraitMode = true;

// Portrait mode enforcement helpers
function createPortraitWarning() {
  if (portraitWarning) return;
  
  portraitWarning = document.createElement("div");
  portraitWarning.id = "portrait-warning";
  portraitWarning.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.95);
    color: white;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 10000;
    font-family: "Suisse", -apple-system, BlinkMacSystemFont, sans-serif;
    text-align: center;
    padding: 20px;
    box-sizing: border-box;
  `;
  
  portraitWarning.innerHTML = `
    <div style="font-size: 48px; margin-bottom: 20px;">📱</div>
    <h2 style="font-size: 24px; margin-bottom: 15px; font-weight: 600;">Portrait Mode Required</h2>
    <p style="font-size: 18px; line-height: 1.5; max-width: 300px; margin-bottom: 20px;">
      Please rotate your device to portrait orientation for the best gallery experience.
    </p>
    <div style="font-size: 36px; animation: pulse 2s infinite;">↻</div>
    <style>
      @keyframes pulse {
        0%, 100% { opacity: 0.6; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.1); }
      }
    </style>
  `;
  
  document.body.appendChild(portraitWarning);
}

function checkOrientation() {
  if (!isMobile) return;
  
  const isCurrentlyPortrait = globalThis.window.innerHeight > globalThis.window.innerWidth;
  const isInGalleryMode = controls && controls.isLocked;
  
  if (isCurrentlyPortrait !== isPortraitMode) {
    isPortraitMode = isCurrentlyPortrait;
    
    if (isPortraitMode) {
      // Switched to portrait
      if (portraitWarning) {
        portraitWarning.style.display = 'none';
      }
      console.log('Device rotated to portrait mode');
      
      // If user was blocked from entering gallery, allow them to try again
      const container = document.getElementById("container");
      if (container && container.style.display === "none" && !controls.isLocked) {
        console.log('Re-enabling gallery access after portrait rotation');
        container.style.display = "flex";
      }
      
      // Orientation controls automatically adjust to new position
      console.log('Orientation controls will adapt to new portrait position');
    } else {
      // Switched to landscape - show warning regardless of mode
      createPortraitWarning();
      portraitWarning.style.display = 'flex';
      console.log('Device rotated to landscape mode - showing warning');
      
      // If in gallery mode, also unlock controls to prevent getting stuck
      if (isInGalleryMode && controls && controls.isLocked) {
        setTimeout(() => {
          if (!isPortraitMode && controls.isLocked) {
            console.log('Auto-unlocking controls due to landscape mode');
            controls.unlock();
          }
        }, 2000); // Give user 2 seconds to rotate back
      }
    }
  }
}

function hidePortraitWarning() {
  if (portraitWarning) {
    portraitWarning.style.display = 'none';
  }
}

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
  
  // Initialize THREE.js objects
  velocity = new THREE.Vector3();
  direction = new THREE.Vector3();
  clock = new THREE.Clock();
  
  // Check initial orientation for mobile
  if (isMobile) {
    isPortraitMode = globalThis.window.innerHeight > globalThis.window.innerWidth;
    if (!isPortraitMode) {
      createPortraitWarning();
      portraitWarning.style.display = 'flex';
    }
  }

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
    // Phone upright in portrait should look directly at the wall (0 degrees)
    camera.rotation.x = 0;
    camera.rotation.y = 0;
    camera.rotation.z = 0;
    // Point camera toward the wall
    camera.lookAt(0, 1.6, -6);
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
  const windowMesh = new THREE.Mesh(new THREE.PlaneGeometry(4, 2), windowMaterial);
  windowMesh.position.set(0, 2.5, 10.1);
  windowMesh.userData.isWall = false;
  scene.add(windowMesh);

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
      window.addEventListener("orientationchange", () => {
        setTimeout(checkOrientation, 300); // Small delay for orientation change
      });
      window.addEventListener("resize", checkOrientation); // Also check on resize
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
        setupSimpleDeviceOrientation();
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
    setupSimpleDeviceOrientation();
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
 * Simple device orientation handling for mobile camera control
 */
function setupDeviceOrientationControls() {
  if (!isMobile) {
    console.log('Not mobile device, skipping orientation setup');
    return;
  }

  console.log('🚀 Setting up Simple Device Orientation Controls...');

  // Add device orientation event listener
  const handleDeviceOrientation = (event) => {
    if (event.alpha !== null && event.beta !== null && event.gamma !== null) {
      deviceOrientation = {
        alpha: event.alpha,
        beta: event.beta,
        gamma: event.gamma
      };
    }
  };

  // Add event listener
  window.addEventListener('deviceorientation', handleDeviceOrientation, false);
  deviceOrientationControls = { enabled: true };
  
  console.log('Simple device orientation controls initialized');
  updateOrientationStatus('granted', 'Orientation: Ready');
  
  setTimeout(() => {
    if (deviceOrientationControls.enabled) {
      console.log('Simple device orientation controls active');
      updateOrientationStatus('granted', 'Orientation: Active');
    }
  }, 2000);
}



/**
 * No longer needed with absolute orientation positioning
 * Keeping function for compatibility but it does nothing
 */
function recalibrateOrientation() {
  console.log('Recalibration not needed with absolute orientation controls');
}

// Clean up orientation controls
function cleanupDeviceOrientation() {
  window.removeEventListener('deviceorientation', () => {});
  deviceOrientationControls = null;
  deviceOrientation = { alpha: 0, beta: 0, gamma: 0 };
  console.log('Device orientation controls cleaned up');
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

  // Hide portrait warning when exiting gallery
  if (isMobile) {
    hidePortraitWarning();
  }

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
    // Phone upright should look directly at wall
    camera.rotation.set(0, 0, 0);
    camera.lookAt(0, 1.6, -6);
  } else {
    camera.rotation.set(0, 0, 0);
    camera.lookAt(0, 1.6, -6);
  }

  // Reset device orientation
  if (isMobile) {
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

  // Check orientation immediately when entering gallery
  if (isMobile) {
    checkOrientation();
    
    // Don't proceed if in landscape mode
    if (!isPortraitMode) {
      console.log('Blocking gallery entry - device in landscape mode');
      createPortraitWarning();
      portraitWarning.style.display = 'flex';
      
      // Reset back to home screen
      setTimeout(() => {
        if (!isPortraitMode) {
          resetToInitialState();
        }
      }, 100);
      return;
    }
    
    requestDeviceOrientationPermission();
    
    // Set initial camera position for portrait mode
    setTimeout(() => {
      if (deviceOrientationControls && deviceOrientationControls.enabled) {
        console.log('Setting up absolute orientation controls');
        
        // Ensure camera is positioned correctly for portrait mode
        camera.position.set(0, 1.6, -2); // Standard viewing position
        camera.rotation.order = 'YXZ';
        
        console.log('Absolute orientation controls ready');
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
        
        // Start record player animation now that audio is ready (only once)
        if (!recordAnimationStarted) {
          recordAnimationStarted = true;
          animatedRecordPlayer.visible = true;
          if (putVinylAction) {
            putVinylAction.stop();
            putVinylAction.setLoop(THREE.LoopOnce);
            putVinylAction.clampWhenFinished = true;
            putVinylAction.timeScale = 1;
            putVinylAction.reset();
            putVinylAction.play();
          }
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
        
        // Start animation even if audio isn't ready (only once)
        if (!recordAnimationStarted) {
          recordAnimationStarted = true;
          animatedRecordPlayer.visible = true;
          if (putVinylAction) {
            putVinylAction.stop();
            putVinylAction.setLoop(THREE.LoopOnce);
            putVinylAction.clampWhenFinished = true;
            putVinylAction.timeScale = 1;
            putVinylAction.reset();
            putVinylAction.play();
          }
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
  recordAnimationStarted = false; // Reset animation flag
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
  if (spinAction) {
    spinAction.stop();
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

  // Record player animation logic - removed double play
  if (
    putVinylAction &&
    putVinylAction.isRunning() &&
    putVinylAction.time >= putVinylAction.getClip().duration &&
    putVinylAction.timeScale > 0 &&
    isPreviewing
  ) {
    // Switch to spin animation after put vinyl animation completes
    if (spinAction && !spinAction.isRunning()) {
      putVinylAction.stop();
      spinAction.setLoop(THREE.LoopRepeat, Infinity);
      spinAction.timeScale = 1;
      spinAction.play();
    }
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

  // Apply absolute device orientation for mobile camera control
  if (isMobile && deviceOrientationControls && deviceOrientationControls.enabled && deviceOrientation) {
    // Use absolute device orientation values
    const alpha = deviceOrientation.alpha || 0; // Compass heading (0-360°)
    const beta = deviceOrientation.beta || 0;   // Front-back tilt (-180 to 180°)
    const gamma = deviceOrientation.gamma || 0; // Left-right tilt (-90 to 90°)
    
    camera.rotation.order = 'YXZ';
    
    // Map absolute beta to camera pitch (phone camera = eye):
    // Beta 0° = phone upright → camera looks straight ahead  
    // Beta 90° = phone flat down → camera looks down
    // Beta -90° = phone flat up → camera looks up
    // Map so: upright=0°→straight, flat=90°→down, upside=-90°→up
    const adjustedBeta = beta; // Keep original beta
    const pitchSensitivity = 0.01; // Much lower sensitivity to test
    camera.rotation.x = THREE.MathUtils.degToRad(adjustedBeta) * pitchSensitivity;
    
    // Alpha controls yaw (left/right turning) - normalize to -180 to 180 range
    const yawSensitivity = 0.8;
    let normalizedAlpha = alpha;
    if (normalizedAlpha > 180) normalizedAlpha -= 360;
    camera.rotation.y = THREE.MathUtils.degToRad(normalizedAlpha) * yawSensitivity;
    
    // Gamma (roll) - minimal effect for stability
    camera.rotation.z = THREE.MathUtils.degToRad(gamma) * 0.05;
    
    // Clamp rotations for comfortable viewing
    camera.rotation.x = THREE.MathUtils.clamp(camera.rotation.x, -Math.PI/2, Math.PI/2);
    camera.rotation.z = THREE.MathUtils.clamp(camera.rotation.z, -Math.PI/12, Math.PI/12);
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