import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';

// Mock AuthService
jest.mock('../services/AuthService', () => ({
  AuthProvider: ({ children }) => <div>{children}</div>,
  useAuth: () => ({
    isAuthenticated: false,
    user: null,
    loading: false,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
  }),
}));

describe('App Component', () => {
  test('renders without crashing', () => {
    render(<App />);
    // App should render without errors
    expect(screen.getByText(/MediMind Pro/i)).toBeInTheDocument();
  });
});

