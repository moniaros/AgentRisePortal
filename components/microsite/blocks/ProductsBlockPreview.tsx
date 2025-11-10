import React from 'react';
import { ServicesBlock } from '../../../types';

const ServicesBlockPreview: React.FC<ServicesBlock> = ({ title, services }) => {
    return (
        <section className="py-8 my-2 px-4">
            <h2 className="text-3xl font-bold text-center mb-6">{title || 'Our Services'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map(service => (
                    <div key={service.id} className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md border dark:border-gray-600">
                        <h3 className="font-semibold text-lg mb-2">{service.name || 'Service Name'}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{service.description || 'Service description goes here.'}</p>
                    </div>
                ))}
                 {services.length === 0 && <p className="text-sm text-gray-500 col-span-full text-center">Add services in the editor.</p>}
            </div>
        </section>
    );
};

export default ServicesBlockPreview;