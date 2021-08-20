import * as th from 'three';
import { RenderScene } from "./render";
import { genMarkovModel } from './sim2';

function main() {
  const canvas1 = document.getElementById("canvas1") as HTMLDivElement;
  const canvas2 = document.getElementById("canvas2") as HTMLDivElement;
  const canvas3 = document.getElementById("canvas3") as HTMLDivElement;
  const canvas4 = document.getElementById("canvas4") as HTMLDivElement;

  const model1 = genMarkovModel();
  const model2 = genMarkovModel();
  const model3 = genMarkovModel();
  const model4 = genMarkovModel();

  const renderScenes = [
    new RenderScene(canvas1, model1),
    new RenderScene(canvas2, model2),
    new RenderScene(canvas3, model3),
    new RenderScene(canvas4, model4),
  ];

  const gen1 = document.getElementById("gen1") as HTMLButtonElement;
  const gen2 = document.getElementById("gen2") as HTMLButtonElement;
  const gen3 = document.getElementById("gen3") as HTMLButtonElement;
  const gen4 = document.getElementById("gen4") as HTMLButtonElement;
  const choose1 = document.getElementById("choose1") as HTMLButtonElement;
  const choose2 = document.getElementById("choose2") as HTMLButtonElement;
  const choose3 = document.getElementById("choose3") as HTMLButtonElement;
  const choose4 = document.getElementById("choose4") as HTMLButtonElement;

  gen1.addEventListener('click', () => renderScenes[0].genNewWorld());
  gen2.addEventListener('click', () => renderScenes[1].genNewWorld());
  gen3.addEventListener('click', () => renderScenes[2].genNewWorld());
  gen4.addEventListener('click', () => renderScenes[3].genNewWorld());

  // Global hook so we can peer inside
  (window as any).scene = renderScenes;
}

main();