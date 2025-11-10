import React from 'react';
import { CertificatesBlock } from '../../../types';

const CertificatesBlockPreview: React.FC<CertificatesBlock> = ({ title, certificates }) => {
    return (
        <section className="py-8 bg-gray-50 dark:bg-gray-700/50 my-2 rounded-lg px-4">
            <h2 className="text-3xl font-bold text-center mb-6">{title || 'Our Certifications'}</h2>
            <div className="flex justify-center items-center gap-8 flex-wrap">
                {certificates.map(cert => (
                    <div key={cert.id} className="text-center">
                        <img src={cert.imageUrl || 'https://via.placeholder.com/100x150.png?text=Cert'} alt={cert.name} className="h-40" />
                        <p className="text-sm font-semibold mt-2">{cert.name || 'Certificate Name'}</p>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default CertificatesBlockPreview;
