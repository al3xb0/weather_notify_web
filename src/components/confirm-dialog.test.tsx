import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmDialog } from './confirm-dialog';

function setup(overrides: Partial<Parameters<typeof ConfirmDialog>[0]> = {}) {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();
  const view = render(
    <>
      <button type="button">opener</button>
      <ConfirmDialog
        open
        title="Delete all triggers?"
        message="This cannot be undone."
        onConfirm={onConfirm}
        onCancel={onCancel}
        {...overrides}
      />
    </>,
  );
  return { onConfirm, onCancel, view };
}

describe('ConfirmDialog', () => {
  it('is a labelled modal dialog', () => {
    setup();
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAccessibleName('Delete all triggers?');
    expect(dialog).toHaveAccessibleDescription('This cannot be undone.');
  });

  it('focuses cancel on open, so Enter cannot destroy anything by accident', () => {
    setup();
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();
  });

  it('keeps Tab inside the dialog', async () => {
    setup();
    const cancel = screen.getByRole('button', { name: 'Cancel' });
    const confirm = screen.getByRole('button', { name: 'Confirm' });

    await userEvent.tab();
    expect(confirm).toHaveFocus();
    // Past the last control it wraps back instead of reaching the page behind.
    await userEvent.tab();
    expect(cancel).toHaveFocus();
    await userEvent.tab({ shift: true });
    expect(confirm).toHaveFocus();
  });

  it('returns focus to whatever opened it', async () => {
    const tree = (open: boolean) => (
      <>
        <button type="button">opener</button>
        <ConfirmDialog
          open={open}
          title="Delete all triggers?"
          message="This cannot be undone."
          onConfirm={vi.fn()}
          onCancel={vi.fn()}
        />
      </>
    );
    const view = render(tree(false));
    const opener = screen.getByRole('button', { name: 'opener' });
    opener.focus();

    view.rerender(tree(true));
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();

    view.rerender(tree(false));
    expect(opener).toHaveFocus();
  });

  it('cancels on Escape but not while a confirm is in flight', async () => {
    const { onCancel } = setup({ pending: true });
    await userEvent.keyboard('{Escape}');
    expect(onCancel).not.toHaveBeenCalled();
  });
});
