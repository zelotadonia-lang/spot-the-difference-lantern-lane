// A small seeded generator (mulberry32). Every scene paints from a fixed seed,
// so a level looks the same on every load and every screenshot is repeatable.
export function mulberry32(seed) {
  let state = seed >>> 0;
  return function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

// Pick one item from a list with the seeded generator.
export function pick(rng, list) {
  return list[Math.floor(rng() * list.length)];
}

// A number between low and high, from the seeded generator.
export function range(rng, low, high) {
  return low + rng() * (high - low);
}
