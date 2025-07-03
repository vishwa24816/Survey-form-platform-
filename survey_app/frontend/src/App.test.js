import { render, screen } from '@testing-library/react';
import App from './App';

test('renders survey application header', () => {
  render(<App />);
  const headerElement = screen.getByText(/Survey Form Application/i);
  expect(headerElement).toBeInTheDocument();
});
