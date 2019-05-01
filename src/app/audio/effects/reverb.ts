import { Effect } from './effect';

export class Reverb extends Effect {
  constructor(context: AudioContext, model: string) {
    super(context, model);
  }
}
