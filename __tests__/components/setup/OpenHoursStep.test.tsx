import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { OpenHoursStep } from '../../../components/setup/OpenHoursStep';

describe('OpenHoursStep', () => {
  const onFinish = jest.fn();
  const onBack = jest.fn();
  const onSkip = jest.fn();

  beforeEach(() => jest.resetAllMocks());

  it('renders 7 day rows', () => {
    const { getAllByTestId } = render(
      <OpenHoursStep onFinish={onFinish} onBack={onBack} onSkip={onSkip} />
    );
    expect(getAllByTestId(/^day-row-/)).toHaveLength(7);
  });

  it('"Finish setup" calls onFinish (Mon-Fri open by default)', () => {
    const { getByRole } = render(
      <OpenHoursStep onFinish={onFinish} onBack={onBack} onSkip={onSkip} />
    );
    fireEvent.press(getByRole('button', { name: /finish setup/i }));
    expect(onFinish).toHaveBeenCalled();
  });

  it('"Finish setup" does NOT fire when all days are toggled closed', () => {
    const { getByRole, getByTestId } = render(
      <OpenHoursStep onFinish={onFinish} onBack={onBack} onSkip={onSkip} />
    );
    // Toggle Mon-Fri closed (they start open)
    ['mon', 'tue', 'wed', 'thu', 'fri'].forEach(d => {
      fireEvent(getByTestId(`toggle-${d}`), 'valueChange', false);
    });
    fireEvent.press(getByRole('button', { name: /finish setup/i }));
    expect(onFinish).not.toHaveBeenCalled();
  });

  it('calls onFinish with all 7 days, mon open, sat closed', () => {
    const { getByRole } = render(
      <OpenHoursStep onFinish={onFinish} onBack={onBack} onSkip={onSkip} />
    );
    fireEvent.press(getByRole('button', { name: /finish setup/i }));
    const arg: any[] = onFinish.mock.calls[0][0];
    expect(arg).toHaveLength(7);
    expect(arg.find((d: any) => d.day === 'mon').open).toBe(true);
    expect(arg.find((d: any) => d.day === 'sat').open).toBe(false);
  });

  it('calls onSkip', () => {
    const { getByText } = render(
      <OpenHoursStep onFinish={onFinish} onBack={onBack} onSkip={onSkip} />
    );
    fireEvent.press(getByText('Skip'));
    expect(onSkip).toHaveBeenCalled();
  });
});
