'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function CreateRoom() {
  const [names, setNames] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const generateCode = () => Math.random().toString(36).substring(2, 8);

  const handleCreate = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const code = generateCode();
    const nameList = names.split('\n').map(n => n.trim()).filter(Boolean);
    if (nameList.length === 0) {
      alert('Enter at least one name');
      setIsSubmitting(false);
      return;
    }

    const { error } = await supabase.from('rooms').insert({
      code,
      names: nameList,
    });

    setIsSubmitting(false);

    if (error) {
      alert('Error creating room');
      console.error(error);
    } else {
      router.push(`/room/${code}`);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Create a Room</h1>
      <textarea
        className="w-full border border-gray-300 rounded-md p-2 text-base resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Enter player names, one per line"
        value={names}
        onChange={e => setNames(e.target.value)}
        rows={8}
      />
      <button
        className="mt-6 px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handleCreate}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Creating...' : 'Create Room'}
      </button>
    </div>
  );
}
