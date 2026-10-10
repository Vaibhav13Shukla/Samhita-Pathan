import { IAksharaTokenizer } from "./types";

export class SanskritAksharaTokenizer implements IAksharaTokenizer {
  // Devanagari phoneme ranges
  private static readonly CONSONANT = "[\u0915-\u0939\u0958-\u095F]";
  private static readonly VIRAMA = "\u094D";
  private static readonly VOWEL_INDEPENDENT = "[\u0904-\u0914\u0960\u0961\u0972-\u0977]";
  private static readonly VOWEL_DEPENDENT = "[\u093E-\u094C\u0943\u0944\u0962\u0963\u094F]";
  private static readonly MODIFIERS = "[\u0901-\u0903\u093C]";

  private static readonly AKSHARA_REGEX = new RegExp(
    `(${SanskritAksharaTokenizer.CONSONANT}${SanskritAksharaTokenizer.VIRAMA})*` +
    `${SanskritAksharaTokenizer.CONSONANT}` +
    `(${SanskritAksharaTokenizer.VOWEL_DEPENDENT})?` +
    `(${SanskritAksharaTokenizer.MODIFIERS})?` +
    `|` +
    `${SanskritAksharaTokenizer.VOWEL_INDEPENDENT}` +
    `(${SanskritAksharaTokenizer.MODIFIERS})?`,
    "g"
  );

  /**
   * Deconstructs a Sanskrit string into authentic phonological syllables (Aksharas).
   */
  public tokenize(text: string): string[] {
    if (!text) return [];
    const normalized = text.normalize("NFC");
    const matches = normalized.match(SanskritAksharaTokenizer.AKSHARA_REGEX);
    return matches ? matches.filter((item) => item.trim().length > 0) : [];
  }

  /**
   * Splits a classical verse into its four standard metrical quarters (Pādas).
   */
  public splitPadas(verse: string): string[] {
    if (!verse) return [];
    // Split by danda, newlines, or semicolons
    const rawParts = verse
      .split(/[।॥\n;]/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    if (rawParts.length >= 2) {
      return rawParts;
    }

    // Fallback: split by space/words if single long line
    const words = verse.trim().split(/\s+/);
    if (words.length <= 2) return [verse.trim()];
    const mid = Math.ceil(words.length / 2);
    return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
  }
}

export const defaultTokenizer = new SanskritAksharaTokenizer();
