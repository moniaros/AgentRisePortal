/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { useOnlineStatus } from '../useOnlineStatus';
// FIX: Import Jest globals to resolve TypeScript errors.
import { describe, it, expect, jest } from '@jest/globals';

// Example Test Suite for a Custom Hook (using Jest & React Testing Library)
// NOTE: This file is for demonstration purposes and requires a test runner setup.

describe('useOnlineStatus', () => {
  // Helper to change the mock online status and dispatch the event
  const setOnlineStatus = (isOnline: boolean) => {
    Object.defineProperty(navigator, 'onLine', {
      value: isOnline,
      configurable: true,
    });
    window.dispatchEvent(new Event(isOnline ? 'online' : 'offline'));
  };

  it('should return the initial online status of the browser', () => {
    // Assume browser is online initially
    setOnlineStatus(true);
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(true);
  });

  it('should update the status to false when the browser goes offline', () => {
    setOnlineStatus(true);
    const { result } = renderHook(() => useOnlineStatus());
    
    act(() => {
      setOnlineStatus(false);
    });

    expect(result.current).toBe(false);
  });

  it('should update the status to true when the browser comes back online', () => {
    setOnlineStatus(false); // Start offline
    const { result } = renderHook(() => useOnlineStatus());

    act(() => {
      setOnlineStatus(true);
    });

    expect(result.current).toBe(true);
  });

  it('should clean up event listeners on unmount', () => {
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useOnlineStatus());

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function));
    removeEventListenerSpy.mockRestore();
  });
});