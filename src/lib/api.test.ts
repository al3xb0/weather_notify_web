import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios, {
  AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { api, apiError } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };

function make401(config: InternalAxiosRequestConfig): AxiosError {
  const response: AxiosResponse = {
    data: {},
    status: 401,
    statusText: 'Unauthorized',
    headers: {},
    config,
  };
  return new AxiosError(
    'Unauthorized',
    'ERR_BAD_REQUEST',
    config,
    undefined,
    response,
  );
}

describe('apiError', () => {
  it('joins array messages', () => {
    const err = new AxiosError('x');
    err.response = { data: { message: ['a', 'b'] } } as AxiosResponse;
    expect(apiError(err)).toBe('a, b');
  });

  it('uses a string message', () => {
    const err = new AxiosError('x');
    err.response = { data: { message: 'nope' } } as AxiosResponse;
    expect(apiError(err)).toBe('nope');
  });

  it('falls back to the Error message for non-axios errors', () => {
    expect(apiError(new Error('boom'))).toBe('boom');
  });
});

describe('refresh interceptor', () => {
  beforeEach(() => {
    useAuthStore.getState().clear();
    vi.restoreAllMocks();
  });

  it('refreshes once for concurrent 401s, then retries both', async () => {
    const post = vi
      .spyOn(axios, 'post')
      .mockResolvedValue({ data: { accessToken: 'fresh' } } as AxiosResponse);

    api.defaults.adapter = async (config) => {
      if ((config as RetryConfig)._retry) {
        return {
          data: 'ok',
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        };
      }
      throw make401(config);
    };

    const [a, b] = await Promise.all([
      api.get('/triggers'),
      api.get('/triggers'),
    ]);

    expect(a.data).toBe('ok');
    expect(b.data).toBe('ok');
    expect(post).toHaveBeenCalledTimes(1);
    expect(useAuthStore.getState().accessToken).toBe('fresh');
  });

  it('does not refresh for /auth/* requests', async () => {
    const post = vi.spyOn(axios, 'post');

    api.defaults.adapter = async (config) => {
      throw make401(config);
    };

    await expect(api.post('/auth/login', {})).rejects.toBeInstanceOf(
      AxiosError,
    );
    expect(post).not.toHaveBeenCalled();
  });
});
