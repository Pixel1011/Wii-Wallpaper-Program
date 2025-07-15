"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const child_process_1 = require("child_process");
let logFilePath = "C:\\Program Files (x86)\\Steam\\steamapps\\common\\wallpaper_engine\\log.txt";
let infopath = "../info.txt";
let apps = {};
let sampleText = `${logFilePath}
app1=C:\\Program Files (x86)\\Steam\\steam.exe
app2=
app3=
app4=
app5=
app6=
app7=
app8=
app9=
app10=
app11=
app12=`;
async function sendError(msg, title, timeout, callback) {
    return new Promise((res, rej) => {
        (0, child_process_1.exec)(`powershell -Command "Add-Type -AssemblyName PresentationFramework; [System.Windows.MessageBox]::Show('${msg}', '${title}', 'OK', 'Error')"`, () => {
            callback();
            res();
        });
    });
}
async function loadApps() {
    if (!fs_1.default.existsSync(infopath)) {
        fs_1.default.writeFileSync(infopath, sampleText);
        await sendError("Please edit the newly created info.txt with your log file path and apps/commands to execute", "Error", 0, () => { process.exit(); });
    }
    let data = fs_1.default.readFileSync(infopath).toString().split("\n");
    logFilePath = data.splice(0, 1)[0];
    console.log("logfile path: " + logFilePath);
    if (!fs_1.default.existsSync(logFilePath)) {
        await sendError("No log file found! Please fix the path or enable verbose logging in wallpaper engine!", "Error", 0, () => { process.exit(); });
    }
    for (let i = 0; i < data.length; i++) {
        let e = data[i];
        if (!e)
            continue;
        let split = e.split("=");
        let number = e.split("=")[0].replace("app", "");
        if (isNaN(parseInt(number))) {
            await sendError(`Line #${i + 2} in info.txt is misformatted.\nPlease fix!`, "Error", 0, () => { process.exit(); });
        }
        let path = split[1];
        if (!path) {
            console.log(`app${number} missing executable/command, continuing..`);
            continue;
        }
        apps[`app${number}`] = "\"" + path + "\"";
    }
    console.log("Loaded apps");
}
function checkWallpaperLog() {
    fs_1.default.watchFile(logFilePath, { interval: 100 }, () => {
        fs_1.default.readFile(logFilePath, "utf8", (err, data) => {
            if (err || !data)
                return;
            const lines = data.trim().split("\n");
            const lastLine = lines[lines.length - 1];
            const match = lastLine.match(/Log:\s(app\d+)/i);
            if (match) {
                const appKey = match[1].toLowerCase();
                if (apps[appKey]) {
                    console.log(`Launching: ${apps[appKey]}`);
                    fs_1.default.truncate(logFilePath, 0, (err) => {
                        if (!err)
                            (0, child_process_1.exec)(apps[appKey]);
                    });
                }
            }
        });
    });
}
async function main() {
    await loadApps();
    checkWallpaperLog();
}
main();
//# sourceMappingURL=index.js.map