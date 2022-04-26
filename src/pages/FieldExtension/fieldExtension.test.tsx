import React from 'react';
import { render, screen } from '@testing-library/react';
import FieldExtension from './index';

test('renders Choose Asset(s) CTA', () => {
  render(<FieldExtension />);
  const linkElement = screen.getByText('Choose Asset(s)');
  expect(linkElement).toBeInTheDocument();
});
