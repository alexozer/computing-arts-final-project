import { Obj, Sim } from "./simTypes";

let nextId = 0;

function genUniqueId(): string {
  return `obj${nextId++}`;
}

export function genSim(): Sim {
  const sim: Sim = {
    objs: new Set(),
    nnMap: null,
  };

  const obj: Obj = {
    id: genUniqueId(),
    rotX: 0,
    rotY: 0,
    scaleX: 1,
    scaleY: 1,
    scaleOverall: 1,
    hue: 0.5,
    lightness: 0.8,
    oscilFreq: 0,
    oscilAmpl: 0,
    nnObj: null,
  };
  sim.objs.add(obj)

  return sim;
}

export function updateSim(sim: Sim, deltaSeconds: number) {

}