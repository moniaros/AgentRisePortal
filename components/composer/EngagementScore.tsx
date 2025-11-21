import React, { useMemo } from 'react';

interface EngagementScoreProps {
    content: string;
    platform: string;
    hasImage: boolean;
}

const EngagementScore: React.FC<EngagementScoreProps> = ({ content, platform, hasImage }) => {
    
    const { score, feedback } = useMemo(() => {
        let score = 0;
        const feedback: string[] = [];
        
        const length = content.length;
        const hashtagCount = (content.match(/#\w+/g) || []).length;
        
        // 1. Length Check
        if (length > 10) score += 20;
        
        let lengthOptimal = false;
        if (platform === 'x') {
            if (length > 50 && length < 260) lengthOptimal = true;
        } else if (platform === 'linkedin') {
            if (length > 200) lengthOptimal = true;
        } else {
            if (length > 100) lengthOptimal = true;
        }

        if (lengthOptimal) {
            score += 30;
        } else {
            feedback.push(length === 0 ? "Start writing..." : "Text length not optimal");
        }

        // 2. Hashtag Check
        if (hashtagCount > 0) score += 10;
        if (hashtagCount >= 3 && hashtagCount <= 10) {
            score += 20;
        } else if (hashtagCount === 0) {
            feedback.push("Add hashtags for reach");
        }

        // 3. Media Check
        if (hasImage) {
            score += 20;
        } else {
            feedback.push("Posts with images get 2x engagement");
        }

        return { score: Math.min(score, 100), feedback };
    }, [content, platform, hasImage]);

    const getColor = (s: number) => {
        if (s < 40) return 'text-red-500 bg-red-100 dark:bg-red-900/30';
        if (s < 80) return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30';
        return 'text-green-500 bg-green-100 dark:bg-green-900/30';
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border dark:border-gray-700">
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-gray-800 dark:text-white text-sm uppercase tracking-wider">Post Quality</h3>
                <span className={`font-bold text-lg px-2 py-1 rounded-md ${getColor(score)}`}>{score}/100</span>
            </div>
            
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4">
                <div className={`h-2.5 rounded-full transition-all duration-500 ${
                    score < 40 ? 'bg-red-500' : score < 80 ? 'bg-yellow-500' : 'bg-green-500'
                }`} style={{ width: `${score}%` }}></div>
            </div>

            {feedback.length > 0 ? (
                <ul className="space-y-1">
                    {feedback.map((tip, i) => (
                        <li key={i} className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                            <span className="text-yellow-500">⚠️</span> {tip}
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-2">
                    <span>✅</span> Great job! Ready to post.
                </p>
            )}
        </div>
    );
};

export default EngagementScore;