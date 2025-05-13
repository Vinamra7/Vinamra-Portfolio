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
    return new Promise((resolve, reject) => {
      // Set up loading manager callbacks first
      this.loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
        const progress = (itemsLoaded / itemsTotal) * 100;
        if (onProgress) onProgress(progress);
      };

      this.loadingManager.onLoad = () => {
        // Add a small delay to ensure everything is properly initialized
        setTimeout(() => {
          resolve(this.assets);
        }, 100);
      };

      this.loadingManager.onError = (url) => {
        console.error('Error loading:', url);
        reject(new Error(`Failed to load ${url}`));
      };

      // Load HDR
      this.loadHDR(
        "https://lmiwzoiohfrsxaidpyfb.supabase.co/storage/v1/object/public/Models/GRADIENT_01_01_comp.hdr",
        "gradient",
        reject
      );

      // Load Textures
      this.loadTexture(
        "https://lmiwzoiohfrsxaidpyfb.supabase.co/storage/v1/object/public/Models/surf_imp_02.jpg",
        "surfaceImperfection",
        reject
      );

      // Load displacement texture
      this.loadTexture(
        "https://lmiwzoiohfrsxaidpyfb.supabase.co/storage/v1/object/public/Models/ml-dpt-21-1K_normal.jpeg",
        "displacement",
        reject
      );

      // Load FBX Model
      this.loadFBX(
        "https://lmiwzoiohfrsxaidpyfb.supabase.co/storage/v1/object/public/Models/two_hands_01.fbx",
        "hands",
        reject
      );
    });
  }

  loadHDR(url, name, onError) {
    if (CACHE.has(url)) {
      this.assets.hdrs[name] = CACHE.get(url);
      this.updateProgress();
      return;
    }

    this.rgbeLoader.load(
      url,
      (hdr) => {
        this.assets.hdrs[name] = hdr;
        CACHE.set(url, hdr);
      },
      undefined,
      onError
    );
  }

  loadTexture(url, name, onError) {
    if (CACHE.has(url)) {
      this.assets.textures[name] = CACHE.get(url);
      this.updateProgress();
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
      },
      undefined,
      onError
    );
  }

  loadFBX(url, name, onError) {
    if (CACHE.has(url)) {
      this.assets.models[name] = CACHE.get(url);
      this.updateProgress();
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
      },
      undefined,
      onError
    );
  }
}

export default new AssetLoader();