import { CentsPositionPipe } from './cents-position.pipe';

describe('CentsPositionPipe', () => {
  it('create an instance', () => {
    const pipe = new CentsPositionPipe();
    expect(pipe).toBeTruthy();
  });

  it('should return zero for null value', () => {
    const pipe = new CentsPositionPipe();
    expect(pipe.transform(null)).toBe('0');
  });

  it('should return zero for zero value', () => {
    const pipe = new CentsPositionPipe();
    expect(pipe.transform(0)).toBe('0');
  });

  it('should return correct position for negative value', () => {
    const pipe = new CentsPositionPipe();
    expect(pipe.transform(-33)).toBe('-56px');
  });

  it('should return correct position for positive value', () => {
    const pipe = new CentsPositionPipe();
    expect(pipe.transform(12)).toBe('16px');
  });
});
