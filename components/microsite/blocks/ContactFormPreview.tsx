import React from 'react';
import { ContactBlock } from '../../../types';

const ContactFormPreview: React.FC<ContactBlock> = ({ title, subtitle }) => {
    return (
        <section className="py-8 my-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg px-4">
            <h2 className="text-3xl font-bold text-center mb-2">{title || 'Contact Us'}</h2>
            <p className="text-center text-gray-600 dark:text-gray-300 mb-6">{subtitle || 'We would love to hear from you!'}</p>
            <form className="max-w-xl mx-auto space-y-4" onSubmit={(e) => e.preventDefault()}>
                <input type="text" placeholder="Your Name" className="w-full p-3 border rounded dark:bg-gray-800 dark:border-gray-600" />
                <input type="email" placeholder="Your Email" className="w-full p-3 border rounded dark:bg-gray-800 dark:border-gray-600" />
                <textarea placeholder="Your Message" rows={4} className="w-full p-3 border rounded dark:bg-gray-800 dark:border-gray-600"></textarea>
                <button type="submit" className="w-full px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition">
                    Send Message
                </button>
            </form>
        </section>
    );
};

export default ContactFormPreview;
