export interface FadeInOptions {
  target: GainNode;
  dest?: AudioNode;
  time: number;
  value?: number;
}

export function clamp(min, max, value) {
  return Math.min(Math.max(value, min), max);
}

export function connectNodes(nodes: AudioNode[]) {
  for (let i = nodes.length - 1; i > 0; --i) {
    nodes[i - 1].connect(nodes[i]);
  }
}

export function gainFadeInConnect(options: FadeInOptions) {
  const value = options.value || options.target.gain.value;
  options.target.gain.value = 0;

  if (options.dest) {
    options.target.connect(options.dest);
  }

  options.target.gain.setTargetAtTime(value, options.time, 0.01);
}

