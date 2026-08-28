import { Price } from './Price.jsx';

export function Receipt() {
  return (
    <div style={{ background: '#ffffff', padding: 24, width: 280, font: '14px system-ui, sans-serif' }}>
      <p style={{ margin: '0 0 8px' }}>Order total</p>
      <Price amount={2400} />
    </div>
  );
}
