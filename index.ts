/* eslint-disable @stylistic/spaced-comment */
/* eslint-disable @stylistic/brace-style */
/* eslint-disable @stylistic/max-statements-per-line */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */

// i love new eslint... :(

import fs from "fs";
import { exec, execSync } from "child_process";
import dialog from "dialog-node";

// File path to log.txt
let logFilePath = "C:\\Program Files (x86)\\Steam\\steamapps\\common\\wallpaper_engine\\log.txt";

// format: appI: '"path"',
let apps = {

};
let sampleText = `${logFilePath}
app1=
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

function sendError(msg: string, title: string, timeout: number, callback: dialog.DialogCallback<"OK" | "CANCEL">) {
    return new Promise<void>((res, rej) => {
        dialog.error(msg, title, timeout, (code, retval, stderr: string) => {
            callback(code, retval, stderr);
            res();
        });
    });
}

async function loadApps() {
    if (!fs.existsSync("./info.txt")) {
        fs.writeFileSync("./info.txt", sampleText);
        await sendError("Please edit the newly created info.txt with your log file path and apps/commands to execute", "Error", 0, (code, retval) => { process.exit(); });
    }
    let data = fs.readFileSync("./info.txt").toString().split("\n");
    logFilePath = data.splice(0, 1)[0];
    console.log("logfile path: " + logFilePath);
    if (!fs.existsSync(logFilePath)) {
        await sendError("No log file found! Please fix the path or enable verbose logging in wallpaper engine!", "Error", 0, (code, retval) => { process.exit(); });
    }

    for (let i = 0; i < data.length; i++) {
        let e = data[i];
        if (!e) continue;
        let split = e.split("=");
        let number = e.split("=")[0].replace("app", "");
        if (isNaN(parseInt(number))) {
            await sendError(`Line #${i + 2} in info.txt is misformatted.\nPlease fix!`, "Error", 0, (code, retval) => { process.exit(); });
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

function isServiceInstalled(name: string) {
    try {
        execSync(`sc query "${name}"`, { stdio: "ignore" });
        return true;
    } catch {
        return false;
    }
}
function installService(name: string) {
    const exePath = process.execPath;
    const cmd = `sc create "${name}" binPath= "${exePath}" start= auto`;
    execSync(cmd);
    execSync(`sc start "${name}"`);
    console.log("Service installed and started.");
}

function uninstallService(name: string) {
    if (isServiceInstalled(name)) {
        try {
            execSync(`sc stop "${name}"`, { stdio: "ignore" });
        } catch (err) {
            console.warn("Warning: Could not stop service.");
        }

        execSync(`sc delete "${name}"`);
        console.log("Service uninstalled.");
    }
}

async function main() {
    let serviceName = "WiiWallpaper";
    uninstallService(serviceName);
    await loadApps();
    //installService(serviceName);
    checkWallpaperLog();
}

main();
