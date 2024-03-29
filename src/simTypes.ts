import { vec3 } from 'gl-matrix';

export type Mutation = {
  kind: 'rotX',
  delta: number,
} | {
  kind: 'rotY',
  delta: number,
} | {
  kind: 'scaleX',
  delta: number,
} | {
  kind: 'scaleY',
  delta: number,
} | {
  kind: 'scaleOverall',
  delta: number,
} | {
  kind: 'hue',
  delta: number,
};

export type MarkovTable = {
  mutations: Mutation[],
  probs: number[], // Discrete non-cumulative probabilities for each mutation
}

export type MarkovModel = {
  pos: MarkovTable,
  rotX: MarkovTable,
  rotY: MarkovTable,
  scaleX: MarkovTable,
  scaleY: MarkovTable,
  scaleOverall: MarkovTable,
  hue: MarkovTable,
}

export type Obj = {
  id: string,
  pos: vec3, // TODO separate entries for oscillations
  rotX: number,
  rotY: number,
  scaleX: number,
  scaleY: number,
  scaleOverall: number,
  hue: number,
  oscilFreq: number,
  oscilAmpl: number,
  nnObj: any, // Object in Nearby nearest-neighbor map
}

export type Sim = {
  objs: Set<Obj>,
  nnMap: any, // Nearby class instance
  markovModel: MarkovModel,
}