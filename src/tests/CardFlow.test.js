import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

jest.setTimeout(10000);

describe('Card modal and confirm-delete flow', () => {
  test('open card modal, edit and save; then delete card via confirm dialog', async () => {
    render(<App />);

    // Wait for initial card to be present
    const cardTitle = await screen.findByText(/Investigar idea Kanban/i);
    expect(cardTitle).toBeInTheDocument();

    // Open card modal by clicking the card
    await userEvent.click(cardTitle);

    // Modal should open
    const modalHeading = await screen.findByText(/Detalles de la tarjeta/i);
    expect(modalHeading).toBeInTheDocument();

    // Edit title and description
    const titleInput = screen.getByDisplayValue(/Investigar idea Kanban/i);
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, 'Título modificado');

    const textarea = screen.getByRole('textbox', { name: /Descripción/i }) || screen.getByRole('textbox');
    // Try to find textarea; fallback to first textbox
    if (textarea) {
      await userEvent.clear(textarea);
      await userEvent.type(textarea, 'Descripción modificada');
    }

    // Click Guardar
    const saveBtn = screen.getByRole('button', { name: /Guardar/i });
    await userEvent.click(saveBtn);

    // Modal should close and title updated in the card
    await waitFor(() => expect(screen.getByText(/Título modificado/i)).toBeInTheDocument());

    // Now delete the card: find the delete button near the card and click it
    // We search for all delete buttons and pick the one associated with our modified card by traversing DOM
    const deleteButtons = screen.getAllByRole('button', { name: /Eliminar/i });
    // Try clicking the delete button that is in the same container as the updated title
    let targetBtn = null;
    for (const btn of deleteButtons) {
      try {
        const parent = btn.closest('.card');
        if (parent && parent.textContent.includes('Título modificado')) {
          targetBtn = btn;
          break;
        }
      } catch (e) {
        // ignore
      }
    }
    expect(targetBtn).not.toBeNull();
    await userEvent.click(targetBtn);

    // Confirm dialog appears
    const confirmText = await screen.findByText(/¿Eliminar esta tarjeta\?/i);
    expect(confirmText).toBeInTheDocument();

    const confirmBtn = screen.getByRole('button', { name: /Confirmar/i });
    await userEvent.click(confirmBtn);

    // The card should be removed
    await waitFor(() => expect(screen.queryByText(/Título modificado/i)).not.toBeInTheDocument());
  });
});

