import { vec3 } from "gl-matrix";
import { MarkovModel, MarkovTable, Mutation, Obj, Sim } from "./simTypes";

let nextId = 0;

export function genUniqueId(): string {
  return `obj${nextId++}`;
}

const kNumMutations = 8;

function randSmall() { return (Math.random() - 0.5) * 0.02 }

function clamp(x: number, min: number, max: number) { return Math.max(min, Math.min(max, x)); }

function genMutation(): Mutation {
  const mutIdx = Math.floor(Math.random() * kNumMutations);
  switch (mutIdx) {
    case 0: {
      return {
        kind: 'pos',
        delta: vec3.fromValues(randSmall(), randSmall(), randSmall()),
      }
    }
    case 1: return { kind: 'rotX', delta: randSmall() };
    case 2: return { kind: 'rotY', delta: randSmall() };
    case 3: return { kind: 'scaleX', delta: randSmall() };
    case 4: return { kind: 'scaleX', delta: randSmall() };
    case 5: return { kind: 'scaleOverall', delta: randSmall() };
    case 6: return { kind: 'hue', delta: randSmall() };
    case 7: return { kind: 'lightness', delta: randSmall() };
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
    lightness: genMarkovTable(),
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