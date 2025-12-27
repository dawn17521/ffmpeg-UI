const video = document.getElementById("video");
const info = document.getElementById("info");
let VideoPath = "";
document.getElementById("open").onclick = async () => {
    const path = await window.parseInt.pickVideo();
    if (!path) return;
    videoPath = path;
    video.src = path;

};

document.getElementById("export").onclick = async () => {
    if (!videoPath) {
        alert("no video found");
        return;
    }
    const { inPut, outPut} = window.timeline.get();
    const start = video.duration * inPut;
    const end = video.duration * outPut;
    if (!isFinite(start) || !isFinite(end) || end <= start) {
        alert("not in range");
        return;
    }
    const output = VideoPath.replace(/\.(\w+)$/, `_cut_${Math.floor(start)}_${Math.floor(end)}.$1`);
    const cmd = `ffmpeg -ss ${start} -to ${end} -i "${videoPath}" -c copy "${output}"`;
    info.textContent = 'exporting...';
    await window.api.runFFmpeg(cmd);
    info.textContent = `Exported as ${output}`;
};