'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function RoomPage() {
  const { code } = useParams<{ code: string }>();
  const [room, setRoom] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [games, setGames] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRoom = async () => {
    const { data: roomData } = await supabase.from('rooms').select('*').eq('code', code).single();
    setRoom(roomData);
  };

  const fetchSubmissions = async () => {
    if (!room) return;
    const { data } = await supabase
      .from('submissions')
      .select('*')
      .eq('room_id', room.id);
    setSubmissions(data || []);
  };

  useEffect(() => {
    if (code) fetchRoom();
  }, [code]);

  useEffect(() => {
    if (room) fetchSubmissions();
  }, [room]);

  const handleSubmit = async () => {
    if (!name || games.split('\n').filter(Boolean).length < 10) {
      alert('Please fill all fields with at least 10 games');
      return;
    }
    if (isSubmitting) return;
    setIsSubmitting(true);

    const gameList = games.split('\n').map(g => g.trim()).filter(Boolean);

    const { error } = await supabase.from('submissions').upsert({
      room_id: room.id,
      name,
      games: gameList,
    });

    setIsSubmitting(false);

    if (error) {
      alert('Error submitting: ' + error.message);
    } else {
      setName('');
      setGames('');
      setRevealed(false);
      await fetchSubmissions();
    }
  };

  if (!room) return <p className="p-6 max-w-xl mx-auto">Loading...</p>;

  const submittedNames = submissions.map(s => s.name);
  const remainingNames = room.names.filter((n: string) => !submittedNames.includes(n));
  const allSubmitted = remainingNames.length === 0;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Room: {code}</h1>

      {!allSubmitted && (
        <div className="mb-8">
          <label className="block mb-2 font-medium">Select your name</label>
          <select
            className="w-full border border-gray-300 rounded-md p-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={name}
            onChange={e => setName(e.target.value)}
          >
            <option value="">-- Select --</option>
            {remainingNames.map(n => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>

          <textarea
            className="w-full border border-gray-300 rounded-md p-2 mt-4 text-base resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your top 10 games, one per line"
            value={games}
            onChange={e => setGames(e.target.value)}
            rows={8}
          />

          <button
            className="mt-6 px-5 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit List'}
          </button>
        </div>
      )}

      {allSubmitted && (
        <div>
          <h2 className="text-xl font-semibold mb-6">Submitted Lists</h2>
          {[...submissions].sort(() => 0.5 - Math.random()).map((s, i) => (
            <div
              key={i}
              className="bg-white shadow rounded-md p-4 mb-6 border border-gray-200"
            >
              <h3 className="font-semibold mb-2">List {i + 1}</h3>
              <ol className="list-decimal list-inside space-y-1">
                {s.games.map((g: string, j: number) => (
                  <li key={j}>{g}</li>
                ))}
              </ol>
              {revealed && (
                <p className="mt-3 text-sm text-gray-500">By: {s.name}</p>
              )}
            </div>
          ))}

          <button
            className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={() => setRevealed(true)}
            disabled={revealed}
          >
            {revealed ? 'Names Revealed' : 'Reveal Names'}
          </button>
        </div>
      )}
    </div>
  );
}
