'use client';

import {
  CheckCircle,
  AlertTriangle,
  Loader2,
  XCircle,
  MapPin,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useContribution } from '../context/contribution-context';

export function LocationIndicator() {
  const { locationStatus } = useContribution();

  const getIndicatorContent = () => {
    switch (locationStatus) {
      case 'loading':
        return {
          icon: <Loader2 className='size-4 animate-spin' />,
          text: 'Prüfe Standort...',
          className: 'text-blue-600',
        };
      case 'verified':
        return {
          icon: <CheckCircle className='size-4' />,
          text: 'Standort OK',
          className: 'text-primary',
        };
      case 'too-far':
        return {
          icon: <AlertTriangle className='size-4' />,
          text: 'Zu weit entfernt',
          className: 'text-orange-600',
        };
      case 'denied':
        return {
          icon: <XCircle className='size-4' />,
          text: 'Standort verweigert',
          className: 'text-destructive',
        };
      case 'error':
        return {
          icon: <XCircle className='size-4' />,
          text: 'Standort-Fehler',
          className: 'text-destructive',
        };
      default:
        return {
          icon: <MapPin className='size-4' />,
          text: 'Standort unbekannt',
          className: 'text-gray-600',
        };
    }
  };

  const { icon, text, className } = getIndicatorContent();

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      {icon}
      <span className='text-xs font-medium'>{text}</span>
    </div>
  );
}
