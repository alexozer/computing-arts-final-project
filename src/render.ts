import * as th from 'three';
import { genSim, updateSim } from './sim';
import { Obj, Sim } from './simTypes';
import { OrbitControls } from './OrbitControls';

// Match the original game's camera settings, for now
const FOV = 60;
const ASPECT_RATIO = 640 / 480;
const NEAR_DISTANCE = 0.1;
const FAR_DISTANCE = 20000;

export class RenderScene {
  private scene: th.Scene;
  private camera: th.PerspectiveCamera;
  private renderer: th.WebGLRenderer;
  private clock: th.Clock;
  private orbit: OrbitControls;

  private sim: Sim;
  private simObjMap: Map<Obj, th.Mesh>;

  constructor() {
    this.scene = new th.Scene();
    this.camera = new th.PerspectiveCamera(FOV, ASPECT_RATIO, NEAR_DISTANCE, FAR_DISTANCE);
    this.renderer = new th.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.outputEncoding = th.sRGBEncoding;
    document.body.appendChild(this.renderer.domElement);
    this.clock = new th.Clock();

    const axis = new th.AxesHelper(10);

    this.scene.add(axis);

    const light = new th.DirectionalLight(0xffffff, 0.5);

    light.position.set(100, 100, 100);

    this.scene.add(light);

    const light2 = new th.DirectionalLight(0xffffff, 0.5);

    light2.position.set(-100, 100, -100);

    this.scene.add(light2);

    this.camera.position.x = 5;
    this.camera.position.y = 5;
    this.camera.position.z = 5;

    this.camera.lookAt(this.scene.position);

    this.renderer.setAnimationLoop(() => this.update());
    window.addEventListener('resize', () => this.onResize());
    this.onResize();

    this.orbit = new OrbitControls(this.camera, this.renderer.domElement);
    this.orbit.update();

    this.scene.background = new th.Color(0x343468);

    this.sim = genSim();
    this.simObjMap = new Map();
  }

  private update(): void {
    const deltaSeconds = this.clock.getDelta();
    updateSim(this.sim, deltaSeconds);
    this.updateSceneFromSim();
    this.renderer.render(this.scene, this.camera);
  }

  private updateSceneFromSim() {
    // Prune threejs objects that don't exist in sim
    for (const [simObj, mesh] of this.simObjMap.entries()) {
      if (!this.sim.objs.has(simObj)) {
        this.simObjMap.delete(simObj);
        this.scene.remove(mesh);
      }
    }

    // Add threejs objects that don't exist for sim objects
    // TODO should we use instancing here eventually?
    for (const simObj of this.sim.objs) {
      if (!this.simObjMap.has(simObj)) {
        const mesh = new th.Mesh(new th.BoxGeometry(), new th.MeshToonMaterial());
        this.simObjMap.set(simObj, mesh);
        this.scene.add(mesh);
      }
    }

    // Apply simulation properties to threejs meshes
    for (const [simObj, mesh] of this.simObjMap.entries()) {
      mesh.position.x = simObj.pos[0];
      mesh.position.y = simObj.pos[1];
      mesh.position.z = simObj.pos[2];
      mesh.rotation.x = simObj.rotX;
      mesh.rotation.y = simObj.rotY;
      mesh.scale.x = simObj.scaleX * simObj.scaleOverall;
      mesh.scale.y = simObj.scaleY * simObj.scaleOverall;
      mesh.scale.z = simObj.scaleOverall;
      (mesh.material as th.MeshToonMaterial).color.setHSL(simObj.hue, 1, 0.5);
      // TODO oscillation stuff
    }
  }

  private onResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}