// Based on https://beis.de/Elektronik/Filter/AnaDigFilt/1stOrderDigFilt.html

export interface IIRCoefficients {
  feedforward: number[];
  feedback: number[];
}

/**
 * Creates one-pole low pass IIR filter coefficients for cut-off frequency.
 */
export function onePoleLowpass(frequency: number, sampleRate: number): IIRCoefficients {
  const t = 1 / (2 * Math.PI * frequency);
  const a0 = 1 / (t * sampleRate);
  const b1 = a0 - 1;

  return {
    feedforward: [a0, 0],
    feedback: [1, b1]
  };
}

/**
 * Creates one-pole high pass IIR filter coefficients for cut-off frequency.
 */
export function onePoleHighpass(frequency: number, sampleRate: number): IIRCoefficients {
  const t = 1 / (2 * Math.PI * frequency);
  const b1 = 1 / (t * sampleRate) - 1;

  return {
    feedforward: [1, -1],
    feedback: [1, b1]
  };
}
