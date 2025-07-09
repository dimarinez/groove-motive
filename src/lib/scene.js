import * as THREE from "three";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import gsap from "gsap";

const albums = [
  {
    title: "Luke Andy x Sophiegrophy",
    cover:
      "https://5ndhpj66kbzege6f.public.blob.vercel-storage.com/GM001%20Cover%20Art-CXMv1jONUAiX4AkqqrnImIYaN0uhvf.jpg",
    previewUrl:
      "https://5ndhpj66kbzege6f.public.blob.vercel-storage.com/Luke%20Andy%20%26%20Sophiegrophy%20-%20My%20Side%20%28Radio%20Edit%29%5BGroove%20Motive%5D-E7LHlE93liGWo5wye9EkHVvfKOEhP7.wav",
    buyUrl: "https://example.com/buy1",
  },
  {
    title: "KiRiK",
    cover:
      "https://5ndhpj66kbzege6f.public.blob.vercel-storage.com/GM002-lGO8mItablUVx5gSDlrIdYGGmGiMvI.jpg",
    previewUrl:
      "https://5ndhpj66kbzege6f.public.blob.vercel-storage.com/KiRiK%20-%20Truth_Groove%20Motive%20%5BRadio%20Master%5D-E0A5sRdKPSfAN0yQwpdmC3089krw1t.wav",
    buyUrl: "https://example.com/buy2",
  },
  {
    title: "Dateless",
    cover:
      "https://5ndhpj66kbzege6f.public.blob.vercel-storage.com/GM003-Z0LtleLGW8Z5SH2h4Zs0dL3OxYklNV.jpg",
    previewUrl:
      "https://5ndhpj66kbzege6f.public.blob.vercel-storage.com/Dateless%20-%20Like%20Me_Groove%20Motive-cGOfozPVRhjgVUCX41HxEC9gyOaTlS.wav",
    buyUrl: "https://example.com/buy3",
  },
  {
    title: "BRN",
    cover:
      "https://5ndhpj66kbzege6f.public.blob.vercel-storage.com/GM004_Machines-2ZaUOuUQWrb6wmS4jiE8wrSMniij2O.jpg",
    previewUrl:
      "https://5ndhpj66kbzege6f.public.blob.vercel-storage.com/BRN%20-%20Machines%20%28Radio%29%28FW%20MASTER%201%29-BQDu0emCVCpFtyAfLec8GWmTkUmrI1.wav",
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
let deviceOrientation = { alpha: 0, beta: 0, gamma: 0 };
let initialOrientation = null;
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
      loadingIndicator.style.display = 'block';
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
      'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; background: rgba(0, 0, 0, 0.9); padding: 20px 30px; border-radius: 12px; font-size: 18px; font-weight: 600; text-align: center; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3); backdrop-filter: blur(10px); border: 2px solid rgba(255, 255, 255, 0.2); z-index: 1000; display: none; font-family: "Suisse", -apple-system, BlinkMacSystemFont, sans-serif; letter-spacing: 0.5px;';
    previewInstruction.innerHTML =
      'Press <span style="background: rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 6px; font-weight: 700;">G</span> to stop the music';
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

  renderer = new THREE.WebGLRenderer({
    canvas: galleryCanvas,
    antialias: true,
  });
  renderer.setSize(canvasWidth, canvasHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;

  controls = new PointerLockControls(camera, galleryCanvas);
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
  
  // Initialize orientation status
  if (isMobile) {
    updateOrientationStatus('not-requested', 'Orientation: Not requested');
  } else {
    // Hide orientation status on desktop
    if (orientationStatus) {
      orientationStatus.style.display = 'none';
    }
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
      updateOrientationStatus('not-requested', 'Requesting permission...');
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
        updateOrientationStatus('granted', 'Orientation: Granted');
        console.log('Device orientation permission granted');
        // Wait a bit then setup controls
        setTimeout(() => {
          setupDeviceOrientationControls();
        }, 500);
      } else if (permissionResult === 'denied') {
        updateOrientationStatus('denied', 'Orientation: Denied');
        console.log('Device orientation permission denied');
      } else {
        updateOrientationStatus('denied', 'Orientation: Error - ' + permissionResult);
        console.log('Device orientation permission error:', permissionResult);
      }
      
    } catch (error) {
      console.error('Error requesting device orientation permission:', error);
      updateOrientationStatus('denied', 'Orientation: Error');
    }
  } else {
    // Android or older iOS - no permission required
    console.log('No permission required for device orientation');
    updateOrientationStatus('granted', 'Orientation: Available');
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

// Device orientation handling for mobile camera control
function setupDeviceOrientationControls() {
  if (!isMobile) return;

  // Reset orientation data
  deviceOrientation = { alpha: 0, beta: 0, gamma: 0 };
  initialOrientation = null;

  // Show orientation values UI
  if (orientationValues) {
    orientationValues.style.display = 'block';
  }

  window.addEventListener('deviceorientation', function(event) {
    // Update UI values
    if (alphaValue) alphaValue.textContent = event.alpha ? event.alpha.toFixed(1) : '0';
    if (betaValue) betaValue.textContent = event.beta ? event.beta.toFixed(1) : '0';
    if (gammaValue) gammaValue.textContent = event.gamma ? event.gamma.toFixed(1) : '0';
    
    // Update device orientation for camera control
    if (event.alpha !== null && event.beta !== null && event.gamma !== null) {
      deviceOrientation = {
        alpha: event.alpha,
        beta: event.beta,
        gamma: event.gamma
      };

      if (!initialOrientation) {
        initialOrientation = { ...deviceOrientation };
        console.log('Initial upright orientation set:', initialOrientation);
        console.log('Device orientation tracking enabled');
      }
    }
  });

  // Add recalibration option (press 'R' to reset initial orientation when phone is upright)
  window.addEventListener('keydown', (event) => {
    if (event.code === 'KeyR' && isMobile) {
      initialOrientation = { ...deviceOrientation };
      console.log('Recalibrated upright orientation:', initialOrientation);
    }
  });
  
  console.log('scene.js loaded - Version: 2025-07-08-head-eyes');
  console.log('Device orientation listener added');
  
  // Test if we're getting events after 2 seconds
  setTimeout(() => {
    if (!initialOrientation) {
      console.warn('No device orientation events received after 2 seconds');
      updateOrientationStatus('denied', 'Orientation: No events');
    } else {
      console.log('Device orientation working correctly');
    }
  }, 2000);
}

// Clean up orientation listeners
function cleanupDeviceOrientation() {
  window.removeEventListener('deviceorientation', () => {});
  document.removeEventListener('deviceorientation', () => {});
  window.removeEventListener('devicemotion', () => {});
  document.removeEventListener('devicemotion', () => {});
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
  camera.rotation.set(0, 0, 0);
  camera.lookAt(0, 1.6, -6);

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
      animatedRecordPlayer.visible = true;
      if (putVinylAction) {
        putVinylAction.stop();
        putVinylAction.setLoop(THREE.LoopOnce);
        putVinylAction.clampWhenFinished = true;
        putVinylAction.timeScale = 1;
        putVinylAction.reset();
        putVinylAction.play();
      }
      audio.src = album.previewUrl;
      audioTimeout = setTimeout(() => {
        if (isPreviewing) audio.play();
      }, 4800);
      previewInstruction.style.display = "block";

      // Animate camera to face record player from further back
      gsap.to(camera.position, {
        x: 0,
        y: 1.8,
        z: -1.5, // Further back to see both record player and album
        duration: 1,
        ease: "power2.inOut",
        onUpdate: () => {
          camera.lookAt(0, 1.2, -6); // Look slightly down at the record player
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

export function animate() {
  camera.rotation.x += 0.01; // Test pitch
  camera.rotation.y += 0.01; // Test yaw
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

  // Mobile device orientation control - apply rotation to camera
  if (isMobile && deviceOrientation && initialOrientation) {
    const alpha = deviceOrientation.alpha || 0;
    const beta = deviceOrientation.beta || 0;
    const gamma = deviceOrientation.gamma || 0;

    // Calculate relative rotation from initial upright position
    const relativeAlpha = alpha - initialOrientation.alpha;
    const relativeBeta = beta - initialOrientation.beta;

    // Convert to radians with smoothing
    const targetYaw = THREE.MathUtils.degToRad(relativeAlpha); // Left/right rotation
    const targetPitch = THREE.MathUtils.degToRad(relativeBeta); // Up/down tilt
    const targetRoll = 0; // Ignore roll for stable view

    // Smoothly interpolate rotations
    const smoothingFactor = 0.1;
    const yaw = camera.rotation.y + (targetYaw - camera.rotation.y) * smoothingFactor;
    const pitch = camera.rotation.x + (targetPitch - camera.rotation.x) * smoothingFactor;
    const roll = targetRoll;

    // Log orientation values for debugging
    console.log('Orientation data:', {
      alpha, beta, gamma,
      relativeAlpha, relativeBeta,
      yaw, pitch, roll,
      cameraRotationBefore: {
        x: camera.rotation.x.toFixed(3),
        y: camera.rotation.y.toFixed(3),
        z: camera.rotation.z.toFixed(3)
      }
    });

    // Temporarily disable PointerLockControls to apply orientation
    const wasLocked = controls.isLocked;
    if (wasLocked) {
      try {
        controls.unlock();
      } catch (error) {
        console.warn('Failed to unlock controls:', error);
      }
    }

    // Apply rotation to match head/eyes movement
    camera.rotation.x = pitch;   // Beta: Tilt forward (positive) = look down (positive), tilt backward (negative) = look up (negative)
    camera.rotation.y = -yaw;    // Alpha: Rotate left (positive) = turn left (negative), rotate right (negative) = turn right (positive)
    camera.rotation.z = roll;    // Gamma: Ignore (set to 0)

    // Log camera rotation after update
    console.log('Camera rotation after:', {
      x: camera.rotation.x.toFixed(3),
      y: camera.rotation.y.toFixed(3),
      z: camera.rotation.z.toFixed(3)
    });

    // Re-lock controls if they were previously locked
    if (wasLocked) {
      try {
        controls.lock();
      } catch (error) {
        console.warn('Failed to re-lock controls:', error);
      }
    }

    // Force render to ensure update
    renderer.render(scene, camera);
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