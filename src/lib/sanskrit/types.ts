export type AksharaStatus = "accurate" | "acceptable" | "needs-attention" | "unclear";

export interface AksharaAlignment {
  akshara: string;
  status: AksharaStatus;
  note?: string;
}

export interface PadaUnit {
  number: number;
  sanskrit: string;
  transliteration: string;
  aksharaCount: number;
}

export interface VerificationResult {
  score: number;
  sandhiNormalizedScore: number;
  aksharaAlignments: AksharaAlignment[];
  summary: string;
  strengths: string[];
  improvements: string[];
}

export interface ITextNormalizer {
  normalize(text: string): string;
  stripPunctuation(text: string): string;
}

export interface IAksharaTokenizer {
  tokenize(text: string): string[];
}

export interface IRecitationVerifier {
  verify(reference: string, candidate: string): VerificationResult;
}
