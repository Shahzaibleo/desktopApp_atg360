const { app, BrowserView, BrowserWindow, session, Menu, MenuItem, Tray, screen, Notification } = require('electron')
const path = require('path')
const url = require('url')
const sessions = require('electron-json-config')
const { ipcMain } = require('electron')
const { dialog } = require('electron')
const contextMenu = require('electron-context-menu');
const axios = require('axios');
const https = require('https');
const network = require('network');
const { autoUpdater } = require('electron-updater');

const shell = require('electron').shell;
var win2 = "";
var macAdress;
var pjson = require('./package.json');

// const activeWindow = require('active-win');
// const ActivityTracker = require("./ActivityTracker");
const cryptos_ = require('./app/src/pages/render_module/encs_decr');
const child = require('child_process');
const connection = require('./db');
const log = require('electron-log');
var atob = require('atob');
var btoa = require('btoa');
let task_off_app_off = false;

// const UserData = require("./app/src/models/UserData");
// const sess = require("./app/src/includes/sessionmanage");
var win2Test = 0;
let dialogWindow;
let menuWindow = null;
var appIcon = null;
var win2Test2 = 0;

        
network.get_interfaces_list(function(err, list) {
  macAdress = list[0].mac_address;
  sessions.set("macAdress", macAdress);
})

// disbale ctrl commands
let mainWindow
let template = [
  { label: app.getName(), submenu: [
    { label: 'custom action 1', accelerator: 'Command+R',       click() { console.log('go!') } },
    { label: 'custom action 2', accelerator: 'Shift+Command+R', click() { console.log('go!') } },
    { type: 'separator' },
    { role: 'quit' }
  ] }
]
const menu = Menu.buildFromTemplate(template)


app.commandLine.appendSwitch('ignore-certificate-errors');


function createWindow() {
   win2 = new BrowserWindow({
    width: 800, height: 600,
      icon: `${__dirname}/app/src/includes/images/appicon/atg-360.ico`,
      // autoHideMenuBar: true,
      webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webviewTag: true,
      enableRemoteModule: true,
      experimentalFeatures: true
    }
  })

  // Set application menu
  // Menu.setApplicationMenu(menu)
    
  win2.on('close', function (event) {
    if (win2Test == 0) {
      win2.destroy();
    } 
  });

  // win.removeMenu();
  // if (checkLastLogin()) {
  if (sessions.get('isLoggedIn') == 1 && sessions.get('isRememberMe') == 1) {
    get_this_users_projects().then((projs) => {
      // console.log(projs.data);
      sessions.set("Proj_tasks", projs.data);
      win2Test = 1;
      win2.loadURL(url.format({
        pathname: path.join(__dirname, 'app/src/pages/mainpage.html'),
        protocol: 'file:',
        slashes: true
      }));
    })
    .catch((error) => {
      console.error("error 1",error);
    });
    
    get_pin_apps_list().then((pin_apps) => {
      sessions.delete("pin_apps");
      sessions.set("pin_apps", pin_apps.data);
    });
  } else {
    // win2Test = 0;
    win2.loadURL(url.format({
      pathname: path.join(__dirname, 'app/src/pages/loginpage.html'),
      protocol: 'file:',
      slashes: true
    }))
    // win2.webContents.openDevTools()

  }

  win2.on('close', function (e) {
    e.preventDefault();
    // console.log(sessions.all());
    if(win2Test == 1) {
      win2.webContents.send('CheckTaskTimer'); console.log("CheckTaskTimer");
    }
  });
  win2.on('minimize', function (event) {
    // event.preventDefault();
    // win2.hide();
    // if (sessions.get('isLoggedIn') == 1 && typeof sessions.get('currentTask') !== "undefined" && typeof sessions.get('currentProject') !== "undefined") {
    //   integrateFLoatMenu();
    // }
    if (sessions.get('isLoggedIn') == 1) {
      win2.webContents.send('caneclTaskDialog'); console.log("caneclTaskDialog");
      integrateFLoatMenu();
    }
  });
  win2.on('maximize', function (event) {
    // console.log(sessions.all());

    // console.log("maximize");
  });
  win2.on('focus', function (event) { //console.log("focus");
    if (menuWindow !== null) {
      menuWindow.close();
      menuWindow.destroy();
      menuWindow = null;
    }

  });

  ipcMain.once('ready-to-show', () => {
    autoUpdater.checkForUpdatesAndNotify();
  });
  
  ipcMain.on('app_version', (event) => {
    event.sender.send('app_version', { version: app.getVersion() });
  });
  
  autoUpdater.on('update-available', () => {
    win2.webContents.send('update_available');
  });
  autoUpdater.on('update-downloaded', () => {
    win2.webContents.send('update_downloaded');
  });
  
  // auto updater code end
}

