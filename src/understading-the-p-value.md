---
title: Understanding the p-Value
---

# Understanding the ${tex`p`}-Value

Let's explore the concept of a ${tex`p`}-Value from first principles using a simple experiment: **tossing a coin**.

## The Experiment

Imagine we have a standard coin with two sides: **Heads** and **Tails**. If it is fair, each side has an equal probability of appearing (${tex`p = 0.5`}).

We can simulate tossing this coin ${tex`N`} times.

```js
const rollsInput = Inputs.range([10, 1000], {value: 100, step: 10, label: "Number of Tosses (N)"});
const rolls = Generators.input(rollsInput);
view(rollsInput);
```

```js
// Simulate the tosses (0 = Tails, 1 = Heads)
const data = Array.from({length: rolls}, () => Math.random() < 0.5 ? "Heads" : "Tails");

// Count occurrences
const counts = d3.rollup(data, v => v.length, d => d);
const flatCounts = Array.from(counts, ([face, count]) => ({face, count}));
```

Here are the results of our simulation:

```js
Plot.plot({
y: {
  grid: true, 
  label: "Count"},
x: {
  domain: ["Heads", "Tails"],
  label: "Outcome"},
marks: [
  Plot.barY(flatCounts, {x: "face", y: "count", fill: "steelblue"}),
  Plot.ruleY([rolls / 2], {stroke: "red", strokeDasharray: "4", strokeWidth: 2, title: "Expected (Fair)"})]})
```

The red line shows the expected count for a perfectly fair coin (${tex`N/2`}).
As you increase ${tex`N`}, the actual counts should cluster more closely around this line relative to the total size.

## Is the Coin Rigged?

Now, suppose we suspect the coin is **rigged** to show **Heads** more often than it should.

How many times do we need to see "Heads" in ${tex`N`} tosses to be confident it's not just luck?

This is where the **${tex`p`}-Value** comes in. The ${tex`p`}-Value is the probability of seeing a result as extreme as (or more extreme than) what we observed, assuming the coin is fair (the **Null Hypothesis**, denoted as ${tex`H_0`}).

If this probability is very low (typically below a threshold, denoted as ${tex`\alpha`}, like ${tex`0.05`} or ${tex`5`}%), we reject the **Null Hypothesis** and conclude the coin is **likely rigged**.

### Calculator

Enter your criteria below to find the **tipping point**.

1.  **Significance Level (${tex`\alpha`}):** The probability threshold for rejecting the **Null Hypothesis** when it's actually true (false positive rate). Commonly ${tex`\alpha = 0.05`} (${tex`5`}%) or ${tex`0.01`} (${tex`1`}%).
2.  **Number of Rolls (N):** The total tosses.

```js
const alphaInput = Inputs.number([0.001, 0.5], {value: 0.05, step: 0.005, label: "Significance Level (α)"});
const alpha = Generators.input(alphaInput);
view(alphaInput);

const nCheckInput = Inputs.number([1, 10000], {value: 10, label: "N (Tosses)"});
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
  
  let cumulativeProb = 0;
  for (let k = 0; k <= n; k++) {
    let prob = binomialPMF(k, n, p);
    cumulativeProb += prob;
    if (1 - cumulativeProb <= alpha) {
        return k + 1;
    }
  }
  return n + 1;
}

const pFair = 0.5;
const criticalValue = findCriticalValue(nCheck, pFair, alpha);
```

### Result

```js
display(html`
<div style="background: #f0f0f0; padding: 20px; border-radius: 8px; border-left: 5px solid #333;">
<h3>Verdict</h3>

<p>For <b>${nCheck}</b> tosses, assuming a fair coin:</p>
<p>If you see <b>Heads</b> appear <strong>${criticalValue}</strong> times or more,</p>
<p>We can say it is <b>rigged</b> with a ${tex`p`}-value < ${alpha}.</p>
<hr/>
<p><small>Expected count for fair coin: 
${(nCheck/2).toFixed(1)}</small></p>
</div>
`);
```

This means if you count the occurrences of Heads, and the count is less than ${criticalValue}, you cannot statistically claim it's rigged at the ${alpha} confidence level (you fail to reject the **Null Hypothesis**).

## The Math Behind the Calculator

To understand how that **critical value** is calculated, let's consider the coin flip.

> If the coin is indeed fair, what is the probability of it landing on Heads in a single toss?

Since we are tossing the coin ${tex`${nCheck}`} times, we are looking at a **Binomial Distribution**. 
This helps us calculate the probability of getting any specific number of Heads (from ${tex`0`} to ${tex`${nCheck}`}).

To find the ${tex`p`}-value, we don't just look at the probability of the result we got (${tex`${criticalValue}`} Heads). We have to look at how likely it is to get a result at least as extreme as the one we observed.

> If "extreme" means straying far away from the expected average (${tex`${nCheck / 2}`} Heads), which other outcomes would be considered more extreme than getting ${tex`${criticalValue}`} Heads?

To calculate the ${tex`p`}-value, we need the probability of the result we got (${tex`${criticalValue}`}) plus the probability of anything more extreme.

So, on the high side (lots of Heads), we care about the probability of getting ${tex`7`}, ${tex`8`}, ${tex`9`}, or ${tex`10`} Heads.

But we also have to consider the other side. If the coin were rigged to favor Tails, we would see very few Heads.

