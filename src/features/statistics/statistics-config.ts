export const colorClasses = {
  primary: {
    name: 'primary',
    bg: 'bg-[#CCDDA2]',
    text: 'text-primary',
    hex: '#446622',
  },
  destructive: {
    name: 'destructive',
    bg: 'bg-[#F1A9A9]',
    text: 'text-destructive-foreground',
    hex: '#dc2626',
  },
  default: {
    name: 'default',
    bg: 'bg-zinc-200',
    text: 'text-zinc-600',
    hex: '#e4e4e7',
  },
};

export const colorMapping: Record<number, string> = {
  1: '#446622', // dark green
  2: '#99BB44', // medium green
  3: '#C3D963', // light green
  4: '#666666', // dark gray (distinct)
  5: '#A0A0A0', // medium gray (more contrast)
};
