import { vec3 } from 'gl-matrix';
import { Color } from 'three';

export type Obj = {
  id: string,
  rotX: number,
  rotY: number,
  scaleX: number,
  scaleY: number,
  scaleOverall: number,
  hue: number,
  lightness: number,
  oscilFreq: number,
  oscilAmpl: number,
  nnObj: any, // Object in Nearby nearest-neighbor map
}

export type Sim = {
  objs: Set<Obj>,
  nnMap: any, // Nearby class instance
}