'use client';

import {useState, useEffect} from 'react';
import {login, signup} from './actions';
import {useRouter} from 'next/navigation';

type FormState = {
  error?: string;
  success?: string;
  action?: string;
  loading: boolean;
};

export default function LoginPage() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [formState, setFormState] = useState<FormState>({loading: false});

  // Handle form submission
  async function handleSubmit(
    formData: FormData,
    action: typeof login | typeof signup
  ) {
    setFormState({loading: true});

    const result = await action(formData);

    if (result?.error) {
      setFormState({loading: false, error: result.error});
    } else if (result?.success) {
      setFormState({
        loading: false,
        success: result.success,
        action: result.action,
      });

      if (result.action === 'login') {
        setAuthMode('login');
      }
    }
  }

  // Reset form state when switching modes
  useEffect(() => {
    setFormState({loading: false});
  }, [authMode]);

  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8'>
      <div className='w-full max-w-md space-y-8'>
        <div className='text-center'>
          <h2 className='mt-6 text-3xl font-bold tracking-tight text-gray-900'>
            {authMode === 'login'
              ? 'Sign in to your account'
              : 'Create a new account'}
          </h2>
          <p className='mt-2 text-sm text-gray-600'>
            {authMode === 'login'
              ? "Don't have an account? "
              : 'Already have an account? '}
            <button
              type='button'
              className='font-medium text-indigo-600 hover:text-indigo-500'
              onClick={() =>
                setAuthMode(authMode === 'login' ? 'signup' : 'login')
              }>
              {authMode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>

        {formState.error && (
          <div className='rounded-md bg-red-50 p-4'>
            <div className='flex'>
              <div className='ml-3'>
                <h3 className='text-sm font-medium text-red-800'>Error</h3>
                <div className='mt-2 text-sm text-red-700'>
                  <p>{formState.error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {formState.success && (
          <div className='rounded-md bg-green-50 p-4'>
            <div className='flex'>
              <div className='ml-3'>
                <h3 className='text-sm font-medium text-green-800'>Success</h3>
                <div className='mt-2 text-sm text-green-700'>
                  <p>{formState.success}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <form
          className='mt-8 space-y-6'
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            if (authMode === 'login') {
              handleSubmit(formData, login);
            } else {
              handleSubmit(formData, signup);
            }
          }}>
          <div className='space-y-4 rounded-md shadow-sm'>
            <div>
              <label
                htmlFor='email'
                className='block text-sm font-medium text-gray-700'>
                Email address
              </label>
              <input
                id='email'
                name='email'
                type='email'
                autoComplete='email'
                required
                className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500'
              />
            </div>

            <div>
              <label
                htmlFor='password'
                className='block text-sm font-medium text-gray-700'>
                Password
              </label>
              <input
                id='password'
                name='password'
                type='password'
                autoComplete={
                  authMode === 'login' ? 'current-password' : 'new-password'
                }
                required
                minLength={6}
                className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500'
              />
            </div>
          </div>

          {authMode === 'login' && (
            <div className='flex items-center justify-between'>
              <div className='flex items-center'>
                <input
                  id='remember-me'
                  name='remember-me'
                  type='checkbox'
                  className='h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500'
                />
                <label
                  htmlFor='remember-me'
                  className='ml-2 block text-sm text-gray-900'>
                  Remember me
                </label>
              </div>

              <div className='text-sm'>
                <a
                  href='#'
                  className='font-medium text-indigo-600 hover:text-indigo-500'>
                  Forgot your password?
                </a>
              </div>
            </div>
          )}

          <div>
            <button
              type='submit'
              disabled={formState.loading}
              className={`group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white ${
                formState.loading
                  ? 'opacity-70 cursor-not-allowed'
                  : 'hover:bg-indigo-700'
              } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}>
              {formState.loading ? (
                <span>Processing...</span>
              ) : (
                <span>{authMode === 'login' ? 'Sign in' : 'Sign up'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
