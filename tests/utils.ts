/**
 * Boolean to indicate if tests requiring a real connection the NM B2B should
 * be run.
 */
export const shouldUseRealB2BConnection =
  // Disable B2B connections in CI
  !process.env.CI ||
  // ... unless explicity allowed
  !!process.env.REAL_B2B_CONNECTIONS;
