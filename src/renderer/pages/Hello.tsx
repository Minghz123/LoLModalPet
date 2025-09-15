import { useEffect, useRef } from 'react';
// @ts-ignore
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Base from '../../utils/Base';
import * as THREE from 'three';
export default function Hello() {
  const canvasDom = useRef(null);

  let controls = null;
  let base;
  const resize = () => {
    base.resize();
  };
  const clock = new THREE.Clock()
  const update = () => {
    base.time.elapsed =clock.getDelta();
    base.mixer.update(base.time.elapsed)
    requestAnimationFrame(update);
    // tick();
    controls.update();
    base.update();


  };
  let dollmesh
    const createObj = ()=>{
     dollmesh= base.add({
            base: base.resources.items.gewenSimple,
            position: new THREE.Vector3(0, -.5, 0),
            scale: new THREE.Vector3(.1, 0.1, 0.1),
            rotation: new THREE.Vector3(0, 0, 0),
            needPhysics: false,
            mass: 0,
            spring: 1,
      },[]);
      base.add({
            base: base.resources.items.zoe,
            position: new THREE.Vector3(0, -.5, 0),
            scale: new THREE.Vector3(.1, 0.1, 0.1),
            rotation: new THREE.Vector3(0, 0, 0),
            needPhysics: false,
            mass: 0,
            spring: 1,
      },[]);
      let mesh = new THREE.Mesh(new THREE.PlaneGeometry(100,100),new THREE.ShadowMaterial({opacity:0.2}))
      mesh.receiveShadow = true
      mesh.position.y = -0.5
      mesh.rotateX(-Math.PI/2) 
      base.scene.add(mesh)
  }

  const handleClick =()=>{
    dollmesh.scale.set(0.01,0.01,0.01)
    dollmesh.position.x = 100
  }
  useEffect(() => {
    base = new Base(canvasDom.current);

    let timer = setInterval(() => {
      if (base.ready) {
        controls = new OrbitControls(base.camera, base.renderer.domElement);
        // base.addAmbientLight(0.75);
        base.camera.position.set(0.5, 1.5, 1.5);
        base.camera.lookAt(0, 0, 0);
        let dir = base.addDirLight(1);
        dir.castShadow = true;
        dir.position.set(-5, 5, 5);

        // const d = 100;
        // dir.shadow.camera.top = d;
        // dir.shadow.camera.bottom = -d;
        // dir.shadow.camera.left = -d;
        // dir.shadow.camera.right = d;
        // dir.shadow.camera.near = 0.5;
        // dir.shadow.camera.far = 50;
        // // 阴影贴图的宽度和高度。值必须是2的幂。默认值为512。越大阴影贴图越清晰，但性能消耗也越高。
        // dir.shadow.mapSize.x = 1024;
        // dir.shadow.mapSize.y = 1024;
        // dir.shadow.bias = -0.003; // 阴影贴图偏差，避免出现斑驳的阴影
        createObj()
        console.log(base);
        update(); 
        window.addEventListener('resize', resize);
        clearInterval(timer);
      }
    }, 1000);
  }, []);



  return (
    <>
    <button className='abc' onClick={handleClick}>click</button>
      <div className="container">
        <canvas ref={canvasDom} />
      </div>
    </>
  );
}
