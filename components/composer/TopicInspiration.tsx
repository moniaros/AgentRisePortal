
import React, { useMemo } from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import { Language } from '../../types';

interface TopicInspirationProps {
    onSelectTopic: (topic: string) => void;
}

const TopicInspiration: React.FC<TopicInspirationProps> = ({ onSelectTopic }) => {
    const { language } = useLocalization();

    const topics = useMemo(() => {
        if (language === Language.EL) {
            return [
                { id: 1, label: "🔥 Ασφάλεια Πυρός", prompt: "Γράψε μια ανάρτηση για τη σημασία της ασφάλισης κατοικίας έναντι πυρκαγιάς και φυσικών καταστροφών στην Ελλάδα." },
                { id: 2, label: "🚗 Οδική Βοήθεια", prompt: "Συμβουλές για το τι να κάνετε σε περίπτωση βλάβης στην εθνική οδό και πώς βοηθάει η οδική βοήθεια." },
                { id: 3, label: "⚕️ Υγεία για Παιδιά", prompt: "Η σημασία ενός ισχυρού προγράμματος υγείας για οικογένειες με μικρά παιδιά." },
                { id: 4, label: "📉 Μείωση Φόρου", prompt: "Ενημέρωση για τη μείωση του ΕΝΦΙΑ μέσω της ασφάλισης κατοικίας." },
                { id: 5, label: "👴 Συνταξιοδοτικό", prompt: "Γιατί οι νέοι πρέπει να ξεκινήσουν ένα αποταμιευτικό πρόγραμμα σήμερα." },
            ];
        }
        return [
            { id: 1, label: "⛈️ Storm Season Prep", prompt: "Tips for preparing your home roof and gutters for the upcoming storm season." },
            { id: 2, label: "🚗 Distracted Driving", prompt: "Statistics on distracted driving and how to stay safe on the road." },
            { id: 3, label: "🏠 Home Office Coverage", prompt: "Why your standard home policy might not cover your business equipment." },
            { id: 4, label: "🎓 New Teen Driver", prompt: "Adding a teen driver to your policy? Here is how to save on premiums." },
            { id: 5, label: "🐶 Pet Insurance Myths", prompt: "Debunking common myths about pet insurance coverage." },
        ];
    }, [language]);

    return (
        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">
                {language === Language.EL ? "Τάσεις στην Ασφάλιση" : "Trending in Insurance"}
            </h3>
            <div className="flex flex-wrap gap-2">
                {topics.map(topic => (
                    <button
                        key={topic.id}
                        onClick={() => onSelectTopic(topic.prompt)}
                        className="text-xs px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-200 dark:hover:bg-blue-900/50 rounded-md border border-blue-100 dark:border-blue-800 transition text-left"
                    >
                        {topic.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default TopicInspiration;
