// @vitest-environment jsdom
import { render } from '@testing-library/react';
import { expect, test } from 'vitest';
import { capture, writeCapture } from '@variance-authority/unit-test';
import { holdingOf, provenanceOf, wiringOf } from '@variance-authority/react';
import { Price } from '../src/Price.jsx';
import { Receipt } from '../src/Receipt.jsx';
import { PromoCard } from '../src/PromoCard.jsx';

// Media queries are resolved against this here, in this process, because the
// renderer that paints the capture later never sees this DOM.
const VIEWPORT = { width: 360, height: 200, deviceScaleFactor: 1, colorScheme: 'light' };

// The three readers are what make this a tree of *components* rather than a tree
// of nodes: they read React's own fibers for the name behind each element, the
// props it was called with, and the hooks holding it.
async function watch(subject, container) {
  await writeCapture(
    '.variance/captures',
    await capture(container.firstElementChild, {
      subject,
      viewport: VIEWPORT,
      provenanceOf,
      wiringOf,
      holdingOf,
    }),
  );
}

test('the price on its own', async () => {
  const { container } = render(<Price amount={2400} />);

  // Your existing assertions stay. The capture is one more line, not a rewrite.
  expect(container.textContent).toBe('$24.00');

  await watch('price', container);
});

test('the price on a receipt', async () => {
  const { container } = render(<Receipt />);
  expect(container.textContent).toContain('$24.00');

  await watch('receipt', container);
});

test('the price on the launch offer', async () => {
  const { container } = render(<PromoCard />);
  expect(container.textContent).toContain('$24.00');

  await watch('promo', container);
});
