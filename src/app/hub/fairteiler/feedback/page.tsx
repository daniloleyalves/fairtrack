import { DataErrorBoundary } from '@/components/error-boundary';
import { BlurFade } from '@/components/magicui/blur-fade';
import { UnauthorizedAccess } from '@/components/unauthorized-access';
import { FeedbackForm } from '@/features/feedback/forms/feedback-form';
import { getSession } from '@/server/dto';
import { headers } from 'next/headers';

export default async function FeedbackPage() {
  const auth = await getSession(await headers());
  const user = auth?.user;

  if (!user) {
    return <UnauthorizedAccess />;
  }

  return (
    <div className='mx-2 mt-8 mb-64 flex flex-col gap-4 sm:mx-8'>
      <h2 className='font-londrina text-4xl font-bold tracking-wider text-white'>
        Feedback
      </h2>

      <DataErrorBoundary>
        <BlurFade delay={0.2}>
          <FeedbackForm />
        </BlurFade>
      </DataErrorBoundary>
    </div>
  );
}
