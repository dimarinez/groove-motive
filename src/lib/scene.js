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
    }); // Changed to moveBackward
    moveUpButton.addEventListener("touchend", () => {
      moveBackward = false;
    });
    moveDownButton.addEventListener("touchstart", () => {
      moveForward = true;
    }); // Changed to moveForward
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
  scene.background = new THREE.Color(0xf0f0f0); // Slightly lighter background

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
      
      // Request device orientation permission when entering gallery on iOS
      if (typeof DeviceOrientationEvent !== 'undefined' && 
          typeof DeviceOrientationEvent.requestPermission === 'function') {
        console.log('Requesting device orientation permission on gallery entry...');
        DeviceOrientationEvent.requestPermission().then(permission => {
          console.log('Device orientation permission:', permission);
          if (permission === 'granted') {
            initialOrientation = null; // Reset initial orientation
            setupDeviceOrientationListener(); // Add listener directly
          }
        }).catch(error => {
          console.warn('Permission error:', error);
        });
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

// Legacy setup function (keeping for compatibility)
function setupDeviceOrientationListener() {
  startOrientationTracking();
}

// Add orientation button to the actual UI instead of immediately
function addOrientationButton() {
  if (!isMobile || !globalThis.window) return;
  
  // Remove any existing button
  const existingButton = document.querySelector('#orientation-button');
  if (existingButton) existingButton.remove();
  
  const testButton = document.createElement('button');
  testButton.id = 'orientation-button';
  testButton.textContent = 'Enable Device Rotation';
  testButton.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10000;
    background: #007AFF;
    color: white;
    padding: 16px 24px;
    border: none;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    cursor: pointer;
  `;
  
  testButton.onclick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🚀 Orientation button clicked from user interaction');
    
    // Must be called directly from user interaction
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        console.log('🚀 Requesting iOS permission...');
        const permission = await DeviceOrientationEvent.requestPermission();
        console.log('🚀 Permission result:', permission);
        
        if (permission === 'granted') {
          startOrientationTracking();
          testButton.textContent = '✅ Rotation Enabled';
          testButton.style.background = '#34C759';
          
          // Hide button after 2 seconds
          setTimeout(() => {
            testButton.style.opacity = '0';
            setTimeout(() => testButton.remove(), 300);
          }, 2000);
        } else {
          testButton.textContent = '❌ Permission Denied';
          testButton.style.background = '#FF3B30';
        }
      } catch (error) {
        console.error('🚀 Permission error:', error);
        testButton.textContent = '⚠️ Permission Error';
        testButton.style.background = '#FF9500';
      }
    } else {
      // Android or older iOS
      startOrientationTracking();
      testButton.textContent = '✅ Rotation Enabled';
      testButton.style.background = '#34C759';
      
      setTimeout(() => {
        testButton.style.opacity = '0';
        setTimeout(() => testButton.remove(), 300);
      }, 2000);
    }
  };
  
  document.body.appendChild(testButton);
  
  // Add fade-in animation
  testButton.style.opacity = '0';
  setTimeout(() => {
    testButton.style.transition = 'opacity 0.3s ease';
    testButton.style.opacity = '1';
  }, 100);
}

// Call this when page is ready and user has interacted
if (isMobile) {
  // Add button after a delay to ensure DOM is ready
  setTimeout(() => {
    addOrientationButton();
    
    // Add debug info
    const debugDiv = document.createElement('div');
    debugDiv.style.cssText = `
      position: fixed;
      top: 80px;
      left: 10px;
      background: rgba(0,0,0,0.8);
      color: white;
      padding: 10px;
      border-radius: 8px;
      font-size: 12px;
      z-index: 9999;
      max-width: 300px;
    `;
    debugDiv.innerHTML = `
      <strong>Debug Info:</strong><br>
      User Agent: ${navigator.userAgent}<br>
      DeviceOrientationEvent: ${typeof DeviceOrientationEvent !== 'undefined'}<br>
      requestPermission: ${typeof DeviceOrientationEvent?.requestPermission === 'function'}<br>
      HTTPS: ${location.protocol === 'https:'}<br>
      Host: ${location.host}
    `;
    document.body.appendChild(debugDiv);
    
    // Remove after 10 seconds
    setTimeout(() => debugDiv.remove(), 10000);
  }, 1000);
}

// Simple orientation tracking function
function startOrientationTracking() {
  console.log('📱 Starting orientation tracking');
  
  // Clear any existing listeners
  if (window.orientationHandler) {
    window.removeEventListener('deviceorientation', window.orientationHandler);
  }
  
  window.orientationHandler = (event) => {
    if (event.alpha !== null && event.beta !== null && event.gamma !== null) {
      deviceOrientation = {
        alpha: event.alpha,
        beta: event.beta,
        gamma: event.gamma
      };
      
      // Set initial orientation on first reading
      if (!initialOrientation) {
        initialOrientation = { ...deviceOrientation };
        console.log('📍 Initial orientation set:', initialOrientation);
      }
      
      // Log more frequently to verify it's working
      if (Math.random() < 0.1) {
        console.log('📱 Orientation update:', {
          current: deviceOrientation,
          initial: initialOrientation,
          delta: initialOrientation ? {
            alpha: deviceOrientation.alpha - initialOrientation.alpha,
            beta: deviceOrientation.beta - initialOrientation.beta,
            gamma: deviceOrientation.gamma - initialOrientation.gamma
          } : null
        });
      }
    }
  };
  
  window.addEventListener('deviceorientation', window.orientationHandler);
  console.log('✅ Orientation listener added');
}

// Auto-setup for Android devices (no permission needed)
if (isMobile && typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission !== 'function') {
  console.log('📱 Android device detected, auto-enabling orientation');
  startOrientationTracking();
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
  }); // Light blue for window

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
  walls[0].position.set(0, 2.5, -10); // Back wall
  walls[1].position.set(0, 2.5, 10); // Front wall (with window)
  walls[1].rotation.y = Math.PI;
  walls[2].position.set(-10, 2.5, 0); // Left wall
  walls[2].rotation.y = Math.PI / 2;
  walls[3].position.set(10, 2.5, 0); // Right wall
  walls[3].rotation.y = -Math.PI / 2;
  walls.forEach((wall) => {
    wall.userData.isWall = true;
    scene.add(wall);
  });

  // Window on front wall
  const window = new THREE.Mesh(new THREE.PlaneGeometry(4, 2), windowMaterial);
  window.position.set(0, 2.5, 10.1); // Slightly in front of the front wall
  window.userData.isWall = false;
  scene.add(window);

  // Lighting (enhanced with window light)
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.2); // Increased intensity
  scene.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.8); // Increased intensity
  directionalLight.position.set(5, 10, 5);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.set(1024, 1024);
  scene.add(directionalLight);
  const windowLight = new THREE.PointLight(0x87ceeb, 2.2, 15); // Light blue window light
  windowLight.position.set(0, 3, 10); // Positioned at window
  scene.add(windowLight);
  const pointLight = new THREE.PointLight(0xfff5e6, 1.0, 20);
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
    },
    undefined,
    (error) => {
      console.error("Error loading GLB model:", error);
    }
  );

  // Albums
  albums.forEach((album, index) => createAlbumMesh(album, index));

  audio = new Audio();
  audio.addEventListener("ended", () => {});

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

function resetToInitialState() {
  // Stop any music preview
  if (isPreviewing) {
    stopPreview();
  }

  // Reset UI elements
  ui.style.display = "none";
  currentAlbum = null;
  albumTitle.textContent = "";

  // Move instructions back to right panel when exiting gallery
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
    ease: "power2.out",
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

    // Resize renderer to preview size
    renderer.setSize(rightPanel.clientWidth, rightPanel.clientHeight);
    camera.aspect = rightPanel.clientWidth / rightPanel.clientHeight;
    camera.updateProjectionMatrix();
  }

  // Reset controls
  controls.dispose();
  controls = new PointerLockControls(camera, renderer.domElement);

  // Re-add standard control event listeners
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

    // Reset to initial state recursively
    resetToInitialState();
  });

  // Stop main animation
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

  // Trigger resize to ensure proper canvas dimensions
  setTimeout(() => {
    onWindowResize();
  }, 100);
}

export function enterGallery() {
  const container = document.getElementById("container");
  if (container) container.style.display = "none";

  // Add body class to show mobile menu
  document.body.classList.add("gallery-entered");

  // Stop preview animation
  if (previewAnimationId) {
    cancelAnimationFrame(previewAnimationId);
    previewAnimationId = null;
  }

  // Move instructions to body for fullscreen overlay
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

  // Add unlock event listener to handle ESC properly
  controls.addEventListener("unlock", () => {
    // Clean up click-to-lock handler
    if (clickToLockHandler) {
      document.removeEventListener("click", clickToLockHandler);
      clickToLockHandler = null;
    }

    // Reset to initial state - simpler approach
    resetToInitialState();
  });

  // Clean up any existing click-to-lock handler
  if (clickToLockHandler) {
    document.removeEventListener("click", clickToLockHandler);
  }

  // Enable click-to-lock after entering gallery (but not on enter button)
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

  // Force a render to ensure the canvas is properly initialized
  renderer.render(scene, camera);

// Remove the gallery permission button - using the simpler top-left button instead

  // Initial lock with error handling
  setTimeout(() => {
    if (!controls.isLocked) {
      try {
        controls.lock();
      } catch (error) {
        console.warn("Initial pointer lock failed:", error);
      }
    }

    // Ensure mobile controls are visible after fullscreen transition
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
  const texture = new THREE.TextureLoader().load(album.cover);
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
            const textureAspect = texture.image.width / texture.image.height;
            const geometryAspect = width / height;
            const shrinkFactor = 1.95;
            let repeatX = shrinkFactor;
            let repeatY = shrinkFactor * (geometryAspect / textureAspect);
            if (textureAspect > geometryAspect) {
              repeatX = shrinkFactor * (textureAspect / geometryAspect);
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

      // Animate camera to face record player
      gsap.to(camera.position, {
        x: 0,
        y: 1.6,
        z: -3,
        duration: 1,
        ease: "power2.inOut",
        onUpdate: () => {
          camera.lookAt(0, 0, -6);
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
      break; // Corrected to moveBackward
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
      break; // Corrected to moveBackward
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
      // Preview mode - use right panel dimensions
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
    direction.z = Number(moveForward) - Number(moveBackward); // Forward is negative z, backward is positive z
    direction.x = Number(moveRight) - Number(moveLeft);
    direction.normalize();
    if (moveForward || moveBackward) velocity.z = -direction.z * 400.0 * delta; // Adjusted for correct direction
    if (moveLeft || moveRight) velocity.x = -direction.x * 400.0 * delta;
  }

  // Check collision separately for each axis to allow sliding along walls
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

  // Debug orientation conditions (only log occasionally to avoid spam)
  if (isMobile && Math.random() < 0.01) { // Log ~1% of the time
    console.log('🎮 Animate orientation debug:', {
      isMobile,
      isLocked: controls.isLocked,
      hasInitialOrientation: !!initialOrientation,
      hasAlpha: deviceOrientation.alpha !== null,
      hasBeta: deviceOrientation.beta !== null,
      hasGamma: deviceOrientation.gamma !== null,
      alphaValue: deviceOrientation.alpha,
      betaValue: deviceOrientation.beta,
      gammaValue: deviceOrientation.gamma
    });
  }

  if (
    isMobile &&
    controls.isLocked &&
    initialOrientation &&
    deviceOrientation.alpha !== null &&
    deviceOrientation.beta !== null &&
    deviceOrientation.gamma !== null
  ) {
    // Calculate relative orientation
    const deltaAlpha = deviceOrientation.alpha - initialOrientation.alpha;
    const deltaBeta = deviceOrientation.beta - initialOrientation.beta;

    // Apply sensitivity and convert to radians
    const sensitivity = 1.5;
    const yaw = THREE.MathUtils.degToRad(deltaAlpha) * sensitivity;
    const pitch = THREE.MathUtils.clamp(
      THREE.MathUtils.degToRad(deltaBeta) * sensitivity,
      -Math.PI / 3,
      Math.PI / 3
    );

    // Apply rotation directly to the camera (not through controls)
    // PointerLockControls manages the camera rotation through its internal object
    const euler = new THREE.Euler(0, 0, 0, 'YXZ');
    euler.setFromQuaternion(camera.quaternion);
    
    // Apply device orientation rotation
    euler.y = -yaw;
    euler.x = -pitch;
    
    camera.quaternion.setFromEuler(euler);

    // Debug log occasionally
    if (Math.random() < 0.05) {
      console.log('🎯 Camera rotation applied:', {
        yaw: THREE.MathUtils.radToDeg(-yaw),
        pitch: THREE.MathUtils.radToDeg(-pitch),
        deltaAlpha,
        deltaBeta,
        cameraRotationY: euler.y,
        cameraRotationX: euler.x
      });
    }
  }

  camera.position.x = THREE.MathUtils.clamp(camera.position.x, -9, 9);
  camera.position.z = THREE.MathUtils.clamp(camera.position.z, -8.5, 9);
  camera.position.y = 1.6;

  // Only show album popups when in active gallery mode (controls locked or mobile in fullscreen)
  const container = document.getElementById("container");
  const isInGalleryMode =
    controls.isLocked ||
    (isMobile && container && container.style.display === "none");

  if (isInGalleryMode) {
    // Find closest album based on position only (not looking direction)
    let closestAlbum = null;
    let closestDistance = Infinity;

    scene.children.forEach((child) => {
      if (child.userData.album) {
        const distance = camera.position.distanceTo(child.position);
        if (distance < 3 && distance < closestDistance) {
          // Within 3 units
          closestDistance = distance;
          closestAlbum = child.userData.album;
        }
      }
    });

    // Debug logging for mobile
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
        // Debug logging for mobile
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
      // Debug logging for mobile
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
    // If not in gallery mode but there's a current album, clear it
    currentAlbum = null;
    ui.style.display = "none";
    ui.classList.remove("visible");
  }

  renderer.render(scene, camera);
}
