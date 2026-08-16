import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '@/store/auth';

describe('auth store', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    useAuthStore.setState({
      accessToken: null,
      email: null,
      status: 'unknown',
    });
  });

  it('starts as unknown, which is not the same as signed out', () => {
    expect(useAuthStore.getState().status).toBe('unknown');
    expect(useAuthStore.getState().accessToken).toBeNull();
  });

  it('keeps the access token out of browser storage', () => {
    useAuthStore.getState().setSession('secret-token', 'user@example.com');

    expect(useAuthStore.getState().accessToken).toBe('secret-token');
    expect(localStorage.length).toBe(0);
    expect(sessionStorage.length).toBe(0);
    expect(JSON.stringify(localStorage)).not.toContain('secret-token');
  });

  it('marks the session anonymous when the refresh attempt yields nothing', () => {
    useAuthStore.getState().setSession('secret-token', 'user@example.com');
    useAuthStore.getState().setAccessToken(null);

    expect(useAuthStore.getState().status).toBe('anonymous');
  });

  it('keeps the known email when only the token is rotated', () => {
    useAuthStore.getState().setSession('first', 'user@example.com');
    useAuthStore.getState().setSession('second');

    expect(useAuthStore.getState().email).toBe('user@example.com');
    expect(useAuthStore.getState().accessToken).toBe('second');
  });

  it('drops everything on sign-out', () => {
    useAuthStore.getState().setSession('secret-token', 'user@example.com');
    useAuthStore.getState().clear();

    expect(useAuthStore.getState()).toMatchObject({
      accessToken: null,
      email: null,
      status: 'anonymous',
    });
  });
});
