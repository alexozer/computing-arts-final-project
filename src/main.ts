import * as three from 'three';

// Match the original game's camera settings, for now
const FOV = 60;
const ASPECT_RATIO = 640 / 480;
const NEAR_DISTANCE = 0.1;
const FAR_DISTANCE = 20000;

class Main {
  private scene: three.Scene;
  private camera: three.PerspectiveCamera;
  private renderer: three.WebGLRenderer;
  private clock: three.Clock;

  private box: three.Mesh;

  constructor() {
    this.scene = new three.Scene();
    this.camera = new three.PerspectiveCamera(FOV, ASPECT_RATIO, NEAR_DISTANCE, FAR_DISTANCE);
    this.renderer = new three.WebGLRenderer({ antialias: true });
    document.body.appendChild(this.renderer.domElement);
    this.clock = new three.Clock();

    const axis = new three.AxesHelper(10);

    this.scene.add(axis);

    const light = new three.DirectionalLight(0xffffff, 1.0);

    light.position.set(100, 100, 100);

    this.scene.add(light);

    const light2 = new three.DirectionalLight(0xffffff, 1.0);

    light2.position.set(-100, 100, -100);

    this.scene.add(light2);

    const material = new three.MeshNormalMaterial()

    this.box = new three.Mesh(new three.BoxGeometry(1, 7, 1), material);

    this.scene.add(this.box);

    this.box.position.x = 0.5;
    this.box.rotation.y = 0.5;

    this.camera.position.x = 5;
    this.camera.position.y = 5;
    this.camera.position.z = 5;

    this.camera.lookAt(this.scene.position);

    this.renderer.setAnimationLoop(() => this.update());
    window.addEventListener('resize', () => this.onResize());
    this.onResize();
  }

  private update(): void {
    const deltaSeconds = this.clock.getDelta();

    this.box.position.y = Math.abs(0.5 + Math.abs(0.8 * Math.sin(15 * this.clock.getElapsedTime())));
    this.box.rotation.x += deltaSeconds * 8;
    this.renderer.render(this.scene, this.camera);
  }

  private onResize(): void {
    this.camera.aspect = ASPECT_RATIO;
    this.camera.updateProjectionMatrix();

    if (window.innerWidth / ASPECT_RATIO <= window.innerHeight) {
      this.renderer.setSize(window.innerWidth, window.innerWidth / ASPECT_RATIO);
    } else {
      this.renderer.setSize(window.innerHeight * ASPECT_RATIO, window.innerHeight);
    }

    this.renderer.setPixelRatio(window.devicePixelRatio);
  }
}

new Main();