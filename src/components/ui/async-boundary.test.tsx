import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AsyncBoundary } from './async-boundary';

vi.mock('@/lib/api', () => ({
  apiError: (e: unknown) => (e as Error).message,
}));

type Query<T> = Parameters<typeof AsyncBoundary<T>>[0]['query'];

function query<T>(overrides: Partial<Query<T>> = {}): Query<T> {
  return {
    data: undefined,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    ...overrides,
  };
}

describe('AsyncBoundary', () => {
  it('shows a busy placeholder while loading', () => {
    render(
      <AsyncBoundary query={query<string[]>({ isLoading: true })}>
        {() => <p>data</p>}
      </AsyncBoundary>,
    );
    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByText('data')).not.toBeInTheDocument();
  });

  it('reports a failed request instead of rendering nothing', () => {
    render(
      <AsyncBoundary
        query={query<string[]>({ isError: true, error: new Error('boom') })}
      >
        {() => <p>data</p>}
      </AsyncBoundary>,
    );
    // role=alert so the failure is announced, not just drawn.
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('boom')).toBeInTheDocument();
  });

  it('retries through the query on demand', async () => {
    const refetch = vi.fn();
    render(
      <AsyncBoundary
        query={query<string[]>({
          isError: true,
          error: new Error('boom'),
          refetch,
        })}
      >
        {() => <p>data</p>}
      </AsyncBoundary>,
    );
    await userEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('treats undefined data as a failure rather than as empty', () => {
    render(
      <AsyncBoundary query={query<string[]>({ data: undefined })}>
        {() => <p>data</p>}
      </AsyncBoundary>,
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('shows the empty slot when the data is empty', () => {
    render(
      <AsyncBoundary
        query={query<string[]>({ data: [] })}
        isEmpty={(d) => d.length === 0}
        empty={<p>nothing here</p>}
      >
        {() => <p>data</p>}
      </AsyncBoundary>,
    );
    expect(screen.getByText('nothing here')).toBeInTheDocument();
  });

  it('renders the data once it is there', () => {
    render(
      <AsyncBoundary
        query={query<string[]>({ data: ['a', 'b'] })}
        isEmpty={(d) => d.length === 0}
        empty={<p>nothing here</p>}
      >
        {(items) => <p>{items.join(',')}</p>}
      </AsyncBoundary>,
    );
    expect(screen.getByText('a,b')).toBeInTheDocument();
  });
});
