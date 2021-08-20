export type MarkovModel = number[][]; // One Markov table per property

export function normalizeMarkovTable(table: number[]) {
  let sum = 0;
  for (let i = 0; i < table.length; i++) {
    if (table[i] < 0) table[i] = 0;
    sum += table[i];
  }
  for (let i = 0; i < table.length; i++) {
    table[i] /= sum;
  }
}

export function genMarkovTable(entries: number): number[] {
  const probs: number[] = [];
  for (let i = 0; i < entries; i++) {
    const p = Math.random();
    probs.push(p);
  }
  normalizeMarkovTable(probs);

  // Increase standard deviation
  for (let i = 0; i < entries; i++) {
    probs[i] = Math.pow(probs[i], 2);
  }
  // Renormalize
  normalizeMarkovTable(probs);

  return probs;
}

export function genMarkovModel(props: number): MarkovModel {
  const model: MarkovModel = [];
  for (let i = 0; i < props; i++) {
    model.push(genMarkovTable(props));
  }
  return model;
}
