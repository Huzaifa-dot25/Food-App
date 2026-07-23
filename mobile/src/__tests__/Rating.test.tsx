import React from 'react';
import { render } from '@testing-library/react-native';
import { Rating } from '../components/common/Rating';

describe('Rating component', () => {
  it('renders the value formatted to 1 decimal', () => {
    const { getByText } = render(<Rating value={4.5} />);
    expect(getByText('4.5')).toBeTruthy();
  });

  it('shows review count when provided and showCount is true', () => {
    const { getByText } = render(<Rating value={4.0} count={128} showCount />);
    expect(getByText('(128)')).toBeTruthy();
  });

  it('hides count when showCount is false', () => {
    const { queryByText } = render(
      <Rating value={4.0} count={128} showCount={false} />,
    );
    expect(queryByText('(128)')).toBeNull();
  });

  it('has correct accessibility label', () => {
    const { getByLabelText } = render(<Rating value={3.7} />);
    expect(getByLabelText('Rating: 3.7 out of 5')).toBeTruthy();
  });

  it('renders without count when count is undefined', () => {
    expect(() => render(<Rating value={4.2} />)).not.toThrow();
  });
});
