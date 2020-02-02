import { PitchClassNamePipe } from './pitch-class-name.pipe';

describe('PitchClassNamePipe', () => {
  it('create an instance', () => {
    const pipe = new PitchClassNamePipe();
    expect(pipe).toBeTruthy();
  });

  it('should return false for both class names in null passed', () => {
    const pipe = new PitchClassNamePipe();
    expect(pipe.transform(null)).toEqual({
      accurate: false,
      inaccurate: false
    });
  });

  it('should return true for accurate cents', () => {
    const pipe = new PitchClassNamePipe();
    expect(pipe.transform(3)).toEqual({
      accurate: true,
      inaccurate: false
    });
  });

  it('should return true for inaccurate cents', () => {
    const pipe = new PitchClassNamePipe();
    expect(pipe.transform(10)).toEqual({
      accurate: false,
      inaccurate: true
    });
  });

  it('should return true for accurate negative cents', () => {
    const pipe = new PitchClassNamePipe();
    expect(pipe.transform(-2)).toEqual({
      accurate: true,
      inaccurate: false
    });
  });

  it('should return true for inaccurate negative cents', () => {
    const pipe = new PitchClassNamePipe();
    expect(pipe.transform(-33)).toEqual({
      accurate: false,
      inaccurate: true
    });
  });
});
