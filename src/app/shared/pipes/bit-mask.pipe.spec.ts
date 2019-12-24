import { BitMaskPipe } from './bit-mask.pipe';

describe('BitMaskPipe', () => {
  it('create an instance', () => {
    const pipe = new BitMaskPipe();
    expect(pipe).toBeTruthy();
  });

  it('should return false for null and undefined', () => {
    const pipe = new BitMaskPipe();
    expect(pipe.transform(null, null)).toBeFalsy();
    expect(pipe.transform(undefined, null)).toBeFalsy();
  });

  it('should return true if bit is set', () => {
    const pipe = new BitMaskPipe();
    expect(pipe.transform(0b10101, 0b00100)).toBeTruthy();
    expect(pipe.transform(0b00111011, 0b00000010)).toBeTruthy();
  });

  it('should return false if bit is not set', () => {
    const pipe = new BitMaskPipe();
    expect(pipe.transform(0b10101, 0b01000)).toBeFalsy();
    expect(pipe.transform(0b00111011, 0b00000100)).toBeFalsy();
  });
});
