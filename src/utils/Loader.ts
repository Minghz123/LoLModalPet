/**
 * Set loaders
 */
// @ts-ignore
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
// @ts-ignore
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import * as THREE from 'three';
export default class Loader {
  loaders = [];
  resources: any;
  loading: number;
  constructor(_options) {
    this.setLoaders();
    this.resources = _options.resources;

    this.loading = 0;
  }

  setLoaders() {
    // Images
    this.loaders.push({
      extensions: ['jpg', 'png', 'webp'],
      action: (_resource) => {
        const image = new Image();
        image.src = _resource.source;
        // image.onload = () => {
        //     console.log('return,1')

        // }
        this.FileLoadEnd(_resource, image);
        // return image;
        // image.addEventListener('load', () => {
        //     fileLoadEnd(_resource, image)
        // })

        // image.addEventListener('error', () => {
        //     fileLoadEnd(_resource, image)
        // })

        // return image
        // return textureloader.load(_resource.source, (texture) => {
        //     console.log('return,1')
        //     return texture
        // })
      },
    });

    // Draco
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('draco/gltf/');
    dracoLoader.setDecoderConfig({ type: 'js' });

    this.loaders.push({
      extensions: ['drc'],
      action: (_resource) => {
        dracoLoader.load(_resource.source, (_data) => {
          // fileLoadEnd(_resource, _data)

          DRACOLoader.releaseDecoderModule();
        });
      },
    });

    // GLTF
    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);

    this.loaders.push({
      extensions: ['glb', 'gltf'],
      action: (_resource) => {
        gltfLoader.load(_resource.source, (_data) => {
          // return _data;

          _data.scene.traverse((child) => {
            if (child.isSkinnedMesh ) {
              // child.frustumCulled = false;
              child.castShadow = true;
              // child.material.emissive = child.material.color;
              // child.material.emissiveMap = child.material.map;
            }
          });
          this.FileLoadEnd(_resource, _data);
        });
      },
    });

    // // FBX
    // const fbxLoader = new FBXLoader()

    // this.loaders.push({
    //     extensions: ['fbx'],
    //     action: (_resource) => {
    //         fbxLoader.load(_resource.source, (_data) => {
    //             fileLoadEnd(_resource, _data)
    //         })
    //     }
    // })
  }

  load(_resources = []) {
    for (const _resource of _resources) {
      // toLoad++
      const extensionMatch = _resource.source.match(/\.([a-z]+)$/);

      if (typeof extensionMatch[1] !== 'undefined') {
        const extension = extensionMatch[1];
        const loader = this.loaders.find((_loader) =>
          _loader.extensions.find((_extension) => _extension === extension),
        );

        if (loader) {
          this.loading += 1;
          loader.action(_resource);
        } else {
          console.warn(`Cannot found loader for ${_resource}`);
        }
      } else {
        console.warn(`Cannot found extension of ${_resource}`);
      }
    }
  }

  FileLoadEnd(_resource, _data) {
    this.resources[_resource.name] = _data;

    // Texture
    if (_resource.type === 'texture') {
      const texture = new THREE.Texture(_data);

      // const texture = a

      texture.needsUpdate = true;

      this.resources[`${_resource.name}Texture`] = texture;
    }
    this.loading -= 1;
  }
}

/**
 * Load
 */
