
import { MicrositeTemplate } from "../types";

export const MICROSITE_TEMPLATES: MicrositeTemplate[] = [
    {
        id: 'tmpl_generic_free',
        name: 'Standard Agency',
        description: 'A clean, professional layout suitable for any general insurance agency.',
        thumbnailUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500&auto=format&fit=crop&q=60',
        previewImages: [
            'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&q=80'
        ],
        tier: 'free',
        category: 'general',
        tags: ['clean', 'corporate', 'simple'],
        blocks: [
            { id: 'b1', type: 'hero', title: 'Protecting What Matters', subtitle: 'Reliable insurance solutions for your family and business.', ctaText: 'Get a Quote', imageUrl: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&q=80' },
            { id: 'b2', type: 'services', title: 'Our Products', services: [
                { id: 's1', name: 'Auto', description: 'Comprehensive car insurance.', icon: 'car' },
                { id: 's2', name: 'Home', description: 'Protect your property.', icon: 'home' },
                { id: 's3', name: 'Life', description: 'Secure your family\'s future.', icon: 'heart' }
            ]},
            { id: 'b3', type: 'contact', title: 'Get in Touch', subtitle: 'We are here to help you.' }
        ],
        defaultConfig: {
            themeColor: '#2563eb' // blue-600
        }
    },
    {
        id: 'tmpl_auto_pro',
        name: 'Auto Specialist Pro',
        description: 'High-conversion layout designed specifically for auto insurance leads.',
        thumbnailUrl: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=500&auto=format&fit=crop&q=60',
        previewImages: [
            'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1200&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200&q=80'
        ],
        tier: 'pro',
        category: 'auto',
        tags: ['modern', 'high-energy', 'dark-mode-friendly'],
        blocks: [
            { id: 'b1', type: 'hero', title: 'Drive with Confidence', subtitle: 'Affordable rates. 24/7 Roadside Assistance.', ctaText: 'Start Saving Today', imageUrl: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200&q=80' },
            { id: 'b2', type: 'testimonials', title: 'Happy Drivers', testimonials: [
                { id: 't1', quote: 'Saved me 20% on my annual premium!', author: 'Maria K.' },
                { id: 't2', quote: 'Claims process was incredibly fast.', author: 'John D.' }
            ]},
            { id: 'b3', type: 'faq', title: 'Common Questions', items: [
                { id: 'q1', question: 'Do you cover young drivers?', answer: 'Yes, we have special packages for new drivers.' },
                { id: 'q2', question: 'What if I have an accident?', answer: 'Call our 24/7 hotline immediately.' }
            ]},
            { id: 'b4', type: 'contact', title: 'Request a Callback', subtitle: 'One of our auto experts will call you in 5 mins.' }
        ],
        defaultConfig: {
            themeColor: '#dc2626' // red-600
        }
    },
    {
        id: 'tmpl_home_free',
        name: 'Home Sweet Home',
        description: 'Warm and inviting design for property and homeowners insurance.',
        thumbnailUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=500&auto=format&fit=crop&q=60',
        previewImages: [
            'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&q=80'
        ],
        tier: 'free',
        category: 'home',
        tags: ['warm', 'family', 'secure'],
        blocks: [
            { id: 'b1', type: 'hero', title: 'Your Safe Haven', subtitle: 'Complete protection for your home and belongings.', ctaText: 'View Plans', imageUrl: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&q=80' },
            { id: 'b2', type: 'about', title: 'Why Choose Us', content: 'We specialize in comprehensive home coverage, including fire, theft, and natural disasters.', imageUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80' },
            { id: 'b3', type: 'contact', title: 'Contact Us', subtitle: 'Get a free property assessment.' }
        ],
        defaultConfig: {
            themeColor: '#059669' // green-600
        }
    },
    {
        id: 'tmpl_business_pro',
        name: 'Corporate Elite',
        description: 'Sophisticated B2B design for commercial lines and liability.',
        thumbnailUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500&auto=format&fit=crop&q=60',
        previewImages: [
            'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80'
        ],
        tier: 'pro',
        category: 'business',
        tags: ['sleek', 'trustworthy', 'b2b'],
        blocks: [
            { id: 'b1', type: 'hero', title: 'Risk Management Solutions', subtitle: 'Tailored insurance for growing businesses.', ctaText: 'Consultation', imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80' },
            { id: 'b2', type: 'team', title: 'Our Experts', members: [
                { id: 'm1', name: 'Alex T.', role: 'Risk Advisor', imageUrl: '' },
                { id: 'm2', name: 'Sarah J.', role: 'Commercial Specialist', imageUrl: '' }
            ]},
            { id: 'b3', type: 'awards', title: 'Industry Recognition', awards: [
                { id: 'a1', title: 'Top B2B Broker', issuer: 'Insurance Weekly', year: '2023' }
            ]},
            { id: 'b4', type: 'contact', title: 'Let\'s Talk Business', subtitle: 'Schedule a meeting with our corporate team.' }
        ],
        defaultConfig: {
            themeColor: '#1e293b' // slate-800
        }
    }
];
