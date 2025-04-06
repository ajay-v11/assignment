'use server';

import {revalidatePath} from 'next/cache';
import {redirect} from 'next/navigation';
import {createClient} from '@/utils/supabase/server';
import {cookies} from 'next/headers';

type AuthError = {
  message: string;
  status: number;
};

export async function login(formData: FormData) {
  const cookieStore = cookies();
  const supabase = await createClient();

  // Validate inputs
  const email = formData.get('email');
  const password = formData.get('password');

  if (!email || typeof email !== 'string') {
    return {error: 'Valid email is required'};
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    return {error: 'Password must be at least 6 characters'};
  }

  // Sign in
  const {data, error} = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      error: error.message || 'Failed to sign in',
    };
  }

  // Set session cookie
  if (formData.get('remember-me')) {
    cookieStore.set('session', JSON.stringify(data.session), {
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  // Validate inputs
  const email = formData.get('email');
  const password = formData.get('password');

  if (!email || typeof email !== 'string') {
    return {error: 'Valid email is required'};
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    return {error: 'Password must be at least 6 characters'};
  }

  // Sign up
  const {data, error} = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (error) {
    return {
      error: error.message || 'Failed to create account',
    };
  }

  // Check if email confirmation is required
  if (data?.user?.identities?.length === 0) {
    return {
      success: 'Account already exists. Please sign in instead.',
      action: 'login',
    };
  }

  // If email confirmation is not required, log the user in directly
  if (data?.user?.confirmed_at) {
    revalidatePath('/', 'layout');
    redirect('/dashboard');
  } else {
    // Email confirmation required
    return {
      success: 'Please check your email to confirm your account.',
      action: 'confirm',
    };
  }
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/');
}
