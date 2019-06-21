export const curves = {
  blues(amount: number, curve: Float32Array, n: number) {
    const k = amount * 10;

    for (let i = 0, x: number; i <= n; ++i) {
      x = i * 2 / n - 1;
      curve[i] = Math.tanh(0.5 * k * k * x * Math.PI);
    }
  },
  sunshine(amount: number, curve: Float32Array, n: number) {
    const k = amount * 10;

    for (let i = 0, x, y: number; i <= n; ++i) {
      x = i * 2 / n - 1;
      y = Math.tanh(0.5 * x * k * Math.PI);
      curve[i] =  Math.tanh(0.5 * y * k * Math.PI) * Math.cos(0.5 * y);
    }
  },
  // A nonlinearity by Partice Tarrabia and Bram de Jong.
  driver(amount: number, curve: Float32Array, n: number) {
    amount = Math.min(amount, 0.9);
    const k = 2 * amount / (1 - amount);

    for (let i = 0, x; i < n; ++i) {
      x = i * 2 / n - 1;
      curve[i] =  (1 + k) * x / (1 + k * Math.abs(x));
    }
  },
  sustained(amount: number, curve: Float32Array, n: number) {
    const k = 1 - amount;

    for (let i = 0, x, y; i < n; ++i) {
      x = i * 2 / n - 1;
      y = x < 0 ? - Math.pow(Math.abs(x), k + 0.04) : Math.pow(x, k);
      curve[i] = Math.tanh(y * 2);
    }
  },
  // Arctangent nonlinearity.
  arch(amount: number, curve: Float32Array, n: number) {
    for (let i = 0, x; i < n; ++i) {
      x = i * 2 / n - 1;
      curve[i] = (2 / Math.PI) * Math.atan(amount * x);
    }
  },
  // A cubic nonlinearity, input range: [-1, 1]
  cubic(amount: number, curve: Float32Array, n: number) {
    for (let i = 0, x; i < n; ++i) {
      x = i * 2 / n - 1;
      curve[i] = 1.5 * x - 0.5 * Math.pow(x, 3);
    }
  },
  // A nonlinearity by Jon Watte.
  jonny(amount: number, curve: Float32Array, n: number) {
    const z = Math.PI * amount;
    const s = 1 / Math.sin(z);
    const b = 1 / amount;

    for (let i = 0, x; i < n; ++i) {
      x = i * 2 / n - 1;

      if (x > b) {
        curve[i] = 1;
      } else {
        curve[i] = Math.sin(z * x) * s;
      }
    }
  }
};

export type CurveType = 'blues' | 'sunshine' | 'driver' | 'sustained';
