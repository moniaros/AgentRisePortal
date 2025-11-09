import React from 'react';

interface PostPreviewProps {
    content: string;
    image: string | null;
}

const PostPreview: React.FC<PostPreviewProps> = ({ content, image }) => {
    // A simple regex to find URLs, #hashtags, and @mentions and wrap them in a styled span
    const formatContent = (text: string) => {
        const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
        const hashtagRegex = /(#\w+)/g;
        const mentionRegex = /(@\w+)/g;

        let formattedText = text
            .replace(urlRegex, '<span class="text-blue-400">$1</span>')
            .replace(hashtagRegex, '<span class="text-blue-400">$1</span>')
            .replace(mentionRegex, '<span class="text-blue-400">$1</span>');

        return <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: formattedText }} />;
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border dark:border-gray-700">
            <div className="flex items-center mb-3">
                <img
                    className="h-10 w-10 rounded-full object-cover"
                    src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
                    alt="User avatar"
                />
                <div className="ml-3">
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">Agent Smith</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">@agentsmith_insurance</p>
                </div>
            </div>
            {content ? formatContent(content) : <p className="text-sm text-gray-400">Your post content will appear here...</p>}
            {image && (
                <div className="mt-3 rounded-lg overflow-hidden border dark:border-gray-700">
                    <img src={image} alt="Post preview" className="w-full h-auto object-cover" />
                </div>
            )}
        </div>
    );
};

export default PostPreview;
