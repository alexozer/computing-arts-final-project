import * as th from 'three';
import { RenderScene } from "./render";

function main() {
  const canvas1 = document.getElementById("canvas1") as HTMLDivElement;
  const canvas2 = document.getElementById("canvas2") as HTMLDivElement;
  const canvas3 = document.getElementById("canvas3") as HTMLDivElement;
  const canvas4 = document.getElementById("canvas4") as HTMLDivElement;
  const renderScenes = [
    new RenderScene(canvas1),
    new RenderScene(canvas2),
    new RenderScene(canvas3),
    new RenderScene(canvas4),
  ];

  // Global hook so we can peer inside
  (window as any).scene = renderScenes;
}

main();