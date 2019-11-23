export const curves = {
  blues(amount: number, curve: Float32Array, n: number) {
    const k = amount * 10;

    for (let i = 0, x: number; i <= n; ++i) {
      x = (i * 2) / n - 1;
      curve[i] = Math.tanh(0.5 * k * k * x * Math.PI);
    }
  },
  sunshine(amount: number, curve: Float32Array, n: number) {
    const k = amount * 10;

    for (let i = 0, x, y: number; i <= n; ++i) {
      x = (i * 2) / n - 1;
      y = Math.tanh(0.5 * x * k * Math.PI);
      curve[i] = Math.tanh(0.5 * y * k * Math.PI) * Math.cos(0.5 * y);
    }
  },
  // A nonlinearity by Partice Tarrabia and Bram de Jong.
  driver(amount: number, curve: Float32Array, n: number) {
    const k = amount * 2000;

    for (let i = 0, x; i < n; ++i) {
      x = (i * 2) / n - 1;

      curve[i] = ((1 + k / 101) * x) / (1 + (k / 101) * Math.abs(x));
    }
  },
  sustained(amount: number, curve: Float32Array, n: number) {
    const k = 1 - amount;

    for (let i = 0, x, y; i < n; ++i) {
      x = (i * 2) / n - 1;
      y = x < 0 ? -Math.pow(Math.abs(x), k + 0.04) : Math.pow(x, k);
      curve[i] = Math.tanh(y * 2);
    }
  },
  // Arctangent nonlinearity.
  arch(amount: number, curve: Float32Array, n: number) {
    const k = Math.max(amount, 0.01) * 100;

    for (let i = 0, x; i < n; ++i) {
      x = (i * 2) / n - 1;
      curve[i] = (2 / Math.PI) * Math.atan(k * x);
    }
  },
  // A cubic nonlinearity, soft-clip, input range: [-1, 1]
  cubic(amount: number, curve: Float32Array, n: number) {
    for (let i = 0, x; i < n; ++i) {
      x = (i * 2) / n - 1;
      curve[i] = 1.5 * x - 0.5 * Math.pow(x, 3);
    }
  }
};

export type CurveType =
  | 'blues'
  | 'sunshine'
  | 'driver'
  | 'sustained'
  | 'arch'
  | 'cubic';

export function makeDistortionCurve(
  amount: number,
  n: number,
  type: CurveType
) {
  const curve = new Float32Array(n);

  curves[type](amount, curve, n);

  return curve;
}
