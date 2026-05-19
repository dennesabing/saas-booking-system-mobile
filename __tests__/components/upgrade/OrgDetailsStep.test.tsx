import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import OrgDetailsStep from '../../../components/upgrade/OrgDetailsStep';

describe('OrgDetailsStep', () => {
  it('defaults org name to "<user name>\'s Business"', () => {
    const { getByDisplayValue } = render(<OrgDetailsStep userName="Maria" initial="" onContinue={() => {}} />);
    expect(getByDisplayValue("Maria's Business")).toBeTruthy();
  });

  it('disables Continue when empty', () => {
    const { getByRole, getByTestId } = render(<OrgDetailsStep userName="" initial="" onContinue={() => {}} />);
    fireEvent.changeText(getByTestId('org-name-input'), '');
    expect(getByRole('button', { name: 'Continue' }).props.accessibilityState?.disabled).toBe(true);
  });

  it('calls onContinue with the typed name', () => {
    const onContinue = jest.fn();
    const { getByText, getByTestId } = render(<OrgDetailsStep userName="X" initial="" onContinue={onContinue} />);
    fireEvent.changeText(getByTestId('org-name-input'), 'Acme Co');
    fireEvent.press(getByText('Continue'));
    expect(onContinue).toHaveBeenCalledWith('Acme Co');
  });
});
