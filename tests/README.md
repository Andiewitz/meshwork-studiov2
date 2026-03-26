# Test Suite Documentation

## Overview

This `/tests` folder contains comprehensive test suites for the Meshwork-Studio security features, with current focus on the **Account Lockout with Exponential Backoff** functionality.

## Test Structure

```
tests/
├── unit/
│   └── auth/
│       └── lockout.test.ts          # Unit tests for lockout logic
├── integration/
│   └── auth/
│       └── lockout-routes.test.ts   # Integration tests for login routes
└── fixtures/                         # Test data and utilities
```

## Running Tests

### Run all lockout tests
```bash
npm run test:lockout
```

### Run in watch mode (auto-rerun on changes)
```bash
npm run test
```

### Run in single execution mode
```bash
npm run test:run
```

### Run with UI dashboard
```bash
npm run test:ui
```

### Run coverage report
```bash
npm run test:coverage
```

## Test Suites

### 1. Unit Tests: `tests/unit/auth/lockout.test.ts`

**Target**: Core business logic and algorithms

**Contains 26 tests across 7 test groups:**

#### Exponential Backoff Calculation (6 tests)
- `should_return_zero_minutes_for_attempts_1_through_5`
- `should_return_15_minutes_for_sixth_failed_attempt`
- `should_return_30_minutes_for_seventh_failed_attempt_exponential`
- `should_return_60_minutes_for_eighth_failed_attempt`
- `should_return_120_minutes_for_ninth_failed_attempt`
- `should_cap_maximum_lockout_duration_at_eight_hours`

**Key properties tested:**
- Initial threshold: 5 failed attempts before lockout
- Exponential growth: 15m → 30m → 60m → 120m...
- Maximum cap: 8 hours (480 minutes)

#### Timestamp Calculations (2 tests)
- `should_calculate_correct_future_timestamp_for_15_minute_lockout`
- `should_calculate_correct_future_timestamp_for_30_minute_lockout`

**Key properties tested:**
- Duration-to-timestamp conversion
- Millisecond precision

#### Timestamp Comparisons (4 tests)
- `should_determine_account_locked_true_when_lockedUntil_is_in_future`
- `should_determine_account_unlocked_when_lockedUntil_is_in_past`
- `should_handle_exact_expiration_time_boundary`
- `should_handle_millisecond_precision_in_timestamp_comparison`

**Key properties tested:**
- Correct "locked" vs "unlocked" determination
- Edge cases at expiration boundary
- Timezone-aware comparisons

#### Counter Increment Logic (3 tests)
- `should_not_increment_counter_when_account_is_locked`
- `should_track_multiple_failed_attempts_independently`
- (Implicit: counter starts at 0)

**Key properties tested:**
- DoS prevention: locked accounts don't extend timeout
- Per-email independent tracking
- Attempt accumulation

#### Counter Reset (3 tests)
- `should_reset_counter_from_1_to_0`
- `should_reset_counter_from_5_to_0`
- `should_reset_lockedUntil_to_null_on_successful_login`

**Key properties tested:**
- Successful login resets all state
- Both counter and timestamp cleared

#### Security & Edge Cases (5 tests)
- `should_prevent_negative_or_zero_attempt_counts`
- `should_prevent_lockout_duration_from_being_negative`
- `should_prevent_future_dates_from_being_treated_as_past`
- `should_handle_date_objects_with_different_precisions`
- `should_not_leak_information_through_response_time_analysis`

**Key properties tested:**
- Bounds checking
- Time travel attacks prevented
- Timing resistance (constant-time operations)

#### Realistic Scenarios (4 tests)
- `should_handle_successful_second_attempt`
- `should_handle_many_failed_attempts_then_successful_login`
- `should_handle_lockout_expiration_then_successful_login`
- `should_handle_repeated_lockout_cycles_with_exponential_increase`

**Key properties tested:**
- Multi-attempt sequences
- Lockout expiration and unlock
- Exponential increase across cycles

---

### 2. Integration Tests: `tests/integration/auth/lockout-routes.test.ts`

**Target**: Login route behavior and CSRF/lockout interaction

**Contains 29 descriptive test cases across 6 test groups:**

#### Login Route Tests (10 tests)
- `should_allow_login_with_correct_credentials_first_attempt`
- `should_reject_login_with_incorrect_password_first_attempt`
- `should_show_generic_error_message_to_prevent_email_enumeration`
- `should_track_failed_attempts_across_timestamps`
- `should_lock_account_after_five_failed_attempts`
- `should_return_locked_until_timestamp_to_client`
- `should_prevent_login_while_account_is_locked`
- `should_prevent_failed_attempt_increment_while_locked`
- `should_apply_exponential_backoff_on_second_lockout`
- `should_cap_lockout_duration_at_eight_hours_maximum`

