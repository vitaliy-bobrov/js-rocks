/// <reference lib="webworker" />

import { TunerRequestMessage, TunerResponse } from './tuner.interface';

const middleA = 440;
const semitone = 69;
const noteStrings = [
  'C',
  'C♯',
  'D',
  'D♯',
  'E',
  'F',
  'F♯',
  'G',
  'G♯',
  'A',
  'A♯',
  'B'
];

/**
 * Returns closes fundamental frequency using autocorrelation.
 * https://en.wikipedia.org/wiki/Autocorrelation
 * http://www.akellyirl.com/reliable-frequency-detection-using-dsp-techniques/
 */
function findFundamentalFreq(buffer: Uint8Array, sampleRate: number) {
  const len = buffer.length;
  let sum = 0;
  let prevSum = 0;
  let state = 0;
  let period = 0;
  let thresh = 0;

  for (let i = 0; i <= len; i++) {
    prevSum = sum;
    sum = 0;

    for (let k = 0; k < len - i; k++) {
      sum += ((buffer[k] - 128) * (buffer[i + k] - 128)) / 256;
    }

    // Peak Detect State Machine
    if (state === 2 && sum - prevSum <= 0) {
      period = i;
      break;
    }

    if (state === 1 && sum > thresh && sum - prevSum > 0) {
      state = 2;
    }

    if (!i) {
      thresh = sum * 0.7;
      state = 1;
    }
  }

  // Frequency identified in kHz
  return period ? sampleRate / period : -1;
}

/**
 * Finds note index from fundamental frequency.
 */
function findNote(frequency: number) {
  const note = 12 * (Math.log(frequency / middleA) / Math.LN2);
  return Math.round(note) + semitone;
}

/**
 * Returns note standard musical frequency.
 */
function getStandardFrequency(note: number) {
  return middleA * Math.pow(2, (note - semitone) / 12);
}

/**
 * Finds cents off standard note frequency pitch.
 */
function findCentsOffPitch(freq: number, refFreq: number) {
  // We need to find how far freq is from baseFreq in cents
  const multiplicativeFactor = freq / refFreq;

  // We use Math.floor to get the integer part and ignore decimals
  return Math.floor(1200 * (Math.log(multiplicativeFactor) / Math.LN2));
}

addEventListener('message', ({ data }: TunerRequestMessage) => {
  const fundamentalFreq = findFundamentalFreq(data.buffer, data.sampleRate);
  const response: TunerResponse = {
    note: null
  };

  if (fundamentalFreq !== -1) {
    const note = findNote(fundamentalFreq);
    const symbol = noteStrings[note % 12];
    const octave = Math.floor(note / 12) - 1;
    const frequency = getStandardFrequency(note);
    const cents = findCentsOffPitch(fundamentalFreq, frequency);
    response.note = {
      symbol,
      frequency,
      octave,
      cents
    };
  }

  postMessage(response);
});
