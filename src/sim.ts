import { vec3 } from "gl-matrix";
import { MarkovModel, MarkovTable, Mutation, Obj, Sim } from "./simTypes";
import * as th from 'three';

let nextId = 0;

export function genUniqueId(): string {
  return `obj${nextId++}`;
}

const kNumMutations = 6;

function randSmall() { return (Math.random() - 0.5) * 2 }

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(val, max));
}

function inverseLerp(val: number, min: number, max: number): number {
  return (val - min) / (max - min);
}

function genMutation(): Mutation {
  const mutIdx = Math.floor(Math.random() * kNumMutations);
  switch (mutIdx) {
    case 0: return { kind: 'rotX', delta: randSmall() };
    case 1: return { kind: 'rotY', delta: randSmall() };
    case 2: return { kind: 'scaleX', delta: randSmall() };
    case 3: return { kind: 'scaleX', delta: randSmall() };
    case 4: return { kind: 'scaleOverall', delta: randSmall() };
    case 5: return { kind: 'hue', delta: randSmall() };
    default: throw new Error('Invariant violation');
  }
}

function genMarkovTable(): MarkovTable {
  const mutations: Mutation[] = [];
  const probs: number[] = [];
  let sum = 0;
  for (let i = 0; i < kNumMutations; i++) {
    mutations.push(genMutation());
    const weight = Math.random();
    probs.push(weight);
    sum += weight;
  }
  for (let i = 0; i < kNumMutations; i++) {
    probs[i] /= sum;
  }
  return { mutations, probs };
}

function genMarkovModel(): MarkovModel {
  return {
    pos: genMarkovTable(),
    rotX: genMarkovTable(),
    rotY: genMarkovTable(),
    scaleX: genMarkovTable(),
    scaleY: genMarkovTable(),
    scaleOverall: genMarkovTable(),
    hue: genMarkovTable(),
  };
}

export function genSim(): Sim {
  const sim: Sim = {
    objs: new Set(),
    nnMap: null,
    markovModel: genMarkovModel(),
  };

  const obj: Obj = {
    id: genUniqueId(),
    pos: vec3.fromValues(0, 1, 0),
    rotX: 0,
    rotY: 0,
    scaleX: 1,
    scaleY: 1,
    scaleOverall: 1,
    hue: 0.5,
    oscilFreq: 0,
    oscilAmpl: 0,
    nnObj: null,
  };
  sim.objs.add(obj)

  console.log(sim);

  return sim;
}

function pickMutation(propValue: number, propMin: number, propMax: number, table: MarkovTable): Mutation {
  const t = inverseLerp(propValue, propMin, propMax);
  let cumulProb = 0;
  for (let i = 0; i < kNumMutations; i++) {
    cumulProb += table.probs[i];
    if (t < cumulProb) {
      return table.mutations[i];
    }
  }
  return table.mutations[0];
}

function mutateObj(obj: Obj, model: MarkovModel, deltaSeconds: number) {
  const rotXMut = pickMutation(obj.rotX, 0, 2 * Math.PI, model.rotX);
  obj.rotX = (obj.rotX + rotXMut.delta * deltaSeconds + 2 * Math.PI) % (2 * Math.PI);

  const rotYMut = pickMutation(obj.rotY, 0, 2 * Math.PI, model.rotY);
  obj.rotY = (obj.rotY + rotYMut.delta * deltaSeconds + 2 * Math.PI) % (2 * Math.PI);

  const scaleXMut = pickMutation(obj.scaleX, 0.2, 2.5, model.scaleX);
  obj.scaleX = clamp(obj.scaleX + scaleXMut.delta * deltaSeconds, 0.2, 2.5);

  const scaleYMut = pickMutation(obj.scaleY, 0.2, 2.5, model.scaleY);
  obj.scaleY = clamp(obj.scaleY + scaleYMut.delta * deltaSeconds, 0.2, 2.5);

  const scaleOverallMut = pickMutation(obj.scaleOverall, 0.2, 2.5, model.scaleOverall);
  obj.scaleOverall = clamp(obj.scaleOverall + scaleOverallMut.delta * deltaSeconds, 0.2, 2.5);

  const hueMut = pickMutation(obj.hue, 0, 1, model.hue);
  obj.hue = (obj.hue + hueMut.delta * deltaSeconds + 1) % 1;
}

export function updateSim(sim: Sim, deltaSeconds: number) {
  for (let obj of sim.objs) {
    mutateObj(obj, sim.markovModel, deltaSeconds);
  }
}