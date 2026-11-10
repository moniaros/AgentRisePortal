import React, { useState } from 'react';
import { ContactBlock, LeadStatus, PolicyType } from '../../../types';
import { useCrmData } from '../../../hooks/useCrmData';

const ContactFormPreview: React.FC<ContactBlock> = ({ title, subtitle }) => {
    const { addLead } = useCrmData();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [policyLine, setPolicyLine] = useState<PolicyType>(PolicyType.AUTO);
    const [message, setMessage] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !email.trim()) return;

        const [firstName, ...rest] = name.trim().split(' ');
        addLead({
            agencyId: 'agency_1',
            firstName: firstName || 'Microsite',
            lastName: rest.join(' ') || 'Visitor',
            email: email.trim(),
            phone: phone.trim(),
            source: 'Agency Microsite Contact Form',
            status: LeadStatus.NEW,
            policyType: policyLine,
            potentialValue: policyLine === PolicyType.HEALTH ? 900 : 380,
            score: 82,
            details: message.trim() || 'Submitted inquiry via Agency Microsite',
        });

        setSubmitted(true);
        setName('');
        setEmail('');
        setPhone('');
        setMessage('');
    };

    return (
        <section className="py-8 my-2 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700 px-6">
            <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
                {title || 'Request a Personalized Quote'}
            </h2>
            <p className="text-center text-sm text-gray-600 dark:text-gray-300 mb-6">
                {subtitle || 'Compare 6 leading insurers with a licensed advisor.'}
            </p>

            {submitted ? (
                <div className="max-w-xl mx-auto p-5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-center space-y-2">
                    <p className="text-sm font-bold text-emerald-800 dark:text-emerald-200">
                        Inquiry Received &amp; Routed to Advisor Inbox
                    </p>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300">
                        Your inquiry has been logged in our CRM and an advisor will respond shortly.
                    </p>
                    <button
                        type="button"
                        onClick={() => setSubmitted(false)}
                        className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                        Submit another inquiry
                    </button>
                </div>
            ) : (
                <form className="max-w-xl mx-auto space-y-3.5" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Full Name"
                            className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600"
                        />
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email Address"
                            className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600"
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Mobile Phone"
                            className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600"
                        />
                        <select
                            value={policyLine}
                            onChange={(e) => setPolicyLine(e.target.value as PolicyType)}
                            className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600"
                        >
                            <option value={PolicyType.AUTO}>Auto Insurance</option>
                            <option value={PolicyType.HOME}>Home &amp; ENFIA -20%</option>
                            <option value={PolicyType.HEALTH}>Private Health</option>
                            <option value={PolicyType.LIFE}>Life &amp; Income Protection</option>
                        </select>
                    </div>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Vehicle plate, property sq.m., or questions..."
                        rows={3}
                        className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-600"
                    />
                    <button
                        type="submit"
                        className="w-full px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Send Quote Request
                    </button>
                </form>
            )}
        </section>
    );
};

export default ContactFormPreview;
