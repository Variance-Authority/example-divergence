# One input, two renderings

Every screenshot tool answers the same question: is this subject different from
its own past? That question has a shape, and the shape has a hole in it. It
compares each subject to itself, one at a time, and never compares two subjects
to each other — so a component that takes one set of props and paints two
different pictures at the same commit is, to a screenshot tool, two green
subjects.

This example is three tests around one `Price` component. Two of them agree
about what a price looks like. The third does not, and no props were changed to
get there.

## 1. Take the first look

```bash
npm install
npx playwright install chromium
npm test
npx variance run
```

```
3 subject(s) observed, durable run at 2026-08-28T01:45:34.520Z
rendered by playwright-chromium (chromium@151.0.7922.34, darwin/arm64, 1x)
3 new

[new] price: no baseline for `price` under this renderer; nothing to compare against; the collection of this subject reported unverified-fonts (warn) ×2, portals-not-resolved (warn), so what was compared may be less than the whole subject
[new] promo: no baseline for `promo` under this renderer; nothing to compare against; the collection of this subject reported unverified-fonts (warn) ×2, portals-not-resolved (warn), so what was compared may be less than the whole subject
[new] receipt: no baseline for `receipt` under this renderer; nothing to compare against; the collection of this subject reported unverified-fonts (warn) ×2, portals-not-resolved (warn), so what was compared may be less than the whole subject

coverage: every planned subject was observed.
findings: none in 3 inspected subject(s).

3 component(s) across 3 subject(s) — 1 shared rendering(s), 1 divergence(s), nothing moved
  components: Price, PromoCard, Receipt

diverging at this commit (1) — one input, more than one rendering. Not a regression: there is no baseline anywhere in this. Either something outside the props decides part of the output — a token, a theme, an ancestor’s cascade — or the reading is not repeatable.

Price (token) — 2 rendering(s) from one props digest
  2 subject(s): price, receipt
  1 subject(s): promo
    variation — an input moved and the page followed
    Price inherited a different `color` — an ancestor declared it
      2 deltas here (token) — color

shared renderings (1) — the same component producing the same output in more than one subject. Two diffs over one of these are one thing to review, and an example among them is the narrow subject to review it in.

Price · 2 subject(s), 2 site(s)
  example: price
  price, receipt

warnings:
  the `jsdom` profile has no layout engine, so no changed region in this report could be joined to the node that occupies it; every region is reported unattributed rather than attributed to a guess

report: /Users/marinakorzunova/dev/variance-authority-examples/example-divergence/out/report.json
```

Exit code `1` — nothing has been approved yet, so nothing could be compared.

Read the middle paragraph. `Price` was called with `amount={2400}` in all three
tests, and the run is telling you it painted two different things:

```
Price (token) — 2 rendering(s) from one props digest
  2 subject(s): price, receipt
  1 subject(s): promo
    variation — an input moved and the page followed
    Price inherited a different `color` — an ancestor declared it
      2 deltas here (token) — color
```

`price` and `receipt` agree with each other. `promo` is on its own. The split is
the whole finding — knowing that a divergence happened is not actionable, and
knowing that the odd one out is `promo` is: that is the file to open.

The three indented lines under the split are the run naming the cause. The
first is triage: `variation` means an input moved and the output followed, so
this is a thing about the code and not an unrepeatable reading — nobody has to
go hunting for one. The second names the input. `Price` sets its own font and
never sets a colour, so it takes whatever colour it is standing in — white text
on [PromoCard](src/PromoCard.jsx)'s dark panel, near-black on
[Receipt](src/Receipt.jsx)'s white card — and `an ancestor declared it` is the
run saying it found `color` in force on the node and declared by nothing inside
`Price`.

`(token)` says which band the two renderings differ in, and `2 deltas here`
counts the values under it that moved.

## 2. Approve what you see

```bash
npx variance accept price receipt promo
npx variance run
```

```
3 unchanged
```

Exit code `0`, and the divergence paragraph is still there, word for word.

That is correct and it is the point. A divergence is not a difference from a
baseline — it is a fact about this commit, and approving three pictures does not
make `Price` stop having two renderings. It stays reported on every green run
until the code changes.

## 3. Read it on the page

```bash
npx variance report --format html > out/report.html
open out/report.html
```

The Composition section carries both halves of what the run said:

- **Echoes** — `Price`, 2 subjects · 2 sites. One rendering reached from more
  than one place, so a diff in either is one thing to review.
- **Divergences** — `Price`, 2 renderings, `token`, then
  `price` `receipt` **vs** `promo`, with the two sentences that name the cause
  underneath the split.