app.on('ready', createWindow);


// // Quit when all windows are closed.
app.on('window-all-closed', () => {

  if (process.platform !== 'darwin') {
    app.quit()
  }
})
//this line is added to be able to the native modules rendered process
app.allowRendererProcessReuse = false

async function get_User_Details() {
  
  let result = {}; 
  try {
    let username = atob(sessions.get('userEMail'));
    let password = atob(sessions.get('userPass'));
    var encryptedusename = cryptos_.encrypt(username);
    var encryptedPassword = cryptos_.encrypt(password);

    const params = new URLSearchParams();
    params.append('email', encryptedusename);
    params.append('password', encryptedPassword);
    params.append('staff', true);
    const agent = new https.Agent({
      rejectUnauthorized: false
    });
    axios.defaults.headers.post['Content-Type'] = 'application/json';
    result = await axios.post('https://crm.atgtravel.com/admin/api/atg_three_sixty/get_user_id_from_param/', params, { httpsAgent: agent })

  } catch (error) {
    let errorsList = {}
    errorsList.apiUrl = 'https://crm.atgtravel.com/admin/api/atg_three_sixty/get_user_id_from_param/';
    errorsList.message = error.message;
    if(error.response) {
      // the client was given an error response
      errorsList.status = error.response.status;
      errorsList.error = error.response.data
      if(errorsList.error == '') {
        errorsList.error = "Empty data";
      } 
      errorlogs(errorsList)

    } else if(error.request) {
      // The client never recieved a response, and the request was never left.
      errorsList.status = "request error";
      errorsList.error = error.request
      errorlogs(errorsList)
    } else {
      // Anything else
      errorsList.status = "unknown error";
      errorsList.error = "unknown error"
      errorlogs(errorsList)
    }
    
  }
  return result;

}

// start error logs function store logs in the db 
function errorlogs(errorsList) {
  let userID = atob(sessions.get('userStaffID'));
  const params = new URLSearchParams();
  let app_version = pjson.version;
  params.append('user_id', userID);
  params.append('error_log', errorsList.error);
  params.append('mac_address', macAdress);
  params.append('app_version', app_version);
  params.append('status', errorsList.status);
  params.append('api_url', errorsList.apiUrl);
  params.append('message', errorsList.message);

  const agent = new https.Agent({
    rejectUnauthorized: false
  });
  axios.defaults.headers.post['Content-Type'] = 'application/json';
  axios.post('https://crm.atgtravel.com/admin/api/atg_three_sixty/store_error_logs/', params, { httpsAgent: agent })
}
// end error logs function store logs in the db 


const isRunning = (query, cb) => {
  let platform = process.platform;
  let cmd = '';
  switch (platform) {
    // case 'win32' : cmd = `tasklist`; break;
    case 'win32': cmd = `%SystemRoot%\\System32\\tasklist.exe`; break;
    case 'darwin': cmd = `ps -ax | grep ${query}`; break;
    case 'linux': cmd = `ps -A`; break;
    default: break;
  }
  child.exec(cmd, (err, stdout, stderr) => {
    cb(stdout.toLowerCase().indexOf(query.toLowerCase()) > -1);
  });
}
//**************************************Browser Windows************************************************ */
//******************************************************************************************************* */
//**************************************Browser Windows************************************************ */

