import { ReadonlyVec3, vec3 } from "gl-matrix";
import { stringify } from "querystring";

const kProps = 7;
const kGridSpacing = 2;

const kRotSpeeds = [-3, -2, -1, 0, 1, 2, 3];
const kScales = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75];
const kHues = [0 / 7, 1 / 7, 2 / 7, 3 / 7, 4 / 7, 5 / 7, 6 / 7, 7 / 7];
const kOscilAmpls = [0, 0.25, 0.5, 0.75, 1, 1.25, 1.5];
const kOscilFreqs = [0, 0.5, 1, 1.5, 2, 2.5, 3];
const kColorFreqs = [0, 0.5, 1, 1.5, 2, 2.5, 3];

enum Prop {
  // kRotVelX,
  kLightness,
  kRotVelY,
  kScaleX,
  kScaleY,
  kHue,
  kAmpl,
  kFreq,
}

type PropValueIdx = number;

export type Obj = {
  props: PropValueIdx[]; // One PropValueIdx per property
  currProp: Prop,
  gridPos: vec3,
  children: Obj[],
  childrenLeft: number,

  gridKey: string,
  pos: vec3,
  // rotX: number,
  colorFreq: number,
  rotY: number,
  scaleX: number,
  scaleY: number,
  hue: number,
  ampl: number,
  freq: number,
}

export type MarkovModel = number[][]; // One Markov table per property

export type SimWorld = {
  objs: Map<string, Obj>; // Map from serialized "x,y,z" cell location to object
  spawnObjs: Set<Obj>, // Set of objects that can have children spawned still
  markovModel: MarkovModel;
}

function genMarkovTable(entries: number): number[] {
  const probs: number[] = [];
  let sum = 0;
  for (let i = 0; i < entries; i++) {
    const p = Math.random();
    probs.push(p);
    sum += p;
  }
  for (let i = 0; i < entries; i++) {
    probs[i] /= sum;
  }
  return probs;
}

export function genMarkovModel(): MarkovModel {
  const model: MarkovModel = [];
  for (let i = 0; i < kProps; i++) {
    model.push(genMarkovTable(kProps));
  }
  return model;
}

function tickObj(obj: Obj, deltaSeconds: number) {
  vec3.scale(obj.pos, obj.gridPos, kGridSpacing);
  // obj.rotX += kRotSpeeds[obj.props[Prop.kRotVelX]] * deltaSeconds;
  obj.colorFreq = kColorFreqs[obj.props[Prop.kLightness]];
  obj.rotY += kRotSpeeds[obj.props[Prop.kRotVelY]] * deltaSeconds;
  obj.scaleX = kScales[obj.props[Prop.kScaleX]];
  obj.scaleY = kScales[obj.props[Prop.kScaleY]];
  obj.hue = (kHues[obj.props[Prop.kHue]] + 0.1) % 1;

  // TODO this should actually be lerping position
  obj.ampl = kOscilAmpls[obj.props[Prop.kAmpl]];
  obj.freq = kOscilFreqs[obj.props[Prop.kFreq]];
}

function createObj(props: PropValueIdx[], currProp: Prop, gridPos: vec3): Obj {
  const obj: Obj = {
    props,
    currProp,
    gridPos,
    children: [],
    childrenLeft: Math.floor(Math.random() * 4) + 2,

    /* Actual visual properties we can display */
    gridKey: `${gridPos[0]},${gridPos[1]},${gridPos[2]}`,
    pos: vec3.fromValues(0, 0, 0),
    colorFreq: 0.5,
    // rotX: 0,
    rotY: 0,
    scaleX: 1,
    scaleY: 1,
    hue: 0,
    // TODO these should be setting position
    ampl: 0,
    freq: 0,
  };

  tickObj(obj, 0);
  return obj;
}

function randSetElem<T>(s: Set<T>): T {
  let i = 0;
  const targetIdx = Math.floor(Math.random() * s.size);
  for (const e of s) {
    if (i == targetIdx) return e;
    i++;
  }
  throw new Error('Invariant violation: failed to pick random element of set');
}

const kUnitX: ReadonlyVec3 = vec3.fromValues(1, 0, 0);
const kUnitY: ReadonlyVec3 = vec3.fromValues(0, 1, 0);
const kUnitZ: ReadonlyVec3 = vec3.fromValues(0, 0, 1);

const scratchVec3a = vec3.create();
const scratchVec3b = vec3.create();
const scratchVec3c = vec3.create();
const scratchVec3d = vec3.create();
const scratchVec3e = vec3.create();

function pickMarkov(probTable: number[]): number {
  const t = Math.random();
  let cumulProb = 0;
  for (let i = 0; i < probTable.length; i++) {
    cumulProb += probTable[i];
    if (t < cumulProb) {
      return i;
    }
  }
  return probTable.length - 1;
}

function spawnChildObj(world: SimWorld) {
  // Pick object that can spawn a child
  const parent = randSetElem(world.spawnObjs);

  // Find candidate grid positions we could place candidate. Advancing in X direction
  const ahead = scratchVec3a;
  const left = scratchVec3b;
  const right = scratchVec3c;
  const up = scratchVec3d;
  const down = scratchVec3e;
  vec3.add(ahead, parent.gridPos, kUnitX);
  vec3.scaleAndAdd(left, parent.gridPos, kUnitZ, -1);
  vec3.add(right, parent.gridPos, kUnitZ);
  vec3.scaleAndAdd(down, parent.gridPos, kUnitY, -1)
  vec3.add(up, parent.gridPos, kUnitY);

  const availCells: vec3[] = [ahead, left, right, up, down].filter(cell => {
    const key = `${cell[0]},${cell[1]},${cell[2]}`;
    return !world.objs.has(key);
  });

  if (availCells.length > 0) {
    // Property to mutate of child is current value of current property of parent
    // Stochastically choose new property value of child
    const childPropToMutate: Prop = parent.props[parent.currProp];
    const childProps = parent.props.slice();
    childProps[childPropToMutate] = pickMarkov(world.markovModel[childPropToMutate]);

    // Pick a cell position and generate a child there
    const chosenCell: vec3 = availCells[Math.floor(Math.random() * availCells.length)];
    const childObj = createObj(childProps, childPropToMutate, vec3.clone(chosenCell));
    addObjToSimWorld(childObj, world);
    parent.children.push(childObj);

    // Cleanup
    parent.childrenLeft--;
    if (parent.childrenLeft == 0) {
      world.spawnObjs.delete(parent);
    }

  } else {
    // Parent object is trapped! No more spawning children for it
    parent.childrenLeft = 0;
    world.spawnObjs.delete(parent);
  }
}

function addObjToSimWorld(obj: Obj, world: SimWorld) {
  if (obj.childrenLeft > 0) {
    world.spawnObjs.add(obj);
  }
  world.objs.set(obj.gridKey, obj);
}

export function genSimWorld(markovModel: MarkovModel): SimWorld {
  const objMap: Map<string, Obj> = new Map();
  const spawnObjs: Set<Obj> = new Set();
  const world = {
    objs: objMap,
    spawnObjs: spawnObjs,
    markovModel: markovModel,
  };

  const defaultObj: Obj = createObj([3, 1, 3, 3, 0, 0, 0], Prop.kLightness, vec3.fromValues(0, 0, 0));
  addObjToSimWorld(defaultObj, world);


  // Add a crapton of objects
  for (let i = 0; i < 5000; i++) {
    spawnChildObj(world);
  }

  return world;
}

export function updateSimWorld(world: SimWorld, deltaSeconds: number) {
  for (const obj of world.objs.values()) {
    tickObj(obj, deltaSeconds);
  }
}