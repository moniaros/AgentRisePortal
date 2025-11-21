
import React from 'react';
import { SocialPlatform } from '../../types';

interface PostPreviewProps {
    content: string;
    image: string | null;
    platform: string;
}

const PostPreview: React.FC<PostPreviewProps> = ({ content, image, platform }) => {
    
    const formatContent = (text: string) => {
        const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
        const hashtagRegex = /(#\w+)/g;
        const mentionRegex = /(@\w+)/g;

        return text
            .replace(urlRegex, '<span class="text-blue-500 hover:underline cursor-pointer">$1</span>')
            .replace(hashtagRegex, '<span class="text-blue-500 hover:underline cursor-pointer">$1</span>')
            .replace(mentionRegex, '<span class="text-blue-500 hover:underline cursor-pointer">$1</span>');
    };

    const renderHeader = () => {
        switch(platform) {
            case 'linkedin':
                return (
                    <div className="flex items-start mb-3">
                        <img className="h-12 w-12 rounded-sm object-cover mr-3" src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="User" />
                        <div>
                            <div className="font-semibold text-sm text-gray-900 dark:text-white flex items-center">
                                Agent Smith
                                <span className="ml-1 text-gray-500 text-xs font-normal">• 1st</span>
                            </div>
                            <div className="text-xs text-gray-500">Insurance Specialist | Risk Advisor</div>
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                                2h • <span className="text-[10px]">🌐</span>
                            </div>
                        </div>
                        <button className="ml-auto text-blue-600 font-semibold text-sm">+ Follow</button>
                    </div>
                );
            case 'x':
                return (
                    <div className="flex items-start mb-1">
                        <img className="h-10 w-10 rounded-full object-cover mr-3" src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="User" />
                        <div className="flex-grow">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1">
                                    <span className="font-bold text-sm text-gray-900 dark:text-white">Agent Smith</span>
                                    <span className="text-gray-500 text-sm">@agentsmith_ins · 2h</span>
                                </div>
                                <span className="text-gray-400">···</span>
                            </div>
                        </div>
                    </div>
                );
            case 'instagram':
                return (
                    <div className="flex items-center justify-between p-2">
                        <div className="flex items-center gap-2">
                            <div className="p-[2px] rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600">
                                <img className="h-8 w-8 rounded-full border-2 border-white dark:border-black" src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="User" />
                            </div>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">agentsmith_insurance</span>
                        </div>
                        <span className="text-gray-500">...</span>
                    </div>
                );
            default: // Facebook
                return (
                    <div className="flex items-center mb-3">
                        <img className="h-10 w-10 rounded-full object-cover mr-2" src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="User" />
                        <div>
                            <div className="font-semibold text-sm text-gray-900 dark:text-white">Agent Smith</div>
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                                2h • <span className="text-[10px]">🌎</span>
                            </div>
                        </div>
                        <span className="ml-auto text-gray-500">...</span>
                    </div>
                );
        }
    };

    const renderFooter = () => {
        switch(platform) {
            case 'linkedin':
                return (
                    <div className="border-t dark:border-gray-700 mt-2 pt-2 flex justify-between text-gray-500 text-sm px-4">
                        <span className="flex items-center gap-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded">👍 Like</span>
                        <span className="flex items-center gap-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded">💬 Comment</span>
                        <span className="flex items-center gap-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded">🔁 Repost</span>
                        <span className="flex items-center gap-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded">✈️ Send</span>
                    </div>
                );
            case 'x':
                return (
                    <div className="flex justify-between text-gray-500 text-sm mt-3 max-w-[80%] ml-12">
                        <span>💬 2</span>
                        <span>🔁 5</span>
                        <span>❤️ 12</span>
                        <span>📊 105</span>
                        <span>⬆️</span>
                    </div>
                );
            case 'instagram':
                return (
                    <div className="p-2">
                        <div className="flex justify-between mb-2 text-2xl text-gray-800 dark:text-white">
                            <div className="flex gap-4">
                                <span>❤️</span><span>💬</span><span>✈️</span>
                            </div>
                            <span>🔖</span>
                        </div>
                        <div className="text-sm font-semibold mb-1 text-gray-900 dark:text-white">24 likes</div>
                        <div className="text-sm">
                            <span className="font-semibold mr-2 text-gray-900 dark:text-white">agentsmith_insurance</span>
                            <span className="text-gray-800 dark:text-gray-200" dangerouslySetInnerHTML={{ __html: formatContent(content) }} />
                        </div>
                    </div>
                );
            default: // Facebook
                return (
                    <div className="border-t dark:border-gray-700 mt-2 pt-2 flex justify-between text-gray-500 text-sm px-8 font-medium">
                        <span className="flex items-center gap-2">👍 Like</span>
                        <span className="flex items-center gap-2">💬 Comment</span>
                        <span className="flex items-center gap-2">↗️ Share</span>
                    </div>
                );
        }
    };

    const containerClasses = () => {
        switch(platform) {
            case 'x': return "bg-black text-white border-gray-800"; // X dark mode defaults usually
            default: return "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700";
        }
    };

    // X content is indented to the right of the avatar
    const contentClasses = platform === 'x' ? 'ml-12 -mt-4 mb-2' : 'mb-2';

    return (
        <div className={`rounded-lg shadow-sm border ${containerClasses()} overflow-hidden max-w-[500px] mx-auto`}>
            {platform !== 'instagram' && <div className="p-4 pb-0">{renderHeader()}</div>}
            {platform === 'instagram' && renderHeader()}
            
            {/* Content Area */}
            <div className={`px-4 text-sm whitespace-pre-wrap ${contentClasses} ${platform === 'x' ? 'text-gray-100' : 'text-gray-800 dark:text-gray-200'}`}>
                {platform !== 'instagram' && <span dangerouslySetInnerHTML={{ __html: formatContent(content) }} />}
            </div>

            {/* Image Area */}
            {image && (
                <div className={`${platform === 'x' ? 'ml-12 mr-4 rounded-2xl overflow-hidden border border-gray-700' : ''}`}>
                    <img src={image} alt="Post media" className={`w-full object-cover ${platform === 'instagram' ? 'aspect-square' : 'aspect-video'}`} />
                </div>
            )}

            {renderFooter()}
        </div>
    );
};

export default PostPreview;
