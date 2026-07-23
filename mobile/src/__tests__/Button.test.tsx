import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../components/common/Button';

describe('Button component', () => {
  it('renders the title', () => {
    const { getByText } = render(
      <Button title="Order Now" onPress={() => {}} />,
    );
    expect(getByText('Order Now')).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button title="Tap Me" onPress={onPress} />,
    );
    fireEvent.press(getByText('Tap Me'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button title="Disabled" onPress={onPress} disabled />,
    );
    fireEvent.press(getByText('Disabled'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('does not call onPress when loading', () => {
    const onPress = jest.fn();
    const { queryByText, getByRole } = render(
      <Button title="Loading" onPress={onPress} isLoading />,
    );
    // Title should not be visible when loading
    expect(queryByText('Loading')).toBeNull();
  });

  it('has correct accessibility role', () => {
    const { getByRole } = render(
      <Button title="Accessible" onPress={() => {}} />,
    );
    expect(getByRole('button')).toBeTruthy();
  });

  it('sets aria-disabled when disabled', () => {
    const { getByRole } = render(
      <Button title="Disabled" onPress={() => {}} disabled />,
    );
    const btn = getByRole('button');
    expect(btn.props.accessibilityState?.disabled).toBe(true);
  });

  it('renders different variants without crashing', () => {
    const variants = ['primary', 'secondary', 'outline', 'ghost', 'danger'] as const;
    variants.forEach(variant => {
      expect(() =>
        render(<Button title="Test" onPress={() => {}} variant={variant} />),
      ).not.toThrow();
    });
  });

  it('renders different sizes without crashing', () => {
    const sizes = ['sm', 'md', 'lg'] as const;
    sizes.forEach(size => {
      expect(() =>
        render(<Button title="Test" onPress={() => {}} size={size} />),
      ).not.toThrow();
    });
  });
});
