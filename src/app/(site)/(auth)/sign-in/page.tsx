import { Illustrations } from '@/lib/assets/illustrations';
import { SignInForm } from '@/lib/auth/forms/signin-form';
import { Button } from '@components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@components/ui/card';
import { ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function SignIn() {
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
                ANMELDEN
              </h1>
              <h2 className='mt-2 text-sm font-medium sm:text-lg'>
                Geben Sie unten Ihre E-Mail-Adresse ein, <br /> um sich bei
                Ihrem Konto anzumelden.
              </h2>
            </div>
            <SignInForm />
          </div>
        </CardContent>
      </Card>
      <Card className='w-full py-16 text-center'>
        <CardHeader>
          <CardTitle className='mb-1 text-xl'>Zum ersten Mal hier?</CardTitle>
          <CardDescription>
            Hier gehts&apos;s zur Anmeldung und zum Retteformular.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className='size-16 rounded-full' size='icon'>
            <Link href='/sign-up'>
              <ChevronRight className='size-[36px]' />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
