import React from 'react';
import { render, screen } from '@testing-library/react';
import EventList from '../../components/EventList';

describe('EventList Component', () => {
  test('renders empty state when no events', () => {
    render(<EventList events={[]} />);
    expect(screen.getByText(/No hay eventos registrados aún/i)).toBeInTheDocument();
  });

  test('renders events list', () => {
    const events = [
      {
        id: 1,
        device_id: 'test_device',
        pill_removed: true,
        weight: 100.5,
        weight_diff: 5.0,
        created_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 2,
        device_id: 'test_device',
        pill_removed: true,
        weight: 95.5,
        weight_diff: 5.0,
        created_at: '2024-01-01T01:00:00Z'
      }
    ];

    render(<EventList events={events} />);
    const pillRemovedTexts = screen.getAllByText(/Píldora removida/i);
    expect(pillRemovedTexts.length).toBeGreaterThan(0);
    expect(screen.getByText('100.50')).toBeInTheDocument();
    expect(screen.getByText('95.50')).toBeInTheDocument();
  });
});

