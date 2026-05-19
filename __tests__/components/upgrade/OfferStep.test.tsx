import { render, fireEvent } from '@testing-library/react-native';
import React from 'react';
import OfferStep from '../../../components/upgrade/OfferStep';

const offer = {
  name: 'Pro Owner', description: 'Run your business.',
  benefits: ['Unlimited services', 'Up to 25 staff seats'],
  display_price: '$399.99', trial_months: 3,
  payment_config: { restore_supported: true },
} as any;

describe('OfferStep', () => {
  it('renders backend price and trial', () => {
    const { getByText } = render(<OfferStep offer={offer} onContinue={() => {}} onRestore={() => {}} />);
    expect(getByText(/3 MONTHS FREE/i)).toBeTruthy();
    expect(getByText(/then \$399\.99\/month/i)).toBeTruthy();
  });

  it('renders all benefits', () => {
    const { getByText } = render(<OfferStep offer={offer} onContinue={() => {}} onRestore={() => {}} />);
    expect(getByText(/Unlimited services/)).toBeTruthy();
    expect(getByText(/Up to 25 staff seats/)).toBeTruthy();
  });

  it('hides restore link when not supported', () => {
    const o = { ...offer, payment_config: { restore_supported: false } };
    const { queryByText } = render(<OfferStep offer={o} onContinue={() => {}} onRestore={() => {}} />);
    expect(queryByText(/Restore purchases/i)).toBeNull();
  });

  it('calls onContinue', () => {
    const onContinue = jest.fn();
    const { getByText } = render(<OfferStep offer={offer} onContinue={onContinue} onRestore={() => {}} />);
    fireEvent.press(getByText('Continue'));
    expect(onContinue).toHaveBeenCalled();
  });
});
