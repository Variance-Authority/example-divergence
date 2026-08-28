/**
 * A price. It sets its own size and weight, and no colour — so it takes
 * whatever colour it is standing in.
 */
export function Price({ amount }) {
  return (
    <span style={{ font: '600 20px system-ui, sans-serif' }}>
      {`$${(amount / 100).toFixed(2)}`}
    </span>
  );
}
