import { clamp, mapToMinMax, percentFromMinMax } from './utils';

describe('clamp', () => {
  it('should correctly clamp value to positive range', () => {
    expect(clamp(0, 1, 1.5)).toBe(1);
    expect(clamp(0, 1, 0.5)).toBe(0.5);
  });

  it('should correctly clamp value to negative range', () => {
    expect(clamp(-50, -10, -5)).toBe(-10);
    expect(clamp(-50, -10, -25)).toBe(-25);
  });

  it('should correctly clamp value to mixed range', () => {
    expect(clamp(-5, 5, 10)).toBe(5);
    expect(clamp(-5, 5, 0)).toBe(0);
  });
});

describe('mapToMinMax', () => {
  it('should correctly map value to positive range', () => {
    expect(mapToMinMax(0.1, 0, 10)).toBe(1);
    expect(mapToMinMax(0, 0, 10)).toBe(0);
  });

  it('should correctly map value to negative range', () => {
    expect(mapToMinMax(0.5, -50, -10)).toBe(-30);
    expect(mapToMinMax(0.2, -50, -10)).toBe(-42);
  });

  it('should correctly map value to mixed range', () => {
    expect(mapToMinMax(0.3, -5, 5)).toBe(-2);
    expect(mapToMinMax(1, -5, 5)).toBe(5);
  });
});

describe('percentFromMinMax', () => {
  it('should correctly give percentage for positive range', () => {
    expect(percentFromMinMax(0.1, 0, 10)).toBe(0.01);
    expect(percentFromMinMax(0, 0, 10)).toBe(0);
  });

  it('should correctly give percentage for negative range', () => {
    expect(percentFromMinMax(-15, -50, -10)).toBe(0.875);
    expect(percentFromMinMax(-45, -50, -10)).toBe(0.125);
  });

  it('should correctly give percentage for mixed range', () => {
    expect(percentFromMinMax(0.3, -5, 5)).toBe(0.53);
    expect(percentFromMinMax(1, -5, 5)).toBe(0.6);
  });
});
