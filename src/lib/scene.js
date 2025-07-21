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
    buyUrl: "https://www.beatport.com/track/my-side/20167500",
  },
  {
    title: "KiRiK",
    cover:
      "https://5ndhpj66kbzege6f.public.blob.vercel-storage.com/GM002.jpg",
    previewUrl:
      "https://5ndhpj66kbzege6f.public.blob.vercel-storage.com/KiRiK%20-%20Truth_Groove%20Motive%20%5BRadio%20Master%5D.mp3",
    buyUrl: "https://www.beatport.com/track/truth/20398456",
  },
  {
    title: "Dateless",
    cover:
      "https://5ndhpj66kbzege6f.public.blob.vercel-storage.com/GM003.jpg",
    previewUrl:
      "https://5ndhpj66kbzege6f.public.blob.vercel-storage.com/Dateless%20-%20Like%20Me_Groove%20Motive.mp3",
    buyUrl: "https://www.beatport.com/track/like-me/20633536",
  },
  // {
  //   title: "BRN",
  //   cover:
  //     "https://5ndhpj66kbzege6f.public.blob.vercel-storage.com/GM004_Machines.jpg",
  //   previewUrl:
  //     "https://5ndhpj66kbzege6f.public.blob.vercel-storage.com/BRN%20-%20Machines%20%28Radio%29%28FW%20MASTER%201%29.mp3",
  //   buyUrl: "https://example.com/buy3",
  // },
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
let orientationCalibration = { alpha: 0, beta: 0, gamma: 0 };
let isCalibrated = false;
let clickToLockHandler = null;
let previewInstruction = null;
let artworkInstruction = null;
let previewAnimationId = null;
let mainAnimationId = null;

// Asset loading tracking
let assetsLoaded = 0;
let totalAssets = 0;
let sceneReady = false;

// Asset caching system
let cachedAssets = {
  recordPlayer: null,
  table: null,
  pillars: [],
  plants: [],
  couch: null,
  albums: [],
  textures: new Map(),
  isFullyLoaded: false
};

// Function to create default album cover with logo
function createDefaultAlbumCover(callback) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  
  // Black background
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, 512, 512);
  
  // Load the logo image and draw it when ready
  const logoImg = new Image();
  logoImg.crossOrigin = 'anonymous';
  logoImg.onload = () => {
    console.log('Logo loaded successfully:', logoImg.width, 'x', logoImg.height);
    ctx.clearRect(0, 0, 512, 512);
    // Black background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 512, 512);
    
    // Calculate logo dimensions to center it with some padding
    const padding = 64;
    const maxWidth = 512 - (padding * 2);
    const maxHeight = 512 - (padding * 2);
    
    // Calculate aspect ratio and sizing
    const logoAspect = logoImg.width / logoImg.height;
    let logoWidth, logoHeight;
    
    if (logoAspect > 1) {
      // Logo is wider than tall
      logoWidth = Math.min(maxWidth, logoImg.width);
      logoHeight = logoWidth / logoAspect;
    } else {
      // Logo is taller than wide
      logoHeight = Math.min(maxHeight, logoImg.height);
      logoWidth = logoHeight * logoAspect;
    }
    
    // Center the logo
    const x = (512 - logoWidth) / 2;
    const y = (512 - logoHeight) / 2;
    
    console.log('Drawing logo at:', x, y, 'size:', logoWidth, logoHeight);
    ctx.drawImage(logoImg, x, y, logoWidth, logoHeight);
    
    // Create and return the texture with logo
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    
    if (callback) callback(texture);
  };
  
  logoImg.onerror = () => {
    console.error('Failed to load logo image');
    // Fallback: just black background
    const texture = new THREE.CanvasTexture(canvas);
    if (callback) callback(texture);
  };
  
  logoImg.src = "https://5ndhpj66kbzege6f.public.blob.vercel-storage.com/GM_Wordmark_WHITE_300PPI.svg";
}

// Function to create wood texture
function createWoodTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  
  // Create wood grain pattern (darker colors)
  const gradient = ctx.createLinearGradient(0, 0, 512, 0);
  gradient.addColorStop(0, '#5D2F0A');
  gradient.addColorStop(0.3, '#6B3410');
  gradient.addColorStop(0.6, '#5D2F0A');
  gradient.addColorStop(1, '#3E1F08');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 512);
  
  // Add wood grain lines
  for (let i = 0; i < 20; i++) {
    const x = Math.random() * 512;
    const opacity = 0.1 + Math.random() * 0.2;
    ctx.strokeStyle = `rgba(62, 31, 8, ${opacity})`;
    ctx.lineWidth = 1 + Math.random() * 3;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + (Math.random() - 0.5) * 100, 512);
    ctx.stroke();
  }
  
  // Add darker wood knots
  for (let i = 0; i < 8; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const radius = 10 + Math.random() * 20;
    const opacity = 0.2 + Math.random() * 0.3;
    
    const knotGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    knotGradient.addColorStop(0, `rgba(35, 18, 5, ${opacity})`);
    knotGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = knotGradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  
  const woodTexture = new THREE.CanvasTexture(canvas);
  woodTexture.wrapS = THREE.RepeatWrapping;
  woodTexture.wrapT = THREE.RepeatWrapping;
  woodTexture.repeat.set(2, 1);
  
  return woodTexture;
}
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

// Scene initialization flag
let isSceneInitialized = false;
let hasShownInstructions = localStorage.getItem('grooveMotive_hasShownInstructions') === 'true';
// Reset this for testing - you can change this back to localStorage later
let hasApproachedArtwork = false; // localStorage.getItem('grooveMotive_hasApproachedArtwork') === 'true';

