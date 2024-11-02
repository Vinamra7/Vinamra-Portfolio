import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

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
      this.rgbeLoader.load(
        "https://lmiwzoiohfrsxaidpyfb.supabase.co/storage/v1/object/public/Models/GRADIENT_01_01_comp.hdr",
        (hdr) => {
          this.assets.hdrs.gradient = hdr;
        },
        undefined,
        reject
      );

      // Load Textures
      this.textureLoader.load(
        "https://lmiwzoiohfrsxaidpyfb.supabase.co/storage/v1/object/public/Models/surf_imp_02.jpg",
        (texture) => {
          this.assets.textures.surfaceImperfection = texture;
        },
        undefined,
        reject
      );

      // Load displacement texture
      this.textureLoader.load(
        "https://lmiwzoiohfrsxaidpyfb.supabase.co/storage/v1/object/public/Models/ml-dpt-21-1K_normal.jpeg",
        (texture) => {
          this.assets.textures.displacement = texture;
        },
        undefined,
        reject
      );

      // Load FBX Model
      this.fbxLoader.load(
        "https://lmiwzoiohfrsxaidpyfb.supabase.co/storage/v1/object/public/Models/two_hands_01.fbx",
        (model) => {
          this.assets.models.hands = model;
        },
        undefined,
        reject
      );
    });
  }
}

export default new AssetLoader();