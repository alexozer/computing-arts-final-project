import { vec3 } from 'gl-matrix';
import * as th from 'three';
import { OrbitControls } from './OrbitControls';
import { genSimWorld, Obj, SimWorld, updateSimWorld } from './sim2';

// Match the original game's camera settings, for now
const FOV = 60;
const ASPECT_RATIO = 640 / 480;
const NEAR_DISTANCE = 0.1;
const FAR_DISTANCE = 20000;

function vec3ToThree(v: vec3): th.Vector3 {
  return new th.Vector3(v[0], v[1], v[2]);
}

export class RenderScene {
  private scene: th.Scene;
  private camera: th.PerspectiveCamera;
  private renderer: th.WebGLRenderer;
  private clock: th.Clock;
  private orbit: OrbitControls;

  private sim: SimWorld;
  private simObjMap: Map<Obj, th.Mesh>;

  constructor() {
    this.scene = new th.Scene();
    this.camera = new th.PerspectiveCamera(FOV, ASPECT_RATIO, NEAR_DISTANCE, FAR_DISTANCE);
    this.renderer = new th.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.outputEncoding = th.sRGBEncoding;
    document.body.appendChild(this.renderer.domElement);
    this.clock = new th.Clock();

    // const axis = new th.AxesHelper(10);
    // this.scene.add(axis);

    const light = new th.DirectionalLight(0xffffff, 0.75);
    light.position.set(100, 100, 100);
    this.scene.add(light);

    const light2 = new th.DirectionalLight(0xffffff, 0.5);
    light2.position.set(-100, 100, -100);
    this.scene.add(light2);

    const light3 = new th.DirectionalLight(0xffffff, 0.25);
    light3.position.set(100, -100, -100);
    this.scene.add(light3);

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

    this.sim = genSimWorld();
    this.simObjMap = new Map();

    // this.addArrows();
  }

  private addArrows() {
    const start = vec3.create();
    const end = vec3.create();
    const dir = vec3.create();
    for (const parent of this.sim.objs.values()) {
      for (const child of parent.children) {
        vec3.lerp(start, parent.pos, child.pos, 0.25);
        vec3.lerp(end, parent.pos, child.pos, 0.75);
        vec3.sub(dir, end, start);
        const len = vec3.len(dir);
        vec3.normalize(dir, dir);
        const arrow = new th.ArrowHelper(vec3ToThree(start), vec3ToThree(dir), len, 0xffff00);
        this.scene.add(arrow);
      }
    }
  }

  private update(): void {
    const deltaSeconds = this.clock.getDelta();
    updateSimWorld(this.sim, deltaSeconds);
    this.updateSceneFromSim();
    this.renderer.render(this.scene, this.camera);
  }

  private updateSceneFromSim() {
    // Prune threejs objects that don't exist in sim
    for (const [simObj, mesh] of this.simObjMap.entries()) {
      if (!this.sim.objs.has(simObj.gridKey)) {
        this.simObjMap.delete(simObj);
        this.scene.remove(mesh);
      }
    }

    // Add threejs objects that don't exist for sim objects
    // TODO should we use instancing here eventually?
    for (const simObj of this.sim.objs.values()) {
      if (!this.simObjMap.has(simObj)) {
        const mesh = new th.Mesh(new th.BoxGeometry(), new th.MeshPhongMaterial());
        this.simObjMap.set(simObj, mesh);
        this.scene.add(mesh);
      }
    }

    // Apply simulation properties to threejs meshes
    for (const [simObj, mesh] of this.simObjMap.entries()) {
      mesh.position.x = simObj.pos[0];
      mesh.position.y = simObj.pos[1];
      mesh.position.z = simObj.pos[2];
      mesh.rotation.x = 0;
      mesh.rotation.y = simObj.rotY;
      mesh.scale.x = simObj.scaleX;
      mesh.scale.y = simObj.scaleY;
      (mesh.material as th.MeshPhongMaterial).color.setHSL(simObj.hue, 1, 0.5);
      // TODO oscillation stuff
    }
  }

  private onResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
