import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from '../../lib/axios';
import { Button } from '../ui/Button';

export default function NewsletterWidget() {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);

  const subscribe = useMutation({
    mutationFn: async (emailAddr: string) => {
      // Typically goes to /api/newsletter/subscribe
      return axios.post('/api/newsletter/subscribe', { email: emailAddr });
    },
    onSuccess: () => setSuccess(true),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) subscribe.mutate(email);
  };

  if (success) {
    return (
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
        <h3 className="text-xl font-bold mb-2">You're in! 🎉</h3>
        <p className="text-indigo-100">Thanks for subscribing. Expect the best dispatches in your inbox soon.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
      <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Get the Daily Dispatch</h3>
      <p className="text-slate-600 dark:text-slate-400 mb-4 text-sm">
        Join 50,000+ readers getting breaking news and deep insights delivered daily.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          required
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
        />
        <Button type="submit" disabled={subscribe.isPending} className="w-full">
          {subscribe.isPending ? 'Subscribing...' : 'Subscribe Free'}
        </Button>
      </form>
    </div>
  );
}
