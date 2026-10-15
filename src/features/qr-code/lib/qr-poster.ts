import QRCode from 'qrcode';

const POSTER_WIDTH = 1240;
const POSTER_HEIGHT = 1754;
const QR_SIZE = 900;

function wrapLines(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
) {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(' ')) {
    const candidate = line ? `${line} ${word}` : word;
    if (context.measureText(candidate).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

export async function renderQrPoster({
  url,
  fairteilerName,
}: {
  url: string;
  fairteilerName: string;
}): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = POSTER_WIDTH;
  canvas.height = POSTER_HEIGHT;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas wird nicht unterstützt.');

  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, POSTER_WIDTH, POSTER_HEIGHT);
  context.fillStyle = '#1f2937';
  context.textAlign = 'center';
  const centerX = POSTER_WIDTH / 2;

  context.font = 'bold 84px sans-serif';
  context.fillText('Lebensmittel gerettet?', centerX, 200);

  context.font = '44px sans-serif';
  wrapLines(
    context,
    'Scanne den QR-Code und trage ein, was du in den Fairteiler gelegt hast.',
    POSTER_WIDTH - 240,
  ).forEach((line, index) => {
    context.fillText(line, centerX, 300 + index * 60);
  });

  const qrDataUrl = await QRCode.toDataURL(url, {
    width: QR_SIZE,
    margin: 1,
    errorCorrectionLevel: 'M',
  });
  const qrImage = await loadImage(qrDataUrl);
  const qrTop = 440;
  context.drawImage(qrImage, centerX - QR_SIZE / 2, qrTop, QR_SIZE, QR_SIZE);

  context.font = 'bold 60px sans-serif';
  wrapLines(context, fairteilerName, POSTER_WIDTH - 240).forEach(
    (line, index) => {
      context.fillText(line, centerX, qrTop + QR_SIZE + 110 + index * 72);
    },
  );

  context.font = '32px sans-serif';
  context.fillStyle = '#6b7280';
  context.fillText(
    'Mit eigenem Konto oder als Gast · FairTrack',
    centerX,
    POSTER_HEIGHT - 90,
  );

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Poster konnte nicht erstellt werden.'));
    }, 'image/png');
  });
}

export function downloadBlob(blob: Blob, fileName: string) {
  const href = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = href;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(href);
}
