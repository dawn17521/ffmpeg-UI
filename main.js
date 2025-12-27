const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const { exec } = require("child_process");
const path = require("path");

function CreateWindow() {
    const win = new BrowserWindow({
        width:1200,
        height:800,
        backgroundcolor: "#0b0b0b",
        webPreferences: {
            preload: path.join(__dirname, "preload.js")
        }
    });
    win.loadFile("index.html");
}

ipcMain.handle("pickVideo", async () => {
    const res = await dialog.showOpenDialog({
        properties: ["openFile"],
        filters: [{ name: "Video", extension: ["mp4", "mov", "mkv"]}]
    });
    return res.canceled ? null : res.filePaths[0];
});

ipcMain.handle("runFFmpeg", (_, cmd, warned ) => {
    console.log("./ffmpeg/ffmpeg.exe", cmd);
    return new Promise((resolve, reject) => {
        exec(cmd,(err) => {
            if (err) reject(err);
            else resolve();
        });
    });
});
app.whenReady().then(CreateWindow);