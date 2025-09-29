import Loader from "../Loader";
export default class Resource {
  items: any;
  loader: Loader;
  ready: boolean;
  constructor() {
    this.items = {};
    this.ready = false;
    this.loader = new Loader({ resources: this.items });
    this.loader.load(
      [
        {
          name: 'zoe',
          source: 'models/Zoe/Zoe.glb',
        },
        {
          name: 'pengu_garen',
          source: 'models/Pengu_Garen/Pengu_Garen.glb',
        },
        {
          name: 'mac',
          source: 'models/mac/base.glb',
        },
        {
          name: 'gewen',
          source: 'models/gewen/base.glb',
        },
        {
          name: 'gewenSimple',
          source: 'models/gewen/simple.glb',
        },
        {
          name: 'arura',
          source: 'models/arura/base.glb',
        },
        {
          name: 'aixi',
          source: 'models/aixi/base.glb',
        },
        {
          name: 'nico',
          source: 'models/nico/base.glb',
        },
        {
          name: 'murfi',
          source: 'models/murfi/base.glb',
        },
        {
          name: 'douhun_gewen',
          source: 'models/gewen/douhun_gewen.glb',
        },
        {
          name: 'lux',
          source: 'models/lux/base.glb',
        },
        // { name: 'matcapGold', source: './models/matcaps/gold.png', type: 'texture' },
      ],
      // ,
      // (_resource, _data) => {
      //   console.log(_data);
      //   this.items[_resource.name] = _data;

      //   // Texture
      //   if (_resource.type === "texture") {
      //     const texture = new THREE.Texture(_data);

      //     // const texture = a

      //     texture.needsUpdate = true;

      //     this.items[`${_resource.name}Texture`] = texture;
      //   }

      //   // Trigger progress
      //   // trigger("progress", [loader.loaded / loader.toLoad]);
      // }
    );
    let timer = setInterval(() => {
      if (this.loader.loading == 0) {
        this.ready = true;
        setTimeout(() => {
        console.log('????')

          window.electron.ipcRenderer.sendMessage('menu-item',Object.keys(this.items))
        }, 1000);
        clearInterval(timer);
      }
    }, 500);

    // loader.on("fileEnd", (_resource, _data) => {
    //     this.items[_resource.name] = _data;

    //     // Texture
    //     if (_resource.type === "texture") {
    //         const texture = new THREE.Texture(_data);
    //         texture.needsUpdate = true;

    //         this.items[`${_resource.name}Texture`] = texture;
    //     }

    //     // Trigger progress
    //     // trigger("progress", [loader.loaded / loader.toLoad]);
    // });
  }
}