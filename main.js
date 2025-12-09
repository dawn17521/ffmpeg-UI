const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const { spawn, execFileSync } = require('child_process');
const path = require('path');
const fs = require('fs');


function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    backgroundColor: '#000000',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.loadFile(path.join(__dirname, 'index.html'));
}

app.whenReady().then(createWindow);


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Helper to run ffmpeg and forward stderr lines to renderer
function runFFmpegProcess(args, event) {
  return new Promise((resolve, reject) => {
    try {
      const ff = spawn('ffmpeg', args, { windowsHide: true });

      ff.stderr.on('data', (data) => {
        const text = data.toString();
        if (event && event.sender) event.sender.send('ffmpeg-log', text);
      });

      ff.on('close', (code) => {
        resolve({ success: code === 0, code });
      });

      ff.on('error', (err) => {
        reject({ success: false, error: err.message });
      });
    } catch (err) {
      reject({ success: false, error: err.message });
    }
  });
}

ipcMain.handle('run-ffmpeg', async (event, payload) => {
  const { input, start, duration, output, encoderArgs } = payload;
  const args = [];
  if (start) args.push('-ss', start);
  args.push('-i', input);
  if (duration) args.push('-t', duration);
  if (Array.isArray(encoderArgs) && encoderArgs.length) args.push(...encoderArgs);
  args.push(output);

  return await runFFmpegProcess(args, event);
});

ipcMain.handle('select-file', async () => {
  const res = await dialog.showOpenDialog({ properties: ['openFile'], filters: [{ name: 'Videos', extensions: ['mp4','mov','mkv','webm'] }] });
  if (res.canceled) return null;
  return res.filePaths[0];
});

// Pre-generate thumbnails into outDir (creates outDir/thumb_0001.jpg ...)
ipcMain.handle('generate-thumbs', async (event, payload) => {
  const { input, fps = 1, outDir } = payload;
  try {
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    const args = ['-i', input, '-vf', `scale=320:-1,fps=${fps}`, path.join(outDir, 'thumb_%04d.jpg')];
    const res = await runFFmpegProcess(args, event);
    return res;
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// Grab single frame at time to outPath
ipcMain.handle('grab-frame', async (event, payload) => {
  const { input, time, outPath } = payload;
  try {
    const args = ['-ss', time, '-i', input, '-frames:v', '1', '-q:v', '2', outPath];
    const res = await runFFmpegProcess(args, event);
    return res;
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// Detect encoders via ffmpeg -encoders
ipcMain.handle('detect-encoders', async () => {
  try {
    const out = execFileSync('ffmpeg', ['-hide_banner', '-encoders'], { encoding: 'utf8' });
    const lines = out.split('\n');
    const encoders = [];
    for (let line of lines) {
      const m = line.match(/^\s*[A-Z\.]+\s+(\S+)\s+(.*)$/);
      if (m) {
        encoders.push({ name: m[1], desc: m[2].trim() });
      }
    }
    return { success: true, encoders };
  } catch (err) {
    // Some ffmpeg builds print to stderr; try again with pipe
    try {
      const out2 = execFileSync('ffmpeg', ['-hide_banner', '-encoders'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
      const lines = out2.split('\n');
      const encoders = [];
      for (let line of lines) {
        const m = line.match(/^\s*[A-Z\.]+\s+(\S+)\s+(.*)$/);
        if (m) encoders.push({ name: m[1], desc: m[2].trim() });
      }
      return { success: true, encoders };
    } catch (e) {
      return { success: false, error: err.message };
    }
  }
});
