import React, { useState } from 'react';
import { GbpReview, GbpStarRating } from '../../types';
import { useLocalization } from '../../hooks/useLocalization';
import StarRating from '../ui/StarRating';
import { GoogleGenAI } from '@google/genai';

interface ReviewCardProps {
    review: GbpReview;
    onReplyPosted: (reviewId: string, replyText: string) => void;
}

const starRatingMap: Record<GbpStarRating, number> = {
    'FIVE': 5,
    'FOUR': 4,
    'THREE': 3,
    'TWO': 2,
    'ONE': 1,
    'STAR_RATING_UNSPECIFIED': 0,
};

const ReviewCard: React.FC<ReviewCardProps> = ({ review, onReplyPosted }) => {
    const { t } = useLocalization();
    const rating = starRatingMap[review.starRating] || 0;

    const [isGenerating, setIsLoading] = useState(false);
    const [isPosting, setIsPosting] = useState(false);
    const [isPosted, setIsPosted] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [isReplying, setIsReplying] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);
    const [postError, setPostError] = useState<string | null>(null);

    const handleGenerateReply = async () => {
        setIsLoading(true);
        setIsReplying(false);
        setReplyContent('');
        setAiError(null);
        setPostError(null);

        if (!process.env.API_KEY) {
            setAiError(t('dashboard.errors.noApiKey') as string);
            setIsLoading(false);
            return;
        }

        try {
            const tone = "You are a helpful and friendly manager for an insurance agency. Your goal is to respond to customer reviews in a professional and appreciative manner.";
            let criteria = '';
            if (rating >= 4) {
                criteria = `The review is positive. Thank the customer by name (${review.reviewer.displayName}). Acknowledge a specific positive point from their review if possible. Keep it brief and warm.`;
            } else {
                criteria = `The review is negative or neutral. Thank the reviewer for their feedback. Apologize for their experience and show empathy. Do not make excuses. Offer to resolve the issue offline by asking them to contact you at contact@agency.com.`;
            }
            const fullPrompt = `${tone}\n\n${criteria}\n\nHere is the review:\nStar Rating: ${rating}/5\nReviewer Name: ${review.reviewer.displayName}\nReview Text: "${review.comment}"`;
            
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: fullPrompt,
            });

            setReplyContent(response.text);
            setIsReplying(true);
        } catch (error) {
            console.error("AI Generation Error:", error);
            setAiError(t('dashboard.errors.replyGenerationFailed') as string);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handlePostReply = async () => {
        setIsPosting(true);
        setPostError(null);
        
        try {
            console.log(`Simulating API call to 'locations.reviews.updateReply' for review: ${review.name}`);
            console.log(`Reply content: "${replyContent}"`);

            // Simulate network delay and potential error
            await new Promise(resolve => setTimeout(resolve, 1000));
            if (Math.random() < 0.2) { // 20% chance of failure
                throw new Error("Simulated Post API failure.");
            }

            // On success
            setIsPosting(false);
            setIsPosted(true);

            setTimeout(() => {
                onReplyPosted(review.name, replyContent);
            }, 2000);

        } catch (error) {
            console.error("Post Reply Error:", error);
            setPostError(t('dashboard.errors.replyPostFailed') as string);
            setIsPosting(false);
        }
    }

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border dark:border-gray-700">
            {/* Reviewer Info */}
            <div className="flex items-start justify-between mb-3">
                <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{review.reviewer.displayName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(review.createTime).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <StarRating rating={rating} />
                    <span>({rating} {t('dashboard.stars')})</span>
                </div>
            </div>

            {/* Review Comment */}
            <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">&ldquo;{review.comment}&rdquo;</p>
            
            {review.reply && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">Your reply:</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 italic mt-1">&ldquo;{review.reply.comment}&rdquo;</p>
                </div>
            )}

            {/* Reply Section */}
            {!review.reply && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                    {isPosted ? (
                        <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-md">
                            <p className="font-semibold">{t('dashboard.replyPosted')}</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex justify-end items-center gap-4">
                                {aiError && (
                                    <div className="text-sm text-red-500 flex-grow">
                                        {aiError}
                                    </div>
                                )}
                                <button
                                    onClick={handleGenerateReply}
                                    disabled={isGenerating || isPosting}
                                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-wait"
                                    aria-label={`Generate AI reply for ${review.reviewer.displayName}'s review`}
                                >
                                    {isGenerating ? t('dashboard.generatingReply') : (aiError ? t('common.retry') : t('dashboard.generateAiReply'))}
                                </button>
                            </div>
                            
                            {isReplying && (
                                <>
                                    <div>
                                        <label htmlFor={`reply-${review.name}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            {t('dashboard.yourReply')}
                                        </label>
                                        <textarea
                                            id={`reply-${review.name}`}
                                            rows={3}
                                            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm disabled:text-gray-500 dark:disabled:text-gray-400 disabled:bg-gray-100 dark:disabled:bg-gray-700/50"
                                            placeholder="AI-generated reply will appear here..."
                                            value={replyContent}
                                            onChange={(e) => setReplyContent(e.target.value)}
                                            disabled={!isReplying || isPosting}
                                        />
                                    </div>
                                    <div className="flex justify-end items-center gap-4">
                                        {postError && (
                                            <p className="text-sm text-red-500">{postError}</p>
                                        )}
                                        <button
                                            onClick={handlePostReply}
                                            className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-wait"
                                            disabled={!isReplying || !replyContent || isPosting}
                                        >
                                            {isPosting ? `${t('common.loading')}...` : t('dashboard.postReply')}
                                        </button>
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default ReviewCard;