// Load all assets immediately for preview
function loadAllAssets() {
  const gltfLoader = new GLTFLoader();
  
  // Modern Couch - turned around and positioned further back
  gltfLoader.load(
    "https://5ndhpj66kbzege6f.public.blob.vercel-storage.com/modern_couch.glb",
    (gltf) => {
      const couch = gltf.scene;
      couch.position.set(0, 0, 1); // Further back from table
      couch.scale.set(0.8, 0.8, 0.8); // Slightly smaller
      couch.rotation.y = Math.PI; // Turn around to face the table
      couch.visible = true;
      
      couch.traverse((child) => {
        if (child.isMesh && child.material) {
          if (child.material.map) {
            child.material.map.encoding = THREE.sRGBEncoding;
            child.material.map.needsUpdate = true;
          }
          child.material.needsUpdate = true;
        }
      });
      
      scene.add(couch);
      onAssetLoaded(); // Couch loaded
    },
    undefined,
    (error) => {
      console.error("Error loading couch model:", error);
      onAssetLoaded(); // Still count as loaded even if failed
    }
  );

  // House Plant 1 - left side wall middle
  gltfLoader.load(
    "https://5ndhpj66kbzege6f.public.blob.vercel-storage.com/house_plant.glb",
    (gltf) => {
      const plant3 = gltf.scene;
      plant3.position.set(-9, 0, 0); // Left wall middle
      plant3.scale.set(0.6, 0.6, 0.6); // Half the size of monstera
      plant3.rotation.y = Math.PI / 2; // Face towards center
      plant3.visible = true;
      
      plant3.traverse((child) => {
        if (child.isMesh && child.material) {
          if (child.material.map) {
            child.material.map.encoding = THREE.sRGBEncoding;
            child.material.map.needsUpdate = true;
          }
          child.material.needsUpdate = true;
        }
      });
      
      scene.add(plant3);
      onAssetLoaded(); // Plant 3 loaded
    },
    undefined,
    (error) => {
      console.error("Error loading house plant 1:", error);
      onAssetLoaded(); // Still count as loaded even if failed
    }
  );

  // House Plant 2 - right side wall middle
  gltfLoader.load(
    "https://5ndhpj66kbzege6f.public.blob.vercel-storage.com/house_plant.glb",
    (gltf) => {
      const plant4 = gltf.scene;
      plant4.position.set(9, 0, 0); // Right wall middle
      plant4.scale.set(0.6, 0.6, 0.6); // Half the size of monstera
      plant4.rotation.y = -Math.PI / 2; // Face towards center
      plant4.visible = true;
      
      plant4.traverse((child) => {
        if (child.isMesh && child.material) {
          if (child.material.map) {
            child.material.map.encoding = THREE.sRGBEncoding;
            child.material.map.needsUpdate = true;
          }
          child.material.needsUpdate = true;
        }
      });
      
      scene.add(plant4);
      onAssetLoaded(); // Plant 4 loaded
    },
    undefined,
    (error) => {
      console.error("Error loading house plant 2:", error);
      onAssetLoaded(); // Still count as loaded even if failed
    }
  );

  // Albums
  albums.forEach((album, index) => createAlbumMesh(album, index));
}

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
    font-family: "Gotham", -apple-system, BlinkMacSystemFont, sans-serif;
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
      
      // If user was blocked from entering gallery, allow them to try again
      const mainContent = document.querySelector(".main-content");
      if (mainContent && mainContent.style.display === "none" && !controls.isLocked) {
        mainContent.style.display = "block";
      }
      
      // Orientation controls automatically adjust to new position
    } else {
      // Switched to landscape - show warning regardless of mode
      createPortraitWarning();
      portraitWarning.style.display = 'flex';
      
      // If in gallery mode, also unlock controls to prevent getting stuck
      if (isInGalleryMode && controls && controls.isLocked) {
        setTimeout(() => {
          if (!isPortraitMode && controls.isLocked) {
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

// Setup mobile control button event listeners
function setupMobileControlListeners() {
  if (!isMobile) return;
  
  const moveUpButton = document.getElementById("move-up");
  const moveDownButton = document.getElementById("move-down");
  const moveLeftButton = document.getElementById("move-left");
  const moveRightButton = document.getElementById("move-right");

  if (moveUpButton && moveDownButton && moveLeftButton && moveRightButton) {
    
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
    const mobilePauseButton = document.getElementById("mobile-pause");
    const mobileBuyButton = document.getElementById("mobile-buy");

    if (mobilePreviewButton) {
      mobilePreviewButton.addEventListener("touchstart", () => {
        if (isPreviewing) {
          stopPreview();
        } else if (currentAlbum) {
          startPreview(currentAlbum);
        } else {
        }
      });
    }

    if (mobilePauseButton) {
      mobilePauseButton.addEventListener("touchstart", () => {
        if (isPreviewing && audio) {
          if (audio.paused) {
            audio.play().catch(error => {
              console.warn("Could not resume audio:", error);
            });
            // Update instruction text
            previewInstruction.innerHTML = 
              'Press <span style="background: rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 6px; font-weight: 700; white-space: nowrap;">G</span> to stop • <span style="background: rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 6px; font-weight: 700; white-space: nowrap;">P</span> to pause';
          } else {
            audio.pause();
            // Update instruction text
            previewInstruction.innerHTML = 
              'Press <span style="background: rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 6px; font-weight: 700; white-space: nowrap;">G</span> to stop • <span style="background: rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 6px; font-weight: 700; white-space: nowrap;">P</span> to resume';
          }
        }
      });
    }

    if (mobileBuyButton) {
      mobileBuyButton.addEventListener("touchend", (e) => {
        e.preventDefault();
        if (currentAlbum) {
          // Mobile Safari requires navigation to happen immediately in the touch event
          window.location.href = currentAlbum.buyUrl;
        } else {
        }
      });
    }
  } else {
    console.warn("Mobile control buttons not found when setting up listeners");
  }
}

// Create and show instructional popup
function showWelcomeInstructions() {
  // Enhanced mobile detection for better compatibility
  const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || 
                         ('ontouchstart' in window) || 
                         (navigator.maxTouchPoints > 0) ||
                         window.innerWidth <= 768;

  
  // For mobile devices, always show instructions regardless of localStorage
  if (!isMobileDevice && hasShownInstructions) {
    return;
  }
  
  if (!isMobileDevice) {
    hasShownInstructions = true;
    localStorage.setItem('grooveMotive_hasShownInstructions', 'true');
  }
  
  
  // Ensure controls are unlocked and cursor is enabled for the popup
  if (controls && controls.isLocked) {
    controls.unlock();
  }
  document.body.style.cursor = "auto";
  
  const instructionalPopup = document.createElement("div");
  instructionalPopup.id = "welcome-instructions";
  instructionalPopup.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.95);
    color: white;
    padding: ${isMobileDevice ? '20px' : '40px'};
    border-radius: 20px;
    font-family: "Gotham", -apple-system, BlinkMacSystemFont, sans-serif;
    text-align: center;
    z-index: 10000;
    width: ${isMobileDevice ? '85vw' : 'auto'};
    max-width: ${isMobileDevice ? '400px' : '90vw'};
    max-height: ${isMobileDevice ? '85vh' : '90vh'};
    overflow: auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(20px);
    border: 2px solid rgba(255, 255, 255, 0.1);
    box-sizing: border-box;
  `;
  
  instructionalPopup.innerHTML = `
    <div style="margin-bottom: ${isMobileDevice ? '20px' : '30px'};">
      <h2 style="font-size: ${isMobileDevice ? '20px' : '28px'}; margin-bottom: ${isMobileDevice ? '15px' : '20px'}; color: #fff; font-weight: 600;">
        Welcome to the Listening Room
      </h2>
      <p style="font-size: ${isMobileDevice ? '16px' : '18px'}; line-height: 1.6; margin-bottom: ${isMobileDevice ? '20px' : '25px'}; color: rgba(255,255,255,0.9);">
        Explore the gallery and approach the framed artwork to discover music releases.
      </p>
    </div>
    
    <div style="margin-bottom: ${isMobileDevice ? '20px' : '30px'};">
      <h3 style="font-size: ${isMobileDevice ? '18px' : '20px'}; margin-bottom: ${isMobileDevice ? '12px' : '15px'}; color: #fff;">How to Navigate:</h3>
      ${isMobileDevice ? `
        <p style="font-size: 12px; margin-bottom: 8px; color: rgba(255,255,255,0.8);">
          • Use the directional arrows at the bottom to move around
        </p>
        <p style="font-size: 12px; margin-bottom: 8px; color: rgba(255,255,255,0.8);">
          • Tilt and rotate your device to look around
        </p>
        <p style="font-size: 12px; margin-bottom: 8px; color: rgba(255,255,255,0.8);">
          • Get close to framed artwork to see album details
        </p>
        <p style="font-size: 12px; margin-bottom: 8px; color: rgba(255,255,255,0.8);">
          • Tap the <strong>G</strong> button to play music
        </p>
        <p style="font-size: 12px; margin-bottom: 8px; color: rgba(255,255,255,0.8);">
          • Tap the <strong>P</strong> to pause during preview
        </p>
        <p style="font-size: 12px; margin-bottom: 8px; color: rgba(255,255,255,0.8);">
          • Tap the <strong>B</strong> button to purchase tracks
        </p>
        <p style="font-size: 12px; margin-bottom: 8px; color: rgba(255,255,255,0.8);">
          • Tap the <strong>Menu</strong> button to exit the gallery
        </p>
      ` : `
        <p style="font-size: 16px; margin-bottom: 10px; color: rgba(255,255,255,0.8);">
          • Use <strong>Arrow Keys</strong> or <strong>WASD</strong> to move around
        </p>
        <p style="font-size: 16px; margin-bottom: 10px; color: rgba(255,255,255,0.8);">
          • Move your <strong>mouse</strong> to look around
        </p>
        <p style="font-size: 16px; margin-bottom: 10px; color: rgba(255,255,255,0.8);">
          • Press <strong>G</strong> to preview music when near artwork
        </p>
        <p style="font-size: 16px; margin-bottom: 10px; color: rgba(255,255,255,0.8);">
          • Press <strong>P</strong> to pause during preview
        </p>
        <p style="font-size: 16px; margin-bottom: 10px; color: rgba(255,255,255,0.8);">
          • Press <strong>B</strong> to buy the track
        </p>
        <p style="font-size: 16px; margin-bottom: 10px; color: rgba(255,255,255,0.8);">
          • Press <strong>Escape</strong> to exit the gallery
        </p>
      `}
    </div>
    
    <button id="close-instructions" style="
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: ${isMobileDevice ? '12px 24px' : '15px 30px'};
      border-radius: 30px;
      font-size: ${isMobileDevice ? '14px' : '16px'};
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      font-family: inherit;
      display: block;
      margin: ${isMobileDevice ? '20px auto 0' : '0 auto'};
      width: ${isMobileDevice ? 'auto' : 'auto'};
      min-width: ${isMobileDevice ? '140px' : '160px'};
      text-align: center;
    " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 10px 25px rgba(102, 126, 234, 0.4)'" 
       onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'"
       ontouchstart="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 5px 15px rgba(102, 126, 234, 0.3)'"
       ontouchend="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
      Start Exploring
    </button>
  `;
  
  document.body.appendChild(instructionalPopup);
  
  // Add click handler to close button
  const closeButton = document.getElementById("close-instructions");
  closeButton.addEventListener("click", () => {
    gsap.to(instructionalPopup, {
      opacity: 0,
      scale: 0.8,
      duration: 0.4,
      ease: "power2.in",
      onComplete: () => {
        document.body.removeChild(instructionalPopup);
      }
    });
  });
  
  // Animate in
  gsap.fromTo(instructionalPopup, 
    { opacity: 0, scale: 0.8 },
    { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.2)" }
  );
}

// Manual function to force show instructions (for debugging)
function forceShowInstructions() {
  showWelcomeInstructions();
}


// Asset loading helpers
function markSceneReady() {
  // Mark scene as ready when we have at least 50% of assets loaded (or all assets)
  if (assetsLoaded >= Math.floor(totalAssets / 2) && !sceneReady) {
    sceneReady = true;
    
    // Update global window properties
    try {
      if (globalThis.window) {
        window.sceneReady = true;
        window.sceneAssetsLoaded = assetsLoaded;
        window.sceneTotalAssets = totalAssets;
        // Dispatch custom event for scene ready
        window.dispatchEvent(new CustomEvent('sceneReady', { 
          detail: { assetsLoaded, totalAssets } 
        }));
      }
    } catch (error) {
      console.warn("Could not expose scene properties to global scope:", error);
    }
    
    // Update preview container to show it's ready
    const previewContainer = document.querySelector('.preview-container');
    if (previewContainer) {
      previewContainer.classList.add('scene-ready');
    }
  }
}

function onAssetLoaded() {
  assetsLoaded++;
  markSceneReady();
  
  // Update global progress tracking
  try {
    if (globalThis.window) {
      window.sceneAssetsLoaded = assetsLoaded;
      window.sceneTotalAssets = totalAssets;
      // Dispatch progress update event
      window.dispatchEvent(new CustomEvent('sceneProgress', { 
        detail: { assetsLoaded, totalAssets, progress: (assetsLoaded / totalAssets) * 100 } 
      }));
    }
  } catch (error) {
    console.warn("Could not update global progress:", error);
  }
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
  
  albums.forEach((album, index) => {
    const audio = new Audio();
    audio.addEventListener('canplaythrough', () => {
    });
    audio.addEventListener('error', (error) => {
      console.error(`Error loading preview audio for ${album.title}:`, error);
    });
    audio.preload = 'auto';
    audio.src = album.previewUrl;
  });
}

function initScene() {
  // Prevent multiple initializations, but allow re-initialization if core components are missing
  if (isSceneInitialized && scene && camera && renderer) {
    // If scene is already loaded and we have assets, just restart the preview animation
    if (assetsLoaded >= Math.floor(totalAssets / 2)) {
      // Reset the canvas to hero canvas
      galleryCanvas = document.getElementById("hero-gallery-canvas");
      if (galleryCanvas && renderer) {
        const heroPreview = galleryCanvas.parentElement;
        if (heroPreview) {
          const canvasWidth = heroPreview.clientWidth;
          const canvasHeight = heroPreview.clientHeight;
          camera.aspect = canvasWidth / canvasHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(canvasWidth, canvasHeight);
        }
      }
      // Reset preview state before starting animation
      isPreviewing = false;
      currentAlbum = null;
      if (previewAnimationId) {
        cancelAnimationFrame(previewAnimationId);
        previewAnimationId = null;
      }
      
      // Reset mobile setup on re-entry
      if (isMobile) {
        // Reset camera position and orientation
        camera.position.set(0, 1.6, -2);
        camera.rotation.x = 0;
        camera.rotation.y = 0;
        camera.rotation.z = 0;
        camera.lookAt(0, 1.6, -6);
        
        // Reset orientation calibration
        isCalibrated = false;
        orientationCalibration = { alpha: 0, beta: 0, gamma: 0 };
        
        // Re-setup device orientation controls
        setupDeviceOrientationControls();
      }
      
      // Start preview animation immediately
      setTimeout(() => {
        animatePreview();
      }, 100);
    }
    return;
  }
  
  if (isSceneInitialized && (!scene || !camera || !renderer)) {
    isSceneInitialized = false;
  }

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
      'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; background: rgba(0, 0, 0, 0.9); padding: 20px 30px; border-radius: 12px; font-size: 18px; font-weight: 600; text-align: center; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3); backdrop-filter: blur(10px); border: 2px solid rgba(255, 255, 255, 0.2); z-index: 1000; display: none; font-family: "Gotham", -apple-system, BlinkMacSystemFont, sans-serif; letter-spacing: 0.5px; white-space: nowrap; max-width: 90vw; overflow: hidden;';
    previewInstruction.innerHTML =
      'Press <span style="background: rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 6px; font-weight: 700; white-space: nowrap;">G</span> to stop • <span style="background: rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 6px; font-weight: 700; white-space: nowrap;">P</span> to pause';
    document.body.appendChild(previewInstruction);
  }

  // Add artwork interaction instruction
  if (!artworkInstruction) {
    artworkInstruction = document.createElement("div");
    artworkInstruction.id = "artwork-instruction";
    artworkInstruction.style.cssText =
      'position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); color: white; background: rgba(0, 0, 0, 0.8); padding: 12px 20px; border-radius: 8px; font-size: 14px; font-weight: 500; text-align: center; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.15); z-index: 1000; font-family: "Gotham", -apple-system, BlinkMacSystemFont, sans-serif; letter-spacing: 0.3px; max-width: 85vw; line-height: 1.4; display: none;';
    
    // Add mobile-specific styles
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobileDevice) {
      artworkInstruction.style.fontSize = '13px';
      artworkInstruction.style.padding = '10px 16px';
      artworkInstruction.style.bottom = '15px';
      artworkInstruction.style.maxWidth = '90vw';
    }
    artworkInstruction.innerHTML =
      'Approach artwork to preview and buy music';
    document.body.appendChild(artworkInstruction);
  }

  // DOM elements
  ui = document.getElementById("ui");
  albumTitle = document.getElementById("album-title");
  enterButton = document.getElementById("enter-button");
  galleryCanvas = document.getElementById("hero-gallery-canvas"); // Only use hero canvas now
  galleryScreen = document.getElementById("gallery-screen");
  
  // Set up for hero canvas
  if (galleryCanvas) {
  }
  moveUpButton = document.getElementById("move-up");
  moveDownButton = document.getElementById("move-down");
  moveLeftButton = document.getElementById("move-left");
  moveRightButton = document.getElementById("move-right");
  
  orientationStatus = document.getElementById("orientation-status");
  orientationIndicator = document.getElementById("orientation-indicator");
  orientationText = document.getElementById("orientation-text");
  orientationValues = document.getElementById("orientation-values");
  alphaValue = document.getElementById("alpha-value");
  betaValue = document.getElementById("beta-value");
  gammaValue = document.getElementById("gamma-value");

  if (!galleryCanvas) {
    console.error("Gallery canvas not found. Available elements:", {
      heroCanvas: !!document.getElementById("hero-gallery-canvas"),
      galleryCanvas: !!document.getElementById("gallery-canvas")
    });
    return;
  }
  
  // enterButton is not required for hero canvas mode
  if (!enterButton) {
  }

  // Scene setup
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f0f0);

  // Ensure proper canvas sizing using hero container
  const heroPreview = galleryCanvas ? galleryCanvas.parentElement : null;
  
  let canvasWidth, canvasHeight;
  
  if (heroPreview) {
    // Hero canvas sizing
    canvasWidth = heroPreview.clientWidth;
    canvasHeight = heroPreview.clientHeight;
  } else {
    // Fallback
    canvasWidth = 800;
    canvasHeight = 600;
  }

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

  try {
    renderer = new THREE.WebGLRenderer({
      canvas: galleryCanvas,
      antialias: !isMobile, // Disable antialiasing on mobile for better performance
      alpha: false,
      powerPreference: "high-performance"
    });
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    
    // Mobile-specific renderer settings
    if (isMobile) {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = false; // Disable shadows on mobile
    }

    controls = new PointerLockControls(camera, galleryCanvas);
  } catch (error) {
    console.error("Error creating renderer or controls:", error);
    
    // Fallback for mobile devices with WebGL issues
    if (isMobile) {
      console.log("WebGL failed on mobile, showing loading message");
      // Dispatch event to hide loader and show message
      try {
        if (globalThis.window) {
          window.dispatchEvent(new CustomEvent('sceneError', { 
            detail: { message: 'WebGL not supported on this device' } 
          }));
        }
      } catch (e) {
        console.warn("Could not dispatch scene error event:", e);
      }
    }
    return;
  }
  
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
    if (isMobile) {
      const mobileControls = document.getElementById("mobile-controls");
      if (mobileControls) {
        mobileControls.style.display = "flex";
        setupMobileControlListeners();
      } else {
        console.warn("Mobile controls element not found");
      }
    }
  });
  controls.addEventListener("unlock", () => {
    document.body.style.cursor = "auto";
    const container = document.getElementById("container");
    if (container) container.style.display = "flex";
    if (isMobile) {
      const mobileControls = document.getElementById("mobile-controls");
      if (mobileControls) {
        mobileControls.style.display = "none";
      }
    }
    
    // Reset preview state to prevent mobile from staying in preview mode
    if (isPreviewing) {
      stopPreview();
    }
    isPreviewing = false;
    currentAlbum = null;
  });

  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("keyup", onKeyUp);

  // Setup device orientation for mobile
  if (isMobile) {
    setupDeviceOrientationControls();
  }

  // Initialize asset loading - load all assets for preview
  // All assets: logo texture, record player, basic scene, couch, plants, album covers, pillar plants
  // Reset loading state
  assetsLoaded = 0;
  totalAssets = 15; // logo + record player + basic scene + couch + 4 plants + 5 albums + 4 pillar plants
  
  
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
  carpet.position.set(0, 0, -2.5); // Move towards the table with record player
  carpet.userData.isWall = false;
  scene.add(carpet);
  
  // Mark basic scene as ready - but DON'T mark sceneReady yet
  onAssetLoaded(); // Basic scene loaded
  // sceneReady will be set to true only after record player loads successfully

  // PRIORITY 1: If assets are already loaded, don't reload them
  if (assetsLoaded >= Math.floor(totalAssets / 2)) {
    // Assets already loaded - mark scene as ready immediately
    sceneReady = true;
    
    // Dispatch event to notify the loader
    try {
      if (globalThis.window) {
        window.sceneReady = true;
        window.dispatchEvent(new CustomEvent('sceneReady', { 
          detail: { message: 'Scene already loaded', assetsLoaded, totalAssets } 
        }));
      }
    } catch (error) {
      console.warn("Could not dispatch scene ready event:", error);
    }
    
    return; // Exit early, no need to load assets again
  }

  // PRIORITY 1: Load record player and table first (most important scene elements)
  const gltfLoader = new GLTFLoader();
  gltfLoader.load(
    "https://5ndhpj66kbzege6f.public.blob.vercel-storage.com/vinyl_record_player.glb",
    (gltf) => {
      animatedRecordPlayer = gltf.scene;
      animatedRecordPlayer.position.set(0, 0.9, -6); // Raised to sit on table
      animatedRecordPlayer.scale.set(0.05, 0.05, 0.05);
      animatedRecordPlayer.visible = true;
      scene.add(animatedRecordPlayer);

      // Create table under record player
      const tableGeometry = new THREE.BoxGeometry(6, 0.2, 4);
      const woodTexture = createWoodTexture();
      const tableMaterial = new THREE.MeshStandardMaterial({ 
        map: woodTexture,
        roughness: 0.8,
        metalness: 0.05
      });
      const table = new THREE.Mesh(tableGeometry, tableMaterial);
      table.position.set(0, 0.8, -6); // Raised up to be more visible
      table.userData.isWall = false;
      scene.add(table);
      
      // Add table legs
      const legGeometry = new THREE.BoxGeometry(0.15, 1.6, 0.15);
      const legWoodTexture = createWoodTexture();
      const legMaterial = new THREE.MeshStandardMaterial({ 
        map: legWoodTexture,
        roughness: 0.9,
        metalness: 0.02
      });
      const legPositions = [
        [2.5, 0, -1.5],
        [-2.5, 0, -1.5],
        [2.5, 0, 1.5],
        [-2.5, 0, 1.5]
      ];
      legPositions.forEach(pos => {
        const leg = new THREE.Mesh(legGeometry, legMaterial);
        leg.position.set(pos[0], pos[1], pos[2] - 6);
        leg.userData.isWall = false;
        scene.add(leg);
      });

      // Setup animations
      if (gltf.animations && gltf.animations.length > 0) {
        mixer = new THREE.AnimationMixer(animatedRecordPlayer);
        putVinylAction = mixer.clipAction(gltf.animations[0]);
        putVinylAction.setLoop(THREE.LoopOnce);
        putVinylAction.clampWhenFinished = true;
        
        if (gltf.animations[1]) {
          spinAction = mixer.clipAction(gltf.animations[1]);
          spinAction.setLoop(THREE.LoopRepeat);
        }
      }
      
      // Set default album with logo
      const defaultAlbum = {
        title: "Coming Soon",
        cover: "DEFAULT_LOGO",
        previewUrl: "",
        buyUrl: "",
      };
      applyCoverTexture(defaultAlbum);
      
      onAssetLoaded(); // Record player GLB loaded
      
      // Let markSceneReady handle the sceneReady event when enough assets are loaded
      // markSceneReady will be called by onAssetLoaded()
      
      // PRIORITY 2: Load secondary assets after record player is loaded
      loadSecondaryAssets();
    },
    undefined,
    (error) => {
      console.error("Error loading record player:", error);
      onAssetLoaded(); // Still count as loaded even if failed
      
      // Create fallback table even if record player fails
      const tableGeometry = new THREE.BoxGeometry(6, 0.2, 4);
      const tableMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8B4513,
        roughness: 0.7,
        metalness: 0.1
      });
      const fallbackTable = new THREE.Mesh(tableGeometry, tableMaterial);
      fallbackTable.position.set(0, 0.8, -6);
      fallbackTable.userData.isWall = false;
      scene.add(fallbackTable);
      
      // Add basic table legs
      const legGeometry = new THREE.BoxGeometry(0.15, 1.6, 0.15);
      const legMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x654321,
        roughness: 0.8,
        metalness: 0.1
      });
      const legPositions = [
        [2.5, 0, -1.5],
        [-2.5, 0, -1.5],
        [2.5, 0, 1.5],
        [-2.5, 0, 1.5]
      ];
      legPositions.forEach(pos => {
        const leg = new THREE.Mesh(legGeometry, legMaterial);
        leg.position.set(pos[0], pos[1], pos[2] - 6);
        leg.userData.isWall = false;
        scene.add(leg);
      });
      
      // Let markSceneReady handle the sceneReady event when enough assets are loaded
      // markSceneReady will be called by onAssetLoaded() from other asset loading
      
      // Load secondary assets even if record player fails
      loadSecondaryAssets();
    }
  );

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

  // Function to load secondary assets (pillars, plants, etc.) after record player
  function loadSecondaryAssets() {
    const gltfLoader = new GLTFLoader();
    
    // Marble pillars in corners (snug against walls)
    const pillarPositions = [
    [-9, 0, -9], // Back left corner
    [9, 0, -9],  // Back right corner
    [-9, 0, 9],  // Front left corner
    [9, 0, 9]    // Front right corner
  ];

  // Load marble pillars with extensive debugging
  pillarPositions.forEach((position, index) => {
    gltfLoader.load(
      "https://5ndhpj66kbzege6f.public.blob.vercel-storage.com/marble_pillar.glb",
      (gltf) => {
        const pillar = gltf.scene;
        
        // Scale down the massive model to larger, more prominent size
        pillar.scale.set(0.04, 0.04, 0.04); // Much bigger scale for impressive pillars
        
        // Compute bounding box after scaling
        const box = new THREE.Box3().setFromObject(pillar);
        const size = box.getSize(new THREE.Vector3());
        
        
        // Position the pillar so its bottom sits on the floor
        pillar.position.set(
          position[0], 
          position[1] - box.min.y, // Offset by the minimum Y to put bottom at floor level
          position[2]
        );
        
        pillar.rotation.y = 0; // Reset rotation
        pillar.visible = true;
        
        let meshCount = 0;
        pillar.traverse((child) => {
          if (child.isMesh) {
            meshCount++;
            
            // Apply proper material encoding and keep original material
            if (child.material) {
              if (child.material.map) {
                child.material.map.encoding = THREE.sRGBEncoding;
                child.material.map.needsUpdate = true;
              }
              // Enhance the original material properties
              child.material.needsUpdate = true;
            }
            child.visible = true;
            child.frustumCulled = false;
          }
          child.visible = true;
        });
        
        // If no meshes found, create a placeholder
        if (meshCount === 0) {
          const placeholderGeometry = new THREE.CylinderGeometry(0.5, 0.5, 4, 8);
          const placeholderMaterial = new THREE.MeshBasicMaterial({ color: 0x888888 });
          const placeholder = new THREE.Mesh(placeholderGeometry, placeholderMaterial);
          placeholder.position.set(0, 2, 0);
          pillar.add(placeholder);
        }
        
        scene.add(pillar);
        
        // Add monstera plant on top of each pillar
        gltfLoader.load(
          "https://5ndhpj66kbzege6f.public.blob.vercel-storage.com/monstera_deliciosa_potted_mid-century_plant.glb",
          (plantGltf) => {
            const plant = plantGltf.scene;
            plant.scale.set(32.0, 32.0, 32.0); // Much larger scale for pillar top
            plant.position.set(0, 12, 0); // Position on top of pillar
            plant.visible = true;
            
            plant.traverse((child) => {
              if (child.isMesh && child.material) {
                if (child.material.map) {
                  child.material.map.encoding = THREE.sRGBEncoding;
                  child.material.map.needsUpdate = true;
                }
                child.material.needsUpdate = true;
              }
            });
            
            pillar.add(plant); // Add plant as child of pillar
            onAssetLoaded(); // Pillar plant loaded
          },
          undefined,
          (error) => {
            console.error(`Error loading monstera plant for pillar ${index + 1}:`, error);
            onAssetLoaded(); // Still count as loaded even if failed
          }
        );
      },
      undefined,
      (error) => {
        console.error(`Error loading pillar ${index + 1}:`, error);
        // Create fallback pillar
        const fallbackGeometry = new THREE.CylinderGeometry(0.8, 0.8, 5, 12);
        const fallbackMaterial = new THREE.MeshStandardMaterial({ 
          color: 0xcccccc,
          roughness: 0.3,
          metalness: 0.1
        });
        const fallbackPillar = new THREE.Mesh(fallbackGeometry, fallbackMaterial);
        fallbackPillar.position.set(position[0], 2.5, position[2]);
        scene.add(fallbackPillar);
      }
    );
  });
  
  // PRIORITY 3: Load remaining assets after pillars
  loadAllAssets();
  }

  // End of loadSecondaryAssets function

  audio = new Audio();
  audio.volume = 0.3;
}

// Legacy function - no longer used but kept for compatibility
function loadLegacyRecordPlayer() {
  const gltfLoader = new GLTFLoader();
  gltfLoader.load(
    "https://5ndhpj66kbzege6f.public.blob.vercel-storage.com/vinyl_record_player.glb",
    (gltf) => {
      animatedRecordPlayer = gltf.scene;
      animatedRecordPlayer.position.set(0, 0.9, -6); // Raised to sit on table
      animatedRecordPlayer.scale.set(0.05, 0.05, 0.05);
      animatedRecordPlayer.visible = true;
      scene.add(animatedRecordPlayer);

      // Create table under record player
      const tableGeometry = new THREE.BoxGeometry(6, 0.2, 4);
      const woodTexture = createWoodTexture();
      const tableMaterial = new THREE.MeshStandardMaterial({ 
        map: woodTexture,
        roughness: 0.8,
        metalness: 0.05
      });
      const table = new THREE.Mesh(tableGeometry, tableMaterial);
      table.position.set(0, 0.8, -6); // Raised up to be more visible
      table.userData.isWall = false;
      scene.add(table);
      
      // Add table legs
      const legGeometry = new THREE.BoxGeometry(0.15, 1.6, 0.15);
      const legMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x654321, // Darker brown
        roughness: 0.8,
        metalness: 0.05
      });
      
      // Create 4 legs
      const legPositions = [
        [-2.8, 0, -4.2], // Front left
        [2.8, 0, -4.2],  // Front right
        [-2.8, 0, -7.8], // Back left
        [2.8, 0, -7.8]   // Back right
      ];
      
      legPositions.forEach(pos => {
        const leg = new THREE.Mesh(legGeometry, legMaterial);
        leg.position.set(pos[0], pos[1], pos[2]);
        leg.userData.isWall = false;
        scene.add(leg);
      });

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

  // Load all assets immediately for preview
  loadAllAssets();

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
  
  // Mark scene as initialized
  isSceneInitialized = true;
  

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
  
  // Check if we need to request permission (iOS 13+)
  if (typeof DeviceOrientationEvent !== 'undefined' && 
      typeof DeviceOrientationEvent.requestPermission === 'function') {
    
    try {
      
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
            const result = await DeviceOrientationEvent.requestPermission();
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
        setupDeviceOrientationControls();
      }
      
    } catch (error) {
      console.error('Error requesting device orientation permission:', error);
    }
  } else {
    // Android or older iOS - no permission required
    setupDeviceOrientationControls();
  }

  // Request motion permission if available
  if (typeof DeviceMotionEvent !== 'undefined' && 
      typeof DeviceMotionEvent.requestPermission === 'function') {
    try {
      const motionPermission = await DeviceMotionEvent.requestPermission();
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
    return;
  }


  // Add device orientation event listener
  const handleDeviceOrientation = (event) => {
    if (event.alpha !== null && event.beta !== null && event.gamma !== null) {
      deviceOrientation = {
        alpha: event.alpha,
        beta: event.beta,
        gamma: event.gamma
      };
      
      // Auto-calibrate on first reading (assumes phone is upright when entering gallery)
      if (!isCalibrated) {
        orientationCalibration = { ...deviceOrientation };
        isCalibrated = true;
      }
    }
  };

  // Add event listener
  window.addEventListener('deviceorientation', handleDeviceOrientation, false);
  deviceOrientationControls = { enabled: true };
  
  updateOrientationStatus('granted', 'Orientation: Ready');
  
  setTimeout(() => {
    if (deviceOrientationControls.enabled) {
      updateOrientationStatus('granted', 'Orientation: Active');
    }
  }, 2000);
}

// Clean up orientation controls
function cleanupDeviceOrientation() {
  window.removeEventListener('deviceorientation', () => {});
  deviceOrientationControls = null;
  deviceOrientation = { alpha: 0, beta: 0, gamma: 0 };
  orientationCalibration = { alpha: 0, beta: 0, gamma: 0 };
  isCalibrated = false;
}

function resetToInitialState() {
  // Stop any music preview
  if (isPreviewing) {
    stopPreview();
  }

  // Cancel preview animation
  if (previewAnimationId) {
    cancelAnimationFrame(previewAnimationId);
    previewAnimationId = null;
  }

  // Reset UI elements
  if (ui) ui.style.display = "none";
  currentAlbum = null;
  if (albumTitle) albumTitle.textContent = "";
  
  // Hide artwork instruction
  if (artworkInstruction) {
    artworkInstruction.style.display = "none";
  }

  // Move instructions back to original position
  const instructionsGroup = document.getElementById("instructions-group");
  if (instructionsGroup) {
    instructionsGroup.classList.remove("show");
    instructionsGroup.style.position = "";
    instructionsGroup.style.zIndex = "";
  }

  // Reset cursor
  document.body.style.cursor = "auto";

  // Remove body class to hide mobile menu
  document.body.classList.remove("gallery-entered");

  // Hide portrait warning when exiting gallery
  if (isMobile) {
    hidePortraitWarning();
  }

  // Show main content (homepage)
  const mainContent = document.querySelector(".main-content");
  if (mainContent) {
    mainContent.style.display = "block";
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

  // Reset camera to initial position
  if (camera) {
    camera.position.set(0, 1.6, -2);
    camera.rotation.set(0, 0, 0);
    camera.lookAt(0, 1.6, -6);
  }

  // Reset device orientation
  if (isMobile) {
    cleanupDeviceOrientation();
  }

  // Remove fullscreen canvas if it exists
  if (renderer && renderer.domElement && document.body.contains(renderer.domElement)) {
    document.body.removeChild(renderer.domElement);
  }
  
  // Properly dispose of Three.js components
  if (renderer) {
    renderer.dispose();
    renderer = null;
  }
  
  if (controls) {
    controls.dispose();
    controls = null;
  }
  
  // Clear scene objects
  if (scene) {
    scene.clear();
    scene = null;
  }
  
  camera = null;
  
  // Reset scene initialization flag to allow re-initialization
  isSceneInitialized = false;
  
  // Don't reset instructions flag - let it persist across sessions

  // Trigger app state reset to return to homepage
  try {
    if (globalThis.window && window.returnToHomepage) {
      window.returnToHomepage();
    }
  } catch (error) {
    console.warn("Could not trigger app state reset:", error);
    // Graceful fallback: just ensure main content is visible
    const mainContent = document.querySelector(".main-content");
    if (mainContent) {
      mainContent.style.display = "block";
    }
  }
}

function enterGallery() {

  // Allow immediate entry - assets will load in background

  // Check if scene is properly initialized
  if (!scene || !camera || !renderer) {
    console.warn("Scene not properly initialized, attempting re-initialization...");
    try {
      // Reset the initialization flag and try to reinitialize
      isSceneInitialized = false;
      initScene();
      
      // If still not ready, show loading message
      if (!scene || !camera || !renderer) {
        const mainContent = document.querySelector(".main-content");
        if (mainContent) {
          const loadingMessage = document.createElement("div");
          loadingMessage.innerHTML = "Initializing 3D scene, please wait...";
          loadingMessage.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            background: rgba(0,0,0,0.8);
            padding: 20px;
            border-radius: 8px;
            font-family: 'Gotham', sans-serif;
            z-index: 9999;
          `;
          document.body.appendChild(loadingMessage);
          
          // Remove loading message and return to homepage
          setTimeout(() => {
            if (document.body.contains(loadingMessage)) {
              document.body.removeChild(loadingMessage);
            }
            // Return to homepage instead of entering gallery
            if (globalThis.window && window.returnToHomepage) {
              window.returnToHomepage();
            }
          }, 2000);
        }
        return;
      }
    } catch (error) {
      console.error("Error reinitializing scene:", error);
      // Return to homepage on error
      if (globalThis.window && window.returnToHomepage) {
        window.returnToHomepage();
      }
      return;
    }
  }

  // Hide all page content
  const mainContent = document.querySelector(".main-content");
  if (mainContent) mainContent.style.display = "none";

  // Add body class for mobile menu
  document.body.classList.add("gallery-entered");

  // Stop preview animation and enable cursor immediately
  if (previewAnimationId) {
    cancelAnimationFrame(previewAnimationId);
    previewAnimationId = null;
  }
  
  // Enable cursor immediately when entering the world
  document.body.style.cursor = "auto";

  // Check orientation immediately when entering gallery
  if (isMobile) {
    checkOrientation();
    
    // Don't proceed if in landscape mode
    if (!isPortraitMode) {
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
    
    // Reset orientation calibration for fresh setup
    isCalibrated = false;
    orientationCalibration = { alpha: 0, beta: 0, gamma: 0 };
    
    // Re-setup device orientation controls if they were cleaned up
    if (!deviceOrientationControls || !deviceOrientationControls.enabled) {
      setupDeviceOrientationControls();
    }
    
    requestDeviceOrientationPermission();
    
    // Set initial camera position for portrait mode
    setTimeout(() => {
      if (deviceOrientationControls && deviceOrientationControls.enabled) {
        
        // Ensure camera is positioned correctly for portrait mode
        camera.position.set(0, 1.6, -2); // Standard viewing position
        camera.rotation.order = 'YXZ';
        
      }
    }, 1000);
  }
  
  // Audio will be loaded when needed for previews

  // Move instructions to body for fullscreen
  const instructionsGroup = document.getElementById("instructions-group");
  if (instructionsGroup) {
    document.body.appendChild(instructionsGroup);
    instructionsGroup.classList.add("show");
    instructionsGroup.style.position = "fixed";
    instructionsGroup.style.zIndex = "950";
  }

  // Dispose existing controls first
  if (controls) {
    controls.dispose();
    controls = null;
  }

  // Get the gallery canvas and replace it with the renderer's canvas
  const galleryCanvas = document.getElementById('gallery-canvas');
  if (renderer && renderer.domElement && galleryCanvas) {
    // Replace the placeholder canvas with the actual renderer canvas
    galleryCanvas.parentNode.replaceChild(renderer.domElement, galleryCanvas);
    renderer.domElement.id = 'gallery-canvas'; // Give it the same ID for styling
    
    try {
      if (globalThis.window) {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
      }
    } catch (error) {
      console.warn("Could not resize renderer for fullscreen:", error);
    }
    
    // Create new controls with the updated canvas element
    controls = new PointerLockControls(camera, renderer.domElement);
    
  } else if (renderer && renderer.domElement) {
    // Fallback: append to body if gallery canvas not found
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
    
    // Create new controls with the canvas element
    controls = new PointerLockControls(camera, renderer.domElement);
  }
  
  // Re-expose controls to global scope
  try {
    if (globalThis.window) {
      window.controls = controls;
    }
  } catch (error) {
    console.warn("Could not re-expose controls to global scope:", error);
  }

  // Add lock and unlock event listeners
  if (controls) {
    controls.addEventListener("lock", () => {
      document.body.style.cursor = "none";
      if (isMobile) {
        const mobileControls = document.getElementById("mobile-controls");
        if (mobileControls) {
          mobileControls.style.display = "flex";
          setupMobileControlListeners();
        }
        
        // Also ensure hamburger menu is visible for exit option
        const hamburgerMenu = document.querySelector(".hamburger-menu");
        if (hamburgerMenu) {
          hamburgerMenu.classList.add("show");
        }
      }
    });
    
    controls.addEventListener("unlock", () => {
      document.body.style.cursor = "auto";
      const container = document.getElementById("container");
      if (container) container.style.display = "flex";
      if (isMobile) {
        const mobileControls = document.getElementById("mobile-controls");
        if (mobileControls) {
          mobileControls.style.display = "none";
        }
      }
      
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
  }


  // Clean up any existing click-to-lock handler
  if (clickToLockHandler) {
    document.removeEventListener("click", clickToLockHandler);
  }

  // Enable click-to-lock
  clickToLockHandler = (event) => {
    if (controls && event.target.id !== "enter-button" && !controls.isLocked) {
      try {
        controls.lock();
      } catch (error) {
        console.warn("Pointer lock failed:", error);
      }
    }
  };
  
  // Add click listener with slight delay to ensure DOM is ready
  setTimeout(() => {
    document.addEventListener("click", clickToLockHandler);
  }, 200);

  // Set camera position for gallery view
  if (camera) {
    camera.position.set(0, 1.6, -2);
    camera.lookAt(0, 1.6, -6);
  }

  // Force render
  
  if (renderer && scene && camera) {
    renderer.render(scene, camera);
  } else {
    console.error("Cannot render - missing components:", {
      renderer: !!renderer,
      scene: !!scene,
      camera: !!camera
    });
  }

  // Show welcome instructions first, then handle controls
  setTimeout(() => {
    showWelcomeInstructions();
    
    // Auto-lock controls after instructions are dismissed
    // Wait for instructions to be dismissed before auto-locking
    const checkInstructions = () => {
      const instructionsEl = document.getElementById("welcome-instructions");
      if (!instructionsEl) {
        // Instructions have been dismissed, now auto-lock
        setTimeout(() => {
          try {
            if (controls) {
              controls.lock();
            }
          } catch (error) {
            console.warn("Auto-lock failed, user will need to click:", error);
          }
        }, 500);
      } else {
        // Check again in 100ms
        setTimeout(checkInstructions, 100);
      }
    };
    checkInstructions();
  }, 1000);
  
  // Ensure mobile controls are visible and initialized
  if (isMobile) {
    setTimeout(() => {
      const mobileControls = document.getElementById("mobile-controls");
      if (mobileControls) {
        mobileControls.style.display = "flex";
        setupMobileControlListeners();
      }
    }, 100);
  }

  // Show artwork instruction after a delay (only if user hasn't approached artwork before)
  setTimeout(() => {
    if (artworkInstruction && !hasApproachedArtwork) {
      artworkInstruction.style.display = "block";
    }
  }, 3000); // Show after 3 seconds to let user get oriented
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
  const position = [-8 + index * 4, 1.8, -9.8];
  
  // Load the album texture
  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load(
    album.cover,
    undefined,
    undefined,
    (error) => {
      console.error("Error loading album cover:", error);
    }
  );
  
  // Load the GLB frame from local assets
  const frameLoader = new GLTFLoader();
  frameLoader.load(
    "https://5ndhpj66kbzege6f.public.blob.vercel-storage.com/frame01_lowpoly.glb",
    (gltf) => {
      const frameModel = gltf.scene;
      frameModel.position.set(position[0], position[1] - 2.0, position[2] + 0.05);
      frameModel.scale.set(14, 14, 2);
      frameModel.userData = { album };
      
      let albumArtApplied = false;
      
      // Log all meshes found in the frame and make them lighter
      frameModel.traverse((child) => {
        if (child.isMesh) {
          
          // Make frame material lighter
          if (child.material) {
            // Clone the material to avoid affecting other instances
            child.material = child.material.clone();
            child.material.color.setHex(0xd4af37); // Set to gold color
            child.material.emissive.setHex(0x333333); // Add more emission for brightness
            child.material.roughness = 0.3;
            child.material.metalness = 0.8;
          }
        }
      });
      
      // Apply album artwork to the center/canvas area
      frameModel.traverse((child) => {
        if (child.isMesh) {
          const meshName = child.name.toLowerCase();
          const materialName = child.material?.name?.toLowerCase() || '';
          
          // Look for the canvas/picture area with various possible names
          if (meshName.includes('picture') || 
              meshName.includes('canvas') || 
              meshName.includes('art') ||
              meshName.includes('painting') ||
              meshName.includes('image') ||
              meshName.includes('center') ||
              meshName.includes('inner') ||
              materialName.includes('picture') ||
              materialName.includes('canvas')) {
            
            // Apply album artwork to this mesh
            child.material = new THREE.MeshStandardMaterial({
              map: texture,
              roughness: 0.1,
              metalness: 0.0
            });
            albumArtApplied = true;
          }
          // Keep original materials for frame decorative parts
        }
      });
      
      // If no specific canvas area found, add a plane in the center
      if (!albumArtApplied) {
        const albumMaterial = new THREE.MeshStandardMaterial({ 
          map: texture,
          roughness: 0.1,
          metalness: 0.0
        });
        const albumPlane = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.12), albumMaterial);
        albumPlane.position.set(0.077, 0.225, -0.01);
        frameModel.add(albumPlane);
      }
      
      scene.add(frameModel);
      onAssetLoaded(); // Album frame loaded
    },
    (progress) => {
    },
    (error) => {
      console.error(`Error loading local GLB frame for ${album.title}:`, error);
      // Fallback to custom frame
      createFramedAlbum(position, texture, album);
      onAssetLoaded(); // Album frame loaded (fallback)
    }
  );
}

function createFramedAlbum(position, texture, album) {
  // Create a group to hold frame and artwork
  const frameGroup = new THREE.Group();
  frameGroup.position.set(position[0], position[1], position[2]);
  
  // Create 3D frame using basic geometry
  const frameDepth = 0;
  const frameWidth = 2.6;
  const frameHeight = 2.6;
  const frameThickness = 0.2;
  
  // Default material for frame parts (no color override)
  const frameMaterial = new THREE.MeshStandardMaterial({
    roughness: 0.3,
    metalness: 0.8
  });
  
  // Create frame parts (top, bottom, left, right)
  const topFrame = new THREE.Mesh(
    new THREE.BoxGeometry(frameWidth, frameThickness, frameDepth),
    frameMaterial
  );
  topFrame.position.set(0, frameHeight/2 - frameThickness/2, 0);
  frameGroup.add(topFrame);
  
  const bottomFrame = new THREE.Mesh(
    new THREE.BoxGeometry(frameWidth, frameThickness, frameDepth),
    frameMaterial.clone()
  );
  bottomFrame.position.set(0, -frameHeight/2 + frameThickness/2, 0);
  frameGroup.add(bottomFrame);
  
  const leftFrame = new THREE.Mesh(
    new THREE.BoxGeometry(frameThickness, frameHeight - 2*frameThickness, frameDepth),
    frameMaterial.clone()
  );
  leftFrame.position.set(-frameWidth/2 + frameThickness/2, 0, 0);
  frameGroup.add(leftFrame);
  
  const rightFrame = new THREE.Mesh(
    new THREE.BoxGeometry(frameThickness, frameHeight - 2*frameThickness, frameDepth),
    frameMaterial.clone()
  );
  rightFrame.position.set(frameWidth/2 - frameThickness/2, 0, 0);
  frameGroup.add(rightFrame);
  
  // Create album artwork in the center
  const albumMaterial = new THREE.MeshStandardMaterial({ 
    map: texture,
    roughness: 0.1,
    metalness: 0.0
  });
  const artworkSize = frameWidth - 2*frameThickness - 0.05; // Smaller gap
  const albumMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(artworkSize, artworkSize), 
    albumMaterial
  );
  albumMesh.position.set(0, 0, -frameDepth/2 + 0.01); // Inside the frame, at the back
  frameGroup.add(albumMesh);
  
  frameGroup.userData = { album };
  scene.add(frameGroup);
  
  onAssetLoaded(); // Custom frame loaded
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
  if (album.cover === "DEFAULT_LOGO") {
    // Use the generated default album cover with callback
    createDefaultAlbumCover((texture) => {
      applyTextureToVinyl(texture);
      if (onComplete) onComplete();
    });
  } else {
    // Load texture from URL
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      album.cover,
      (texture) => {
        texture.encoding = THREE.sRGBEncoding;
        applyTextureToVinyl(texture);
        if (onComplete) onComplete();
      },
      undefined,
      (error) => console.error("Error loading texture:", error)
    );
  }
}

