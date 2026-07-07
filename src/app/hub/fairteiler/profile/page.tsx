import { ProfileFormWrapper } from '@/features/fairteiler/profile/forms/fairteiler-profile-form';
import { BlurFade } from '@components/magicui/blur-fade';
import { FormErrorBoundary } from '@components/error-boundary';

export default function FairteilerProfilePage() {
  return (
    <div className='mx-2 mt-8 mb-64 flex flex-col gap-4 sm:mx-8'>
      <div className='mb-4 flex flex-col gap-2 text-center sm:text-start'>
        <h2 className='font-londrina text-4xl font-bold tracking-wider text-white'>
          Profil
        </h2>
      </div>
      <FormErrorBoundary>
        <BlurFade duration={0.2}>
          <ProfileFormWrapper />
        </BlurFade>
      </FormErrorBoundary>
    </div>
  );
}
