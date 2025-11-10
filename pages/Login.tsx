
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Navigate } from 'react-router-dom';
import { useLocalization } from '../hooks/useLocalization';
import { useAuth } from '../hooks/useAuth';
// FIX: Import types from correct path
import { Language } from '../types';

type FormData = {
    email: string;
    password: string;
    rememberMe: boolean;
};

const Login: React.FC = () => {
    const { t, language, setLanguage } = useLocalization();
    const navigate = useNavigate();
    const { login, currentUser } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

    useEffect(() => {
        // Prefill language toggle based on browser language if it's Greek
        const browserLang = navigator.language.split('-')[0];
        if (browserLang === 'el') {
            setLanguage(Language.EL);
        }
    }, [setLanguage]);

    const onSubmit = async (data: FormData) => {
        setIsLoading(true);
        setAuthError(null);
        const success = await login(data.email, data.password);
        setIsLoading(false);
        if (success) {
            navigate('/');
        } else {
            setAuthError(t('login.errorInvalidCredentials'));
        }
    };

    const handleLanguageToggle = () => {
        setLanguage(language === Language.EN ? Language.EL : Language.EN);
    };
    
    // If user is already logged in, redirect to dashboard
    if (currentUser) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col justify-center items-center p-4">
            <div className="absolute top-4 right-4">
                <button onClick={handleLanguageToggle} className="px-3 py-1.5 text-sm font-semibold border rounded-full dark:border-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                    {language === Language.EN ? 'ΕΛ' : 'EN'}
                </button>
            </div>
            <div className="max-w-md w-full mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400">AgentOS</h1>
                    <h2 className="mt-2 text-xl text-gray-700 dark:text-gray-300">{t('login.title')}</h2>
                    <p className="mt-1 text-gray-500 dark:text-gray-400">{t('login.subtitle')}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-8">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {authError && <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md text-sm">{authError}</div>}
                        
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t('login.emailLabel')}
                            </label>
                            <input
                                id="email"
                                type="email"
                                {...register('email', {
                                    // Fix: Use replacement syntax for translations and cast to string
                                    required: t('validation.required', {fieldName: t('login.emailLabel')}) as string,
                                    pattern: { value: /^\S+@\S+$/i, message: t('validation.invalidEmail') as string }
                                })}
                                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 dark:bg-gray-700 focus:outline-none sm:text-sm ${errors.email ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'}`}
                                placeholder={t('login.emailPlaceholder')}
                            />
                            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message as string}</p>}
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t('login.passwordLabel')}
                            </label>
                            <input
                                id="password"
                                type="password"
                                // Fix: Use replacement syntax for translations and cast to string
                                {...register('password', { required: t('validation.required', {fieldName: t('login.passwordLabel')}) as string })}
                                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 dark:bg-gray-700 focus:outline-none sm:text-sm ${errors.password ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'}`}
                            />
                             {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message as string}</p>}
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input id="remember-me" {...register('rememberMe')} type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                                    {t('login.rememberMe')}
                                </label>
                            </div>
                            <div className="text-sm">
                                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                                    {t('login.forgotPassword')}
                                </a>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
                            >
                                {isLoading ? t('login.authenticating') : t('login.loginButton')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