function integrateFLoatMenu() {
  
  if (menuWindow !== null) {
    menuWindow.show();
  } else {
    let dims = screen.getPrimaryDisplay().workAreaSize;
    let factor = screen.getPrimaryDisplay().scaleFactor;
    let x_axis = Math.abs(parseInt(dims.width * 0.75));
    let y_axis = Math.abs(parseInt(dims.height * 0.2314814814814815));
    let d_width = Math.abs(parseInt(dims.width * 0.1979166666666667));
    let d_height = Math.abs(parseInt(dims.height * 0.4166666666666667));
    console.log(dims);
    console.log("=====");
    console.log(x_axis);    
      console.log("=====");
    console.log(y_axis);
    console.log("d_width");
    console.log(d_width);
    console.log("d_height");
    console.log(d_height);
    //         console.log("=====");      console.log("factor");
    //         console.log("=====");
    //         console.log(factor);
    // console.log(x_axis);

    menuWindow = new BrowserWindow({

      // width: 500/factor,
      // maxWidth: 800,
      // minHeight: 100,
      // height: 550/factor,
      // width: d_width,
      // maxWidth: 800,
      // minHeight: 200,
      // height: d_height,
      // width: 400/factor,
      // maxWidth: 800,
      // minHeight: 600,
      width: d_width+100 / factor,
      height: d_height+150 / factor,
      fullscreenable: false,
      // resizable: false,
      resizable: true,
      frame: false,
      transparent: true,
      autoHideMenuBar: true,
      // zoomToPageWidth:true,
      // x: 1150,
      // y: 250,    
      // x: 1535,
      // y: 250,    
      x: x_axis,
      y: y_axis,
      skipTaskbar: true,
      alwaysOnTop: true,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        webviewTag: true,
        enableRemoteModule: true,
        experimentalFeatures: true,

        zoomFactor: 1.0 / factor,

      }
    })

    menuWindow.setAlwaysOnTop(false);
    menuWindow.loadURL(url.format({
      pathname: path.join(__dirname, 'app/src/pages/floatingmenu.html'),
      protocol: 'file:',
      slashes: true
    }));
    menuWindow.show();
    // menuWindow.hide();
    // menuWindow.webContents.openDevTools();

  }


}
function openTaskWindow() {
  dialogWindow = new BrowserWindow({
    height: 450,
    width: 400,
    modal: true,
    parent: win2,
    autoHideMenuBar: true,
    frame: false
    , webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webviewTag: true,
      enableRemoteModule: true,
      experimentalFeatures: true,
    }
  });
    dialogWindow.loadURL(url.format({
      pathname: path.join(__dirname, 'app/src/pages/tasks_dialog.html'),
      protocol: 'file:',
      slashes: true
    }));
  //  dialogWindow.webContents.openDevTools();

}

async function get_this_users_projects() {
  let result= {}
  try {
    let userID = atob(sessions.get('userStaffID'));
    const agent = new https.Agent({
      rejectUnauthorized: false
    });
    axios.defaults.headers.post['Content-Type'] = 'application/json';
    result = await axios.get('https://crm.atgtravel.com/admin/api/atg_three_sixty/get_projects_tasks2/' + userID, { httpsAgent: agent })

  } catch (error) {
    let errorsList = {}
    errorsList.apiUrl = 'https://crm.atgtravel.com/admin/api/atg_three_sixty/get_projects_tasks2/';
    console.log("error message", error.message)
    errorsList.message = error.message;
    if(error.response) {
      // the client was given an error response
      errorsList.status = error.response.status;
      errorsList.error = error.response.data
      if(errorsList.error == '') {
        errorsList.error = "Empty data";
      } 
      errorlogs(errorsList)

    } else if(error.request) {
      // The client never recieved a response, and the request was never left.
      errorsList.status = "request error";
      errorsList.error = error.request
      errorlogs(errorsList)
    } else {
      // Anything else
      errorsList.status = "unknown error";
      errorsList.error = "unknown error"
      errorlogs(errorsList)
    }
  }
  return result;
}


// get pin apps list 
async function get_pin_apps_list() {
  let api_result = {}
  try
  {
    let userID = atob(sessions.get('userStaffID'));
    const agent = new https.Agent({
    rejectUnauthorized: false
    });
    axios.defaults.headers.post['Content-Type'] = 'application/json';
    api_result = await axios.get('https://crm.atgtravel.com/admin/api/atg_three_sixty/get_pin_apps_list/' + userID, { httpsAgent: agent })

  } catch (error) {
    let errorsList = {}
    errorsList.apiUrl = 'https://crm.atgtravel.com/admin/api/atg_three_sixty/get_pin_apps_list/';

    errorsList.message = error.message;
    if(error.response) {
      // the client was given an error response
      errorsList.status = error.response.status;
      errorsList.error = error.response.data
      if(errorsList.error == '') {
        errorsList.error = "Empty data";
      } 
      errorlogs(errorsList)

    } else if(error.request) {
      // The client never recieved a response, and the request was never left.
      errorsList.status = "request error";
      errorsList.error = error.request
      errorlogs(errorsList)
    } else {
      // Anything else
      errorsList.status = "unknown error";
      errorsList.error = "unknown error"
      errorlogs(errorsList)
    }
    
  }
  return api_result;

}


