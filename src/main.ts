import { RenderScene } from "./render";

function main() {
  const scene = new RenderScene();
  // Global hook so we can peer inside
  (window as any).scene = scene;
}

main();