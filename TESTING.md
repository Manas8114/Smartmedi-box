# Testing Guide - MediMind Pro

## Overview

This document describes the testing strategy and how to run tests for the MediMind Pro system.

## Test Structure

### Backend Tests

Located in `backend/tests/`:

- **db.test.js** - Database operations tests
- **api.test.js** - API endpoint tests
- **mqtt.test.js** - MQTT client tests
- **integration.test.js** - Integration tests
- **helpers.js** - Test helper functions

### Frontend Tests

Located in `web/src/__tests__/`:

- **App.test.js** - Main app component tests
- **components/** - Component tests
  - **Login.test.js** - Login component tests
  - **EventList.test.js** - Event list component tests

## Running Tests

### Backend Tests

```bash
cd backend

# Install dependencies (if not already installed)
npm install

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run integration tests only
npm run test:integration

# Run tests with coverage
npm test -- --coverage
```

### Frontend Tests

```bash
cd web

# Install dependencies (if not already installed)
npm install

# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Run All Tests

```bash
# From project root
cd backend && npm test && cd ../web && npm test
```

## Test Coverage

### Backend Coverage Goals

- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

### Frontend Coverage Goals

- **Statements**: 70%
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%

## Test Categories

### Unit Tests

Test individual functions and components in isolation.

**Backend:**
- Database operations
- API route handlers
- Utility functions

**Frontend:**
- React components
- Service functions
- Helper utilities

### Integration Tests

Test interactions between components and systems.

**Backend:**
- API endpoints with database
- MQTT message processing
- Authentication flow
- Full user workflows

**Frontend:**
- Component interactions
- API service calls
- MQTT service integration

### End-to-End Tests

Test complete user flows (manual or automated).

- User registration and login
- Event creation and viewing
- Alert sending and receiving
- Dashboard updates

## Test Data

### Test Database

Tests use a separate test database (`medimind.test.db`) to avoid affecting development data.

### Test Users

Test users are created and cleaned up automatically in tests.

### Mock Data

- MQTT client is mocked in unit tests
- Chart.js is mocked in frontend tests
- Notification API is mocked in frontend tests

## Writing Tests

### Backend Test Example

```javascript
describe('Database Tests', () => {
  test('should insert an event', async () => {
    const eventId = await db.insertEvent(
      'test_device',
      true,
      100.0,
      5.0,
      Date.now()
    );
    
    expect(eventId).toBeDefined();
  });
});
```

### Frontend Test Example

```javascript
describe('Login Component', () => {
  test('renders login form', () => {
    render(<Login />);
    expect(screen.getByPlaceholderText(/Usuario/i)).toBeInTheDocument();
  });
});
```

## Test Best Practices

1. **Isolation**: Each test should be independent
2. **Cleanup**: Clean up test data after tests
3. **Mocking**: Mock external dependencies
4. **Naming**: Use descriptive test names
5. **Coverage**: Aim for high code coverage
6. **Speed**: Keep tests fast
7. **Reliability**: Tests should be deterministic

## Continuous Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: cd backend && npm install && npm test

  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: cd web && npm install && npm test
```

## Troubleshooting

### Backend Tests Fail

1. Check if test database is accessible
2. Verify MQTT broker is not required (tests use mocks)
3. Check environment variables in `tests/setup.js`

### Frontend Tests Fail

1. Verify all dependencies are installed
2. Check if mocks are properly configured
3. Verify React Testing Library is set up correctly

### Coverage Issues

1. Run tests with `--coverage` flag
2. Check coverage report in `coverage/` directory
3. Identify untested code paths
4. Add tests for missing coverage

## Test Maintenance

1. **Update tests** when code changes
2. **Remove obsolete tests** when features are removed
3. **Refactor tests** to improve readability
4. **Fix flaky tests** immediately
5. **Document test requirements** for new features

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://testingjavascript.com/)

