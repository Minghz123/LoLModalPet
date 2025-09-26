import * as THREE from 'three';
import Resource from './world/Resource';
// import Material from './world/Materials';
// import Ammo from "ammojs-typed";
export default class Base {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  mouse: THREE.Vector2;
  physicsWorld: any;
  sizes: {
    width: number;
    height: number;
  };
  resources: Resource;
  materials: any;
  parsers: any;
  meshObjects: any;
  ready: boolean;
  dirLight: any;
  time: { start: number; elasped: number };
  mixer: any;

  constructor(
    canvas,
    width = window.innerWidth,
    height = window.innerHeight,
    color = 0xffffff,
  ) {
    this.time = { start: Date.now(), elasped: 0 };
    this.ready = false;
    this.meshObjects = [];
    this.sizes = { width, height };
    // 场景
    this.scene = new THREE.Scene();
    // 摄像机
    // this.camera = new THREE.OrthographicCamera(
    //   this.sizes.width / -2,
    //   this.sizes.width / 2,
    //   this.sizes.height / 2,
    //   this.sizes.height / -2,
    //   0.001,
    //   10000
    // );
    // this.camera = new THREE.PerspectiveCamera(
    //   75,
    //   window.innerWidth / window.innerHeight,
    //   0.001,
    //   10000
    // );
    this.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    // this.camera.position.z = 5;
    // 渲染器
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
    });
    this.renderer.setSize(width, height);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // 可选
    // 设置像素
    this.renderer.setPixelRatio(window.devicePixelRatio);
    // 在你的渲染器设置中
    // this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    // 设置背景色
    // this.scene.background = new THREE.Color(color);
    // 设置鼠标
    this.mouse = new THREE.Vector2();
    // Ammo().then((AmmoLib) => {
    // Ammo = AmmoLib;
    // transformAux = new Ammo.btTransform()
    // this.initPhysics();
    // createObjects()
    // update()
    // });
    this.resources = new Resource();

    // this.setMaterials();
    this.creatParsers();
    let timer = setInterval(() => {
      if (this.resources.ready) {
        this.ready = true;
        console.log('--------check---------');
        console.log(this.resources, this.materials, this.ready);
        clearInterval(timer);
      }
    }, 500);
  }
  update() {

    this.renderer.render(this.scene, this.camera);
  }
  // 自适应
  resize() {
    this.sizes.width = window.innerWidth;
    this.sizes.height = window.innerHeight;
    this.camera.aspect = this.sizes.width / this.sizes.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.sizes.width, this.sizes.height);
  }
  // 添加环境光
  addAmbientLight(intensity = 1, color = 0xffcfe0) {
    let light = new THREE.AmbientLight(color, intensity);
    this.scene.add(light);
    return light; //修改位置
  }

  // 添加方向光
  addDirLight(intensity = 1, color = 0xffffff) {
    let light = new THREE.DirectionalLight(color, intensity);
    light.castShadow = true;
    this.dirLight = light;
    this.scene.add(light);
    return light; //修改位置
  }

  createMaterial = () => {
    return new THREE.MeshStandardMaterial({
      color: Math.floor(Math.random() * (1 << 24)),
      side: THREE.DoubleSide,
    });
  };

  // // 初始化物理世界
  // initPhysics = () => {
  //   // 构造离散动态世界，声明相关参数
  //   const collisionConfiguration = new Ammo.btSoftBodyRigidBodyCollisionConfiguration();
  //   const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
  //   const broadphase = new Ammo.btDbvtBroadphase();
  //   const solver = new Ammo.btSequentialImpulseConstraintSolver();
  //   const softsolver = new Ammo.btDefaultSoftBodySolver();
  //   this.physicsWorld = new Ammo.btSoftRigidDynamicsWorld(
  //     dispatcher,
  //     broadphase,
  //     solver,
  //     collisionConfiguration,
  //     softsolver,
  //   );
  //   // 设置重力
  //   this.physicsWorld.setGravity(new Ammo.btVector3(0, -9.8, 0));
  // };

  // setMaterials() {
  //   this.materials = new Material({
  //     resources: this.resources,
  //   });
  // }

  creatParsers() {
    this.parsers = {};

    this.parsers.items = [
      // Shade
      {
        regex: /^shade([a-z]+)_?[0-9]{0,3}?/i,
        apply: (_mesh, _options) => {
          // Find material
          const match = _mesh.name.match(/^shade([a-z]+)_?[0-9]{0,3}?/i);
          const materialName = `${match[1].substring(0, 1).toLowerCase()}${match[1].substring(1)}`; // PastalCase to camelCase
          let material = this.materials?.shades?.items[materialName];
          // Default
          if (typeof material === 'undefined') {
            material = new THREE.MeshNormalMaterial();
          }

          // Create clone mesh with new material
          const mesh = _options.duplicated ? _mesh.clone() : _mesh;
          mesh.material = material;
          if (mesh.children.length) {
            for (const _child of mesh.children) {
              if (_child instanceof THREE.Mesh) {
                _child.material = material;
              }
            }
          }

          return mesh;
        },
      },

      // Shade
      {
        regex: /^pure([a-z]+)_?[0-9]{0,3}?/i,
        apply: (_mesh, _options) => {
          // Find material
          const match = _mesh.name.match(/^pure([a-z]+)_?[0-9]{0,3}?/i);
          const materialName = match[1].toLowerCase();
          let material = this.materials?.pures?.items[materialName];

          // Default
          if (typeof material === 'undefined') {
            material = new THREE.MeshNormalMaterial();
          }

          // Create clone mesh with new material
          const mesh = _options.duplicated ? _mesh.clone() : _mesh;
          mesh.material = material;

          return mesh;
        },
      },

      // // Floor
      // {
      //     regex: /^floor_?[0-9]{0,3}?/i,
      //     apply: (_mesh, _options) =>
      //     {
      //         // Create floor manually because of missing UV
      //         const geometry = new THREE.PlaneGeometry(_mesh.scale.x, _mesh.scale.y, 10, 10)
      //         const material = this.materials.items.floorShadow.clone()

      //         material.uniforms.tShadow.value = _options.floorShadowTexture
      //         material.uniforms.uShadowColor.value = new THREE.Color(this.materials.items.floorShadow.shadowColor)
      //         material.uniforms.uAlpha.value = 0

      //         const mesh = new THREE.Mesh(geometry, material)
      //         mesh.matrixAutoUpdate = false
      //         mesh.updateMatrix()

      //         floorShadows.push(mesh)

      //         return mesh
      //     }
      // }
    ];

    // Default
    this.parsers.default = {};
    this.parsers.default.apply = (_mesh) => {
      // Create clone mesh with normal material
      const mesh = _mesh.clone();
      // mesh.material = this.materials.shades.items.white;

      return mesh;
    };

    // return parsers;
  }

  getConvertedMesh(_children, _options = {}) {
    const container = new THREE.Object3D();
    const center = new THREE.Vector3();
    
    // Go through each base child
    const baseChildren = [..._children];
    for (const _child of baseChildren) {
      // Find center
      if (_child.name.match(/^center_?[0-9]{0,3}?/i)) {
        center.set(_child.position.x, _child.position.y, _child.position.z);
      }
      
      // if (_child instanceof THREE.SkinnedMesh) {
      //   // 对于SkinnedMesh，我们需要保持原始引用
      //   container.add(_child);
      // } else 
        if (_child.isMesh) {
        // Find parser and use default if not found
        let parser = this.parsers.items.find((_item) =>
          _child.name.match(_item.regex),
        );
        if (typeof parser === 'undefined') {
          parser = this.parsers.default;
        }

        // Create mesh by applying parser
        const mesh = parser.apply(_child.clone(), _options);
        container.add(mesh);
      } else if (_child.isGroup) {
        container.add(_child);
      }
    }

    // Recenter
    if (center.length() > 0) {
      for (const _child of container.children) {
        _child.position.sub(center);
      }
      container.position.add(center);
    }

    return container;
  }

  // createPhysicsByTriangle = (child: any, mass: number, spring: number, scale: THREE.Vector3) => {
  //   const shape = new Ammo.btConvexHullShape();

  //   let triangle_mesh = new Ammo.btTriangleMesh();

  //   let vectA = new Ammo.btVector3(0, 0, 0);
  //   let vectB = new Ammo.btVector3(0, 0, 0);
  //   let vectC = new Ammo.btVector3(0, 0, 0);

  //   let verticesPos = child.geometry.attributes.position.array;
  //   let triangles = [];

  //   for (let i = 0; i < verticesPos.length; i += 3)
  //     triangles.push({
  //       x: verticesPos[i] * scale.x,
  //       y: verticesPos[i + 1] * scale.y,
  //       z: verticesPos[i + 2] * scale.z,
  //     });

  //   for (let i = 0; i < triangles.length - 3; i += 3) {
  //     vectA.setValue(triangles[i].x, triangles[i].y, triangles[i].z);
  //     shape.addPoint(vectA, true);
  //     vectB.setValue(triangles[i + 1].x, triangles[i + 1].y, triangles[i + 1].z);
  //     shape.addPoint(vectB, true);
  //     vectC.setValue(triangles[i + 2].x, triangles[i + 2].y, triangles[i + 2].z);
  //     shape.addPoint(vectC, true);
  //     triangle_mesh.addTriangle(vectA, vectB, vectC, true);
  //   }
  //   // let meshShape = new Ammo.btBvhTriangleMeshShape(triangle_mesh, true, true)
  //   // let meshShape = new Ammo.btConvexTriangleMeshShape(triangle_mesh, true);
  //   let localInertia = new Ammo.btVector3(0, 0, 0);
  //   let transform = new Ammo.btTransform();
  //   // meshShape.calculateLocalInertia(mass, localInertia);
  //   shape.calculateLocalInertia(mass, localInertia);
  //   transform.setIdentity();
  //   transform.setOrigin(new Ammo.btVector3(child.position.x, child.position.y, child.position.z));
  //   transform.setRotation(
  //     new Ammo.btQuaternion(child.quaternion.x, child.quaternion.y, child.quaternion.z, child.quaternion.w),
  //   );
  //   let motionState = new Ammo.btDefaultMotionState(transform);
  //   let rigid = new Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia);
  //   let body = new Ammo.btRigidBody(rigid);
  //   body.setRestitution(spring);

  //   child.userData.body = body;
  //   this.meshObjects.push(child);
  //   this.physicsWorld.addRigidBody(body);
  // };

  // addPhysicsObjectsFromGLB(options: {
  //   mesh: any;
  //   position: THREE.Vector3;
  //   quaternion: THREE.Vector3;
  //   scale: THREE.Vector3;
  //   spring: number;
  //   mass: number;
  //   show: any;
  //   // ma: any;
  // }) {
  //   let container = new THREE.Group();
  //   let transform = new Ammo.btTransform();
  //   let btc = new Ammo.btCompoundShape();
  //   transform.setIdentity();
  //   transform.setOrigin(new Ammo.btVector3(options.position.x, options.position.y, options.position.z));
  //   let q = new THREE.Quaternion();
  //   let r = new THREE.Euler(options.quaternion.x, options.quaternion.y, options.quaternion.z);
  //   q.setFromEuler(r);
  //   transform.setRotation(new Ammo.btQuaternion(q.x, q.y, q.z, q.w));
  //   let motionState = new Ammo.btDefaultMotionState(transform);

  //   for (let item of options.mesh) {
  //     // Define shape
  //     let shape = null;

  //     if (item.name.match(/^cube_?[0-9]{0,3}?|box[0-9]{0,3}?$/i)) {
  //       shape = 'box';
  //     } else if (item.name.match(/^cylinder_?[0-9]{0,3}?$/i)) {
  //       shape = 'cylinder';
  //     } else if (item.name.match(/^sphere_?[0-9]{0,3}?$/i)) {
  //       shape = 'sphere';
  //     } else if (item.name.match(/^center_?[0-9]{0,3}?$/i)) {
  //       shape = 'center';
  //     }

  //     // Shape is the center
  //     // if (shape === "center") {
  //     //   collision.center.set(item.position.x, item.position.y, item.position.z);
  //     // }

  //     // Other shape
  //     // else
  //     if (shape) {
  //       // Geometry
  //       let shapeGeometry = null;

  //       if (shape === 'cylinder') {
  //         shapeGeometry = new Ammo.btCylinderShape(item.scale.x, item.scale.z, item.scale.x);
  //       } else if (shape === 'box') {
  //         shapeGeometry = new Ammo.btBoxShape(
  //           new Ammo.btVector3(
  //             item.scale.x * options.scale.x * 0.5 * (options.scale.x <= 1.5 ? 2 : 1),
  //             item.scale.y * options.scale.y * 0.5 * (options.scale.x <= 1.5 ? 2 : 1),
  //             item.scale.z * options.scale.z * 0.5 * (options.scale.x <= 1.5 ? 2 : 1),
  //           ),
  //         );
  //         // shapeGeometry = new CANNON.Box(halfExtents);
  //       } else if (shape === 'sphere') {
  //         shapeGeometry = new Ammo.btSphereShape(item.scale.x);
  //       }

  //       // let a = new THREE.Mesh(
  //       //   new THREE.BoxGeometry(
  //       //     item.scale.x * options.scale.x * (options.scale.x <= 1.5 ? 2 : 1),
  //       //     item.scale.y * options.scale.y * (options.scale.x <= 1.5 ? 2 : 1),
  //       //     item.scale.z * options.scale.z * (options.scale.x <= 1.5 ? 2 : 1),
  //       //   ),
  //       //   this.createMaterial(),
  //       // );
  //       // a.position.set(
  //       //   item.position.x * options.scale.x,
  //       //   item.position.y * options.scale.y,
  //       //   item.position.z * options.scale.z,
  //       // );
  //       // a.rotation.set(item.rotation.x, item.rotation.y, item.rotation.z);

  //       // // this.scene.add(a);
  //       // container.add(a);

  //       // Position
  //       transform.setOrigin(
  //         new Ammo.btVector3(
  //           item.position.x * options.scale.x,
  //           item.position.y * options.scale.y,
  //           item.position.z * options.scale.z,
  //         ),
  //       );

  //       // Quaternion
  //       let rot = new THREE.Euler(item.rotation.x, item.rotation.y, item.rotation.z);

  //       let quat = new THREE.Quaternion();
  //       quat.setFromEuler(rot);
  //       transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
  //       let motionState = new Ammo.btDefaultMotionState(transform);
  //       let localInertia = new Ammo.btVector3(0, 0, 0);
  //       shapeGeometry.calculateLocalInertia(options.mass, localInertia);
  //       btc.addChildShape(transform, shapeGeometry);
  //       // let rigid = new Ammo.btRigidBodyConstructionInfo(
  //       //   0,
  //       //   motionState,
  //       //   shapeGeometry,
  //       //   localInertia
  //       // );
  //       // let body = new Ammo.btRigidBody(rigid);
  //       // body.setRestitution(options.spring);
  //       // this.physicsWorld.addRigidBody(body);
  //     }
  //   }
  //   // container.rotation.set(options.quaternion.x, options.quaternion.y, options.quaternion.z);
  //   // container.position.set(options.position.x, options.position.y, options.position.z);
  //   // // console.log(container);
  //   // this.scene.add(container);
  //   let localInertia = new Ammo.btVector3(0, 0, 0);
  //   let rigid = new Ammo.btRigidBodyConstructionInfo(options.mass, motionState, btc, localInertia);
  //   let body = new Ammo.btRigidBody(rigid);
  //   options.show.userData.body = body;
  //   this.meshObjects.push(options.show);
  //   this.physicsWorld.addRigidBody(body);
  // }

  add(
    _options = {
      base: this.resources.items.brick.scene,
      rotation: new THREE.Vector3(0, 0, 0),
      position: new THREE.Vector3(0, 0, 0),
      scale: new THREE.Vector3(1, 1, 1),
      needPhysics: false,
      mass: 0,
      spring: 0,
    },
    hide=[],
    collision: any = null,
  ) {
    const box = new THREE.Box3().setFromObject(_options.base.scene);
    const size = box.getSize(new THREE.Vector3());
    const scale = 1 / size.y;
    console.log(_options.base, '/////',scale);
    // _options.base.scene.traverse((child)=>{
    //   if(child.isSkinnedMesh){
    //     child.castShadow = true;
    //     child.receiveShadow = true;
    //     child.visible =! hide.includes(child?.material?.name)
    //   }
    // })


    // 转换mesh
    // let res = this.getConvertedMesh(_options.base.scene.children);
    // if (res.children.length == 1) res = res.children[0];
    if (
      _options.rotation &&
      _options.rotation.x !== undefined &&
      _options.rotation.y !== undefined &&
      _options.rotation.z !== undefined
    ) {
      _options.base.scene.rotation.set(
        _options.rotation.x,
        _options.rotation.y,
        _options.rotation.z,
      );
    }
    if (
      _options.position &&
      _options.position.x !== undefined &&
      _options.position.y !== undefined &&
      _options.position.z !== undefined
    ) {
      _options.base.scene.position.set(
        _options.position.x,
        _options.position.y,
        _options.position.z,
      );
    }
    if (
      _options.scale &&
      _options.scale.x !== undefined &&
      _options.scale.y !== undefined &&
      _options.scale.z !== undefined
    ) {
      // 将用户设置的scale与自动计算的scale相乘
      _options.base.scene.scale.set(
        _options.scale.x * scale,
        _options.scale.y * scale,
        _options.scale.z * scale
      );
    }


        this.mixer = new THREE.AnimationMixer(_options.base.scene);
    if (_options.base.animations && _options.base.animations.length > 0) {
      const action = this.mixer.clipAction(_options.base.animations[1]);
      action.play();
    }

    this.scene.add(_options.base.scene);
    _options.base.scene.updateMatrixWorld(true)
    // if (_options.needPhysics) {
    //   if (collision) {
    //     this.addPhysicsObjectsFromGLB({
    //       mesh: collision.children,
    //       position: _options.position,
    //       quaternion: _options.rotation,
    //       scale: _options.scale,
    //       spring: _options.spring,
    //       mass: _options.mass,
    //       show: res,
    //     });
    //     // res.userData.collision = collision
    //   } else {
    //     this.createPhysicsByTriangle(res, _options.mass, _options.spring, _options.scale);
    //   }
    // }
    // return res;
  }
}
