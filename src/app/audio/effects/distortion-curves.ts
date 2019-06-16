export const curves = {
  classic(amount: number, curve: Float32Array, n: number) {
    const k = amount * 150 + 50;

    for (let i = 0, x: number; i <= n; ++i) {
      x = i * 2 / n - 1;

      curve[i] = (Math.PI + k) * x / (Math.PI + k * Math.abs(x));
    }
  },
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
      y = Math.tanh(Math.PI * x * k * 0.5);
      curve[i] =  Math.tanh(Math.PI * y * k * 0.5) * Math.cos(0.5 * y);
    }
  },
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
  chebyshev(amount: number, curve: Float32Array, n: number) {
    const k = amount * 100;

    for (let i = 0, x; i < n; ++i) {
      x = i * 2 / n - 1;

      if (x === 0) {
        // should output 0 when input is 0.
        curve[i] = 0;
      } else {
        curve[i] = _getCoefficient(x, k);
      }
    }
  }
};

function _getCoefficient(x: number, degree: number, memo = {}) {
  if (degree in memo) {
    return memo[degree];
  } else if (degree === 0) {
    memo[degree] = 0;
  } else if (degree === 1) {
    memo[degree] = x;
  } else {
    memo[degree] = 2 * x * _getCoefficient(x, degree - 1, memo) - _getCoefficient(x, degree - 2, memo);
  }

  return memo[degree];
}

export type CurveType = 'classic' | 'blues' | 'sunshine' | 'driver' |
  'sustained' | 'chebyshev';
