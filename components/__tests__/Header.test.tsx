/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
// FIX: Import Jest globals to resolve TypeScript errors.
import { describe, it, expect, jest } from '@jest/globals';
import Header from '../Header';
import { LanguageProvider } from '../../context/LanguageContext';

// Example Test Suite for a Component (using Jest & React Testing Library)
// NOTE: This file is for demonstration purposes and requires a test runner setup.

// Mock dependencies
jest.mock('../../hooks/useOnlineStatus', () => ({
  useOnlineStatus: () => true, // Always mock as online for these tests
}));

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <LanguageProvider>
      {component}
    </LanguageProvider>
  );
};

describe('Header Component', () => {
  // This is a placeholder test as fetching translations is async
  // A real test suite would mock the fetch calls
  it('should render without crashing', async () => {
    renderWithProvider(<Header onToggleSidebar={() => {}} />);
    // Wait for async operations in LanguageProvider to complete
    // In a real test, you would mock fetch and not need to wait long
    await new Promise(r => setTimeout(r, 100)); 
  });

  it('should display online status correctly', async () => {
    renderWithProvider(<Header onToggleSidebar={() => {}} />);
    // Using a regex to be case-insensitive and match partial text
    expect(await screen.findByText(/online/i)).toBeInTheDocument();
  });

  it('should show the profile dropdown when the avatar is clicked', async () => {
     renderWithProvider(<Header onToggleSidebar={() => {}} />);
     
     // The profile menu should not be visible initially
     expect(screen.queryByText(/profile/i)).not.toBeInTheDocument();

     // Click the avatar button
     const avatarButton = await screen.findByRole('button', { name: /your avatar/i });
     fireEvent.click(avatarButton);

     // Now the profile menu should be visible
     expect(await screen.findByText(/profile/i)).toBeInTheDocument();
  });

   it('should call onToggleSidebar when the mobile menu button is clicked', async () => {
    const toggleSidebarMock = jest.fn();
    renderWithProvider(<Header onToggleSidebar={toggleSidebarMock} />);

    // Click the mobile menu button (only visible on smaller screens in a real browser, but always rendered here)
    const menuButton = screen.getByRole('button', { hidden: true }); // It might be hidden by CSS
    fireEvent.click(menuButton);

    expect(toggleSidebarMock).toHaveBeenCalledTimes(1);
  });
});