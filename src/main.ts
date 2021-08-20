import * as th from 'three';
import { RenderScene } from "./render";
import { genMarkovModel, MarkovModel, normalizeMarkovTable } from './markov';
import { kProps } from './sim2';

let model1 = genMarkovModel(kProps);
let model2 = genMarkovModel(kProps);
let model3 = genMarkovModel(kProps);
let model4 = genMarkovModel(kProps);

const canvas1 = document.getElementById("canvas1") as HTMLDivElement;
const canvas2 = document.getElementById("canvas2") as HTMLDivElement;
const canvas3 = document.getElementById("canvas3") as HTMLDivElement;
const canvas4 = document.getElementById("canvas4") as HTMLDivElement;

const renderScenes = [
  new RenderScene(canvas1, model1),
  new RenderScene(canvas2, model2),
  new RenderScene(canvas3, model3),
  new RenderScene(canvas4, model4),
];

let noiseLevel = 0;

const gen1 = document.getElementById("gen1") as HTMLButtonElement;
const gen2 = document.getElementById("gen2") as HTMLButtonElement;
const gen3 = document.getElementById("gen3") as HTMLButtonElement;
const gen4 = document.getElementById("gen4") as HTMLButtonElement;
const choose1 = document.getElementById("choose1") as HTMLButtonElement;
const choose2 = document.getElementById("choose2") as HTMLButtonElement;
const choose3 = document.getElementById("choose3") as HTMLButtonElement;
const choose4 = document.getElementById("choose4") as HTMLButtonElement;

gen1.addEventListener('click', () => renderScenes[0].genNewWorld(model1));
gen2.addEventListener('click', () => renderScenes[1].genNewWorld(model2));
gen3.addEventListener('click', () => renderScenes[2].genNewWorld(model3));
gen4.addEventListener('click', () => renderScenes[3].genNewWorld(model4));

choose1.addEventListener('click', () => genNewModels(model1));
choose2.addEventListener('click', () => genNewModels(model2));
choose3.addEventListener('click', () => genNewModels(model3));
choose4.addEventListener('click', () => genNewModels(model4));

// Global hook so we can peer inside
(window as any).scene = renderScenes;

function genNewModels(oldModel: MarkovModel) {
  model1 = genVariation(oldModel);
  model2 = genVariation(oldModel);
  model3 = genVariation(oldModel);
  model4 = genVariation(oldModel);

  renderScenes[0].genNewWorld(model1);
  renderScenes[1].genNewWorld(model2);
  renderScenes[2].genNewWorld(model3);
  renderScenes[3].genNewWorld(model4);

  // noiseLevel++;
}

// function genVariation(oldModel: MarkovModel): MarkovModel {
//   const newModel: MarkovModel = oldModel.map(table => table.slice());
//   const noise = 0.3 * Math.pow(2, -noiseLevel);

//   for (const row of newModel) {
//     for (let i = 0; i < row.length; i++) {
//       row[i] += Math.random() * noise;
//     }
//     normalizeMarkovTable(row);
//   }

//   return newModel;
// }

function genVariation(oldModel: MarkovModel): MarkovModel {
  const newModel: MarkovModel = oldModel.map(table => table.slice());
  const noise = 0.3 * Math.pow(2, -noiseLevel);

  for (const row of newModel) {
    row[Math.floor(Math.random() * row.length)] = 1;
    normalizeMarkovTable(row);
  }

  return newModel;
}