function applyTextureToVinyl(texture) {
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
        // Handle both canvas textures and image textures
        let aspectTexture;
        if (texture.image) {
          // Image texture (loaded from URL)
          aspectTexture = texture.image.width / texture.image.height;
        } else if (texture.source && texture.source.data) {
          // Canvas texture
          aspectTexture = texture.source.data.width / texture.source.data.height;
        } else {
          // Fallback to square aspect ratio
          aspectTexture = 1;
        }
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
        
        
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
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
    case "KeyS":
      moveForward = true;
      break;
    case "ArrowUp":
    case "KeyW":
      moveBackward = true;
      break;
    case "ArrowRight":
    case "KeyD":
      moveLeft = true;
      break;
    case "ArrowLeft":
    case "KeyA":
      moveRight = true;
      break;
    case "Escape":
      if (controls && controls.isLocked) {
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
    case "KeyP":
      if (isPreviewing && audio) {
        if (audio.paused) {
          audio.play().catch(error => {
            console.warn("Could not resume audio:", error);
          });
          // Update instruction text
          previewInstruction.innerHTML = 
            'Press <span style="background: rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 6px; font-weight: 700; white-space: nowrap;">G</span> to stop • <span style="background: rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 6px; font-weight: 700; white-space: nowrap;">P</span> to pause';
        } else {
          audio.pause();
          // Update instruction text
          previewInstruction.innerHTML = 
            'Press <span style="background: rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 6px; font-weight: 700; white-space: nowrap;">G</span> to stop • <span style="background: rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 6px; font-weight: 700; white-space: nowrap;">P</span> to resume';
        }
      }
      break;
    case "KeyB":
      if (currentAlbum) {
        try {
          if (globalThis.window) {
            // Create a temporary anchor element for better Safari compatibility
            const link = document.createElement('a');
            link.href = currentAlbum.buyUrl;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            
            // Temporarily add to DOM and click
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
        } catch (error) {
          console.warn("Could not open buy URL:", error);
          // Fallback: try direct window.open
          try {
            window.open(currentAlbum.buyUrl, "_blank");
          } catch (fallbackError) {
            console.warn("Fallback window.open also failed:", fallbackError);
          }
        }
      }
      break;
  }
}

function onKeyUp(event) {
  switch (event.code) {
    case "ArrowDown":
    case "KeyS":
      moveForward = false;
      break;
    case "ArrowUp":
    case "KeyW":
      moveBackward = false;
      break;
    case "ArrowRight":
    case "KeyD":
      moveLeft = false;
      break;
    case "ArrowLeft":
    case "KeyA":
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
      // Preview mode - using hero canvas
      const heroPreview = galleryCanvas ? galleryCanvas.parentElement : null;
      
      if (heroPreview) {
        // Hero canvas sizing
        const canvasWidth = heroPreview.clientWidth;
        const canvasHeight = heroPreview.clientHeight;
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

function animatePreview() {
  if ((!controls || !controls.isLocked) && renderer && scene && camera) {
    const time = clock.getElapsedTime();
    
    // Different camera movement for hero vs right panel preview
    const isHeroCanvas = galleryCanvas && galleryCanvas.id === "hero-gallery-canvas";
    
    if (isHeroCanvas) {
      // Slower, more elegant movement for hero preview
      camera.position.x = Math.sin(time * 0.15) * 4;
      camera.position.z = -4 + Math.cos(time * 0.15) * 2;
      camera.position.y = 1.6 + Math.sin(time * 0.1) * 0.2;
    } else {
      // Original movement for right panel
      camera.position.x = Math.sin(time * 0.2) * 5;
      camera.position.z = -5 + Math.cos(time * 0.2) * 3;
      camera.position.y = 1.6;
    }
    
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
    window.sceneReady = sceneReady; // Expose scene ready state
    window.sceneAssetsLoaded = assetsLoaded; // Expose loading progress
    window.sceneTotalAssets = totalAssets;
  }
} catch (error) {
  console.warn("Could not expose functions to global scope:", error);
}

function animate() {
  mainAnimationId = requestAnimationFrame(animate);
  
  // Safety check - stop animation if camera doesn't exist
  if (!camera || !controls || !renderer || !scene) {
    return;
  }
  
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

  // Apply calibrated device orientation for mobile camera control
  if (isMobile && deviceOrientationControls && deviceOrientationControls.enabled && deviceOrientation && isCalibrated) {
    // Use calibrated orientation values (relative to upright position)
    const alpha = deviceOrientation.alpha || 0;
    const beta = deviceOrientation.beta || 0;
    const gamma = deviceOrientation.gamma || 0;
    
    // Calculate relative rotation from calibrated upright position
    const deltaBeta = beta - orientationCalibration.beta;
    let deltaAlpha = alpha - orientationCalibration.alpha;
    
    // Handle alpha wraparound
    if (deltaAlpha > 180) deltaAlpha -= 360;
    if (deltaAlpha < -180) deltaAlpha += 360;
    
    camera.rotation.order = 'YXZ';
    
    // Map relative beta to camera pitch:
    // deltaBeta 0° = phone in calibrated position → camera looks straight ahead  
    // deltaBeta positive = phone tilted forward → camera looks down
    // deltaBeta negative = phone tilted back → camera looks up
    const pitchSensitivity = 0.8;
    camera.rotation.x = THREE.MathUtils.degToRad(deltaBeta) * pitchSensitivity;
    
    // Map relative alpha to camera yaw (left/right turning)
    const yawSensitivity = 0.8;
    camera.rotation.y = THREE.MathUtils.degToRad(deltaAlpha) * yawSensitivity;
    
    // Gamma (roll) - minimal effect for stability
    const deltaGamma = gamma - orientationCalibration.gamma;
    camera.rotation.z = THREE.MathUtils.degToRad(deltaGamma) * 0.05;
    
    // Clamp rotations for comfortable viewing
    camera.rotation.x = THREE.MathUtils.clamp(camera.rotation.x, -Math.PI/2, Math.PI/2);
    camera.rotation.z = THREE.MathUtils.clamp(camera.rotation.z, -Math.PI/12, Math.PI/12);
  }

  camera.position.x = THREE.MathUtils.clamp(camera.position.x, -9, 9);
  camera.position.z = THREE.MathUtils.clamp(camera.position.z, -8.5, 9);
  camera.position.y = 1.6;

  // Album popups - using working reference logic
  // For mobile: check if we're in gallery mode by looking for mobile controls being visible
  const mobileControls = document.getElementById("mobile-controls");
  const isInGalleryMode =
    controls.isLocked ||
    (isMobile && mobileControls && mobileControls.style.display !== "none");


  if (isInGalleryMode) {
    let closestAlbum = null;
    let closestDistance = Infinity;

    let albumCount = 0;
    scene.children.forEach((child) => {
      if (child.userData.album) {
        albumCount++;
        const distance = camera.position.distanceTo(child.position);
        if (distance < 3 && distance < closestDistance) {
          closestDistance = distance;
          closestAlbum = child.userData.album;
        }
      }
    });

    if (closestAlbum && closestAlbum !== currentAlbum) {
      currentAlbum = closestAlbum;
      
      // Hide artwork instruction permanently after first approach (only on mobile)
      if (artworkInstruction && !hasApproachedArtwork) {
        const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        if (isMobileDevice) {
          artworkInstruction.style.display = "none";
          hasApproachedArtwork = true;
          localStorage.setItem('grooveMotive_hasApproachedArtwork', 'true');
        }
      }
      
      if (!ui) ui = document.getElementById("ui");
      if (!albumTitle) albumTitle = document.getElementById("album-title");
      
      if (ui && albumTitle) {
        albumTitle.textContent = currentAlbum.title;
        if (ui.style.display !== "block") {
          ui.style.display = "block";
          
          // Hide artwork instruction when album UI shows
          if (artworkInstruction) {
            artworkInstruction.style.display = "none";
          }
          
          if (typeof gsap !== 'undefined') {
            gsap.fromTo(
              "#ui",
              { opacity: 0, scale: 0.8 },
              { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.4)" }
            );
          } else {
            ui.style.opacity = "1";
            ui.style.transform = "translateX(-50%) scale(1)";
          }
        }
        ui.classList.add("visible");
      }
    } else if (!closestAlbum && currentAlbum) {
      currentAlbum = null;
      
      // Don't show artwork instruction again if user has already approached artwork
        
      if (ui) {
        if (typeof gsap !== 'undefined') {
          gsap.to("#ui", {
            opacity: 0,
            scale: 0.8,
            duration: 0.3,
            ease: "power2.in",
            onComplete: () => {
              ui.style.display = "none";
              ui.classList.remove("visible");
              
              // Show artwork instruction when album UI hides (only on desktop)
              const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
              if (artworkInstruction && !isMobileDevice) {
                artworkInstruction.style.display = "block";
              }
            },
          });
        } else {
          ui.style.display = "none";
          ui.classList.remove("visible");
          
          // Show artwork instruction when album UI hides (only on desktop)
          const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
          if (artworkInstruction && !isMobileDevice) {
            artworkInstruction.style.display = "block";
          }
        }
      }
    }
  } else if (currentAlbum) {
    currentAlbum = null;
    if (!ui) ui = document.getElementById("ui");
    if (ui) {
      ui.style.display = "none";
      ui.classList.remove("visible");
      
      // Show artwork instruction when album UI hides (only on desktop)
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (artworkInstruction && !isMobileDevice) {
        artworkInstruction.style.display = "block";
      }
    }
  }

  renderer.render(scene, camera);
}

// Function to cache loaded assets before switching modes
function cacheCurrentAssets() {
  if (scene && cachedAssets.isFullyLoaded) {
    return; // Already cached
  }
  
  if (scene) {
    // Cache all loaded objects
    cachedAssets.recordPlayer = animatedRecordPlayer;
    
    // Find and cache other assets by traversing the scene
    scene.traverse((child) => {
      if (child.userData && child.userData.assetType) {
        switch (child.userData.assetType) {
          case 'table':
            cachedAssets.table = child;
            break;
          case 'pillar':
            if (!cachedAssets.pillars.includes(child)) {
              cachedAssets.pillars.push(child);
            }
            break;
          case 'plant':
            if (!cachedAssets.plants.includes(child)) {
              cachedAssets.plants.push(child);
            }
            break;
          case 'couch':
            cachedAssets.couch = child;
            break;
          case 'album':
            if (!cachedAssets.albums.includes(child)) {
              cachedAssets.albums.push(child);
            }
            break;
        }
      }
    });
    
    cachedAssets.isFullyLoaded = true;
  }
}

// Function to restore cached assets to the scene
function restoreCachedAssets() {
  if (!cachedAssets.isFullyLoaded || !scene) {
    return false; // No cached assets or no scene
  }
  
  // Restore record player
  if (cachedAssets.recordPlayer) {
    scene.add(cachedAssets.recordPlayer);
    animatedRecordPlayer = cachedAssets.recordPlayer;
  }
  
  // Restore table
  if (cachedAssets.table) {
    scene.add(cachedAssets.table);
  }
  
  // Restore pillars
  cachedAssets.pillars.forEach(pillar => {
    if (pillar) scene.add(pillar);
  });
  
  // Restore plants
  cachedAssets.plants.forEach(plant => {
    if (plant) scene.add(plant);
  });
  
  // Restore couch
  if (cachedAssets.couch) {
    scene.add(cachedAssets.couch);
  }
  
  // Restore albums
  cachedAssets.albums.forEach(album => {
    if (album) scene.add(album);
  });
  
  // Restore mixer if record player exists
  if (animatedRecordPlayer && !mixer) {
    try {
      mixer = new THREE.AnimationMixer(animatedRecordPlayer);
      // Restore animation actions if available
      if (animatedRecordPlayer.userData.animations) {
        const animations = animatedRecordPlayer.userData.animations;
        putVinylAction = mixer.clipAction(animations[0]);
        if (animations[1]) {
          spinAction = mixer.clipAction(animations[1]);
        }
      }
    } catch (error) {
      console.warn("Could not restore mixer:", error);
    }
  }
  
  return true; // Successfully restored from cache
}

// Function to reset scene state when returning to homepage
function resetSceneForHomepage() {
  
  // Cancel any existing preview animation
  if (previewAnimationId) {
    cancelAnimationFrame(previewAnimationId);
    previewAnimationId = null;
  }
  
  // Cancel main animation
  if (mainAnimationId) {
    cancelAnimationFrame(mainAnimationId);
    mainAnimationId = null;
  }
  
  // DON'T reset scene initialization flag if assets are already loaded
  // This prevents the scene from being recreated when returning to homepage
  if (assetsLoaded < Math.floor(totalAssets / 2)) {
    isSceneInitialized = false;
  }
  
  // Reset camera position if camera exists
  if (camera) {
    camera.position.set(0, 1.6, -2);
    camera.rotation.set(0, 0, 0);
    if (isMobile) {
      camera.lookAt(0, 1.6, -6);
    } else {
      camera.lookAt(0, 1.6, 0);
    }
    camera.updateMatrixWorld();
  }
  
  // Reset preview states
  isPreviewing = false;
  currentAlbum = null;
  
}

// Export functions
export { initScene, animate, animatePreview, enterGallery, resetSceneForHomepage };