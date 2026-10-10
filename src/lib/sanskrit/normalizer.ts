import { ITextNormalizer } from "./types";

export class SanskritNormalizer implements ITextNormalizer {
  private static readonly DANDA_REGEX = /[।॥]/g;
  private static readonly VEDIC_ACCENTS_REGEX = /[\u0951\u0952\u0953\u0954]/g;
  private static readonly AVAGRAHA_REGEX = /ऽ/g;
  private static readonly PUNCTUATION_REGEX = /[.,\/#!$%\^&\*;:{}=\-_`~()?"'—–]/g;
  private static readonly DIGITS_REGEX = /[0-9\u0966-\u096F]/g;
  private static readonly MULTI_SPACE_REGEX = /\s+/g;

  /**
   * Normalizes Sanskrit text to Unicode NFC and cleans irrelevant metrical and layout artifacts.
   */
  public normalize(text: string): string {
    if (!text) return "";
    return text
      .normalize("NFC")
      .replace(SanskritNormalizer.VEDIC_ACCENTS_REGEX, "")
      .replace(SanskritNormalizer.DANDA_REGEX, " ")
      .replace(SanskritNormalizer.AVAGRAHA_REGEX, "")
      .replace(SanskritNormalizer.PUNCTUATION_REGEX, "")
      .replace(SanskritNormalizer.DIGITS_REGEX, "")
      .replace(SanskritNormalizer.MULTI_SPACE_REGEX, " ")
      .trim();
  }

  /**
   * Strips all spacing and punctuation for boundary-agnostic sandhi evaluation.
   */
  public stripPunctuation(text: string): string {
    return this.normalize(text).replace(/\s+/g, "");
  }
}

export const defaultNormalizer = new SanskritNormalizer();
