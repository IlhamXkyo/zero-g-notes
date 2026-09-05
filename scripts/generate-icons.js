const { app, BrowserWindow, nativeImage } = require('electron');
const fs = require('fs');
const path = require('path');

app.whenReady().then(async () => {
  console.log('Generating Earth app icon assets...');

  const win = new BrowserWindow({
    width: 512,
    height: 512,
    show: false,
    webPreferences: {
      offscreen: true,
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  const htmlContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body { margin: 0; padding: 0; background: transparent; overflow: hidden; }
      canvas { display: block; }
    </style>
  </head>
  <body>
    <canvas id="canvas" width="512" height="512"></canvas>
    <script>
      const canvas = document.getElementById('canvas');
      const ctx = canvas.getContext('2d');
      const cx = 256, cy = 256, r = 210;

      // 1. Atmosphere Glow (Outer Halo)
      const glowGrad = ctx.createRadialGradient(cx, cy, r * 0.85, cx, cy, r * 1.25);
      glowGrad.addColorStop(0, 'rgba(64, 200, 255, 0.6)');
      glowGrad.addColorStop(0.3, 'rgba(30, 144, 255, 0.35)');
      glowGrad.addColorStop(0.7, 'rgba(0, 100, 255, 0.12)');
      glowGrad.addColorStop(1, 'rgba(0, 50, 200, 0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 1.25, 0, Math.PI * 2);
      ctx.fill();

      // 2. Earth Sphere Clip
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.clip();

      // 2a. Ocean Base Gradient
      const oceanGrad = ctx.createRadialGradient(cx - 50, cy - 60, 30, cx, cy, r);
      oceanGrad.addColorStop(0, '#1a759f');
      oceanGrad.addColorStop(0.5, '#165b80');
      oceanGrad.addColorStop(0.85, '#0e3b5e');
      oceanGrad.addColorStop(1, '#071e3d');
      ctx.fillStyle = oceanGrad;
      ctx.fillRect(0, 0, 512, 512);

      // 2b. Continents (Stylized Earth Landmasses)
      ctx.fillStyle = '#2ec4b6';
      
      // North America & Greenland
      ctx.beginPath();
      ctx.moveTo(110, 100);
      ctx.bezierCurveTo(150, 80, 200, 95, 230, 125);
      ctx.bezierCurveTo(250, 150, 210, 190, 170, 200);
      ctx.bezierCurveTo(130, 210, 90, 160, 110, 100);
      ctx.fill();

      // South America
      ctx.beginPath();
      ctx.moveTo(180, 230);
      ctx.bezierCurveTo(240, 240, 260, 300, 230, 360);
      ctx.bezierCurveTo(200, 410, 170, 370, 160, 320);
      ctx.bezierCurveTo(150, 270, 160, 230, 180, 230);
      ctx.fill();

      // Europe & Asia / Eurasia
      ctx.fillStyle = '#48cae4';
      ctx.beginPath();
      ctx.moveTo(270, 90);
      ctx.bezierCurveTo(340, 70, 420, 100, 450, 150);
      ctx.bezierCurveTo(460, 190, 390, 220, 340, 190);
      ctx.bezierCurveTo(300, 170, 260, 140, 270, 90);
      ctx.fill();

      // Africa
      ctx.fillStyle = '#52b788';
      ctx.beginPath();
      ctx.moveTo(280, 190);
      ctx.bezierCurveTo(340, 200, 370, 260, 350, 320);
      ctx.bezierCurveTo(330, 380, 270, 360, 260, 300);
      ctx.bezierCurveTo(250, 240, 260, 190, 280, 190);
      ctx.fill();

      // Australia & Oceanic Islands
      ctx.beginPath();
      ctx.moveTo(380, 340);
      ctx.bezierCurveTo(430, 330, 450, 380, 410, 400);
      ctx.bezierCurveTo(370, 410, 360, 360, 380, 340);
      ctx.fill();

      // Small archipelago islands
      ctx.fillStyle = '#74c69d';
      const islands = [[220, 180, 8], [240, 200, 6], [320, 170, 9], [370, 280, 7], [400, 300, 10]];
      islands.forEach(([x, y, rad]) => {
        ctx.beginPath();
        ctx.arc(x, y, rad, 0, Math.PI * 2);
        ctx.fill();
      });

      // 2c. Cloud swirls
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      // Cloud band 1
      ctx.beginPath();
      ctx.moveTo(80, 150);
      ctx.bezierCurveTo(150, 130, 220, 170, 300, 140);
      ctx.bezierCurveTo(380, 110, 440, 160, 470, 170);
      ctx.bezierCurveTo(420, 185, 340, 160, 270, 180);
      ctx.bezierCurveTo(190, 200, 130, 170, 80, 150);
      ctx.fill();

      // Cloud band 2
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.beginPath();
      ctx.moveTo(120, 280);
      ctx.bezierCurveTo(200, 260, 280, 310, 360, 270);
      ctx.bezierCurveTo(420, 240, 450, 290, 430, 310);
      ctx.bezierCurveTo(350, 330, 260, 290, 180, 320);
      ctx.bezierCurveTo(130, 330, 100, 300, 120, 280);
      ctx.fill();

      // 2d. 3D Spherical Shading & Shadow
      const shadowGrad = ctx.createRadialGradient(cx - 70, cy - 80, 40, cx + 40, cy + 50, r * 1.15);
      shadowGrad.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
      shadowGrad.addColorStop(0.3, 'rgba(255, 255, 255, 0.05)');
      shadowGrad.addColorStop(0.65, 'rgba(0, 10, 30, 0.4)');
      shadowGrad.addColorStop(0.9, 'rgba(0, 5, 20, 0.75)');
      shadowGrad.addColorStop(1, 'rgba(0, 0, 10, 0.92)');
      ctx.fillStyle = shadowGrad;
      ctx.fillRect(0, 0, 512, 512);

      // 2e. Inner Atmosphere Rim Glow
      const innerRim = ctx.createRadialGradient(cx, cy, r * 0.85, cx, cy, r);
      innerRim.addColorStop(0, 'rgba(0, 210, 255, 0)');
      innerRim.addColorStop(0.8, 'rgba(64, 210, 255, 0.3)');
      innerRim.addColorStop(1, 'rgba(128, 230, 255, 0.8)');
      ctx.fillStyle = innerRim;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore(); // end earth sphere clip

      // Send ready signal
      window.dataUrl = canvas.toDataURL('image/png');
    </script>
  </body>
  </html>
  `;

  await win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);

  // Wait a small moment for render
  const dataUrl = await win.webContents.executeJavaScript('window.dataUrl');
  const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
  const masterPngBuffer = Buffer.from(base64Data, 'base64');

  const assetsDir = path.join(__dirname, '..', 'assets');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  // Save master 512x512 icon.png
  const pngPath = path.join(assetsDir, 'icon.png');
  fs.writeFileSync(pngPath, masterPngBuffer);
  console.log(`Saved master PNG icon to ${pngPath} (${masterPngBuffer.length} bytes)`);

  // Generate ICO containing [256, 128, 64, 48, 32, 16]
  const masterImg = nativeImage.createFromBuffer(masterPngBuffer);
  const sizes = [256, 128, 64, 48, 32, 16];
  const pngBuffers = sizes.map(size => {
    if (size === 512) return { size, buffer: masterPngBuffer };
    const resized = masterImg.resize({ width: size, height: size });
    return { size, buffer: resized.toPNG() };
  });

  // Assemble Windows .ico buffer
  // Header: 6 bytes
  // Directory entries: 16 bytes each
  // Image buffers appended
  const numImages = pngBuffers.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  let offset = headerSize + numImages * dirEntrySize;

  const icoBuffer = Buffer.alloc(offset + pngBuffers.reduce((acc, cur) => acc + cur.buffer.length, 0));
  
  // ICONDIR: idReserved (0), idType (1 = icon), idCount (numImages)
  icoBuffer.writeUInt16LE(0, 0);
  icoBuffer.writeUInt16LE(1, 2);
  icoBuffer.writeUInt16LE(numImages, 4);

  let currentDirOffset = headerSize;
  let currentImgOffset = offset;

  for (const { size, buffer } of pngBuffers) {
    const width = size >= 256 ? 0 : size;
    const height = size >= 256 ? 0 : size;

    icoBuffer.writeUInt8(width, currentDirOffset);
    icoBuffer.writeUInt8(height, currentDirOffset + 1);
    icoBuffer.writeUInt8(0, currentDirOffset + 2); // color count
    icoBuffer.writeUInt8(0, currentDirOffset + 3); // reserved
    icoBuffer.writeUInt16LE(1, currentDirOffset + 4); // color planes
    icoBuffer.writeUInt16LE(32, currentDirOffset + 6); // bits per pixel
    icoBuffer.writeUInt32LE(buffer.length, currentDirOffset + 8); // image size
    icoBuffer.writeUInt32LE(currentImgOffset, currentDirOffset + 12); // image offset

    buffer.copy(icoBuffer, currentImgOffset);

    currentDirOffset += dirEntrySize;
    currentImgOffset += buffer.length;
  }

  const icoPath = path.join(assetsDir, 'icon.ico');
  fs.writeFileSync(icoPath, icoBuffer);
  console.log(`Saved Windows ICO icon to ${icoPath} (${icoBuffer.length} bytes)`);

  win.close();
  app.quit();
});
