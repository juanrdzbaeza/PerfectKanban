import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
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

    // Find textarea among all textboxes (first is input for title)
    const textboxes = screen.getAllByRole('textbox');
    const textarea = textboxes.find((el) => el.tagName.toLowerCase() === 'textarea') || textboxes[1] || textboxes[0];

    if (textarea) {
      await userEvent.clear(textarea);
      await userEvent.type(textarea, 'Descripción modificada');
    }

    // Click Guardar
    const saveBtn = screen.getByRole('button', { name: /Guardar/i });
    await userEvent.click(saveBtn);

    // Modal should close and title updated in the card
    const updatedTitle = await screen.findByText(/Título modificado/i);
    expect(updatedTitle).toBeInTheDocument();

    // Now delete the card: locate the card container by accessible role/name and find its delete button
    const cardWrapper = screen.getByRole('button', { name: /Título modificado/i });
    const deleteBtn = within(cardWrapper).getByRole('button', { name: /Eliminar/i });
    await userEvent.click(deleteBtn);

    // Confirm dialog appears (look for Confirmar button)
    const confirmBtn = await screen.findByRole('button', { name: /Confirmar/i });
    expect(confirmBtn).toBeInTheDocument();
    await userEvent.click(confirmBtn);

    // The card should be removed
    await waitFor(() => expect(screen.queryByText(/Título modificado/i)).not.toBeInTheDocument());
  });
});