ipcMain.handle('getUserId', (event, ...args) => {
  var projectTasks = sessions.get("Proj_tasks");
  get_this_users_projects().then((projs) => {
    sessions.delete("Proj_tasks");
    sessions.set("Proj_tasks", projs.data);
    var latestProjectTasks = sessions.get("Proj_tasks");
    // console.log("latestProjectTasks", latestProjectTasks.length);
    
    if((latestProjectTasks.length > projectTasks.length) || (latestProjectTasks.length < projectTasks.length)) {
      win2.webContents.send('getUserId2', latestProjectTasks);
    }
    else {
      for(var i = 0; i < latestProjectTasks.length; i++) {
        if((latestProjectTasks[i]["tasks"].length > projectTasks[i]["tasks"].length || latestProjectTasks[i]["tasks"].length < projectTasks[i]["tasks"].length) && (latestProjectTasks[i]["url"] != null && latestProjectTasks[i]["url"].length > 1)) {
          win2.webContents.send('getUserId2', latestProjectTasks);
        }
        
        if(latestProjectTasks[i]["name"] != projectTasks[i]["name"] && (latestProjectTasks[i]["url"] != null && latestProjectTasks[i]["url"].length > 1)) {
          win2.webContents.send('getUserId2', latestProjectTasks);
        }
        if(latestProjectTasks[i]["url"] != projectTasks[i]["url"] && (latestProjectTasks[i]["url"] != null && latestProjectTasks[i]["url"].length > 1)) {
          win2.webContents.send('getUserId2', latestProjectTasks);
        }
        if(latestProjectTasks[i]["icon"] != projectTasks[i]["icon"] && (latestProjectTasks[i]["url"] != null && latestProjectTasks[i]["url"].length > 1)) {
          win2.webContents.send('getUserId2', latestProjectTasks);
        }

        if(latestProjectTasks[i]["tasks"].length == projectTasks[i]["tasks"].length && (latestProjectTasks[i]["url"] != null && latestProjectTasks[i]["url"].length > 1)) {
          for(var j = 0; j < latestProjectTasks[i]["tasks"].length; j++) {
            if(latestProjectTasks[i]["tasks"][j]["name"] != projectTasks[i]["tasks"][j]["name"]) {
              win2.webContents.send('getUserId2', latestProjectTasks);
            }
          }
        }
      }
    }
    // win2.webContents.send('getUserId2', latestProjectTasks);
  })
  .catch((error) => {
    console.error("error 2",error);
  });

  get_pin_apps_list().then((pin_apps) => {
      var pinApps = sessions.get("pin_apps");
      sessions.delete("pin_apps");
      sessions.set("pin_apps", pin_apps.data);
      var latestPinApps = sessions.get("pin_apps");
      if(latestPinApps.length > pinApps.length) {
        win2.webContents.send('getPinApps2', latestPinApps);
      } 
      if(latestPinApps.length < pinApps.length) {
        win2.webContents.send('getPinApps2', latestPinApps);
      }
  });

});

