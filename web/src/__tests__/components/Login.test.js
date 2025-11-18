import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../../components/Login';
import { AuthProvider } from '../../services/AuthService';

const MockedLogin = () => (
  <BrowserRouter>
    <AuthProvider>
      <Login />
    </AuthProvider>
  </BrowserRouter>
);

describe('Login Component', () => {
  test('renders login form', () => {
    render(<MockedLogin />);
    expect(screen.getByPlaceholderText(/Username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
  });

  test('switches between login and register', () => {
    render(<MockedLogin />);
    const switchButton = screen.getByText(/Don't have an account\?/i);
    fireEvent.click(switchButton);
    expect(screen.getByPlaceholderText(/Email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Device ID/i)).toBeInTheDocument();
  });

  test('validates required fields', async () => {
    render(<MockedLogin />);
    const submitButton = screen.getByRole('button', { name: /Sign in/i });
    fireEvent.click(submitButton);
    // Form validation should prevent submission
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Username/i)).toBeInvalid();
    });
  });
});

