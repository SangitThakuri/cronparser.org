/** Given the set of matched values for a field, propose the cleanest equivalent syntax. */
export function optimizeFieldSet(set: Set<number>, min: number, max: number): string {
  const values = [...set].sort((a, b) => a - b)
  if (values.length === 0) return "*"

  if (values.length === max - min + 1) return "*"

  // Uniform step starting at min, e.g. 0,15,30,45 -> */15
  for (let step = 2; step <= max - min; step++) {
    const expected: number[] = []
    for (let v = min; v <= max; v += step) expected.push(v)
    if (expected.length === values.length && expected.every((v, i) => v === values[i])) {
      return `*/${step}`
    }
  }

  // Contiguous range, e.g. 9,10,11,12 -> 9-12
  if (values.length > 1 && values[values.length - 1] - values[0] === values.length - 1) {
    return `${values[0]}-${values[values.length - 1]}`
  }

  if (values.length === 1) return String(values[0])

  return values.join(",")
}
