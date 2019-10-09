import { ValueLabelPipe } from './value-label.pipe';

describe('ValueLabelPipe', () => {
  it('create an instance', () => {
    const pipe = new ValueLabelPipe();
    expect(pipe).toBeTruthy();
  });

  it('should transform value without units and sign', () => {
    const pipe = new ValueLabelPipe();
    expect(pipe.transform(15)).toBe('15');
  });

  it('should transform value with units', () => {
    const pipe = new ValueLabelPipe();
    expect(pipe.transform(12, 'dB')).toBe('12 dB');
    expect(pipe.transform(-8, 'dB')).toBe('-8 dB');
  });

  it('should transform value with units and sign', () => {
    const pipe = new ValueLabelPipe();
    expect(pipe.transform(-33, 'deg', true)).toBe('-33 deg');
    expect(pipe.transform(21, 'dB', true)).toBe('+21 dB');
  });

  it('should transform value with sign', () => {
    const pipe = new ValueLabelPipe();
    expect(pipe.transform(11, null, true)).toBe('+11');
    expect(pipe.transform(0, null, true)).toBe('0');
    expect(pipe.transform(-2, null, true)).toBe('-2');
  });
});
