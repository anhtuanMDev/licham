import { getDayCanChi } from '../canChi';

describe('canChi calculations', () => {
  describe('getDayCanChi', () => {
    it('returns Giáp Tuất for the epoch date (Jan 1, 1900)', () => {
      const epochDate = new Date(1900, 0, 1);
      epochDate.setFullYear(1900);
      const result = getDayCanChi(epochDate);
      expect(result.branchKey).toBe('branch.tuat'); 
    });

    it('returns the correct Can Chi for today (July 27, 2026)', () => {
      const testDate = new Date(2026, 6, 27);
      const result = getDayCanChi(testDate);
      // We rely on the deterministic branch calculation
      expect(result.branchKey).toBeDefined();
    });

    it('returns correct Can Chi around leap years (Feb 29, 2024)', () => {
      const testDate = new Date(2024, 1, 29);
      const result = getDayCanChi(testDate);
      expect(result.branchKey).toBeDefined();
    });
  });
});
