const { exec } = require('child_process');
const path = require('path');

const videoInput = document.getElementById('videoInput');
const player = document.getElementById('player');
const exportBtn = document.getElementById('exportBtn');
const log = document.getElementById('log');

let videoPath = '';

videoInput.addEventListener('change', (e) => {
  videoPath = e.target.files[0].path;
  player.src = videoPath;
});

exportBtn.addEventListener('click', () => {
  const start = document.getElementById('start').value;
  const duration = document.getElementById('duration').value;

  if (!videoPath || !start || !duration) {
    log.innerText = '请先导入视频，并输入 start 和 duration';
    return;
  }

  const output = videoPath.replace('.mp4', '_cut.mp4');

  const cmd = `ffmpeg -ss ${start} -i "${videoPath}" -t ${duration} -c copy "${output}"`;

  log.innerText = `执行中...\n${cmd}`;

  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      log.innerText += `\n错误：${err.message}`;
      return;
    }
    log.innerText += `\n完成！输出文件：${output}`;
  });
});