//**************************************IPC MAIN HANDLES************************************************ */
//******************************************************************************************************* */
//**************************************IPC MAIN HANDLES************************************************ */
// // receive message from loginpage.html 
ipcMain.handle('loadmainpage', (event, ...args) => {

  const useremail = args[0].email;
  const userpass = args[0].password;
  const rememberMe = args[0].rememberMe;
  sessions.set('isLoggedIn', '1');
  sessions.set('isRememberMe', '1');
  sessions.set('userEMail', btoa(useremail));
  sessions.set('userPass', btoa(userpass));
  win2Test = 1;
  console.log('Hello---');
  get_User_Details()
    .then((response) => {
      // console.log("response----",response)
      let res = response.data;
      console.log("rememberMe--->>>>>", rememberMe);
      if(rememberMe == false) {
        sessions.delete('isRememberMe');
        // sessions.delete('isLoggedIn');
        sessions.delete('userEMail');
        sessions.delete('userPass');
      }
      sessions.set('userFirstname', btoa(res.firstname));
      sessions.set('userLastname', btoa(res.lastname));
      sessions.set('userStaffID', btoa(res.staffid));

      get_this_users_projects().then((projs) => {
        sessions.set("Proj_tasks", projs.data);
        // win2Test = 1;
        win2.loadURL(url.format({
          pathname: path.join(__dirname, 'app/src/pages/mainpage.html'),
          protocol: 'file:',
          slashes: true
        }));

        if(win2Test2 == 1) {
          win2.on('close', function (e) {
            e.preventDefault();
            // console.log(sessions.all());
        
            if(win2Test == 1) {
              win2.webContents.send('CheckTaskTimer'); console.log("CheckTaskTimer");
            }
          });
          win2.on('minimize', function (event) {
            // event.preventDefault();
            // win2.hide();
            // if (sessions.get('isLoggedIn') == 1 && typeof sessions.get('currentTask') !== "undefined" && typeof sessions.get('currentProject') !== "undefined") {
            //   integrateFLoatMenu();
            // }
            if (sessions.get('isLoggedIn') == 1) {
              win2.webContents.send('caneclTaskDialog'); console.log("caneclTaskDialog");
              integrateFLoatMenu();
            }
          });
          win2.on('maximize', function (event) {
            // console.log(sessions.all());
        
            // console.log("maximize");
          });
          win2.on('focus', function (event) { //console.log("focus");
            if (menuWindow !== null) {
              menuWindow.close();
              menuWindow.destroy();
              menuWindow = null;
            }
        
          });
        }

      // });
      // and load the index.html of the app.
      ipcMain.on('UserSession', (event, useremail) => {
        console.log(useremail) // prints "ping"
      })
      // win2.webContents.openDevTools()

      })
      .catch((error) => {
        console.error("error 3",error);
      });

      get_pin_apps_list().then((pin_apps) => {
        sessions.delete("pin_apps");
        sessions.set("pin_apps", pin_apps.data);
      })
      .catch((error) => {
        console.error(error);
      });
    })
})

// // receive message from loginpage.html 
ipcMain.handle('logoutmainpage', (event, ...args) => {
  sessions.delete("userEMail");
  sessions.delete("isLoggedIn");
  sessions.delete("userPass");
  sessions.delete("userFirstname");
  sessions.delete("userLastname");
  sessions.delete("userStaffID");
  sessions.delete("isTaskTimerRunning");
  sessions.delete('isRememberMe');
  sessions.delete("tCloseEW");
  sessions.set("isLoggedOut", "1");
  win2Test = 0;
  win2Test2 = 1;

  win2.loadURL(url.format({
    pathname: path.join(__dirname, 'app/src/pages/loginpage.html'),
    protocol: 'file:',
    slashes: true
  }))

  win2.on('close', function (e) {
    e.preventDefault();
    // console.log(sessions.all());
    if(win2Test == 1) {
      win2.webContents.send('CheckTaskTimer'); console.log("CheckTaskTimer");
    }
  });
  win2.on('minimize', function (event) {
    // event.preventDefault();
    // win2.hide();
    // if (sessions.get('isLoggedIn') == 1 && typeof sessions.get('currentTask') !== "undefined" && typeof sessions.get('currentProject') !== "undefined") {
    //   integrateFLoatMenu();
    // }
    if (sessions.get('isLoggedIn') == 1) {
      win2.webContents.send('caneclTaskDialog'); console.log("caneclTaskDialog");
      integrateFLoatMenu();
    }
  });
  win2.on('maximize', function (event) {
    // console.log(sessions.all());

    // console.log("maximize");
  });
  win2.on('focus', function (event) { //console.log("focus");
    if (menuWindow !== null) {
      menuWindow.close();
      menuWindow.destroy();
      menuWindow = null;
    }

  });

})

ipcMain.handle('opentaskwindow', (event, ...args) => {
  openTaskWindow();
})
ipcMain.handle('StartTimerOnMainPage', (event, ...args) => {
  win2.webContents.send('StartTimerOnMainPage2', args);

})

