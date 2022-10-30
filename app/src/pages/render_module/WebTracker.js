const activeWindows = require("active-windows");
const fs = require("fs-extra");
const _ = require("lodash");

class DesktopTracker {
  constructor(filePath, interval) {
    this.filePath = filePath;
    this.interval = interval;
    this.start = null;
    this.app = null;
    this.track_count = 0;
  }
  // static myStaticProperty = ["filezilla.exe", "electron.exe", "notepad++.exe"];
  static myStaticProperty = ["filezilla.exe"];
  static totaltimespent = 0;
  static isrunning = false;
  track() {
    setInterval(async () => {
      const window = await activeWindows.getActiveWindow();
      let exist_ = this.inArray(window.windowClass, DesktopTracker.myStaticProperty);
      if (exist_) {
        if (!this.app) {
          this.start = new Date();
          this.app = window;
        }
        if (this.track_count == 10) {

          await this.storeData();

        }
        (async () => {
          const content = await fs.readJson(this.filePath);
        })();

        if (window.windowClass !== this.app.windowClass) {
          await this.storeData();
          this.app = null;
        }
        this.track_count++;
      }
    }, this.interval);




  }

  async storeData() {
    const content = await fs.readJson(this.filePath);
    const time = {
      start: this.start,
      end: new Date(),
    };

    const {
      windowClass,
      windowName,
      windowPid,
    } = this.app;

    _.defaultsDeep(content, { [windowClass]: { 'windowName': windowName, time: 0, windowName, ['pids']: { [windowPid]: 'active' } } });
    // _.defaultsDeep(content, { [windowClass]: { [windowName]: { time: 0, windowName }, ['pids']: { windowPid, status: 'active' } } });

    // content[windowClass][windowName].time += Math.abs(time.start - time.end) / 1000;
    content[windowClass].time += Math.abs(time.start - time.end) / 1000;
    //remaining task is to read and overirde PID's when desktop app is closed
    await fs.writeJson(this.filePath, content, { spaces: 2 });
  }

  async init() {
    const fileExists = await fs.pathExists(this.filePath);

    if (!fileExists) {
      await fs.writeJson(this.filePath, {});
    }

    this.track();
  }

  inArray(needle, haystack) {
    var length = haystack.length;
    for (var i = 0; i < length; i++) {
      if (haystack[i] == needle) return true;
    }
    return false;
  }

  async changePidStatus(windowCls, pid) {
    const content = await fs.readJson(this.filePath);
    _.set(content,content[windowCls].pids[pid], "inactive");
    console.log("content[windowCls]");
    console.log(content[windowCls]);
    console.log("content[windowCls].pids");
    console.log(content[windowCls].pids);
    console.log("=== PID");
    console.log(pid);
    console.log(" PID ===");

  }

}

module.exports = DesktopTracker;
