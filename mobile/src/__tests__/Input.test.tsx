import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Input } from '../components/common/Input';

describe('Input component', () => {
  it('renders without crashing', () => {
    expect(() => render(<Input placeholder="Enter text" />)).not.toThrow();
  });

  it('renders label when provided', () => {
    const { getByText } = render(<Input label="Email" placeholder="email@test.com" />);
    expect(getByText('Email')).toBeTruthy();
  });

  it('renders error message when provided', () => {
    const { getByText } = render(
      <Input placeholder="Email" error="This field is required" />,
    );
    expect(getByText('This field is required')).toBeTruthy();
  });

  it('does not render error when not provided', () => {
    const { queryByText } = render(
      <Input placeholder="Email" />,
    );
    expect(queryByText('This field is required')).toBeNull();
  });

  it('calls onChangeText when text changes', () => {
    const onChangeText = jest.fn();
    const { getByPlaceholderText } = render(
      <Input placeholder="Enter email" onChangeText={onChangeText} />,
    );
    fireEvent.changeText(getByPlaceholderText('Enter email'), 'test@test.com');
    expect(onChangeText).toHaveBeenCalledWith('test@test.com');
  });

  it('renders password toggle for isPassword prop', () => {
    const { getByLabelText } = render(
      <Input placeholder="Password" isPassword />,
    );
    expect(getByLabelText('Show password')).toBeTruthy();
  });

  it('has correct accessibility label when label is provided', () => {
    const { getByLabelText } = render(
      <Input label="Email Address" placeholder="email@test.com" />,
    );
    expect(getByLabelText('Email Address')).toBeTruthy();
  });
});
