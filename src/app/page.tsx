'use client';
import Link from 'next/link';
import {createClient} from '@/utils/supabase/client';
import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';

export default function Home() {
  const supabase = createClient();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: {user},
      } = await supabase.auth.getUser();
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const handleStartClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const {
      data: {user},
    } = await supabase.auth.getUser();

    if (user) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  };

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-r from-slate-900 to-slate-700'>
        <div className='flex flex-col items-center justify-center gap-5'>
          <div className='h-12 w-12 border-4 border-white border-t-transparent rounded-full animate-spin'></div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-r from-slate-900 to-slate-700'>
      <div className='flex flex-col items-center justify-center gap-5'>
        <h1 className='font-extrabold text-5xl text-white'>Note Taker</h1>
        <button
          onClick={handleStartClick}
          disabled={isLoading}
          className='text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700'>
          {isLoading ? 'Loading...' : 'Start taking notes'}
        </button>
      </div>
    </div>
  );
}
