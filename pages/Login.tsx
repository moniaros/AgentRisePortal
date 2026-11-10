import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Navigate } from 'react-router-dom';
import { useLocalization } from '../hooks/useLocalization';
import { useAuth } from '../hooks/useAuth';
import { useOnboardingStatus } from '../hooks/useOnboardingStatus';
import { Language } from '../types';

type FormData = {
    email: string;
    password: string;
    rememberMe: boolean;
};

const Login: React.FC = () => {
    const { t, language, setLanguage } = useLocalization();
    const navigate = useNavigate();
    const { login, loginDemoRole, currentUser } = useAuth();
    const { completeOnboarding } = useOnboardingStatus();
    const [isLoading, setIsLoading] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

    useEffect(() => {
        const browserLang = navigator.language.split('-')[0];
        if (browserLang === 'el' && !localStorage.getItem('language')) {
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

    const handleQuickDemo = async (role: 'admin' | 'agent') => {
        setIsLoading(true);
        setAuthError(null);
        const success = await loginDemoRole(role);
        setIsLoading(false);
        if (success) {
            completeOnboarding();
            navigate('/');
        }
    };

    const handleLanguageToggle = () => {
        setLanguage(language === Language.EN ? Language.EL : Language.EN);
    };

    if (currentUser) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-4 transition-colors duration-200">
            <div className="absolute top-4 right-4">
                <button
                    type="button"
                    onClick={handleLanguageToggle}
                    className="px-3 py-1.5 text-xs font-semibold border rounded-md border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition whitespace-nowrap"
                >
                    {language === Language.EN ? 'Ελληνικά (EL)' : 'English (EN)'}
                </button>
            </div>
            <div className="max-w-md w-full mx-auto">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-blue-600 text-white shadow-sm mb-3">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">AgentOS</h1>
                    <h2 className="mt-1.5 text-base font-medium text-slate-700 dark:text-slate-300">{t('login.title')}</h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('login.subtitle')}</p>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        {authError && (
                            <div role="alert" className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 rounded-lg text-sm">
                                {authError}
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                {t('login.emailLabel')}
                            </label>
                            <input
                                id="email"
                                type="email"
                                {...register('email', {
                                    required: t('validation.required', { fieldName: t('login.emailLabel') }),
                                    pattern: { value: /^\S+@\S+$/i, message: t('validation.invalidEmail') },
                                })}
                                className={`mt-1 block w-full px-3.5 py-2.5 border rounded-lg bg-white dark:bg-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 text-sm ${
                                    errors.email
                                        ? 'border-red-500 focus:ring-red-500'
                                        : 'border-slate-300 dark:border-slate-700 focus:ring-blue-600'
                                }`}
                                placeholder={t('login.emailPlaceholder')}
                            />
                            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message as string}</p>}
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                {t('login.passwordLabel')}
                            </label>
                            <input
                                id="password"
                                type="password"
                                {...register('password', {
                                    required: t('validation.required', { fieldName: t('login.passwordLabel') }),
                                })}
                                className={`mt-1 block w-full px-3.5 py-2.5 border rounded-lg bg-white dark:bg-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 text-sm ${
                                    errors.password
                                        ? 'border-red-500 focus:ring-red-500'
                                        : 'border-slate-300 dark:border-slate-700 focus:ring-blue-600'
                                }`}
                                placeholder="••••••••"
                            />
                            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message as string}</p>}
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    {...register('rememberMe')}
                                    type="checkbox"
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded dark:bg-slate-800 dark:border-slate-700"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-700 dark:text-slate-300">
                                    {t('login.rememberMe')}
                                </label>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-2.5 px-4 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 disabled:opacity-50 transition-colors"
                        >
                            {isLoading ? t('login.authenticating') : t('login.loginButton')}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 text-center mb-3">
                            {language === Language.EL ? 'Άμεση Είσοδος Demo Περιβάλλοντος' : 'Instant Workspace Access'}
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                disabled={isLoading}
                                onClick={() => handleQuickDemo('admin')}
                                className="px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors whitespace-nowrap"
                            >
                                {language === Language.EL ? 'Είσοδος Admin' : 'Agency Admin'}
                            </button>
                            <button
                                type="button"
                                disabled={isLoading}
                                onClick={() => handleQuickDemo('agent')}
                                className="px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors whitespace-nowrap"
                            >
                                {language === Language.EL ? 'Είσοδος Σύμβουλος' : 'Senior Agent'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;