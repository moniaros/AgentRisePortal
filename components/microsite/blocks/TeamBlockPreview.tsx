import React from 'react';
import { TeamBlock } from '../../../types';

const TeamBlockPreview: React.FC<TeamBlock> = ({ title, members }) => {
    return (
        <section className="py-8 my-2 px-4">
            <h2 className="text-3xl font-bold text-center mb-6">{title || 'Our Team'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {members.map(member => (
                    <div key={member.id} className="text-center">
                        <img src={member.imageUrl || 'https://via.placeholder.com/150'} alt={member.name} className="w-32 h-32 rounded-full mx-auto mb-4 object-cover" />
                        <h3 className="font-semibold text-lg">{member.name || 'Team Member'}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{member.role || 'Role'}</p>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default TeamBlockPreview;
