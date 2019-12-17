export interface Note {
  symbol: string;
  frequency: number;
  octave: number;
}

export interface TunerRequest {
  buffer: Uint8Array;
  sampleRate: number;
}

export interface TunerRequestMessage {
  data: TunerRequest;
}

export interface TunerResponse {
  note: Note | null;
  cents: number | null;
}

export interface TunerResponseMessage {
  data: TunerResponse;
}