**Validation points:**
- Correct password accepts, incorrect rejects
- Attempt tracking over time
- Lockout threshold (5 failed)
- Response includes `locked_until` timestamp
- Even correct password rejected when locked
- Prevents DoS extension of lockout

#### Automatic Unlock Tests (4 tests)
- `should_automatically_unlock_when_lockout_period_expires`
- `should_reset_counter_when_unlocked_attempt_fails`
- `should_allow_login_after_lockout_expires`
- `should_reset_failed_attempts_on_successful_login`

**Validation points:**
- Lockout duration respected
- Counter resets after unlock
- Fresh attempt cycle after unlock

#### Security Tests (7 tests)
- `should_track_per_email_not_per_ip_address`
- `should_not_enumerate_email_addresses_via_lockout`
- `should_survive_distributed_attack_attempts`
- `should_handle_case_insensitive_email_lockout`
- `should_include_lockout_info_in_error_responses`
- `should_handle_database_errors_gracefully_without_locking`
- `should_not_expose_lockout_logic_in_response_times`

**Validation points:**
- Per-email tracking (prevents bulk attacks)
- Email enumeration prevention
- DDoS resilience
- Case handling
- Client response format
- Error handling
- Timing attack resistance

#### CSRF Integration (2 tests)
- `should_require_valid_csrf_token_for_login`
- `should_check_lockout_before_csrf_validation`

**Validation points:**
- CSRF token enforcement
- Validation order consistency

#### Performance Tests (3 tests)
- `should_check_lockout_status_efficiently`
- `should_clean_up_expired_lockout_records`
- `should_handle_high_volume_of_concurrent_failed_attempts`

**Validation points:**
- Database index usage
- Record cleanup
- Concurrent request safety

#### Logging & Monitoring (3 tests)
- `should_log_account_locking_event`
- `should_not_log_sensitive_passwords_in_lockout_logs`
- `should_provide_metrics_for_lockout_monitoring`

**Validation points:**
- Event logging
- Security-first logging (no passwords)
- Monitoring/observability

---

## Test Naming Convention

All tests follow a specific naming pattern for clarity:

**Unit tests**: `should_<what>_<conditions>`
- Example: `should_return_15_minutes_for_sixth_failed_attempt`
- Describes the expected behavior
- All lowercase with underscores
- Indicates what is being tested

**Integration tests**: `should_<behavior>_when_<scenario>` or `<feature>_<behavior>`
- Example: `should_lock_account_after_five_failed_attempts`
- More context about the route/endpoint
- Includes request/response expectations

---

## Test Configuration

**Framework**: Vitest 4.1.1
**Environment**: Node.js
**Coverage**: Tracked (use `npm run test:coverage`)

**Configuration file**: `./vitest.config.ts`

```typescript
{
  environment: 'node',
  globals: true,
  testTimeout: 10000,
  include: ['tests/**/*.test.ts']
}
```

---

## Current Test Statistics

```
Total Test Files:  2
Total Tests:       55
  - Unit Tests:    26
  - Integration:   29
Pass Rate:         100% ✓
```

---

## Adding New Tests

1. Create test file in appropriate folder:
   - Unit tests: `tests/unit/auth/<feature>.test.ts`
   - Integration: `tests/integration/auth/<feature>.test.ts`

2. Follow the naming convention

3. Include JSDoc comments with:
   - Test description
   - Expected behavior
   - Validation points

4. Run tests frequently:
   ```bash
   npm run test
   ```

---

## Key Testing Principles Used

1. **Clarity**: Test names clearly describe what's being tested
2. **Isolation**: Each test is independent
3. **Documentation**: JSDoc comments explain intent
4. **Specificity**: Tests target specific behaviors and edge cases
5. **Real-world scenarios**: Integration tests cover actual usage patterns
6. **Security focus**: Explicit tests for security-critical properties

---

## Future Test Expansion

Planned test suites:
- [ ] Rate limiting tests (when implemented)
- [ ] MFA/2FA tests (when implemented)
- [ ] Password validation tests
- [ ] Session management tests
- [ ] OAuth strategy tests
- [ ] CAPTCHA integration tests

---

## Debugging Tests

Run a single test file:
```bash
npx vitest tests/unit/auth/lockout.test.ts
```

Run tests matching a pattern:
```bash
npx vitest -t "should_lock_account"
```

Run with debug output:
```bash
DEBUG=* npm run test:lockout
```

---

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Best Practices](https://www.testingpyramid.com/)
- [OWASP Authentication Testing](https://owasp.org/www-project-web-security-testing-guide/design/2-testing_authentication.html)
