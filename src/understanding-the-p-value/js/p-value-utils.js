/**
 * Mathematical and statistical utility functions for p-value calculations.
 */

export function combinations(n, k) {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  if (k > n / 2) k = n - k;
  let res = 1;
  for (let i = 1; i <= k; i++) res = (res * (n - i + 1)) / i;
  return res;
}

export function binomialPMF(k, n, p) {
  return combinations(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
}

export function findCriticalValue(n, p, alpha) {
  const upperTailAlpha = alpha / 2;
  let probSum = 0;
  for (let k = n; k >= 0; k--) {
    probSum += binomialPMF(k, n, p);
    if (probSum > upperTailAlpha) {
      return k + 1;
    }
  }
  return n + 1; // Fallback
}

export function calculatePValue(n, k) {
  if (k < 0 || k > n) return 0;

  // Calculate probability of being at least as extreme
  // For p=0.5, the distribution is symmetric around n/2
  const expected = n / 2;
  const distance = Math.abs(k - expected);

  // High side extreme: k >= expected + distance
  // Low side extreme: k <= expected - distance
  const kHigh = Math.ceil(expected + distance);

  let probHigh = 0;
  for (let i = kHigh; i <= n; i++) {
    probHigh += binomialPMF(i, n, 0.5);
  }

  // Two-tailed p-value is 2 * probHigh (due to symmetry)
  // Cap at 1.0 (e.g. if k is exactly n/2, probHigh is > 0.5)
  return Math.min(1, 2 * probHigh);
}
