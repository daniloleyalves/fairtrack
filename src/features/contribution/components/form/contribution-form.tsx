'use client';

import { Form } from '@components/ui/form';
import { submitContributionAction } from '@server/contribution/actions';
import {
  contributionFormSchema,
  ContributionFormValues,
} from '@features/contribution/schemas/contribution-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { createContext, useContext } from 'react';
import { DefaultValues, SubmitHandler, useForm } from 'react-hook-form';
import { useFormAction } from '@/lib/hooks/use-form-action';
import { usePendingRedirect } from '@/lib/hooks/use-pending-redirect';
import { fairteilerKeys } from '@/server/fairteiler/query-keys';
import { userKeys } from '@/server/user/query-keys';
import { useQueryClient } from '@tanstack/react-query';

const ContributionFormPendingContext = createContext(false);

export function useContributionFormPending() {
  return useContext(ContributionFormPendingContext);
}

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
  const queryClient = useQueryClient();

  const form = useForm<ContributionFormValues>({
    resolver: zodResolver(contributionFormSchema),
    defaultValues: { contributions: [], config, ...defaultValues },
    mode: 'onChange',
  });

  const { isRedirectPending, redirect } = usePendingRedirect(() => {
    form.reset();
    submitContribution.reset();
  });

  const submitContribution = useFormAction(submitContributionAction, form, {
    successMessage: 'Lebensmittel erfolgreich beigetragen!',
    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        queryKey: fairteilerKeys.dashboard().queryKey,
      });
      void queryClient.invalidateQueries({
        queryKey: userKeys.dashboard().queryKey,
      });

      const redirectTo = data?.redirectTo;
      if (redirectTo) {
        redirect(redirectTo);
      } else {
        form.reset();
        submitContribution.reset();
      }
    },
  });

  const isPending =
    submitContribution.isPending ||
    submitContribution.hasSucceeded ||
    isRedirectPending;

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
    <ContributionFormPendingContext.Provider value={isPending}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>{children}</form>
      </Form>
    </ContributionFormPendingContext.Provider>
  );
}
