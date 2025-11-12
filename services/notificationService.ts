import { NOTIFICATION_SOUND_URI } from '../constants/sounds';

let audio: HTMLAudioElement | null = null;

const playSound = () => {
    if (!audio) {
        audio = new Audio(NOTIFICATION_SOUND_URI);
    }
    audio.play().catch(error => console.error("Error playing notification sound:", error));
};

const showBrowserNotification = (title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
            body: body,
            icon: '/vite.svg', // Using the app icon
        });
    }
};

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
    if (!('Notification' in window)) {
        alert('This browser does not support desktop notification');
        return 'denied';
    }
    return await Notification.requestPermission();
};

export const showDemoNotification = (t: (key: string, replacements?: { [key: string]: string | number }) => any) => {
    const title = t('settings.notifications.demo.title');
    const body = t('settings.notifications.demo.body');
    
    playSound();
    showBrowserNotification(title, body);
};
