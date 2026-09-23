import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

// Initialize cache for loaded resources
const CACHE = new Map();

class AssetLoader {
  constructor() {
    this.assets = {
      models: {},
      textures: {},
      hdrs: {}
    };
    
    this.totalAssets = 4; // Update this number based on total assets to load
    this.loadedAssets = 0;
    
    this.loadingManager = new THREE.LoadingManager();
    this.textureLoader = new THREE.TextureLoader(this.loadingManager);
    this.fbxLoader = new FBXLoader(this.loadingManager);
    this.rgbeLoader = new RGBELoader(this.loadingManager);
    this.gltfLoader = new GLTFLoader(this.loadingManager);
    
    // Set compression for textures
    this.textureLoader.setPath = function(path) {
      THREE.DefaultLoadingManager.setPath(path);
      return this;
    };
  }

  getLoadedAssets() {
    return this.assets;
  }

  updateProgress(onProgress) {
    this.loadedAssets++;
    const progress = (this.loadedAssets / this.totalAssets) * 100;
    if (onProgress) onProgress(progress);
  }

  async loadAssets(onProgress) {
    // Resolve when every asset has settled, instead of relying on the THREE
    // LoadingManager's onLoad callback (which may fire before the callbacks
    // that populate `this.assets` have run).
    const results = await Promise.allSettled([
      this.loadHDR("/Models/GRADIENT_01_01_comp.hdr", "gradient", onProgress),
      this.loadTexture("/Models/surf_imp_02.jpg", "surfaceImperfection", onProgress),
      this.loadTexture("/Models/ml-dpt-21-1K_normal.jpeg", "displacement", onProgress),
      this.loadFBX("/Models/two_hands_01.fbx", "hands", onProgress),
    ]);

    const failed = results
      .filter((result) => result.status === "rejected")
      .map((result) => result.reason);

    failed.forEach((error) => console.error("Error loading asset:", error));

    // Only fail hard when nothing usable loaded; otherwise render with what we have.
    if (failed.length === results.length) {
      throw new Error(`Failed to load assets: ${failed[0]}`);
    }

    return this.assets;
  }

  loadHDR(url, name, onProgress) {
    return new Promise((resolve, reject) => {
      if (CACHE.has(url)) {
        this.assets.hdrs[name] = CACHE.get(url);
        this.updateProgress(onProgress);
        resolve(this.assets.hdrs[name]);
        return;
      }

      this.rgbeLoader.load(
        url,
        (hdr) => {
          this.assets.hdrs[name] = hdr;
          CACHE.set(url, hdr);
          this.updateProgress(onProgress);
          resolve(hdr);
        },
        undefined,
        reject
      );
    });
  }

  loadTexture(url, name, onProgress) {
    return new Promise((resolve, reject) => {
      if (CACHE.has(url)) {
        this.assets.textures[name] = CACHE.get(url);
        this.updateProgress(onProgress);
        resolve(this.assets.textures[name]);
        return;
      }

      this.textureLoader.load(
        url,
        (texture) => {
          // Apply optimizations to textures
          texture.generateMipmaps = false;
          texture.minFilter = THREE.LinearFilter;
          texture.magFilter = THREE.LinearFilter;
          texture.needsUpdate = true;
          this.assets.textures[name] = texture;
          CACHE.set(url, texture);
          this.updateProgress(onProgress);
          resolve(texture);
        },
        undefined,
        reject
      );
    });
  }

  loadFBX(url, name, onProgress) {
    return new Promise((resolve, reject) => {
      if (CACHE.has(url)) {
        this.assets.models[name] = CACHE.get(url);
        this.updateProgress(onProgress);
        resolve(this.assets.models[name]);
        return;
      }

      this.fbxLoader.load(
        url,
        (model) => {
          // Apply optimizations to the model
          model.traverse((child) => {
            if (child.isMesh) {
              // Optimize material
              if (child.material) {
                child.material.precision = 'mediump';
              }
            }
          });
          this.assets.models[name] = model;
          CACHE.set(url, model);
          this.updateProgress(onProgress);
          resolve(model);
        },
        undefined,
        reject
      );
    });
  }
}

export default new AssetLoader();