> If ${tex`7`} Heads is "${tex`2`} steps" away from the average of ${tex`5`}, what number of Heads would be "${tex`2`} steps" away on the lower side?

> ${tex`3`} Heads

Since the average is ${tex`5`}, getting ${tex`3`} Heads is just as "extreme" (${tex`2`} steps away) as getting ${tex`7`} Heads, just in the opposite direction.
This is what we call a two-tailed test: we care about extremes on both ends because the coin could be rigged to favor Heads **OR** Tails.
So, to find the ${tex`p`}-value, we need to add up the probabilities of all these extreme outcomes:

1. High side: ${tex`7`}, ${tex`8`}, ${tex`9`}, ${tex`10`} Heads
2. Low side: ${tex`3`}, ${tex`2`}, ${tex`1`}, ${tex`0`} Heads

Because the fair coin (${tex`p=0.5`}) is symmetric, the probability of the high side is identical to the probability of the low side.
We can just calculate the probability for the high side (${tex`7`}, ${tex`8`}, ${tex`9`}, ${tex`10`}) and double it.

> Let's start with the first one. How to calculate the probability of getting exactly ${tex`7`} Heads in ${tex`10`} tosses?

> ${tex`\binom{10}{7} \times 0.5^7 \times 0.5^3`} ?

This accounts for the ${tex`7`} Heads, but we're missing two pieces to get the full probability for exactly ${tex`7`} Heads in ${tex`10`} tosses.

1. **The Tails:** We tossed the coin ${tex`10`} times, so if we got ${tex`7`} Heads, we effectively also got ${tex`3`} Tails.
We need to multiply by the probability of those tails (0.5^3).
* ${tex`0.5^7 \times 0.5^3 = 0.5^{10}`}
* This is the probability of *one specific sequence* (e.g., H H H H H H H T T T).
2. **The Arrangements:** The Heads don't have to appear first. They could be mixed in (e.g., H T H T H H H H T H). We need to count how many different "shuffles" or ways there are to get ${tex`7`} heads out of ${tex`10`}.

Since we have ${tex`10`} tosses and want to choose which ${tex`7`} of them are Heads, we need to calculate ${tex`\binom{10}{7}`}.
The formula is: 

> ${tex`C_n^k=\binom{n}{k} = \frac{n!}{k!(n-k)!}`}

We calculate the number of combinations for ${tex`8`}, ${tex`9`}, and ${tex`10`} Heads, i.e.:

1. ${tex`\binom{10}{8}`}
2. ${tex`\binom{10}{9}`}
3. ${tex`\binom{10}{10}`}

So, let's tally up all the ways to get a result **at least as extreme as ${tex`7`} Heads** on the high side:

* **${tex`7`} Heads:** ${tex`120`} ways
* **${tex`8`} Heads:** ${tex`45`} ways
* **${tex`9`} Heads:** ${tex`10`} ways
* **${tex`10`} Heads:** ${tex`1`} way

If you add those together (${tex`120 + 45 + 10 + 1`}), you get **${tex`176`}** ways.

To turn this count into a probability, we need to divide it by the **total number of possible outcomes** for ${tex`10`} coin tosses.

> If each toss has ${tex`2`} possibilities (Heads or Tails), how many total combinations are there for ${tex`10`} tosses?

Since there are ${tex`2`} possibilities for each of the ${tex`10`} tosses, we calculate ${tex`2^{10}`}, which is ${tex`1024`}. 

So, here is the situation:

* **Total possible outcomes:** ${tex`1024`}
* **Outcomes as extreme as ours (or more):** ${tex`176`} (we calculated this by adding up the ways to get ${tex`7`}, ${tex`8`}, ${tex`9`}, ${tex`10`}, ${tex`3`}, ${tex`2`}, ${tex`1`}, and ${tex`0`} Heads).

To find the **${tex`p`}-value**, we just divide the number of specific outcomes by the total number of possible outcomes.

${tex`\frac{176}{1024} \approx 0.1719`}.

That is correct. The ${tex`p`}-value is approximately **${tex`0.172`}** (or ${tex`17.2`}%).

Here is what that number tells us: If you had a perfectly fair coin and repeated this ${tex`10`}-toss experiment many times, you would see a result this extreme (or more extreme) about **${tex`17.2`}% of the time** just by pure luck.

In statistics, we need a standard to decide if an event is "rare enough" to reject our assumption that the coin is fair.
This standard is called the **Significance Level** (symbol: ${tex`\alpha`}), and it is commonly set at **${tex`0.05`}** (${tex`5`}%).

* If the ${tex`p`}-value is **less than  ${tex`\alpha`}**, the event is so rare that we reject the **Null Hypothesis** (we say the coin is rigged).
* If the ${tex`p`}-value is **greater than ${tex`\alpha`}**, the event could easily happen by chance, so we keep the **Null Hypothesis** (we assume the coin is fair).

### Final Formula

Assuming we observed more heads than average (so ${tex`k > \frac{n}{2}`}), the formula for the two-tailed ${tex`p`}-value is:

```tex
{p}\text{-value} = 2 \times \sum_{i=k}^{n} \binom{n}{i} 0.5^n
```

This literally translates to: 

> Calculate the probability for ${tex`i`} heads, where ${tex`i`} starts at your result ${tex`k`} and goes up to ${tex`n`}. Add them all up. Then double it.
