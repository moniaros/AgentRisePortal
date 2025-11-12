import { useState, useCallback, useEffect } from 'react';
import { SocialConnection, SocialConnections } from '../types';

const STORAGE_KEY = 'social_connections';

const defaultConnections: SocialConnections = {
    facebook: { isConnected: false },
    instagram: { isConnected: false },
    linkedin: { isConnected: false },
    x: { isConnected: false },
};

export const useSocialConnections = () => {
    const [connections, setConnections] = useState<SocialConnections>(defaultConnections);

    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                setConnections(JSON.parse(stored));
            }
        } catch (error) {
            console.error("Failed to load social connections from storage", error);
            localStorage.removeItem(STORAGE_KEY);
        }
    }, []);

    const updateStorage = (newConnections: SocialConnections) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newConnections));
        } catch (error) {
            console.error("Failed to save social connections to storage", error);
        }
    };

    const connectPlatform = useCallback((platformKey: string, accountDetails: Omit<SocialConnection, 'isConnected'>) => {
        setConnections(prev => {
            const newConnections = {
                ...prev,
                [platformKey]: {
                    isConnected: true,
                    ...accountDetails
                }
            };
            updateStorage(newConnections);
            return newConnections;
        });
    }, []);

    const disconnectPlatform = useCallback((platformKey: string) => {
        setConnections(prev => {
            const newConnections = {
                ...prev,
                [platformKey]: { isConnected: false }
            };
            updateStorage(newConnections);
            return newConnections;
        });
    }, []);

    return { connections, connectPlatform, disconnectPlatform };
};
