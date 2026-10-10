import { defaultNormalizer } from "./normalizer";
import { defaultTokenizer } from "./tokenizer";
import { AksharaAlignment, AksharaStatus, IRecitationVerifier, VerificationResult } from "./types";

export class SanskritRecitationVerifier implements IRecitationVerifier {
  constructor(
    private readonly normalizer = defaultNormalizer,
    private readonly tokenizer = defaultTokenizer
  ) {}

  /**
   * Aligns candidate recitation against canonical reference text at the akshara level.
   * Tolerant of sandhi spacing conventions and minor phonetic variations.
   */
  public verify(reference: string, candidate: string): VerificationResult {
    const cleanRef = this.normalizer.normalize(reference);
    const cleanCand = this.normalizer.normalize(candidate);

    const refAksharas = this.tokenizer.tokenize(cleanRef);
    const candAksharas = this.tokenizer.tokenize(cleanCand);

    if (refAksharas.length === 0) {
      return {
        score: 0,
        sandhiNormalizedScore: 0,
        aksharaAlignments: [],
        summary: "No reference syllables found for evaluation.",
        strengths: [],
        improvements: ["Select a valid shloka to begin practice."],
      };
    }

    if (candAksharas.length === 0) {
      return {
        score: 0,
        sandhiNormalizedScore: 0,
        aksharaAlignments: refAksharas.map((akshara) => ({
          akshara,
          status: "unclear",
          note: "Not clearly audible in recording",
        })),
        summary: "Recording did not capture clearly audible Sanskrit recitation.",
        strengths: [],
        improvements: [
          "Check microphone placement and volume.",
          "Recite with steady vocal projection in a quiet room.",
        ],
      };
    }

    // Dynamic programming alignment at the akshara level
    const alignments: AksharaAlignment[] = [];
    let matchedCount = 0;
    let acceptableCount = 0;

    let candIdx = 0;
    for (let i = 0; i < refAksharas.length; i++) {
      const refAk = refAksharas[i];

      // Look ahead up to 3 positions in candidate to handle slight timing/pauses
      let bestMatchIdx = -1;
      let bestStatus: AksharaStatus = "needs-attention";

      for (let j = candIdx; j < Math.min(candIdx + 4, candAksharas.length); j++) {
        const candAk = candAksharas[j];
        if (this.isExactMatch(refAk, candAk)) {
          bestMatchIdx = j;
          bestStatus = "accurate";
          break;
        } else if (this.isPhoneticVariant(refAk, candAk)) {
          bestMatchIdx = j;
          bestStatus = "acceptable";
          break;
        }
      }

      if (bestMatchIdx !== -1) {
        candIdx = bestMatchIdx + 1;
        if (bestStatus === "accurate") matchedCount++;
        else acceptableCount++;

        alignments.push({
          akshara: refAk,
          status: bestStatus,
          note: bestStatus === "acceptable" ? "Good pronunciation variant" : undefined,
        });
      } else {
        // If candidate is past or finished, mark needs-attention or unclear
        alignments.push({
          akshara: refAk,
          status: candIdx >= candAksharas.length ? "unclear" : "needs-attention",
          note: candIdx >= candAksharas.length ? "Audible completion paused here" : "Review syllable clarity",
        });
      }
    }

    const totalAksharas = refAksharas.length;
    const rawRatio = (matchedCount + acceptableCount * 0.85) / totalAksharas;
    const score = Math.round(Math.min(100, Math.max(0, rawRatio * 100)));

    // Sandhi-normalized score (pure character coverage without spacing penalty)
    const strippedRef = this.normalizer.stripPunctuation(reference);
    const strippedCand = this.normalizer.stripPunctuation(candidate);
    const sandhiNormalizedScore = this.computeCoverageScore(strippedRef, strippedCand);

    const strengths: string[] = [];
    const improvements: string[] = [];

    if (score >= 85) {
      strengths.push("Excellent metrical cadence and consonant conjunct clarity");
      strengths.push("Steady pada boundary pacing");
    } else if (score >= 65) {
      strengths.push("Clear vocal projection on primary vowels");
      strengths.push("Good initial pada momentum");
      improvements.push("Ensure full duration on terminal virama syllables");
    } else {
      improvements.push("Pause briefly between padas to let breath reset");
      improvements.push("Articulate conjunct consonants (samyuktākṣara) deliberately");
    }

    const summary =
      score >= 85
        ? "Fluent, metrically-aware recitation with strong phonological fidelity."
        : score >= 65
        ? "Promising recitation with recognizable meter; focus on crisp conjunct endings."
        : "Initial practice attempt logged. Work pada-by-pada before combining the full shloka.";

    return {
      score,
      sandhiNormalizedScore,
      aksharaAlignments: alignments,
      summary,
      strengths,
      improvements,
    };
  }

  private isExactMatch(a: string, b: string): boolean {
    return a.trim() === b.trim();
  }

  /**
   * Recognizes acceptable phonetic and orthographic variants in Sanskrit
   * (e.g. anusvara vs homorganic nasal: अं vs अम्, or long vs short matra variance).
   */
  private isPhoneticVariant(ref: string, cand: string): boolean {
    const a = ref.replace(/[\u0902\u0903]/g, "");
    const b = cand.replace(/[\u0902\u0903]/g, "");
    if (a === b) return true;

    // Check base consonant equality
    const baseA = ref.replace(/[\u093E-\u094C\u0943\u0944\u0962\u0963]/g, "");
    const baseB = cand.replace(/[\u093E-\u094C\u0943\u0944\u0962\u0963]/g, "");
    return baseA === baseB && baseA.length > 0;
  }

  private computeCoverageScore(ref: string, cand: string): number {
    if (!ref.length && !cand.length) return 100;
    if (!ref.length || !cand.length) return 0;

    const m = ref.length;
    const n = cand.length;
    const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (ref[i - 1] === cand[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
        }
      }
    }

    const editDistance = dp[m][n];
    const maxLen = Math.max(m, n);
    const similarity = Math.max(0, 1 - editDistance / maxLen);
    return Math.round(similarity * 100);
  }
}

export const defaultVerifier = new SanskritRecitationVerifier();
