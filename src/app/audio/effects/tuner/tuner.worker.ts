/// <reference lib="webworker" />

import { notes } from './notes';
import { TunerRequestMessage, TunerResponse } from './tuner.interface';

/**
 * Returns closes fundamental frequency using autocorrelation.
 * https://en.wikipedia.org/wiki/Autocorrelation
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

function findClosestNote(freq: number) {
  // Use binary search to find the closest note
  let low = 0;
  let high = notes.length - 1;

  while (high - low > 1) {
    const pivot = Math.round((low + high) / 2);
    if (notes[pivot].frequency <= freq) {
      low = pivot;
    } else {
      high = pivot;
    }
  }

  if (
    Math.abs(notes[high].frequency - freq) <=
    Math.abs(notes[low].frequency - freq)
  ) {
    // notes[high] is closer to the frequency we found
    return notes[high];
  }

  return notes[low];
}

function findCentsOffPitch(freq: number, refFreq: number) {
  // We need to find how far freq is from baseFreq in cents
  const multiplicativeFactor = freq / refFreq;

  // We use Math.floor to get the integer part and ignore decimals
  return Math.floor(1200 * (Math.log(multiplicativeFactor) / Math.LN2));
}

addEventListener('message', ({ data }: TunerRequestMessage) => {
  const fundamentalFreq = findFundamentalFreq(data.buffer, data.sampleRate);
  const response: TunerResponse = {
    note: null,
    cents: null
  };

  if (fundamentalFreq !== -1) {
    const note = findClosestNote(fundamentalFreq);
    response.note = note;
    response.cents = findCentsOffPitch(fundamentalFreq, note.frequency);
  }

  postMessage(response);
});
