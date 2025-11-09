import React from 'react';

interface CharacterCountProps {
    current: number;
    max: number;
}

const CharacterCount: React.FC<CharacterCountProps> = ({ current, max }) => {
    const getTextColor = () => {
        if (current > max) {
            return 'text-red-500';
        }
        if (current > max * 0.9) {
            return 'text-yellow-500';
        }
        return 'text-gray-400';
    };

    return (
        <div className={`absolute bottom-2 right-2 text-xs font-mono ${getTextColor()}`}>
            {current}/{max}
        </div>
    );
};

export default CharacterCount;
