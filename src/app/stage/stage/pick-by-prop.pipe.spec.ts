import { PickByPropPipe } from './pick-by-prop.pipe';

describe('PickByPropPipe', () => {
  it('create an instance', () => {
    const pipe = new PickByPropPipe();
    expect(pipe).toBeTruthy();
  });

  it('should return empty data set for empty data', () => {
    const pipe = new PickByPropPipe();
    const data: string[] = [];

    expect(pipe.transform(data, 'a', true)).toHaveLength(0);
  });

  it('should return data filtered by property', () => {
    const pipe = new PickByPropPipe();
    const data = [
      { a: true, b: 'a', c: 2 },
      { a: false, b: 'd', c: 1 },
      { a: true, b: 'f', c: 2 }
    ];

    expect(pipe.transform(data, 'c', 2)).toHaveLength(2);
  });

  it('should return empty data set if no value matches found', () => {
    const pipe = new PickByPropPipe();
    const data = [
      { a: true, b: 'g', c: 3 },
      { a: false, b: 't', c: 6 },
      { a: true, b: 'f', c: 2 }
    ];

    expect(pipe.transform(data, 'b', 'w')).toHaveLength(0);
  });

  it('should return empty data set if no property matches found', () => {
    const pipe = new PickByPropPipe();
    const data = [
      { a: false, b: 't', c: 8 },
      { a: false, b: 'y', c: 9 },
      { a: true, b: 'f', c: 2 }
    ];

    expect(pipe.transform(data, 'd', 9)).toHaveLength(0);
  });
});
