/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/jest-globals';
import { describe, it, expect, jest } from '@jest/globals';
import { MemoryRouter } from 'react-router-dom';
import Header from '../Header';
import { LanguageProvider } from '../../context/LanguageContext';
import { ThemeProvider } from '../../context/ThemeContext';
import { AuthProvider } from '../../context/AuthContext';

const renderWithProvider = (component: React.ReactElement) => {
    return render(
        <MemoryRouter>
            <ThemeProvider>
                <LanguageProvider>
                    <AuthProvider>{component}</AuthProvider>
                </LanguageProvider>
            </ThemeProvider>
        </MemoryRouter>
    );
};

describe('Header Component', () => {
    it('should render without crashing', async () => {
        renderWithProvider(<Header onToggleSidebar={() => {}} />);
        await new Promise((r) => setTimeout(r, 50));
    });

    it('should show the profile dropdown when the avatar is clicked', async () => {
        renderWithProvider(<Header onToggleSidebar={() => {}} />);
        const avatarButton = await screen.findByRole('button', { name: /your avatar/i });
        fireEvent.click(avatarButton);
        expect(await screen.findByRole('link', { name: /profile/i })).toBeInTheDocument();
    });

    it('should call onToggleSidebar when the mobile menu button is clicked', () => {
        const toggleSidebarMock = jest.fn();
        renderWithProvider(<Header onToggleSidebar={toggleSidebarMock} />);
        const menuButton = screen.getByLabelText(/toggle sidebar/i);
        fireEvent.click(menuButton);
        expect(toggleSidebarMock).toHaveBeenCalledTimes(1);
    });
});