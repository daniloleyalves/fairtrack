'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { toast } from 'sonner';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Copy, Download, Loader2, Plus, QrCode, Trash2 } from 'lucide-react';
import { Button } from '@ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@ui/card';
import { Input } from '@ui/input';
import { Checkbox } from '@ui/checkbox';
import { Label } from '@ui/label';
import { Skeleton } from '@ui/skeleton';
import { ConfirmModal } from '@/components/confirm-modal';
import { invokeAction } from '@/lib/hooks/use-form-action';
import { MemberRolesEnum } from '@/lib/auth/auth-permissions';
import { getActiveFairteiler } from '@/server/fairteiler/queries';
import { fairteilerKeys } from '@/server/fairteiler/query-keys';
import {
  createQrCodeAction,
  revokeQrCodeAction,
  updateQrCodeAction,
} from '@/server/qr-code/actions';
import { getQrCodes, FairteilerQrCodeListItem } from '@/server/qr-code/queries';
import { qrCodeKeys } from '@/server/qr-code/query-keys';
import { qrCodeUrl } from '@/server/qr-code/constants';
import { downloadBlob, renderQrPoster } from '../lib/qr-poster';

export function QrCodeCard() {
  const queryClient = useQueryClient();
  const qrCodesQuery = useQuery({
    ...qrCodeKeys.all(),
    queryFn: () => getQrCodes(),
  });
  const fairteilerQuery = useQuery({
    ...fairteilerKeys.active(),
    queryFn: () => getActiveFairteiler(),
  });

  const fairteiler = fairteilerQuery.data;
  const guestAccessViews = (fairteiler?.members ?? [])
    .filter(
      (member) => (member.role as MemberRolesEnum) === MemberRolesEnum.GUEST,
    )
    .map((member) => ({ id: member.user.id, name: member.user.name }));

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: qrCodeKeys.all().queryKey });

  const create = useMutation({
    mutationFn: () =>
      invokeAction(createQrCodeAction, {
        label: null,
        guestAccessViewId: null,
      }),
    onSuccess: () => toast.success('QR-Code erstellt!'),
    onError: (error) => toast.error(error.message),
    onSettled: invalidate,
  });

  if (qrCodesQuery.isPending || fairteilerQuery.isPending) {
    return <QrCodeCardSkeleton />;
  }
  if (qrCodesQuery.error) throw qrCodesQuery.error;
  if (fairteilerQuery.error) throw fairteilerQuery.error;

  const qrCodes = qrCodesQuery.data;

  return (
    <Card>
      <CardHeader className='flex flex-col justify-between gap-4 sm:flex-row'>
        <QrCodeCardTitle />
        <Button
          onClick={() => create.mutate()}
          disabled={create.isPending}
          className='self-start'
        >
          {create.isPending ? (
            <Loader2 className='size-4 animate-spin' />
          ) : (
            <Plus className='size-4' />
          )}
          QR-Code erstellen
        </Button>
      </CardHeader>
      {qrCodes.length > 0 && fairteiler && (
        <CardContent className='flex flex-col gap-4'>
          {qrCodes.map((qrCode) => (
            <QrCodeRow
              key={qrCode.id}
              qrCode={qrCode}
              fairteilerName={fairteiler.name}
              fairteilerSlug={fairteiler.slug}
              guestAccessViews={guestAccessViews}
              onChanged={invalidate}
            />
          ))}
          {guestAccessViews.length === 0 && (
            <p className='text-sm text-muted-foreground'>
              Lege unter Mitglieder einen Gastzugang an, damit Personen ohne
              Konto nach dem Scannen als Gast beitragen können.
            </p>
          )}
        </CardContent>
      )}
    </Card>
  );
}

function QrCodeCardTitle() {
  return (
    <div className='flex flex-col gap-3 xs:flex-row'>
      <div className='flex size-10 min-w-10 items-center justify-center rounded-lg bg-primary/10'>
        <QrCode className='size-5 text-primary' />
      </div>
      <div>
        <CardTitle>QR-Codes am Fairteiler</CardTitle>
        <CardDescription>
          Für Fairteiler ohne Personal vor Ort: Wer den QR-Code scannt, trägt
          mit dem eigenen Konto oder als Gast bei, und der Beitrag gilt als vor
          Ort bestätigt.
        </CardDescription>
      </div>
    </div>
  );
}

export function QrCodeCardSkeleton() {
  return (
    <Card>
      <CardHeader className='flex flex-col justify-between gap-4 sm:flex-row'>
        <QrCodeCardTitle />
        <Skeleton className='h-9 w-40 self-start rounded-md bg-secondary' />
      </CardHeader>
    </Card>
  );
}

