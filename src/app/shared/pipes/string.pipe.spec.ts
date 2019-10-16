import { StringPipe } from './string.pipe';

describe('StringPipe', () => {
  it('create an instance', () => {
    const pipe = new StringPipe();
    expect(pipe).toBeTruthy();
  });

  it('should transform numeric value to string', () => {
    const pipe = new StringPipe();
    expect(pipe.transform(4)).toBe('4');
  });

  it('should transform float value to string', () => {
    const pipe = new StringPipe();
    expect(pipe.transform(0.3)).toBe('0.3');
  });
});
