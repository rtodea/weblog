---
title: Understanding the P-Value
---

# Understanding the P-Value

Let's explore the concept of a P-Value from first principles using a simple experiment: **rolling a die**.

## The Experiment

Imagine we have a standard 6-sided die. If it is fair, each face (1 through 6) has an equal probability of appearing (${tex`p = 1/6 \approx 0.167`}).

We can simulate rolling this die ${tex`N`} times.

```js
const rollsInput = Inputs.range([10, 1000], {value: 100, step: 10, label: "Number of Rolls (N)"});
const rolls = Generators.input(rollsInput);
view(rollsInput);
```

```js
// Simulate the rolls
const data = Array.from({length: rolls}, () => Math.floor(Math.random() * 6) + 1);

// Count occurrences
const counts = d3.rollup(data, v => v.length, d => d);
const flatCounts = Array.from(counts, ([face, count]) => ({face: face.toString(), count}));
```

Here are the results of our simulation:

```js
Plot.plot({
  y: {grid: true, label: "Count"},
  x: {domain: ["1", "2", "3", "4", "5", "6"], label: "Face"},
  marks: [
    Plot.barY(flatCounts, {x: "face", y: "count", fill: "steelblue"}),
    Plot.ruleY([rolls / 6], {stroke: "red", strokeDasharray: "4", strokeWidth: 2, title: "Expected (Fair)"})
  ]
})
```

The red line shows the expected count for a perfectly fair die (${tex`N/6`}). As you increase ${tex`N`}, the actual counts should cluster more closely around this line relative to the total size.

## Is the Die Rigged?

Now, suppose we suspect the die is **rigged** to show a specific number (say, 6) more often than it should.

How many times do we need to see a "6" in ${tex`N`} rolls to be confident it's not just luck?

This is where the **P-Value** comes in. The P-Value is the probability of seeing a result as extreme as (or more extreme than) what we observed, assuming the die is fair (the Null Hypothesis).

If this probability is very low (typically below a threshold ${tex`\alpha`}, like 0.05 or 5%), we reject the Null Hypothesis and conclude the die is likely rigged.

### Calculator

Enter your criteria below to find the "tipping point".

1.  **Significance Level (${tex`\alpha`}):** The probability threshold for calling it "rigged" when it's actually fair (false positive rate). Commonly 0.05 (5%) or 0.01 (1%).
2.  **Target Face:** The number we suspect the die is biased towards.
3.  **Number of Rolls (N):** The total rolls.

```js
const alphaInput = Inputs.number([0.001, 0.5], {value: 0.05, step: 0.005, label: "Significance Level (α)"});
const alpha = Generators.input(alphaInput);
view(alphaInput);

const targetFaceInput = Inputs.select([1, 2, 3, 4, 5, 6], {value: 6, label: "Target Face"});
const targetFace = Generators.input(targetFaceInput);
view(targetFaceInput);

const nCheckInput = Inputs.number([1, 10000], {value: 100, label: "N (Rolls)"});
const nCheck = Generators.input(nCheckInput);
view(nCheckInput);
```

```js
// Binomial Probability helper functions
function combinations(n, k) {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  if (k > n / 2) k = n - k;
  let res = 1;
  for (let i = 1; i <= k; i++) res = res * (n - i + 1) / i;
  return res;
}

function binomialPMF(k, n, p) {
  return combinations(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
}

function findCriticalValue(n, p, alpha) {
  // We want smallest k such that P(X >= k) <= alpha
  // Which is 1 - P(X < k) <= alpha  => P(X < k) >= 1 - alpha
  // P(X <= k-1) >= 1 - alpha
  
  let cumulativeProb = 0;
  for (let k = 0; k <= n; k++) {
    let prob = binomialPMF(k, n, p);
    cumulativeProb += prob;
    // cumulativeProb is P(X <= k)
    // We want P(X >= k+1) which is 1 - P(X <= k)
    let pValue = 1 - cumulativeProb; 
    
    // However, let's stick to the definition: 
    // We want k such that sum(PMF(i) for i in k..n) <= alpha.
    
    // Let's compute tail sum from right to left or 1 - CDF.
    // simpler: P(X >= k) = 1 - P(X <= k-1)
    
    // If we are at k, the prob of being >= k+1 is 1 - CDF(k).
    // If 1 - CDF(k) <= alpha, then k+1 is a critical value.
    
    if (1 - cumulativeProb <= alpha) {
        return k + 1;
    }
  }
  return n + 1; // Should not happen for valid alpha
}

const pFair = 1/6;
const criticalValue = findCriticalValue(nCheck, pFair, alpha);
```

### Result

```js
display(html`
<div style="background: #f0f0f0; padding: 20px; border-radius: 8px; border-left: 5px solid #333;">
<h3>Verdict</h3>

<p>For <b>${nCheck}</b> rolls, assuming a fair die:</p>
<p>If you see the number <b>${targetFace}</b> appear <strong>${criticalValue}</strong> times or more,</p>
<p>We can say it is <b>rigged</b> with a p-value ${alpha}.</p>
<hr/>
<p><small>Expected count for fair die: 
${(nCheck/6).toFixed(1)}</small></p>
</div>
`);
```


This means if you count the occurrences of ${targetFace}, and the count is less than ${criticalValue}, you cannot statistically claim it's rigged at the ${alpha} confidence level (you fail to reject the null hypothesis).

## The Math (Coin Flip Analogy)

To understand exactly how that "critical value" is calculated, let's switch to a simpler example: a coin flip.

Assuming we observed more heads than average (so ${tex`k > \frac{n}{2}`}), the formula for the two-tailed p-value is:

```tex
\text{p-value} = 2 \times \sum_{i=k}^{n} \binom{n}{i} 0.5^n
```

This literally translates to: 

> Calculate the probability for ${tex`i`} heads, where ${tex`i`} starts at your result ${tex`k`} and goes up to ${tex`n`}. Add them all up. Then double it.
