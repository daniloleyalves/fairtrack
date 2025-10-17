import { Illustrations } from '@/lib/assets/illustrations';
import { ResetPasswordForm } from '@/lib/auth/forms/reset-password-form';
import { SendIntstructionsForm } from '@/lib/auth/forms/send-instructions-form';
import { validateResetPasswordTokenAction } from '@/lib/auth/auth-actions';
import { Button } from '@components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@components/ui/card';
import Image from 'next/image';
import Link from 'next/link';

interface ResetPasswordPageProps {
  searchParams: Promise<{
    token?: string;
    error?: string;
  }>;
}

export default async function ResetPassword({
  searchParams,
}: ResetPasswordPageProps) {
  const { token: isToken, error: isError } = await searchParams;

  // Validate token if present
  let tokenValidation: { isValid: boolean; reason?: string } | null = null;
  if (isToken && !isError) {
    const result = await validateResetPasswordTokenAction({ token: isToken });
    if (result.success && result.data) {
      tokenValidation = result.data;
    } else {
      tokenValidation = { isValid: false, reason: 'validation_error' };
    }
  }

  return (
    <div className='mx-auto mt-8 flex-1 space-y-6 lg:max-w-sm'>
      {isToken && !isError && tokenValidation?.isValid ? (
        <div>
          <div className='mx-auto mb-4'>
            <Image
              src={Illustrations.resetPasswordIllustration}
              alt='reset password'
              loading='eager'
              decoding='sync'
            />
          </div>
          <Card>
            <CardHeader className='text-center'>
              <CardTitle>Passwort zurücksetzen</CardTitle>
              <CardDescription>Wähle ein neues Passwort</CardDescription>
            </CardHeader>
            <CardContent>
              <ResetPasswordForm token={isToken} />
            </CardContent>
          </Card>
        </div>
      ) : isToken && (!tokenValidation?.isValid || isError) ? (
        <Card>
          <CardHeader className='text-center'>
            <CardTitle className='text-destructive'>Ungültiger Token</CardTitle>
            <CardDescription>
              {tokenValidation?.reason === 'invalid_or_expired'
                ? 'Der Token ist ungültig oder abgelaufen. Bitte fordere einen neuen Link an.'
                : 'Es gab ein Problem bei der Token-Validierung. Bitte probiere es erneut.'}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className='w-full'>
              <Link href='/reset-password'>Neuen Link anfordern</Link>
            </Button>
          </CardFooter>
        </Card>
      ) : !isToken && !isError ? (
        <div>
          <div className='mx-auto mb-4'>
            <Image
              src={Illustrations.sendInstructionsIllustration}
              alt='send instructions'
              loading='eager'
              decoding='sync'
            />
          </div>
          <SendIntstructionsForm />
        </div>
      ) : !isToken && isError ? (
        <Card>
          <CardHeader className='text-center'>
            <CardTitle className='text-destructive'>Ungültiger Token</CardTitle>
            <CardDescription>Bitte probiere es erneut.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className='w-full'>
              <Link href='/reset-password'>Passwort zurücksetzen</Link>
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Card>
          <CardHeader className='text-center'>
            <CardTitle className='text-destructive'>
              Unerwarteter Fehler
            </CardTitle>
            <CardDescription>
              Es ist ein unerwarteter Fehler aufgetreten. Bitte probiere es
              erneut.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className='w-full'>
              <Link href='/reset-password'>Zurück</Link>
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
