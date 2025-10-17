'use client';

import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Milestone } from '@/server/db/db-types';

export function ContributionFeedback({
  feedbackData,
}: {
  feedbackData: {
    recentContributions: {
      id: string;
      date: Date;
      quantity: number;
      shelfLife: Date | null;
      title: string | null;
      cool: boolean | null;
      allergens: string | null;
      comment: string | null;
      origin: {
        name: string | null;
      };
      category: {
        name: string | null;
        image: string | null;
      };
      company: {
        name: string | null;
      };
      fairteiler: {
        name: string;
      };
    }[];
    achievedMilestones?: Milestone[] | null;
    nextMilestone?: Milestone | null;
  } | null;
}) {
  const [streamedText, setStreamedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!feedbackData) return;

    const streamFeedback = async () => {
      try {
        setIsLoading(true);
        setStreamedText('');

        const response = await fetch('/api/feedback/stream', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(feedbackData),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error('No response body reader available');
        }

        let accumulatedText = '';

        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          accumulatedText += chunk;
          setStreamedText(accumulatedText);
        }
      } catch (err) {
        console.error('Failed to stream feedback:', err);
        setStreamedText('Super, dass du dabei bist! Jeder Beitrag zählt! 💚');
      } finally {
        setIsLoading(false);
      }
    };

    streamFeedback();
  }, [feedbackData]);

  if (!feedbackData && !isLoading && !streamedText) {
    return null;
  }

  return (
    <div className='mt-6 w-full rounded-lg bg-purple-500/5 p-3'>
      <div className='flex gap-2'>
        <Sparkles className='mt-0.5 size-5 shrink-0 text-purple-700' />
        <div className='flex-1'>
          {isLoading && !streamedText ? (
            <div className='mt-2 ml-2 size-2 animate-ping rounded-full bg-purple-500' />
          ) : (
            <p className='text-sm leading-relaxed text-purple-900'>
              {streamedText}
              {isLoading && streamedText && (
                <span className='ml-1 inline-block size-1 animate-pulse rounded-full bg-purple-500' />
              )}
            </p>
          )}
          {/* {error && <p className='mt-1 text-sm text-red-600'>{error}</p>} */}
        </div>
      </div>
    </div>
  );
}
