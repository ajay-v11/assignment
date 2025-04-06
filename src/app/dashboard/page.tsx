'use client';
import React, {useState, useEffect} from 'react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Button} from '@/components/ui/button';
import {createClient} from '@/utils/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {useRouter} from 'next/navigation';
import {Skeleton} from '@/components/ui/skeleton';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {format} from 'date-fns';

interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
  user_id: string;
}

function Dashboard() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const fetchUserAndNotes = async () => {
      try {
        setLoading(true);

        // Get current user
        const {
          data: {user},
        } = await supabase.auth.getUser();
        setUserId(user?.id ?? null);
        setUserEmail(user?.email ?? null);

        if (user?.id) {
          // Fetch user's notes
          const {data, error} = await supabase
            .from('notes')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', {ascending: false});

          if (error) throw error;
          setNotes(data || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndNotes();
  }, []);

  async function handleLogout() {
    try {
      setLoading(true);
      const {error} = await supabase.auth.signOut();
      if (error) throw error;
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
      alert('Error logging out');
    } finally {
      setLoading(false);
    }
  }

  async function addNote({
    title,
    content,
    user_id,
  }: Omit<Note, 'id' | 'created_at'>) {
    try {
      if (!user_id) {
        throw new Error('User not authenticated');
      }

      setLoading(true);
      const {data, error} = await supabase
        .from('notes')
        .insert({
          title,
          content,
          user_id,
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setNotes([data, ...notes]);
        setTitle('');
        setContent('');
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error('Error adding note:', error);
      alert('Error adding note');
    } finally {
      setLoading(false);
    }
  }

  async function deleteNote(id: string) {
    try {
      setLoading(true);
      const {error} = await supabase.from('notes').delete().eq('id', id);

      if (error) throw error;

      setNotes(notes.filter((note) => note.id !== id));
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Error deleting note');
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      alert('You must be logged in to add a note');
      return;
    }
    if (!title.trim() || !content.trim()) {
      alert('Please fill in all fields');
      return;
    }
    addNote({title, content, user_id: userId});
  };

  if (loading && notes.length === 0) {
    return (
      <div className='min-h-screen bg-gray-50 p-4'>
        <div className='max-w-7xl mx-auto'>
          <div className='flex justify-between items-center mb-8'>
            <Skeleton className='h-8 w-48' />
            <div className='flex space-x-2'>
              <Skeleton className='h-10 w-24' />
              <Skeleton className='h-10 w-24' />
            </div>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className='h-6 w-3/4' />
                </CardHeader>
                <CardContent>
                  <Skeleton className='h-4 w-full mb-2' />
                  <Skeleton className='h-4 w-5/6' />
                </CardContent>
                <CardFooter>
                  <Skeleton className='h-8 w-20' />
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 p-4'>
      <div className='max-w-7xl mx-auto'>
        {/* Header with navigation */}
        <header className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4'>
          <div className='flex items-center space-x-4'>
            <Button
              variant='outline'
              onClick={() => router.push('/')}
              className='hidden sm:inline-flex'>
              Home
            </Button>
            <h1 className='text-2xl font-bold text-gray-800'>My Notes</h1>
          </div>

          <div className='flex items-center space-x-4 w-full sm:w-auto'>
            <div className='flex items-center space-x-2'>
              <Avatar className='h-8 w-8'>
                <AvatarImage src='' />
                <AvatarFallback className='bg-blue-100 text-blue-600'>
                  {userEmail?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className='text-sm text-gray-600 hidden sm:inline'>
                {userEmail}
              </span>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className='whitespace-nowrap'>+ Add Note</Button>
              </DialogTrigger>
              <DialogContent className='sm:max-w-md'>
                <DialogHeader>
                  <DialogTitle>Create New Note</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className='space-y-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='title'>Title</Label>
                    <Input
                      id='title'
                      placeholder='Enter note title'
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='content'>Content</Label>
                    <Input
                      id='content'
                      placeholder='Enter your note content'
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                    />
                  </div>
                  <Button type='submit' disabled={loading} className='w-full'>
                    {loading ? 'Saving...' : 'Save Note'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            <Button variant='outline' onClick={handleLogout} disabled={loading}>
              Logout
            </Button>
          </div>
        </header>

        {/* Mobile Home Button */}
        <Button
          variant='outline'
          onClick={() => router.push('/')}
          className='sm:hidden mb-4 w-full'>
          Home
        </Button>

        {/* Notes Grid */}
        {notes.length === 0 ? (
          <div className='bg-white rounded-lg shadow p-8 text-center'>
            <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-6 w-6 text-blue-600'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
                />
              </svg>
            </div>
            <h3 className='mt-2 text-lg font-medium text-gray-900'>
              No notes yet
            </h3>
            <p className='mt-1 text-gray-500'>
              Get started by creating your first note.
            </p>
            <div className='mt-6'>
              <Button onClick={() => setIsDialogOpen(true)}>+ New Note</Button>
            </div>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {notes.map((note) => (
              <Card
                key={note.id}
                className='hover:shadow-md transition-shadow duration-200'>
                <CardHeader>
                  <CardTitle className='text-lg font-semibold text-gray-800 line-clamp-1'>
                    {note.title}
                  </CardTitle>
                  <p className='text-xs text-gray-500'>
                    {format(new Date(note.created_at), 'MMM dd, yyyy - h:mm a')}
                  </p>
                </CardHeader>
                <CardContent>
                  <p className='text-gray-600 line-clamp-3'>{note.content}</p>
                </CardContent>
                <CardFooter className='flex justify-between items-center'>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => router.push(`/notes/${note.id}`)}>
                    View
                  </Button>
                  <Button
                    variant='destructive'
                    size='sm'
                    onClick={() => deleteNote(note.id)}
                    disabled={loading}>
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
