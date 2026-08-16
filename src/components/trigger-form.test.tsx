import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TriggerForm } from './trigger-form';

const { createMutate, updateMutate } = vi.hoisted(() => ({
  createMutate: vi.fn(),
  updateMutate: vi.fn(),
}));

vi.mock('@/lib/hooks', () => ({
  useCreateTrigger: () => ({ mutateAsync: createMutate }),
  useUpdateTrigger: () => ({ mutateAsync: updateMutate }),
  useApiLimits: () => ({
    maxTriggersPerUser: 10,
    maxConditionsPerTrigger: 5,
    maxPinnedCities: 12,
    testCooldownSec: 600,
    minCooldownMin: 10,
    maxCooldownMin: 1440,
    maxChannelsPerTrigger: 3,
  }),
}));
vi.mock('@/lib/api', () => ({
  apiError: (e: unknown) => (e as Error).message,
}));
vi.mock('@/components/city-autocomplete', () => ({
  CityAutocomplete: ({
    onSelect,
  }: {
    onSelect: (g: {
      name: string;
      latitude: number;
      longitude: number;
    }) => void;
  }) => (
    <button
      type="button"
      onClick={() =>
        onSelect({ name: 'Berlin', latitude: 52.52, longitude: 13.4 })
      }
    >
      pick-city
    </button>
  ),
}));

describe('TriggerForm', () => {
  beforeEach(() => vi.clearAllMocks());

  it('blocks submit and shows errors when name and city are missing', async () => {
    render(<TriggerForm onDone={vi.fn()} />);
    await userEvent.click(
      screen.getByRole('button', { name: /create trigger/i }),
    );

    expect(await screen.findByText('Name is required')).toBeInTheDocument();
    expect(screen.getByText('Pick a city from the list')).toBeInTheDocument();
    expect(createMutate).not.toHaveBeenCalled();
  });

  it('marks an invalid field and points it at its error message', async () => {
    render(<TriggerForm onDone={vi.fn()} />);
    await userEvent.click(
      screen.getByRole('button', { name: /create trigger/i }),
    );

    const name = await screen.findByLabelText('Name');
    expect(name).toHaveAttribute('aria-invalid', 'true');
    expect(name).toHaveAccessibleDescription('Name is required');
  });

  it('labels every condition control, so a screen reader can tell rows apart', () => {
    render(<TriggerForm onDone={vi.fn()} />);
    expect(screen.getByLabelText('Condition 1 metric')).toBeInTheDocument();
    expect(screen.getByLabelText('Condition 1 operator')).toBeInTheDocument();
    expect(screen.getByLabelText('Condition 1 threshold')).toBeInTheDocument();
  });

  it('creates a trigger and calls onDone on valid input', async () => {
    createMutate.mockResolvedValueOnce({ id: 't1' });
    const onDone = vi.fn();
    render(<TriggerForm onDone={onDone} />);

    await userEvent.type(
      screen.getByPlaceholderText(/Berlin heat wave/i),
      'Heat',
    );
    await userEvent.click(screen.getByRole('button', { name: 'pick-city' }));
    await userEvent.click(
      screen.getByRole('button', { name: /create trigger/i }),
    );

    await waitFor(() => expect(createMutate).toHaveBeenCalledTimes(1));
    expect(createMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Heat',
        city: 'Berlin',
        latitude: 52.52,
      }),
    );
    await waitFor(() => expect(onDone).toHaveBeenCalled());
  });
});
