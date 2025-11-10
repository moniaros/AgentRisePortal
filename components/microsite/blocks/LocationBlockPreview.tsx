import React from 'react';
import { LocationBlock } from '../../../types';

const LocationBlockPreview: React.FC<LocationBlock> = ({ title, address, googleMapsUrl }) => {
    return (
        <section className="py-8 my-2">
            <h2 className="text-3xl font-bold text-center mb-6">{title || 'Find Us'}</h2>
            <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="text-center md:text-left">
                    <p className="text-lg">{address || '123 Main Street, Anytown, USA'}</p>
                </div>
                <div>
                    <iframe 
                        src={googleMapsUrl || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.086438671853!2d-122.4217204846817!3d37.78338797975811!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8085809c6b93d339%3A0x867f3944f2438842!2sSan%20Francisco%20City%20Hall!5e0!3m2!1sen!2sus!4v1616005230015!5m2!1sen!2sus"}
                        width="100%" 
                        height="300" 
                        style={{border:0}} 
                        allowFullScreen={true}
                        loading="lazy"
                        title="Location Map"
                        className="rounded-lg shadow-md"
                    ></iframe>
                </div>
            </div>
        </section>
    );
};

export default LocationBlockPreview;