//timerLOG IPC
ipcMain.handle('timerlog', (event, ...args) => {
  win2.webContents.send('timerlog2');
})
ipcMain.handle('timerlog3', (event, ...args) => {
  // console.log("tasktimer is deleted");
  // sessions.delete("isTaskTimerRunning");
  dialogWindow.webContents.send('timerlog4', args);
})

ipcMain.handle('GetTimerForDialog', (event, ...args) => {

  win2.webContents.send('GetTimerForDialog2');

})
ipcMain.handle('GetTimerForDialog3', (event, ...args) => {

  dialogWindow.webContents.send('GetTimerForDialog4', args);

})

ipcMain.handle('isTaskRunningLogout', (event, ...args) => {
  sessions.set('tCloseEW', '0');
})

ipcMain.handle('runningTaskContinue', (event, ...args) => {
  sessions.delete('tCloseEW');
  win2.webContents.send('closeTaskWindow');
})
ipcMain.handle('launchFromFloat', (event, ...args) => {
  isRunning(args[0], (status) => {
    if (!status) {
      var exerun = child.exec(`START ${args[0]}`, function (err, stout, sterr) {
        if (err) {
          console.error(err);
          // return;
        }
        //if exe exist in process then it will be maximized otherwise new instance will be launched
      });
    }
  })

})
ipcMain.handle('GetTotalAppTimerofLogin', (event, ...args) => {
  console.log("1");
  win2.webContents.send('GetTotalAppTimerofLogin2');

})
ipcMain.handle('GetTotalAppTimerofLogin3', (event, ...args) => {
  console.log("GetTotalAppTimerofLogin3");

  menuWindow.webContents.send('GetTotalAppTimerofLogin4', args);

})

const NOTIFICATION_TITLE = 'Start Task Notification'
const NOTIFICATION_BODY = 'It seems you are working without starting a task. Please start a task to log your time.'

function showNotification () {
  new Notification({ title: NOTIFICATION_TITLE, body: NOTIFICATION_BODY }).show()
}

ipcMain.handle('CheckTaskTimer2', (event, ...args) => {
  console.log("CheckTaskTimer2ipc");
  let task_timers_values = args[0];
  let isTimeLogStarted = args[1];
  let isTimemaxwin = args[2];
  console.log("isTimeLogStarted----->>>", isTimeLogStarted);
  console.log("====args");
  console.log(args);
  log.info('Hello, log');
  log.warn('Some problem appears');
  log.log(args);


  if (isTimemaxwin == '01' && task_timers_values == 'afra' && isTimeLogStarted == 'ews'){
    win2.maximize();  
    showNotification();
  }

  // add code maximize issue
  win2.maximize();
  ////////

  console.log("sessions.get('isRememberMe')----->>>>>>", (sessions.get('isRememberMe') ==1));

  if ((task_timers_values.mins == 0 && task_timers_values.scs == 0 && task_timers_values.hrs == 0) && !isTimeLogStarted) {
    // The dialog box below will open, instead of your app closing.

    if(sessions.get('isRememberMe') == 1) {
      console.log("dialog----->>>>>>");
      const choice_logout2 = dialog.showMessageBox(win2,
        {
          type: 'question',
          buttons: ['Yes', 'No','Cancel'],
          title: 'Confirm',
          message: 'Do you also want to logout?'
        });
      choice_logout2.then(function (res) {
        // 0 for OK
        if (res.response == 0) {
          sessions.delete("userEMail");
          sessions.delete("isLoggedIn");
          sessions.delete("userPass");
          sessions.delete("userFirstname");
          sessions.delete("userLastname");
          sessions.delete("userStaffID");
          sessions.delete("isTaskTimerRunning");
          sessions.delete('isRememberMe');
          sessions.delete("tCloseEW"); 
          sessions.set("isLoggedOut", "1");
          win2.close();
          win2.destroy();
          // win2Test = 0;
          // Your Code
        }
        if (res.response == 1) {
  
          win2.close();
          win2.destroy();
        }
        if (res.response == 2) {
  
          // win2.close();
          // win2.destroy();
        }
      });
    } else {

      
      console.log("dialog without RememberMe----->>>>>>");
    const choice_logout = dialog.showMessageBox(win2,
      {
        type: 'question',
        buttons: ['Yes', 'Cancel'],
        title: 'Confirm',
        message: 'Do you want to close app?'
      });
    choice_logout.then(function (res) {
      // 0 for OK
      if (res.response == 0) {
          sessions.delete("userEMail");
          sessions.delete("isLoggedIn");
          sessions.delete("userPass");
          sessions.delete("userFirstname");
          sessions.delete("userLastname");
          sessions.delete("userStaffID");
          sessions.delete("isTaskTimerRunning");
          sessions.delete("tCloseEW");
          sessions.delete("currentProject");
          sessions.delete("currentTask");
          sessions.delete('isRememberMe');
          win2Test = 0;
        win2.close();
        win2.destroy();
      }
      if (res.response == 1) {

        // win2.close();
        // win2.destroy();
      }
    });

    }


  } else {
    sessions.set('tCloseEW', '1');
    openTaskWindow();
  }
  // menuWindow.webContents.send('GetTotalAppTimerofLogin4', args);

});
ipcMain.handle('MaxWindow', (event, ...args) => {
  win2.maximize();
});
ipcMain.handle('GetActiveTabsFromMainPage', (event, ...args) => {
  win2.webContents.send('GetActiveTabsFromMainPage2');
});
ipcMain.handle('GetActiveTabsFromMainPage3', (event, ...args) => {
  menuWindow.webContents.send('GetActiveTabsFromMainPage4', args);
});
ipcMain.handle('OpenActiveTabFromFloatMenu', (event, ...args) => {
  win2.webContents.send('OpenActiveTabFromFloatMenu2', args); 
});
ipcMain.handle('ReadDesktopTrackedData', (event, ...args) => {
  win2.webContents.send('ReadDesktopTrackedData2');

});
ipcMain.handle('ReadDesktopTrackedData3', (event, ...args) => {
  console.log("desktopAppList", args)
  menuWindow.webContents.send('ReadDesktopTrackedData4', args);
});

