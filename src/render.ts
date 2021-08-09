import * as th from 'three';
import { runInThisContext } from 'vm';
import { threadId } from 'worker_threads';
import { genSim, updateSim } from './sim';
import { Obj, Sim } from './simTypes';

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

  private sim: Sim;
  private simObjMap: Map<Obj, th.Mesh>;

  constructor() {
    this.scene = new th.Scene();
    this.camera = new th.PerspectiveCamera(FOV, ASPECT_RATIO, NEAR_DISTANCE, FAR_DISTANCE);
    this.renderer = new th.WebGLRenderer({ antialias: true });
    document.body.appendChild(this.renderer.domElement);
    this.clock = new th.Clock();

    const axis = new th.AxesHelper(10);

    this.scene.add(axis);

    const light = new th.DirectionalLight(0xffffff, 1.0);

    light.position.set(100, 100, 100);

    this.scene.add(light);

    const light2 = new th.DirectionalLight(0xffffff, 1.0);

    light2.position.set(-100, 100, -100);

    this.scene.add(light2);

    this.camera.position.x = 5;
    this.camera.position.y = 5;
    this.camera.position.z = 5;

    this.camera.lookAt(this.scene.position);

    this.renderer.setAnimationLoop(() => this.update());
    window.addEventListener('resize', () => this.onResize());
    this.onResize();

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
        const mesh = new th.Mesh(new th.BoxGeometry(), new th.MeshPhongMaterial());
        this.simObjMap.set(simObj, mesh);
        this.scene.add(mesh);
      }
    }

    // Apply simulation properties to threejs meshes
    for (const [simObj, mesh] of this.simObjMap.entries()) {
      mesh.rotation.x = simObj.rotX;
      mesh.rotation.y = simObj.rotY;
      mesh.scale.x = simObj.scaleX * simObj.scaleOverall;
      mesh.scale.y = simObj.scaleY * simObj.scaleOverall;
      mesh.scale.z = simObj.scaleOverall;
      (mesh.material as th.MeshPhongMaterial).color.setHSL(simObj.hue, 1, simObj.lightness);
      // TODO oscillation stuff
    }
  }

  private onResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}