import { StringPipe } from './string.pipe';

describe('StringPipe', () => {
  it('create an instance', () => {
    const pipe = new StringPipe();
    expect(pipe).toBeTruthy();
  });
});
