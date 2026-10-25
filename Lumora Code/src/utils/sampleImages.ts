/**
 * Generates sample images as File objects for instant testing.
 */
export async function createSampleImage(type: 'photo' | 'graphic' | 'pixel'): Promise<File> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  if (type === 'photo') {
    canvas.width = 1200;
    canvas.height = 800;

    // Realistic gradient sky
    const sky = ctx.createLinearGradient(0, 0, 0, 500);
    sky.addColorStop(0, '#1e293b');
    sky.addColorStop(0.5, '#475569');
    sky.addColorStop(1, '#f97316');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, 1200, 800);

    // Glowing sun
    const sunGrad = ctx.createRadialGradient(600, 480, 10, 600, 480, 220);
    sunGrad.addColorStop(0, '#fffbeb');
    sunGrad.addColorStop(0.3, '#fde047');
    sunGrad.addColorStop(0.8, '#ea580c');
    sunGrad.addColorStop(1, 'rgba(234, 88, 12, 0)');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(600, 480, 220, 0, Math.PI * 2);
    ctx.fill();

    // Mountain layers with subtle details
    const drawMountain = (points: [number, number][], color: string) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(points[0][0], points[0][1]);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i][0], points[i][1]);
      }
      ctx.lineTo(1200, 800);
      ctx.lineTo(0, 800);
      ctx.closePath();
      ctx.fill();
    };

    drawMountain([
      [0, 560], [200, 460], [420, 520], [600, 390], [820, 490], [1050, 420], [1200, 500]
    ], '#334155');

    drawMountain([
      [0, 640], [180, 580], [380, 510], [550, 570], [750, 480], [980, 560], [1200, 610]
    ], '#1e293b');

    drawMountain([
      [0, 720], [240, 670], [480, 630], [700, 690], [920, 640], [1200, 700]
    ], '#0f172a');

    // Water reflection
    const waterGrad = ctx.createLinearGradient(0, 700, 0, 800);
    waterGrad.addColorStop(0, 'rgba(249, 115, 22, 0.4)');
    waterGrad.addColorStop(1, '#020617');
    ctx.fillStyle = waterGrad;
    ctx.fillRect(0, 710, 1200, 90);

    // Pine trees silhouettes
    ctx.fillStyle = '#090d16';
    for (let x = 30; x < 1200; x += 45) {
      const h = 40 + Math.sin(x * 0.1) * 25;
      const y = 720;
      ctx.beginPath();
      ctx.moveTo(x, y - h);
      ctx.lineTo(x - 12, y);
      ctx.lineTo(x + 12, y);
      ctx.closePath();
      ctx.fill();
    }

    const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.95));
    return new File([blob], 'mountain-sunset.jpg', { type: 'image/jpeg' });
  }

  if (type === 'graphic') {
    canvas.width = 800;
    canvas.height = 800;

    // Crisp transparent background with geometric elements
    ctx.clearRect(0, 0, 800, 800);

    // Decorative backdrop badge
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(400, 400, 360, 0, Math.PI * 2);
    ctx.fill();

    // Concentric vibrant rings
    const colors = ['#38bdf8', '#818cf8', '#c084fc', '#f472b6'];
    colors.forEach((col, idx) => {
      ctx.strokeStyle = col;
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.arc(400, 400, 300 - idx * 45, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Geometric hexagon
    ctx.save();
    ctx.translate(400, 400);
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const x = Math.cos(angle) * 110;
      const y = Math.sin(angle) * 110;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();

    // Center focal star
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 64px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⚡', 0, -4);
    ctx.restore();

    // Typographic emblem
    ctx.font = '700 28px sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'center';
    ctx.fillText('VECTOR ART & HIGH CONTRAST', 400, 720);

    const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), 'image/png'));
    return new File([blob], 'geometric-badge.png', { type: 'image/png' });
  }

  // Pixel art
  canvas.width = 64;
  canvas.height = 64;
  ctx.clearRect(0, 0, 64, 64);

  // Draw 64x64 cute pixel character with crisp pixels
  ctx.fillStyle = '#3b82f6';
  ctx.fillRect(16, 20, 32, 28);
  ctx.fillStyle = '#60a5fa';
  ctx.fillRect(18, 22, 28, 24);

  // Eyes
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(24, 28, 4, 8);
  ctx.fillRect(36, 28, 4, 8);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(24, 28, 2, 3);
  ctx.fillRect(36, 28, 2, 3);

  // Smile
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(28, 40, 8, 3);

  // Cheeks
  ctx.fillStyle = '#f472b6';
  ctx.fillRect(20, 35, 4, 3);
  ctx.fillRect(40, 35, 4, 3);

  // Feet
  ctx.fillStyle = '#1d4ed8';
  ctx.fillRect(20, 48, 8, 6);
  ctx.fillRect(36, 48, 8, 6);

  const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), 'image/png'));
  return new File([blob], 'pixel-sprite-64px.png', { type: 'image/png' });
}
