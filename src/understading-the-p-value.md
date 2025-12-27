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
y: {
  grid: true, 
  label: "Count"},
x: {
  domain: ["1", "2", "3", "4", "5", "6"],
  label: "Face"},
marks: [
  Plot.barY(flatCounts, {x: "face", y: "count", fill: "steelblue"}),
  Plot.ruleY([rolls / 6], {stroke: "red", strokeDasharray: "4", strokeWidth: 2, title: "Expected (Fair)"})]})
```

The red line shows the expected count for a perfectly fair die (${tex`\frac{N}{6}`}).
As you increase ${tex`N`}, the actual counts should cluster more closely around this line relative to the total size.

## Is the Die Rigged?

Now, suppose we suspect the die is **rigged** to show a specific number (say, **6**) more often than it should.

How many times do we need to see a "6" in ${tex`N`} rolls to be confident it's not just luck?

This is where the **P-Value** comes in. The P-Value is the probability of seeing a result as extreme as (or more extreme than) what we observed, assuming the die is fair (the **Null Hypothesis**, denoted as ${tex`H_0`}).

If this probability is very low (typically below a threshold, denoted as ${tex`\alpha`}, like `0.05` or 5%), we reject the **Null Hypothesis** and conclude the die is **likely rigged**.

### Calculator

Enter your criteria below to find the **tipping point**.
The tipping point is more likely, your confidence in the die being rigged is higher.  

1.  **Significance Level (${tex`\alpha`}):** The probability threshold for rejecting the **Null Hypothesis** when it's actually true (false positive rate). Commonly ${tex`\alpha`} = 0.05 (5%) or 0.01 (1%).
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

## The Math Behind the Calculator

To understand how that **critical value** is calculated, let's consider the coin flip.

> If the coin is indeed fair, what is the probability of it landing on Heads in a single toss?

Since we are tossing the coin 10 times, we are looking at a **Binomial Distribution**. 
This helps us calculate the probability of getting any specific number of Heads (from 0 to 10).

To find the p-value, we don't just look at the probability of the result we got (7 Heads). We have to look at how likely it is to get a result at least as extreme as the one we observed.

> If "extreme" means straying far away from the expected average (5 Heads), which other outcomes would be considered more extreme than getting 7 Heads?

To calculate the p-value, we need the probability of the result we got (7) plus the probability of anything more extreme.

So, on the high side (lots of Heads), we care about the probability of getting 7, 8, 9, or 10 Heads.

But we also have to consider the other side. If the coin were rigged to favor Tails, we would see very few Heads.

> If 7 Heads is "2 steps" away from the average of 5, what number of Heads would be "2 steps" away on the lower side?

> 3 Heads

Since the average is 5, getting 3 Heads is just as "extreme" (2 steps away) as getting 7 Heads, just in the opposite direction.
This is what we call a two-tailed test: we care about extremes on both ends because the coin could be rigged to favor Heads **OR** Tails.
So, to find the p-value, we need to add up the probabilities of all these extreme outcomes:

1. High side: 7, 8, 9, 10 Heads
2. Low side: 3, 2, 1, 0 Heads

Because the fair coin (${tex`p=0.5$}) is symmetric, the probability of the high side is identical to the probability of the low side.
We can just calculate the probability for the high side (7, 8, 9, 10) and double it.

> Let's start with the first one. How to calculate the probability of getting exactly 7 Heads in 10 tosses?

> ${tex`\binom{10}{7} \times 0.5^7 \times 0.5^3`} ?

This accounts for the 7 Heads, but we're missing two pieces to get the full probability for exactly 7 Heads in 10 tosses.

1. **The Tails:** We tossed the coin 10 times, so if we got 7 Heads, we effectively also got 3 Tails.
We need to multiply by the probability of those tails (0.5^3).
* ${tex`0.5^7 \times 0.5^3 = 0.5^{10}`}
* This is the probability of *one specific sequence* (e.g., H H H H H H H T T T).
2. **The Arrangements:** The Heads don't have to appear first. They could be mixed in (e.g., H T H T H H H H T H). We need to count how many different "shuffles" or ways there are to get 7 heads out of 10.

Since we have 10 tosses and want to choose which 7 of them are Heads, we need to calculate ${tex`\binom{10}{7}`}.
The formula is: 

> ${tex`C_n^k=\binom{n}{k} = \frac{n!}{k!(n-k)!}`}

We calculate the number of combinations for 8, 9, and 10 Heads, i.e.:

1. ${tex`\binom{10}{8}`}
2. ${tex`\binom{10}{9}`}
3. ${tex`\binom{10}{10}`}

So, let's tally up all the ways to get a result **at least as extreme as 7 Heads** on the high side:

* **7 Heads:** 120 ways
* **8 Heads:** 45 ways
* **9 Heads:** 10 ways
* **10 Heads:** 1 way

If you add those together (${tex`120 + 45 + 10 + 1`}), you get **176** ways.

To turn this count into a probability, we need to divide it by the **total number of possible outcomes** for 10 coin tosses.

> If each toss has 2 possibilities (Heads or Tails), how many total combinations are there for 10 tosses?

Since there are 2 possibilities for each of the 10 tosses, we calculate ${tex`2^{10}`}, which is ${tex`1024`}. 

So, here is the situation:

* **Total possible outcomes:** 1024
* **Outcomes as extreme as ours (or more):** 176 (we calculated this by adding up the ways to get 7, 8, 9, 10, 3, 2, 1, and 0 Heads).

To find the **p-value**, we just divide the number of specific outcomes by the total number of possible outcomes.

${tex`\frac{176}{1024} \approx 0.1719`}.

That is correct. The p-value is approximately **0.172** (or 17.2%).

Here is what that number tells us: If you had a perfectly fair coin and repeated this 10-toss experiment many times, you would see a result this extreme (or more extreme) about **17.2% of the time** just by pure luck.

In statistics, we need a standard to decide if an event is "rare enough" to reject our assumption that the coin is fair.
This standard is called the **Significance Level** (symbol: ${tex`\alpha`}), and it is commonly set at **0.05** (5%).

* If the p-value is **less than  ${tex`\alpha`}**, the event is so rare that we reject the Null Hypothesis (we say the coin is rigged).
* If the p-value is **greater than ${tex`\alpha`}**, the event could easily happen by chance, so we keep the Null Hypothesis (we assume the coin is fair).

### Final Formula

Assuming we observed more heads than average (so ${tex`k > \frac{n}{2}`}), the formula for the two-tailed p-value is:

```tex
\text{p-value} = 2 \times \sum_{i=k}^{n} \binom{n}{i} 0.5^n
```

This literally translates to: 

> Calculate the probability for ${tex`i`} heads, where ${tex`i`} starts at your result ${tex`k`} and goes up to ${tex`n`}. Add them all up. Then double it.
