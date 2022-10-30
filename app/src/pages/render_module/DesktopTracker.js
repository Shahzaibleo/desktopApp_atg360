const activeWindows = require("active-windows");

var macAdress;

macAdress = sessions.get("macAdress");
// console.log("macAdress", macAdress)

function get_desktop_apps_list() {
  
  const params = new URLSearchParams();
  params.append('macAdress', macAdress);

  let userID = atob(sessions.get('userStaffID'));
  const agent = new https.Agent({
    rejectUnauthorized: false
  });
  axios.defaults.headers.post['Content-Type'] = 'application/json';
  return axios.get('https://crm.atgtravel.com/admin/api/atg_three_sixty/get_desktop_apps/?' + params, { httpsAgent: agent })
}
let desktopList = [];

const fs = require("fs-extra");
const _ = require("lodash");
var timeDiff = 0;
// var desktopList = [];
class DesktopTracker {
  constructor() {
    this.tracked_data = {};
    this.interval = 1000;
    this.start = null;
    this.app = null;
    this.track_count = 0;
    this.previousCalculatedTime = 0;
    this.checkApp = true;
    this.initCheck = 0;

  }
  // static myStaticProperty = ["filezilla.exe", "electron.exe"];
  static list_prj = sessions.get('Proj_tasks');

  
  static myStaticProperty = ["filezilla.exe", "electron.exe"];
  static totaltimespent = 0;
  static isrunning = false;
  
  static internetError = false;
  
  track() {
    var fileZillasCount; 
    console.log("Tracked Data");
    this.desktracker = setInterval(async () => {
      
      const window = await activeWindows.getActiveWindow();
      
      if(window["windowClass"] == "midoco.exe") {
          window["windowName"] = "midoco"
          window["windowClass"] = "javaw.exe"
      }
      
      // console.log("fileZillasCount----", fileZillasCount);
      console.log('=====Window=========',window);
      console.log('=====Window.windowClass=========',window.windowClass);
      // let exist_ = this.inArray(window.windowClass, DesktopTracker.myStaticProperty);   
      let exist_ = this.inArray(window.windowClass, desktopList);
      if (exist_) {
        if (!this.app) {
          this.start = new Date();
          this.end = new Date();
          this.app = window;
        }
        // if (this.track_count == 1) {
        //   this.track_count = 0
          this.storeData();
        // }
        (() => {
          const content = this.tracked_data;
        })();
        if (window.windowClass !== this.app.windowClass) {
          this.storeData();
          this.app = null;
        }
        // this.track_count++;
      }
    }, this.interval);

  }
  
  storeData() {
    
    
    var desk_tracked_data = { 'filezilla.exe': {'isActive': true, 'isInActive': false}};
    
    const content = this.tracked_data;
    let time = {
      start: this.start,
      end: this.end,
    };

    console.log("this.app-------------------######", this.app)

    const {
      windowClass,
      windowName,
      windowPid,
    } = this.app;


    // if(windowClass == "filezilla.exe") {
      if(desktopList.includes(windowClass)) {

      
        let diff_cal_time = 1;
        // _.defaultsDeep(content, { [windowClass]: { 'windowName': windowName, time: 0, sessionId: 0, windowName, ['pids']: { [windowPid]: 'active' } } });
        // // content[windowClass].time = Math.abs(time.start - time.end) / 1000;

      ///////////////////////////////////////  
        // if(!DesktopTracker.internetError) {
        // _.defaultsDeep(content, { [windowClass]: { 'windowName': windowName, time: 0, sessionId: 0, windowName, ['pids']: { [windowPid]: 'active' } } });
        //  content['filezilla.exe'].time =  content['filezilla.exe'].time + diff_cal_time;
        // }
     ////////////////////////////////////////////

      if(!DesktopTracker.internetError) {
      _.defaultsDeep(content, { [windowClass]: { 'windowName': windowName, time: 0, sessionId: 0, windowName, ['pids']: { [windowPid]: 'active' } } });
       content[windowClass].time =  content[windowClass].time + diff_cal_time;
      }
        // console.log("log 4 content['filezilla.exe'].time", content['filezilla.exe'].time);
      // } 

      // _.defaultsDeep(content, { [windowClass]: { 'windowName': windowName, time: 0, sessionId: 0, windowName, ['pids']: { [windowPid]: 'active' } } });
      // content[windowClass].time = Math.abs(time.start - time.end) / 1000;
  
    }
    
  }
  
  async init() {
    // console.log("this.initCheck  ##########", this.initCheck);
    // if(this.initCheck == 0) {
      this.track();
    //   this.initCheck = 1;
    // }
    DesktopTracker.isrunning = true;
    this.checkApp = 0;
  }

  inArray(needle, haystack) {
    var length = haystack.length;
    for (var i = 0; i < length; i++) {
      if (haystack[i] == needle) { 
        return true; 
      }
    }
    return false;
  }

  async changePidStatus(windowCls, pid) {
    var content = this.tracked_data;
    console.log(" content[windowCls]===================");
    console.log( content[windowCls]);
    console.log("content============END=====");
    let mypid = pid;
    if(typeof(content[windowCls]) == 'undefined' || mypid == 'undefined') {
     return true;
    } else {
      content[windowCls].pids[mypid] = 'inactive';
    }
  }
  async comparePidswithTaskManager(windowCls, pid) {

    var content = this.tracked_data;
    console.log(" content[windowCls]===================");
    console.log( content[windowCls]);
    console.log("content============END=====");
    let mypid = pid;
    if(typeof(content[windowCls]) == 'undefined' || mypid == 'undefined') {
      return true;
     } else {
      if(content[windowCls].pids[mypid] != pid) {
        return true;
      } else {
        return false;
      }
    }
  }
  closeTheDesktopTracking() {
    clearInterval(this.desktracker);
    this.tracked_data = {};
  }
  static pushtoDesktopList(name) {
    DesktopTracker.myStaticProperty.push = name;
  }

  getDesktopSpentTime() {
    // console.log("content 6----------########", this.tracked_data);
      get_desktop_apps_list().then((response)=> {
        console.log("response---2-", response);
        let res =  response.data;
        
        console.log("res---", res);
        desktopList = res.map(function(element){
          // console.log("element res %%%%%%%%", element["app_name"])
            return element["app_name"];
        });
        // console.log("desktopList", desktopList);
      })
    return this.tracked_data;
  }

}

module.exports = DesktopTracker;
