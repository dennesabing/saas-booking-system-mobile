import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { ServiceDetailsStep } from '../../../components/setup/ServiceDetailsStep';

describe('ServiceDetailsStep', () => {
  const onNext = jest.fn();
  const onSkip = jest.fn();

  beforeEach(() => jest.resetAllMocks());

  it('Next button is disabled when name is empty', () => {
    const { getByRole } = render(<ServiceDetailsStep onNext={onNext} onSkip={onSkip} />);
    fireEvent.press(getByRole('button', { name: /next/i }));
    expect(onNext).not.toHaveBeenCalled();
  });

  it('calls onNext with name, duration, price when name is filled', () => {
    const { getByTestId, getByRole } = render(<ServiceDetailsStep onNext={onNext} onSkip={onSkip} />);
    fireEvent.changeText(getByTestId('name-input'), 'Massage');
    fireEvent.press(getByRole('button', { name: /next/i }));
    expect(onNext).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Massage', duration_minutes: 30, price: 0 })
    );
  });

  it('zeroes price when free checkbox is toggled', () => {
    const { getByTestId, getByRole } = render(<ServiceDetailsStep onNext={onNext} onSkip={onSkip} />);
    fireEvent(getByTestId('free-switch'), 'valueChange', true);
    fireEvent.changeText(getByTestId('name-input'), 'Yoga');
    fireEvent.press(getByRole('button', { name: /next/i }));
    expect(onNext).toHaveBeenCalledWith(expect.objectContaining({ price: 0 }));
  });

  it('calls onSkip when Skip is pressed', () => {
    const { getByText } = render(<ServiceDetailsStep onNext={onNext} onSkip={onSkip} />);
    fireEvent.press(getByText('Skip'));
    expect(onSkip).toHaveBeenCalled();
  });
});
