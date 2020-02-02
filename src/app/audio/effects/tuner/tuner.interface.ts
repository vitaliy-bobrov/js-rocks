export interface Note {
  symbol: string;
  frequency: number | null;
  octave: number | null;
  cents: number | null;
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
}

export interface TunerResponseMessage {
  data: TunerResponse;
}
