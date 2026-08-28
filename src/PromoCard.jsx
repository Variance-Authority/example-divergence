import { Price } from './Price.jsx';

// The one difference that matters is `color`, and `Price` never declares it.
export function PromoCard() {
  return (
    <div style={{ background: '#10233f', color: '#ffffff', padding: 24, width: 280, font: '14px system-ui, sans-serif' }}>
      <p style={{ margin: '0 0 8px' }}>Launch offer</p>
      <Price amount={2400} />
    </div>
  );
}
