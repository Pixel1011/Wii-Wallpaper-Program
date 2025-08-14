/* eslint-disable @stylistic/no-trailing-spaces */
/* eslint-disable @stylistic/padded-blocks */
/* eslint-disable @stylistic/spaced-comment */
/* eslint-disable @stylistic/brace-style */
/* eslint-disable @stylistic/max-statements-per-line */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */

// i love new eslint... :(

import fs from "fs";
import { exec, ExecException, execSync, spawn } from "child_process";

// File path to log.txt
let logFilePath = "C:\\Program Files (x86)\\Steam\\steamapps\\common\\wallpaper_engine\\log.txt";
let infopath = "../info.txt";
// format: appI: 'path',
let apps = {};

// adapted from yeeterlol's code (thank you!! :D)
async function getLogFile() {
    if (fs.existsSync(logFilePath)) {
        return { path: logFilePath, guess: false };
    }
    //let findPath = execSync(`wmic process where "name='wallpaper32.exe'" get ExecutablePath`, { windowsHide: true }).toString().trim();
    //let findPath64 = execSync(`wmic process where "name='wallpaper64.exe'" get ExecutablePath`, { windowsHide: true }).toString().trim();
    let findPath = execSync(`powershell.exe -command "Get-WmiObject win32_process | Where-Object name -eq wallpaper32.exe | Select -ExpandProperty ExecutablePath"`, { windowsHide: true }).toString().trim();
    let findPath64 = execSync(`powershell.exe -command "Get-WmiObject win32_process | Where-Object name -eq wallpaper64.exe | Select -ExpandProperty ExecutablePath"`, { windowsHide: true }).toString().trim();
    
    if (!findPath && !findPath64) {
        return { path: "C:\\Program Files (x86)\\Steam\\steamapps\\common\\wallpaper_engine\\log.txt", guess: true };
    }
    let logpath: string;
    if (findPath.includes("wallpaper32")) {
        return { path: findPath.replace("wallpaper32.exe", "log.txt"), guess: false };
    }
    if (findPath64.includes("wallpaper64")) {
        return { path: findPath64.replace("wallpaper64.exe", "log.txt"), guess: false };
    }
}

async function sendError(msg: string, title: string, timeout: number, callback: { (): never; (): never; (): never; (error: ExecException | null, stdout: string, stderr: string): void }) {
    return new Promise<void>((res, rej) => {
        exec(`powershell -Command "Add-Type -AssemblyName PresentationFramework; [System.Windows.MessageBox]::Show('${msg}', '${title}', 'OK', 'Error')"`, () => {
            callback();
            res();
        });
    });
}

async function loadApps() {
    let logFileRes = await getLogFile();
    logFilePath = logFileRes.path;

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
app12=
app13=
app14=
app15=`;

    if (!fs.existsSync(infopath)) {
        fs.writeFileSync(infopath, sampleText);
        await sendError("Please edit the newly created info.txt with your log file path and apps/commands to execute", "Error", 0, () => { process.exit(); });
    }
    let data = fs.readFileSync(infopath).toString().split("\n");
    let localLogFilePath = data.splice(0, 1)[0];
    // only update the file automatically if its not a guess, otherwise may end up writing the wrong (default) path and being very confusing as that could occur on reboots where wallpaper engine hasnt started yet
    if (logFilePath != localLogFilePath && !logFileRes.guess) {
        data.unshift(logFilePath);
        fs.writeFileSync(infopath, data.join("\n"));
        localLogFilePath = data.splice(0, 1)[0];
    } else {
        logFilePath = localLogFilePath;
    }
    console.log("logfile path: " + logFilePath);
    if (!fs.existsSync(logFilePath)) {
        await sendError("No log file found! Please fix the path in info.txt or enable verbose logging in wallpaper engine!", "Error", 0, () => { process.exit(); });
    }

    for (let i = 0; i < data.length; i++) {
        let e = data[i];
        if (!e) continue;
        let split = e.split("=");
        let number = split[0].replace("app", "");
        if (isNaN(parseInt(number))) {
            await sendError(`Line #${i + 2} in info.txt is misformatted.\nPlease fix!`, "Error", 0, () => { process.exit(); });
        }
        split.splice(0, 1);
        let path = split.join("=");
        if (!path) {
            console.log(`app${number} missing executable/command, continuing..`);
            continue;
        }

        apps[`app${number}`] = "\"" + path.trim() + "\"";
    }

    console.log("Loaded apps");
}

function checkWallpaperLog() {
    fs.watchFile(logFilePath, { interval: 100 }, () => {
        fs.readFile(logFilePath, "utf8", (err, data) => {
            if (err || !data) return;

            const lines = data.trim().split("\n");
            const lastLine = lines[lines.length - 1];
            const match = lastLine.match(/Log:\s(app\d+)/i);

            if (match) {
                const appKey = match[1].toLowerCase();
                if (apps[appKey]) {
                    console.log(`Launching: ${apps[appKey]}`);
                    fs.truncate(logFilePath, 0, (err) => {
                        if (!err) exec(apps[appKey]);
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