ipcMain.handle('CloseWindowAndApplication', (event, ...args) => {
  sessions.delete("userEMail");
  sessions.delete("isLoggedIn");
  sessions.delete("userPass");
  sessions.delete("userFirstname");
  sessions.delete("userLastname");
  sessions.delete("userStaffID");
  sessions.delete("isTaskTimerRunning");
  sessions.delete("tCloseEW");
  sessions.delete("currentProject");
  sessions.delete("currentTask");
  sessions.delete('isRememberMe');
  win2Test = 0;
  win2.close();
  win2.destroy();
  app.quit()

});

ipcMain.handle('SetCacheValues', (event, ...args) => {
  for (let [key, value] of Object.entries(args[0])) {
    sessions.set(key, value);
  }
});


ipcMain.handle('SetCacheValuesDesktop', (event, ...args) => {
  console.log(args);
  for (let [key, value] of Object.entries(args[0])) {
    sessions.set(key, value);
  }
});


ipcMain.handle('DeleteCacheValues', (event, ...args) => {
  for (let [key, value] of Object.entries(args[0])) {
    sessions.delete(key);
  }

});

// Main process
ipcMain.handle('getCacheValues', (event, ...args) => {
  let currentTask = sessions.get("currentTask");
  let currentProject = sessions.get("currentProject");
  let userStaffID = sessions.get("userStaffID");
  let Proj_tasks = sessions.get("Proj_tasks");
  dialogWindow.webContents.send('getCurrentTaskCasheValue', currentTask, currentProject, userStaffID, Proj_tasks);
})

// ipcMain.handle('getCacheValuesMainPage', (event, ...args) => {
//   let currentTask = sessions.get("currentTask");
//   let currentProject = sessions.get("currentProject");
//   console.log("currentProject----", currentProject)
//   win2.webContents.send('getCacheValuesMainPage2', currentTask, currentProject);
// })


// ipcMain.handle('getprojectTaskValues', (event, ...args) => {
//   let Proj_tasks = sessions.get("Proj_tasks");
//   menuWindow.webContents.send('getCurrentPrjectTaskCasheValue',Proj_tasks);
// })

// ipcMain.handle('startTaskByWindow', (event, args) => {
//   console.log(args);
//   let isTaskTimerRunning = sessions.get("isTaskTimerRunning");
//   console.log('isTaskTimerRunning----', isTaskTimerRunning);
//   win2.webContents.send('startTaskWindow', isTaskTimerRunning);
// });

// auto updater code start

// app.on('activate', function () {
//   if (mainWindow === null) {
//     createWindow();
//   }
// });


