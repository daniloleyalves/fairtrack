'use client';

import { Form } from '@components/ui/form';
import { submitContributionAction } from '@server/contribution/actions';
import {
  contributionFormSchema,
  ContributionFormValues,
} from '@features/contribution/schemas/contribution-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { DefaultValues, SubmitHandler, useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useFormAction } from '@/lib/hooks/use-form-action';
import { fairteilerKeys } from '@/server/fairteiler/query-keys';
import { userKeys } from '@/server/user/query-keys';
import { useQueryClient } from '@tanstack/react-query';

interface ContributionFormConfig {
  fairteilerId: string;
  successRedirect?: string;
  revalidatePaths?: string[];
  context?: 'fairteiler' | 'user' | 'admin';
  submitAsAccessViewId?: string | null;
}

export function ContributionForm({
  children,
  defaultValues,
  config,
}: {
  children: React.ReactNode;
  defaultValues?: DefaultValues<ContributionFormValues>;
  config: ContributionFormConfig;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const form = useForm<ContributionFormValues>({
    resolver: zodResolver(contributionFormSchema),
    defaultValues: { contributions: [], config, ...defaultValues },
    mode: 'onChange',
  });

  const submitContribution = useFormAction(submitContributionAction, form, {
    successMessage: 'Lebensmittel erfolgreich beigetragen!',
    onSuccess: (data) => {
      form.reset();

      void queryClient.invalidateQueries({
        queryKey: fairteilerKeys.dashboard().queryKey,
      });
      void queryClient.invalidateQueries({
        queryKey: userKeys.dashboard().queryKey,
      });

      if (data?.redirectTo) {
        router.push(data.redirectTo);
      }
    },
  });

  const onSubmit: SubmitHandler<ContributionFormValues> = (
    data: ContributionFormValues,
  ) => {
    if (Object.keys(form.formState.errors).length) {
      return;
    }

    // Merge config into submission data
    const submissionData = {
      ...data,
      config: {
        fairteilerId: config.fairteilerId,
        successRedirect: config.successRedirect,
        revalidatePaths: config.revalidatePaths,
        context: config.context,
        submitAsAccessViewId: config.submitAsAccessViewId,
      },
    };

    submitContribution.execute(submissionData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>{children}</form>
    </Form>
  );
}