Every subject on that row is a link into its own card further down the page. The
divergence row is the one row on the page a screenshot tool could not have
produced, so it is the one that most needs to end somewhere you can click.

## 4. Change the colour only one subject holds

Darken the promo panel's text — `color: '#ffffff'` to `'#7f95b8'` in
[src/PromoCard.jsx](src/PromoCard.jsx) — then run the tests and the comparison
again:

```bash
npm test
npx variance run
```

```
2 unchanged, 1 changed

[changed] promo: 475 pixel(s) differ across 2 region(s); the collection of this subject reported unverified-fonts (warn) ×2, portals-not-resolved (warn), so what was compared may be less than the whole subject
```

Exit code `1`. One subject caught it, and it is the narrow one: `price` — the
test that exists to watch `Price`, that renders `Price` and nothing else — is
green, because `Price` did not change. Something above it did.

This is what the divergence told you one commit earlier. `Price` has a rendering
that lives in exactly one subject, so exactly one subject is watching it. Delete
`promo` as redundant with `price`, or write the next test against `price`
because it is the cheapest one, and that rendering has nobody looking at it.

What to do about it is a choice the report does not make for you:

- **The inheritance is the design.** Then keep `promo`, and know that `price` on
  its own is not coverage of `Price`.
- **The inheritance is a bug.** Then `Price` should declare its own colour, and
  the divergence disappears from the next run because there is only one
  rendering left.

Undo the edit before moving on, and `npm test && npx variance run` returns to
`3 unchanged`.

## Why it says an input moved when the props digest is the same

Both sentences are exact, and they are about different things. The props digest
is what `Price` was *called with*, and it is identical in all three tests. The
parting is about every input the two renderings actually had, and a colour
reaching in from an ancestor is one of them — it is simply not one that was
passed. An input moved; no prop did. That gap is the finding.

Had `Price` declared its own colour and still rendered two ways, the word would
be `flake` instead: the run saying every input it read agreed, the component
tree held, and the output moved regardless. That is a much heavier claim, and it
is only made after the inputs and the tree have been read and found equal —
never on silence.

## Why a component that reads the clock is not reported here

An obvious way to make one input produce two outputs is to read something the
props do not carry — `new Date()`, a locale, a random id. Those are real
problems and they are not divergences, because two renderings with different
text are not one input: the text is part of what went in, and calling them the
same input would report a component that correctly rendered two different
timestamps as a design defect.

A divergence here is refused unless the two renderings agree on their text,
their children, and their props digest, and were not reached inside one subject.
Three conservative refusals, so that what survives is worth opening.

A component that will not read the same way twice is a different finding with a
different name — instability, found by reading one subject twice in a single run
rather than by comparing two subjects.

## Why the run says "nothing moved" while a subject changed

Step 4 reports `1 changed` and, two lines further down, `nothing moved`. Both
are true, and the warning at the bottom of every run in this example is the
reason:

```
the `jsdom` profile has no layout engine, so no changed region in this report could be joined to the node that occupies it; every region is reported unattributed rather than attributed to a guess
```

`nothing moved` counts components a changed region could be pinned on. jsdom has
no layout engine, so no region in this example has a box, so no region can name
a component — and the run says it is not guessing rather than naming one anyway.

The Composition section is unaffected, and that is the interesting part: echoes
and divergences are read from the captured documents, not from the pixels, so
they are as sharp here as they are under a real layout engine.

`findings: none` is a third, separate answer — the baseline-free inspection of
each snapshot found no defects. It is not about the change either.

## Why an empty Divergences list is an answer

Run this on your own suite and the section may well be empty. That is a result,
not a section waiting to be filled: it says every component in the run painted
one picture per set of props, so no ancestor, token or theme is deciding part of
your output behind the props' back.

The Echoes list is worth reading in that case. It says which of your subjects
are showing you the same rendering, which is the difference between eleven diffs
to review and one.

## What is where

| file | what it does |
|---|---|
| [src/Price.jsx](src/Price.jsx) | the component that sets a font and no colour |
| [src/Receipt.jsx](src/Receipt.jsx) | a light card — one of the two agreeing subjects |
| [src/PromoCard.jsx](src/PromoCard.jsx) | a dark panel — the subject that disagrees |
| [test/price.test.jsx](test/price.test.jsx) | three ordinary tests, plus the line that captures |
| [variance/reset.mjs](variance/reset.mjs) | clears last run's captures, once per run |
| [vitest.config.js](vitest.config.js) | ordinary Vitest config, plus that setup file |
| [variance.config.json](variance.config.json) | reads the directory the tests wrote to |
