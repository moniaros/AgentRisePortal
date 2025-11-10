import React from 'react';
import { ContactBlock } from '../../../types';

const ContactFormPreview: React.FC<ContactBlock> = ({ title, subtitle }) => {
    return (
        <section className="py-8 my-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <div className="text-center max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold">{title || 'Get In Touch'}</h2>
                <p className="mt-2 text-gray-600 dark:text-gray-300">{subtitle || 'We would love to hear from you!'}</p>
            </div>
            <form className="mt-8 max-w-xl mx-auto space-y-4 p-4">
                <div>
                    <label className="block text-sm font-medium">Name</label>
                    <input type="text" disabled className="mt-1 w-full p-2 border rounded-md bg-gray-200 dark:bg-gray-600 cursor-not-allowed" />
                </div>
                <div>
                    <label className="block text-sm font-medium">Email</label>
                    <input type="email" disabled className="mt-1 w-full p-2 border rounded-md bg-gray-200 dark:bg-gray-600 cursor-not-allowed" />
                </div>
                <div>
                    <label className="block text-sm font-medium">Message</label>
                    <textarea disabled className="mt-1 w-full p-2 border rounded-md bg-gray-200 dark:bg-gray-600 cursor-not-allowed" rows={4}></textarea>
                </div>
                <button type="submit" disabled className="w-full py-2 px-4 bg-blue-400 text-white rounded-md cursor-not-allowed">
                    Send Message
                </button>
            </form>
        </section>
    );
};

export default ContactFormPreview;
