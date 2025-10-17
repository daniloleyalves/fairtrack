import { Illustrations } from '@/lib/assets/illustrations';
import { SignUpForm } from '@/lib/auth/forms/signup-form';
import { Card, CardContent } from '@components/ui/card';
import Image from 'next/image';

export default function SignUp() {
  return (
    <div className='m-2 mb-16 flex h-full max-w-lg flex-col items-center justify-center gap-8 sm:m-8 sm:mx-auto'>
      <Card className='w-full'>
        <CardContent className='flex flex-col gap-12'>
          <Image
            src={Illustrations.loginIllustration}
            alt='login illustration'
            loading='eager'
            decoding='sync'
          />
          <div>
            <div className='mb-8 text-center'>
              <h1 className='font-londrina text-5xl font-medium sm:text-6xl'>
                REGISTRIEREN
              </h1>
              <h2 className='mt-2 text-sm font-medium sm:text-lg'>
                Bitte fülle das Formular aus, um dich zu registrieren.
              </h2>
            </div>
            <SignUpForm />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