function QrCodeRow({
  qrCode,
  fairteilerName,
  fairteilerSlug,
  guestAccessViews,
  onChanged,
}: {
  qrCode: FairteilerQrCodeListItem;
  fairteilerName: string;
  fairteilerSlug: string;
  guestAccessViews: { id: string; name: string }[];
  onChanged: () => void;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [label, setLabel] = useState(qrCode.label ?? '');
  const [confirmRevoke, setConfirmRevoke] = useState(false);
  const url = qrCodeUrl(
    qrCode.token,
    typeof window === 'undefined' ? 'http://localhost' : window.location.origin,
  );

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(url, { width: 160, margin: 1 }).then((dataUrl) => {
      if (!cancelled) setPreview(dataUrl);
    });
    return () => {
      cancelled = true;
    };
  }, [url]);

  const update = useMutation({
    mutationFn: (values: {
      label: string | null;
      guestAccessViewId: string | null;
    }) => invokeAction(updateQrCodeAction, { id: qrCode.id, ...values }),
    onSuccess: () => toast.success('QR-Code aktualisiert!'),
    onError: (error) => toast.error(error.message),
    onSettled: onChanged,
  });

  const revoke = useMutation({
    mutationFn: () => invokeAction(revokeQrCodeAction, { id: qrCode.id }),
    onSuccess: () =>
      toast.success('QR-Code widerrufen. Gedruckte Poster gelten nicht mehr.'),
    onError: (error) => toast.error(error.message),
    onSettled: onChanged,
  });

  const download = useMutation({
    mutationFn: async () => {
      const blob = await renderQrPoster({ url, fairteilerName });
      downloadBlob(blob, `fairtrack-qr-${fairteilerSlug}.png`);
    },
    onError: (error) => toast.error(error.message),
  });

  const guestAccessViewId = qrCode.guestAccessView?.id ?? null;
  const saveLabel = () => {
    const next = label.trim() || null;
    if (next !== qrCode.label) {
      update.mutate({ label: next, guestAccessViewId });
    }
  };

  return (
    <div className='flex flex-col gap-4 rounded-lg border p-4 sm:flex-row'>
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt='QR-Code Vorschau'
          className='size-32 self-center rounded-md border'
        />
      ) : (
        <Skeleton className='size-32 self-center bg-secondary' />
      )}
      <div className='flex flex-1 flex-col gap-3'>
        <Input
          aria-label='Bezeichnung'
          placeholder='Bezeichnung, z. B. Eingang'
          value={label}
          maxLength={60}
          onChange={(event) => setLabel(event.target.value)}
          onBlur={saveLabel}
        />
        <div className='flex items-center gap-2'>
          <Checkbox
            id={`qr-guest-${qrCode.id}`}
            checked={guestAccessViewId !== null}
            onCheckedChange={(checked) =>
              update.mutate({
                label: qrCode.label,
                guestAccessViewId:
                  checked === true ? (guestAccessViews[0]?.id ?? null) : null,
              })
            }
            disabled={
              update.isPending ||
              (guestAccessViewId === null && guestAccessViews.length === 0)
            }
          />
          <Label htmlFor={`qr-guest-${qrCode.id}`}>
            Beiträge als Gast ermöglichen
          </Label>
        </div>
        <div className='flex flex-wrap gap-2'>
          <Button
            size='sm'
            onClick={() => download.mutate()}
            disabled={download.isPending}
          >
            <Download className='size-4' />
            Poster herunterladen
          </Button>
          <Button
            size='sm'
            variant='outline'
            onClick={async () => {
              await navigator.clipboard.writeText(url);
              toast.success('Link kopiert!');
            }}
          >
            <Copy className='size-4' />
            Link kopieren
          </Button>
          <Button
            size='sm'
            variant='ghost'
            className='text-destructive'
            onClick={() => setConfirmRevoke(true)}
            disabled={revoke.isPending}
          >
            <Trash2 className='size-4' />
            Widerrufen
          </Button>
        </div>
      </div>
      <ConfirmModal
        open={confirmRevoke}
        onOpenChange={setConfirmRevoke}
        title='QR-Code widerrufen?'
        description='Gedruckte Poster mit diesem QR-Code funktionieren danach nicht mehr. Erstelle einen neuen Code, wenn du das Poster ersetzen willst.'
        actionTitle='Ja, widerrufen'
        actionVariant='destructive'
        onConfirm={() => {
          setConfirmRevoke(false);
          revoke.mutate();
        }}
        useTrigger={false}
      />
    </div>
  );
}
