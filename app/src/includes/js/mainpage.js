const remote = require('electron').remote;
const ipc = require('electron').ipcRenderer;
const TabGroup = require("electron-tabs");
var child = require('child_process');
const { spawn } = require('child_process');
console.log(child, 'ddddd');
const { webFrame, BrowserWindow } = require('electron')
const url = require('url')
const sessions = require('electron-json-config');
var  process, { kill } = require('process')
// const Screenshot = require('url-to-screenshot')
var webshot = require('node-webshot');
const fs = require('fs');
var path = require('path');
var tabGroup2 = new TabGroup();
const dragula = require("dragula");
var tabGroup = new TabGroup({
    ready: function (tabGroup) {
        dragula([tabGroup.tabContainer], {
            direction: "horizontal"
        });
    }
});
const axios = require('axios');
const https = require('https');
const cron = require('node-cron');
const getmac = require('getmac');
const fse = require('fs-extra');
var os = require("os");
const find = require('find-process');
const Shell = require('electron').shell;

var pjson = require('../../../package.json');

webFrame.setZoomFactor(1);
const win = remote.getCurrentWindow();
const activeWindows = require('active-windows');
const AppTimers = require("./render_module/AppTimers");
var DesktopTracker = require("./render_module/DesktopTracker");
const Tabs_Groups = require("./render_module/Tabs_Groups");
const UserData = require("../models/UserData");
const { dialog } = require('electron').remote;
const desktopTracker = new DesktopTracker();
const tbgs = new Tabs_Groups();
var web_tracked_data = {};
let desktop_time_spent = {};
var tabsList = [];
let logintimer;
let atgTasktimer;
let isTimeLogStarted = false;
let requestCount = 0;
let requestCountDesktop = 0;
let appsList = [];
var appsUrl = {};
var closeDesktopApp = 0;
var tasksId;
var clickedLogout = 0;
var desktop_tracked_data = {};
var addNewProject = false;
let allProjectsTasks = [];
var countUpdatProjectsArray = 0;
let list_prj;
var macAdress;
let complete_data_track = {};
var exerun1;
var exerun2;
var exerun3;
var exerun4;
var exerun5;
var exerun6;
var cronTask;
var webAppList = {};
var startTaskCounter = 0;
var minimizeDashboard = 0;
var initDesktopApp = 0;
let lanchedDesktopApp = [];
var desktopAppList = [];
var countDesktopAppsInc = 0;
let pinAppsList;
var multiplePidsApps = ["Teams.exe", "RingCentral.exe"];
var microsoftPackageApps = ["OUTLOOK.EXE", "WINWORD.EXE","EXCEL.EXE", "POWERPNT.EXE","ONENOTE.EXE", "javaw.exe", "midoco.exe"];
let systemName = os.userInfo().username;

// When document has loaded, initialise
document.onreadystatechange = (event) => {
    if (document.readyState == "complete") {
        let fname = atob(sessions.get('userFirstname'));
        let lname = atob(sessions.get('userLastname'));
        let fullname = fname + ' ' + lname;
        if (fullname) {
            document.getElementsByClassName('wlcmHeader')[0].innerHTML = '<i class="fa fa-user-circle"></i> ' + fullname;
            logintimer = new AppTimers(0, 0, 0, document.getElementsByClassName('loginTimer')[0]);
            logintimer.startimer();
            document.body.classList.add("open-sidebar");

        } else {
            return false;
        }

        
        // get macAddress 
        macAdress = sessions.get("macAdress");
        // macAdress = getmac.default();
        console.log("macAdress main", macAdress)

        // update task_completed Id
        timelog_Task_completed();

        append_projects();
        sort_projects();

        setTimeout(()=> {
            if ((document.getElementsByClassName('atgtimer')[0].innerText == "00:00:00")) {
                jQuery('.dynamic-web-sidebar li a.linkDisable').addClass('linkDisabled');
                jQuery('.dynamic_desktop_sidebar li a.linkDisable').addClass('linkDisabled');
            }
        },100)

        atgTasktimer = new AppTimers(0, 0, 0, document.getElementsByClassName('atgtimer')[0]);


        window.addEventListener('online', internetstatus);
        window.addEventListener('offline', internetstatus);
        // log_timees_app();


        document.getElementById("login-alert").style.display = "none";
        
        
        // hit api to update task_completed Id
        
        const params = new URLSearchParams();

        let task_id = sessions.get('task_id');
        params.append('task_id', task_id);
        let userID = atob(sessions.get('userStaffID'));
        params.append('users_id', userID);
        // params.append('startTime', time);
        params.append('macAdress', macAdress);
        params.append('appName', 'electronApp');
    
        axios.defaults.headers.post['Content-Type'] = 'application/json';
        axios.post('https://crm.atgtravel.com/admin/api/atg_three_sixty/close_Electron_App_from_Task_Manager/', params)
            .then((response) => {
    
                console.log(response);
    
            })
            .catch((error) => {
                // start store error exception logs in the db
                let errorsList = {}
                errorsList.apiUrl = 'https://crm.atgtravel.com/admin/api/atg_three_sixty/close_Electron_App_from_Task_Manager/';
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
                // start store error exception logs in the db
            });


        // powershell code using desktop app

        var users = '"user32.dll"';
        var newLine = "\n";
        // var test = "param([string]$name) " + newLine + "$SW_MAXIMIZE = 3 " + newLine + "$sig = @' " + newLine + "[DllImport("+ users +")] public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);  " + newLine + "'@ " + newLine + "Add-Type -MemberDefinition $sig -Name Functions -Namespace Win32 " + newLine + "$hWnd = (Get-Process -id $name).MainWindowHandle " + newLine + "[Win32.Functions]::ShowWindow($hWnd, $SW_MAXIMIZE) " + newLine + "Set-ExecutionPolicy RemoteSigned CurrentUser"

        var test = "param([string]$name) " 
        + newLine + "$SW_MAXIMIZE = 3 "  
        + newLine + "Add-Type @' " 
        + newLine + "using System; using System.Runtime.InteropServices;  public class SFW { [DllImport("+ users +")] [return: MarshalAs(UnmanagedType.Bool)] public static extern bool SetForegroundWindow(IntPtr hWnd); }  " 
        + newLine + "'@ " 
        + newLine + "$sig = @' " 
        + newLine + "[DllImport("+ users +")] public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);  " 
        + newLine + "'@ " 
        + newLine + "Add-Type -MemberDefinition $sig -Name Functions -Namespace Win32 " 
        + newLine + "$hWnd = (Get-Process -id $name).MainWindowHandle " 
        + newLine + "[SFW]::SetForegroundWindow($hWnd) "  
        + newLine + "[Win32.Functions]::ShowWindow($hWnd, $SW_MAXIMIZE) " 
        + newLine + "Set-ExecutionPolicy RemoteSigned CurrentUser"


        fse.outputFile('C:/Users/'+ systemName +'/Documents/tmp1/test.ps1', test)
        .then(() => {
            console.log('The file has been saved!');
        })
        .catch(err => {
            console.error(err)
        });


        // Handle mouse wheel click error

        // The following function will catch all non-left (middle and right) clicks
        function handleNonLeftClick (e) {
            // e.button will be 1 for the middle mouse button.
            if (e.button === 1) {
                // Check if it is a link (a) element; if so, prevent the execution.
                if(e.target.tagName == "I" || e.target.tagName == "A" || e.target.tagName == "SPAN" || e.target.tagName == "IMG" || e.target.tagName == "LI" ) {
                    e.preventDefault();
                }
            }
        }
        window.onload = () => {
            // Attach the listener to the whole document.
            document.addEventListener("auxclick", handleNonLeftClick);
        }
    }
};


// Remove hidden class when open start task window
jQuery(".head-control-button .playbutton").click(function(){
    let timerContainer = document.getElementsByClassName('timer_alert_message')[0];
    timerContainer.innerHTML = "";

    let adminPassContainer = document.getElementsByClassName('desktop_alert_message')[0];
    adminPassContainer.innerHTML = "";

    var element = document.getElementsByClassName("left-sidebar")[0];
    element.classList.remove("open-alert");
  }); 
  
// hit api to update task_completed Id
function timelog_Task_completed () {
        
    console.log("macAdress----",macAdress)
    const params = new URLSearchParams();

    let task_id = sessions.get('task_id');
    params.append('task_id', task_id);
    let userID = atob(sessions.get('userStaffID'));
    params.append('users_id', userID);
    // params.append('startTime', time);
    params.append('macAdress', macAdress);
    params.append('appName', 'electronApp');

    axios.defaults.headers.post['Content-Type'] = 'application/json';
    axios.post('https://crm.atgtravel.com/admin/api/atg_three_sixty/close_Electron_App_from_Task_Manager/', params)
        .then((response) => {

            console.log(response);

        })
        .catch((error) => {
            // start store error exception logs in the db
            let errorsList = {}
            errorsList.apiUrl = 'https://crm.atgtravel.com/admin/api/atg_three_sixty/close_Electron_App_from_Task_Manager/';
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
            // start store error exception logs in the db

        });
}

function internetstatus() {
    if (!navigator.onLine) {
        const parser = new DOMParser();
        let internetStatusBox = document.getElementsByClassName('internet-status-message')[0];
        internetStatusBox.appendChild(parser.parseFromString(`<div class="start-task-alert start-task-form">
        <div class="inner-start-task-alert">
        <a href="#" class="close-alert right-menu-alert"><i class="fa fa-close"></i></a>
        <form class="add-password-form"  onsubmit="event.preventDefault()">
            <div class="form-group">
            <h3>Your Internet Connection is disconnected.</h3>
            </div>
        </form>
        </div>
    </div>`, 'text/html').firstChild);
  
    atgTasktimer.idleTime = 1;
    logintimer.idleTime = 1;
    }
    if (navigator.onLine) {
        const parser = new DOMParser();
        let internetStatusBox = document.getElementsByClassName('internet-status-message')[0];
        internetStatusBox.innerHTML = "";
        atgTasktimer.idleTime = 0;
        logintimer.idleTime = 0;
    }
}

/* This function dynamically appends the main screen and side bar web and desktop icons*/
function append_projects() {

    let dynamic_apps_web = document.getElementsByClassName('dynamic-apps-web')[0];
    let dynamic_web_sidebar = document.getElementsByClassName('dynamic-web-sidebar')[0];
    let dynamic_desktop_apps = document.getElementsByClassName('dynamic-desktop-apps')[0];
    let dynamic_desktop_sidebar = document.getElementsByClassName('dynamic-desktop-sidebar')[0];
    
    const testFolder = '../includes/images/';
    //joining path of directory 
    const directoryPath = path.join(__dirname, testFolder);
    fs.readdir(directoryPath, function (err, files) {

        if(addNewProject) {
            dynamic_apps_web.innerHTML = '';
            dynamic_web_sidebar.innerHTML = '';
            dynamic_desktop_apps.innerHTML = '';
            dynamic_desktop_sidebar.innerHTML = '';
        } else {  
           list_prj = sessions.get('Proj_tasks');
           pinAppsList = sessions.get('pin_apps');
           console.log("pinAppsList---", pinAppsList)
           pinAppsList = pinAppsList.filter(pin_app => pin_app.macAdress.includes(macAdress));
        }

        pinAppsList.forEach(function(pin_app) {
            if(pin_app.appType == 'web') {
               if(!files.includes(pin_app.icon) && pin_app.icon !== null) {
                    dynamic_apps_web.insertAdjacentHTML("beforeend", `<li id="pin-apps"><a pd="${pin_app.pId}" href="${pin_app.appUrl}" onclick="event.preventDefault();mainfunc(this);" data-toggle="tooltip" title="${pin_app.appName}"><i class="fa-travel-space-icon cst_bg_icon"><img src="https://crm.atgtravel.com/assets/images/${pin_app.icon}"><span class="badge bg-secondary"><i class="fa fa-thumb-tack"></i></span></i><span>${pin_app.appName}</span></a></li>`);  
                    dynamic_web_sidebar.insertAdjacentHTML("beforeend", `
                    <li class="mainlist menu-un-list" id="pin-apps">
                    <a href="${pin_app.appUrl}" pd="${pin_app.pId}"  class="sidebar-btn-link tablinks" data-toggle="tooltip" appType="${pin_app.appType}" title="${pin_app.appName}" onclick="event.preventDefault();mainfunc(this);">
                    <i class="fa-travel-space-icon cst_bg_icon"><img src="https://crm.atgtravel.com/assets/images/${pin_app.icon}"></i>${pin_app.appName}</a>
                    <a class="right-event-icon linkDisable" onclick="event.preventDefault();openLinkExternally(this)" href="">
                        <i class="fa fa-external-link"></i>
                    </a>
                    <a class="right-event-icon-pin pin-apps" onclick="event.preventDefault();removePinApps(this)" href="">
                        <i class="fa fa-thumb-tack"></i>
                    </a>
                </li>`);
                } else {
                    
                    if(pin_app.icon === null) {
                        dynamic_apps_web.insertAdjacentHTML("beforeend", `<li id="pin-apps"><a pd="${pin_app.pId}" href="${pin_app.appUrl}" onclick="event.preventDefault();mainfunc(this);" data-toggle="tooltip" title="${pin_app.appName}"><i class="fa-travel-space-icon cst_bg_icon"><img src="../includes/images/global-leadership-02.png"><span class="badge bg-secondary"><i class="fa fa-thumb-tack"></i></span></i><span>${pin_app.appName}</span></a></li>`);  
                        dynamic_web_sidebar.insertAdjacentHTML("beforeend", `
                        <li class="mainlist menu-un-list" id="pin-apps">
                        <a href="${pin_app.appUrl}" pd="${pin_app.pId}"  class="sidebar-btn-link tablinks" data-toggle="tooltip" appType="${pin_app.appType}" title="${pin_app.appName}" onclick="event.preventDefault();mainfunc(this);">
                        <i class="fa-travel-space-icon cst_bg_icon"><img src="../includes/images/global-leadership-02.png"></i>${pin_app.appName}</a>
                        <a class="right-event-icon linkDisable" onclick="event.preventDefault();openLinkExternally(this)" href="">
                            <i class="fa fa-external-link"></i>
                        </a>
                        <a class="right-event-icon-pin pin-apps" onclick="event.preventDefault();removePinApps(this)" href="">
                            <i class="fa fa-thumb-tack"></i>
                        </a>
                    </li>`);

                    } else {
                        var iconName = pin_app.icon.split( '.' )[0];
                        dynamic_apps_web.insertAdjacentHTML("beforeend", `<li id="pin-apps"><a pd="${pin_app.pId}" href="${pin_app.appUrl}" onclick="event.preventDefault();mainfunc(this);" data-toggle="tooltip" title="${pin_app.appName}"><i class="fa-travel-space-icon cst_bg_icon"><img src="../includes/images/${iconName}.png"><span class="badge bg-secondary"><i class="fa fa-thumb-tack"></i></span></i><span>${pin_app.appName}</span></a></li>`);  
                        dynamic_web_sidebar.insertAdjacentHTML("beforeend", `
                        <li class="mainlist menu-un-list" id="pin-apps">
                        <a href="${pin_app.appUrl}" pd="${pin_app.pId}"  class="sidebar-btn-link tablinks" data-toggle="tooltip" appType="${pin_app.appType}" title="${pin_app.appName}" onclick="event.preventDefault();mainfunc(this);">
                        <i class="fa-travel-space-icon cst_bg_icon"><img src="../includes/images/${iconName}.png"></i>${pin_app.appName}</a>
                        <a class="right-event-icon linkDisable" onclick="event.preventDefault();openLinkExternally(this)" href="">
                            <i class="fa fa-external-link"></i>
                        </a>
                        <a class="right-event-icon-pin pin-apps" onclick="event.preventDefault();removePinApps(this)" href="">
                            <i class="fa fa-thumb-tack"></i>
                        </a>
                    </li>`);

                    }
                }
            }
            if(pin_app.appType == 'desktop') {
                if(!files.includes(pin_app.icon) && pin_app.icon !== null) {
                    // dynamic desktop apps
                    dynamic_desktop_apps.insertAdjacentHTML("beforeend", `<li id="pin-apps"><a pd="${pin_app.pId}" href="${pin_app.appUrl}" onclick="event.preventDefault();externalApp(this);" data-toggle="tooltip" title="${pin_app.appName}"><i class="fa-travel-space-icon cst_bg_icon"><img src="https://crm.atgtravel.com/assets/images/${pin_app.icon}"><span class="badge bg-secondary"><i class="fa fa-thumb-tack"></i></span></i><span>${pin_app.appName}</span></a></li>`);
                    dynamic_desktop_sidebar.insertAdjacentHTML("beforeend", `
                    <li class="mainlist menu-un-list" id="pin-apps">
                    <a href="${pin_app.appUrl}" pd="${pin_app.pId}" class="sidebar-btn-link tablinks" data-toggle="tooltip" appType="${pin_app.appType}" title="${pin_app.appName}" onclick="event.preventDefault();externalApp(this);">
                    <i class="fa-travel-space-icon cst_bg_icon"><img src="https://crm.atgtravel.com/assets/images/${pin_app.icon}"></i>${pin_app.appName}</a>
                    <a class="right-event-icon-pin pin-apps" onclick="event.preventDefault();removePinApps(this)" href="">
                        <i class="fa fa-thumb-tack"></i>
                    </a>
                    </li>`);
                    // <a class="right-event-icon" onclick="event.preventDefault();openLinkExternally(this)" href="">
                    //     </a>
                } else {
                    if(pin_app.icon === null) {
                        // dynamic desktop apps
                        dynamic_desktop_apps.insertAdjacentHTML("beforeend", `<li id="pin-apps"><a pd="${pin_app.pId}" href="${pin_app.appUrl}" onclick="event.preventDefault();externalApp(this);" data-toggle="tooltip" title="${pin_app.appName}"><i class="fa-travel-space-icon cst_bg_icon"><img src="../includes/images/global-leadership-02.png"><span class="badge bg-secondary"><i class="fa fa-thumb-tack"></i></span></i><span>${pin_app.appName}</span></a></li>`);
                        dynamic_desktop_sidebar.insertAdjacentHTML("beforeend", `
                        <li class="mainlist menu-un-list" id="pin-apps">
                        <a href="${pin_app.appUrl}" pd="${pin_app.pId}" class="sidebar-btn-link tablinks" data-toggle="tooltip" appType="${pin_app.appType}" title="${pin_app.appName}" onclick="event.preventDefault();externalApp(this);">
                        <i class="fa-travel-space-icon cst_bg_icon"><img src="../includes/images/global-leadership-02.png"></i>${pin_app.appName}</a>
                        <a class="right-event-icon-pin pin-apps" onclick="event.preventDefault();removePinApps(this)" href="">
                            <i class="fa fa-thumb-tack"></i>
                        </a>
                        </li>`);
                        // <a class="right-event-icon" onclick="event.preventDefault();openLinkExternally(this)" href="">
                        //     </a>
                    } else {
                        var desktopIconName = pin_app.icon.split( '.' )[0]; 
                        // dynamic desktop apps
                        dynamic_desktop_apps.insertAdjacentHTML("beforeend", `<li id="pin-apps"><a pd="${pin_app.pId}" href="${pin_app.appUrl}" onclick="event.preventDefault();externalApp(this);" data-toggle="tooltip" title="${pin_app.appName}"><i class="fa-travel-space-icon cst_bg_icon"><img src="../includes/images/${desktopIconName}.png"><span class="badge bg-secondary"><i class="fa fa-thumb-tack"></i></span></i><span>${pin_app.appName}</span></a></li>`);
                        dynamic_desktop_sidebar.insertAdjacentHTML("beforeend", `
                        <li class="mainlist menu-un-list" id="pin-apps">
                        <a href="${pin_app.appUrl}" pd="${pin_app.pId}" class="sidebar-btn-link tablinks" data-toggle="tooltip" appType="${pin_app.appType}" title="${pin_app.appName}" onclick="event.preventDefault();externalApp(this);">
                        <i class="fa-travel-space-icon cst_bg_icon"><img src="../includes/images/${desktopIconName}.png"></i>${pin_app.appName}</a>
                        <a class="right-event-icon-pin pin-apps" onclick="event.preventDefault();removePinApps(this)" href="">
                           <i class="fa fa-thumb-tack"></i>
                        </a>
                        </li>`);
                        // <a class="right-event-icon" onclick="event.preventDefault();openLinkExternally(this)" href="">
                        //     </a>

                    }
                }
            }
        })

        // console.log('list_prj---', list_prj);
        list_prj.forEach(function (one_project) {
            var existPinApp = pinAppsList.find(function(ele) {
                console.log("ele---", ele.pId == one_project.id);
                return ele.pId == one_project.id;
            });
            if(one_project.appType == 'web' && one_project.url !== null && one_project["url"].length > 1) {
                if(!files.includes(one_project.icon) && one_project.icon !== null) {
                    // dynamic_apps_web.insertAdjacentHTML("beforeend", `<li><a href="${one_project.url}" onclick="event.preventDefault();mainfunc(this);"><i class="fa-atg-extra-icon cst_bg_icon"></i><span>${one_project.name}</span></a></li>`);
                    if(!existPinApp) {
                        dynamic_apps_web.insertAdjacentHTML("beforeend", `<li id="unselected-apps"><a pd="${one_project.id}" href="${one_project.url}" onclick="event.preventDefault();mainfunc(this);" data-toggle="tooltip" title="${one_project.name}"><i class="fa-travel-space-icon cst_bg_icon"><img src="https://crm.atgtravel.com/assets/images/${one_project.icon}"></i><span>${one_project.name}</span></a></li>`);
                        dynamic_web_sidebar.insertAdjacentHTML("beforeend", `
                        <li class="mainlist menu-un-list" id="unselected-apps">
                        <a href="${one_project.url}" pd="${one_project.id}"  class="sidebar-btn-link tablinks" data-toggle="tooltip" appType="${one_project.appType}" title="${one_project.name}" onclick="event.preventDefault();mainfunc(this);">
                        <i class="fa-travel-space-icon cst_bg_icon"><img src="https://crm.atgtravel.com/assets/images/${one_project.icon}"></i>${one_project.name}</a>
                        <a class="right-event-icon linkDisable" onclick="event.preventDefault();openLinkExternally(this)" href="">
                            <i class="fa fa-external-link"></i>
                        </a>
                        <a class="right-event-icon-pin" onclick="event.preventDefault();setPinApps(this)" href="">
                            <i class="fa fa-thumb-tack"></i>
                        </a>
                    </li>`);
                    }
                } else {
                    if(one_project.icon === null) {
                        if(!existPinApp) {
                            dynamic_apps_web.insertAdjacentHTML("beforeend", `<li id="unselected-apps"><a pd="${one_project.id}" href="${one_project.url}" onclick="event.preventDefault();mainfunc(this);" data-toggle="tooltip" title="${one_project.name}"><i class="fa-travel-space-icon cst_bg_icon"><img src="../includes/images/global-leadership-02.png"></i><span>${one_project.name}</span></a></li>`);
                            dynamic_web_sidebar.insertAdjacentHTML("beforeend", `
                                <li class="mainlist menu-un-list" id="unselected-apps">
                                <a href="${one_project.url}" pd="${one_project.id}"  class="sidebar-btn-link tablinks" data-toggle="tooltip" appType="${one_project.appType}" title="${one_project.name}" onclick="event.preventDefault();mainfunc(this);">
                                <i class="fa-travel-space-icon cst_bg_icon"><img src="../includes/images/global-leadership-02.png"></i>${one_project.name}</a>
                                <a class="right-event-icon linkDisable" onclick="event.preventDefault();openLinkExternally(this)" href="">
                                    <i class="fa fa-external-link"></i>
                                </a>
                                <a class="right-event-icon-pin" onclick="event.preventDefault();setPinApps(this)" href="">
                                    <i class="fa fa-thumb-tack"></i>
                                </a>
                            </li>`);
                        }

                    } else {
                        var iconName = one_project.icon.split( '.' )[0];
                        if(!existPinApp) {
                            dynamic_apps_web.insertAdjacentHTML("beforeend", `<li id="unselected-apps"><a pd="${one_project.id}" href="${one_project.url}" onclick="event.preventDefault();mainfunc(this);" data-toggle="tooltip" title="${one_project.name}"><i class="fa-travel-space-icon cst_bg_icon"><img src="../includes/images/${iconName}.png"></i><span>${one_project.name}</span></a></li>`);
                            dynamic_web_sidebar.insertAdjacentHTML("beforeend", `
                                <li class="mainlist menu-un-list" id="unselected-apps">
                                <a href="${one_project.url}" pd="${one_project.id}"  class="sidebar-btn-link tablinks" data-toggle="tooltip" appType="${one_project.appType}" title="${one_project.name}" onclick="event.preventDefault();mainfunc(this);">
                                <i class="fa-travel-space-icon cst_bg_icon"><img src="../includes/images/${iconName}.png"></i>${one_project.name}</a>
                                <a class="right-event-icon linkDisable" onclick="event.preventDefault();openLinkExternally(this)" href="">
                                    <i class="fa fa-external-link"></i>
                                </a>
                                <a class="right-event-icon-pin" onclick="event.preventDefault();setPinApps(this)" href="">
                                    <i class="fa fa-thumb-tack"></i>
                                </a>
                            </li>`);
                        }

                    }
                }
            }

            if(one_project.appType == 'desktop' && one_project.url !== null && one_project["url"].length > 1) {
                if(!files.includes(one_project.icon) && one_project.icon !== null) {
                    // dynamic desktop apps
                    if(!existPinApp) {
                        dynamic_desktop_apps.insertAdjacentHTML("beforeend", `<li id="unselected-apps"><a pd="${one_project.id}" href="${one_project.url}" onclick="event.preventDefault();externalApp(this);" data-toggle="tooltip" title="${one_project.name}"><i class="fa-travel-space-icon cst_bg_icon"><img src="https://crm.atgtravel.com/assets/images/${one_project.icon}"></i><span>${one_project.name}</span></a></li>`);
                         dynamic_desktop_sidebar.insertAdjacentHTML("beforeend", `
                        <li class="mainlist menu-un-list" id="unselected-apps">
                        <a href="${one_project.url}" pd="${one_project.id}" class="sidebar-btn-link tablinks" data-toggle="tooltip" appType="${one_project.appType}" title="${one_project.name}" onclick="event.preventDefault();externalApp(this);">
                        <i class="fa-travel-space-icon cst_bg_icon"><img src="https://crm.atgtravel.com/assets/images/${one_project.icon}"></i>${one_project.name}</a>
                        <a class="right-event-icon-pin" onclick="event.preventDefault();setPinApps(this)" href="">
                            <i class="fa fa-thumb-tack"></i>
                        </a>
                        </li>`);
                    // <a class="right-event-icon" onclick="event.preventDefault();openLinkExternally(this)" href="">
                    //     </a>
                    }
                } else {
                    if(one_project.icon === null) {
                        // dynamic desktop apps
                        if(!existPinApp) {
                            dynamic_desktop_apps.insertAdjacentHTML("beforeend", `<li id="unselected-apps"><a pd="${one_project.id}" href="${one_project.url}" onclick="event.preventDefault();externalApp(this);" data-toggle="tooltip" title="${one_project.name}"><i class="fa-travel-space-icon cst_bg_icon"><img src="../includes/images/global-leadership-02.png"></i><span>${one_project.name}</span></a></li>`);
                            dynamic_desktop_sidebar.insertAdjacentHTML("beforeend", `
                            <li class="mainlist menu-un-list" id="unselected-apps">
                            <a href="${one_project.url}" pd="${one_project.id}" class="sidebar-btn-link tablinks" data-toggle="tooltip" appType="${one_project.appType}" title="${one_project.name}" onclick="event.preventDefault();externalApp(this);">
                            <i class="fa-travel-space-icon cst_bg_icon"><img src="../includes/images/global-leadership-02.png"></i>${one_project.name}</a>
                            <a class="right-event-icon-pin" onclick="event.preventDefault();setPinApps(this)" href="">
                                <i class="fa fa-thumb-tack"></i>
                            </a>
                            </li>`);
                            // <a class="right-event-icon" onclick="event.preventDefault();openLinkExternally(this)" href="">
                            //     </a>
                        }
                    } else {
                        var desktopIconName = one_project.icon.split( '.' )[0]; 
                        // dynamic desktop apps
                        if(!existPinApp) {
                            dynamic_desktop_apps.insertAdjacentHTML("beforeend", `<li id="unselected-apps"><a pd="${one_project.id}" href="${one_project.url}" onclick="event.preventDefault();externalApp(this);" data-toggle="tooltip" title="${one_project.name}"><i class="fa-travel-space-icon cst_bg_icon"><img src="../includes/images/${desktopIconName}.png"></i><span>${one_project.name}</span></a></li>`);
                            dynamic_desktop_sidebar.insertAdjacentHTML("beforeend", `
                            <li class="mainlist menu-un-list" id="unselected-apps">
                            <a href="${one_project.url}" pd="${one_project.id}" class="sidebar-btn-link tablinks" data-toggle="tooltip" appType="${one_project.appType}" title="${one_project.name}" onclick="event.preventDefault();externalApp(this);">
                            <i class="fa-travel-space-icon cst_bg_icon"><img src="../includes/images/${desktopIconName}.png"></i>${one_project.name}</a>
                            <a class="right-event-icon-pin" onclick="event.preventDefault();setPinApps(this)" href="">
                                <i class="fa fa-thumb-tack"></i>
                            </a>
                            </li>`);
                            // <a class="right-event-icon" onclick="event.preventDefault();openLinkExternally(this)" href="">
                            //     </a>
                        }

                    }
                }
            }
        });
    });

    console.log(dynamic_apps_web);
}
function sort_projects() {
    setTimeout(()=> {

        // dashboard apps
        let apps_web = document.querySelector('.dynamic-apps-web'),
            pin_para_apps_web = document.querySelectorAll('.dynamic-apps-web li#pin-apps'),
            para_apps_web = document.querySelectorAll('.dynamic-apps-web li#unselected-apps');

        let desktop_apps = document.querySelector('.dynamic-desktop-apps'),
            pin_para_apps_desktop = document.querySelectorAll('.dynamic-desktop-apps li#pin-apps'),
            para_desktop_apps_desktop = document.querySelectorAll('.dynamic-desktop-apps li#unselected-apps');

        // sidebar apps
        let web_sidebar = document.querySelector('.dynamic-web-sidebar'),
            pin_para_web_apps_sidebar = document.querySelectorAll('.dynamic-web-sidebar li#pin-apps'),
            para_web_apps_sidebar = document.querySelectorAll('.dynamic-web-sidebar li#unselected-apps');

        let desktop_sidebar_apps = document.querySelector('.dynamic-desktop-sidebar'),
            pin_para_desktop_apps = document.querySelectorAll('.dynamic-desktop-sidebar li#pin-apps'),
            para_desktop_apps = document.querySelectorAll('.dynamic-desktop-sidebar li#unselected-apps');

    
        
        // dashboard apps sorting start  

        // Dashboard pinned web apps sorting
        var pin_paraArr_web_dashboard = [].slice.call(pin_para_apps_web).sort(function (a, b) {

            let prevElement = a.firstElementChild.getAttribute('title') || '';
            let nextElement = b.firstElementChild.getAttribute('title') || '';
            return prevElement.toLowerCase() > nextElement.toLowerCase() ? 1 : -1;
        });
        pin_paraArr_web_dashboard.forEach(function (li) {
            apps_web.appendChild(li);
        });
        // Dashboard unpin web apps sorting
        var unpin_paraArr_web_dashboard = [].slice.call(para_apps_web).sort(function (a, b) {

            let prevElement = a.firstElementChild.getAttribute('title') || '';
            let nextElement = b.firstElementChild.getAttribute('title') || '';
            return prevElement.toLowerCase() > nextElement.toLowerCase() ? 1 : -1;
        });
        unpin_paraArr_web_dashboard.forEach(function (li) {
            apps_web.appendChild(li);
        });


        // Dashboard pinned desktop apps sorting
        var pin_paraArr_dashboard = [].slice.call(pin_para_apps_desktop).sort(function (a, b) {
            
            let prevElement = a.firstElementChild.getAttribute('title') || '';
            let nextElement = b.firstElementChild.getAttribute('title') || '';
            return prevElement.toLowerCase() > nextElement.toLowerCase() ? 1 : -1;
        });
        pin_paraArr_dashboard.forEach(function (li) {
            desktop_apps.appendChild(li);
        });
        // Dashboard unpinned desktop apps sorting
        var unpin_paraArr_dashboard = [].slice.call(para_desktop_apps_desktop).sort(function (a, b) {
            
            let prevElement = a.firstElementChild.getAttribute('title') || '';
            let nextElement = b.firstElementChild.getAttribute('title') || '';
            return prevElement.toLowerCase() > nextElement.toLowerCase() ? 1 : -1;
        });
        unpin_paraArr_dashboard.forEach(function (li) {
            desktop_apps.appendChild(li);
        });

        // dashboard apps sorting end   

        // sidebar apps sorting start

        // pinned apps sorting
        var pin_paraArr = [].slice.call(pin_para_web_apps_sidebar).sort(function (a, b) {
            console.log("a*********", a);
            return a.firstElementChild.getAttribute('title').toLowerCase() > b.firstElementChild.getAttribute('title').toLowerCase() ? 1 : -1;
        });
        pin_paraArr.forEach(function (li) {
            web_sidebar.appendChild(li);
        });
        // unpin apps sorting
        var paraArr = [].slice.call(para_web_apps_sidebar).sort(function (a, b) {
            console.log("a*********", a);
            return a.firstElementChild.getAttribute('title').toLowerCase() > b.firstElementChild.getAttribute('title').toLowerCase() ? 1 : -1;
        });
        paraArr.forEach(function (li) {
            web_sidebar.appendChild(li);
        });

        // pinned desktop apps sorting 
        var pin_paraArrDesktop = [].slice.call(pin_para_desktop_apps).sort(function (a, b) {
            return a.firstElementChild.getAttribute('title').toLowerCase() > b.firstElementChild.getAttribute('title').toLowerCase() ? 1 : -1;
        });
        pin_paraArrDesktop.forEach(function (li) {
            desktop_sidebar_apps.appendChild(li);
        });
        // pinned desktop apps sorting 
        var paraArrDesktop = [].slice.call(para_desktop_apps).sort(function (a, b) {
            return a.firstElementChild.getAttribute('title').toLowerCase() > b.firstElementChild.getAttribute('title').toLowerCase() ? 1 : -1;
        });
        paraArrDesktop.forEach(function (li) {
            desktop_sidebar_apps.appendChild(li);
        });

        //sidebar apps sorting end

    },500)
}
window.onbeforeunload = (event) => {
    /* If window is reloaded, remove win event listeners
    (DOM element listeners get auto garbage collected but not
    Electron win listeners as the win is not dereferenced unless closed) */
    win.removeAllListeners();
}

function mainfunc(elem) {
    
    console.log('start elem', elem);
    // let myproj_selected = checkIfProjectSelected();
    if (document.getElementsByClassName('atgtimer')[0].innerText == "00:00:00") {
        const parser = new DOMParser();
        
        let timerContainer = document.getElementsByClassName('timer_alert_message')[0];  
            
        var element = document.getElementsByClassName("left-sidebar")[0];
        element.classList.add("open-alert");

        jQuery('.right-content').on("keydown", function(e) {
            if (e.keyCode == 13) {
                e.preventDefault();
                return false;
            }
        })

        // timerContainer.appendChild(parser.parseFromString(`<div class="start-task-alert"><div class="inner-start-task-alert"><a href="#" class="close-alert right-menu-alert"><i class="fa fa-close"></i></a><p><span><i class="fa fa-exclamation-triangle"></i></span>Do you want to continue without starting the timer?</p><div class='alert-button'><a href='' class="yes_btn">Yes</a><a href='' class="no_btn">No</a></div></div></div>`, 'text/html').firstChild);
        timerContainer.appendChild(parser.parseFromString(`<div class="start-task-alert"><div class="inner-start-task-alert"><a href="#" class="close-alert right-menu-alert"><i class="fa fa-close"></i></a><div class="inner-start-task-form"><div class="form-group"><label>Select Your Project</label><select class = "projects"><option>None</option></select></div><div class="form-group"><label>Select Your Task</label><select class ="tasks-sel"><option>None</option></select></div></div><div class='alert-button'><a href='' class="start_btn">Start</a></div></div></div>`, 'text/html').firstChild);

        if(timerContainer.innerHTML != null) {
            jQuery('.left-sidebar').on("keydown", function(e) {
                if (e.keyCode == 9) {
                    e.preventDefault();
                    return false;
                }
            })
        }

        document.getElementsByClassName("right-menu-alert")[0].addEventListener('click', function (ev) {
            timerContainer.innerHTML = "";

            jQuery('.left-sidebar').unbind();

            var element = document.getElementsByClassName("left-sidebar")[0];
            element.classList.remove("open-alert");

            jQuery('.right-content').unbind();
        });

        if(addNewProject) {
            allProjectsTasks = list_prj; 
        }
        else {
            allProjectsTasks = sessions.get('Proj_tasks');
        }

        var select = document.getElementsByClassName('projects')[0];
        for (var i = 0; i < allProjectsTasks.length; i++) {
            select.options[select.options.length] = new Option(allProjectsTasks[i].name, allProjectsTasks[i].id);
        }
        // console.log('elem--', elem)
        // console.log('elem.href web--', elem.href)
        // console.log('allProjectsTasks---', allProjectsTasks)
        let singular_object = allProjectsTasks.find(o => o.url === elem.href);
        let project_id = singular_object.id;
        let tasks_projects = singular_object.tasks;
        var tasks_dd = document.getElementsByClassName('tasks-sel')[0];

        for (var i = 0; i < tasks_projects.length; i++) {
            tasks_dd.options[tasks_dd.options.length] = new Option(tasks_projects[i].name, tasks_projects[i].id);
        }

        document.getElementsByClassName('projects')[0].value = project_id;
        document.getElementsByClassName('projects')[0].setAttribute("disabled", "disabled");

        document.getElementsByClassName("start_btn")[0].addEventListener('click', function (ev) {

            var element = document.getElementsByClassName("left-sidebar")[0];
            element.classList.remove("open-alert");

            jQuery('.dynamic-web-sidebar li a.linkDisable').removeClass('linkDisabled');
            jQuery('.dynamic_desktop_sidebar li a.linkDisable').removeClass('linkDisabled');

            jQuery('.right-content').unbind();

            ev.preventDefault();
            console.log("oelelelelel");
            console.log(document.getElementsByClassName('projects')[0]);
            let projectId = document.getElementsByClassName('projects')[0].value;
            console.log("oelelelelel");
            let tasks = document.getElementsByClassName("tasks-sel")[0].value;
            sessions.set("hrefweb", elem.href)

            // appsUrl.href = elem.href;
            appsList.push(elem.href);

            sessions.set('task_id', tasks);
            sessions.set('sessionId', 0);
            console.log('task_id-----', tasks)
            if (tasks == null || tasks == "" || tasks == "None") {
                alert("Task is not selected");
                return;

            } else {
                sessions.set('isTaskTimerRunning', "1");
                let project_task_cache = {};
                console.log('currentTask-------web---', tasks);
                console.log('currentProject-------web---', project_id);
                project_task_cache.currentTask = btoa(tasks);
                project_task_cache.currentProject = btoa(project_id);
                console.log('project_task_cache-------web---', project_task_cache);
                ipc.invoke('StartTimerOnMainPage').then(res => {
                    ipc.invoke('SetCacheValues', project_task_cache).then(res => {
                        mainfuncTaskRunning(elem);
                    });

                });
                // countDesktopAppsInc++;

            }
            timerContainer.innerHTML = "";

        });

    } else {
        mainfuncTaskRunning(elem);
    }

}

function mainfuncTaskRunning(elem) {
    var spinner = document.querySelectorAll(".icon-bar button.etabs-tab-button-refresh")[0];
    spinner.classList.add("fa-spin")

    document.getElementById("login-alert").style.display = "none";

    if(initDesktopApp == 0) {
        desktopTracker.init();
        initDesktopApp = 1;
    }
    // desktopTracker.init();
    closeDesktopApp = 0;

    sessions.set('sessionId', 0);
    isTimeLogStarted = true;
    console.log("elem*********", elem);
    // console.log(elem.getAttribute("pd"));

    document.body.classList.add("open-sidebar");
    let hrefwebview = elem.href;

    
    let projectId = elem.getAttribute('pd');
    // console.log("projectId-----",projectId);

    let sitetitle = elem.getAttribute("title");
    // let sitetitle = elem.innerHTML.split('</i>')[1];
    // console.log("sitetitle test----",sitetitle)
    if (sitetitle == undefined) {
        sitetitle = elem.innerHTML;
    }
    sitetitle = sitetitle.replace(/(\r\n|\n|\r)/gm, "");
    sitetitle = sitetitle.replace(/\s+/g, ' ').trim();

    if (sitetitle.length > 30) {
        sitetitle = sitetitle.slice(0, 20).concat('..');
    }


    // tbgs.addTheTab();
    const ex = checkSameTab(tabGroup, hrefwebview);
    if (!ex) {

        document.getElementById('mainDiv').style = "display: none;";
        document.getElementById('tabsdiv').style = "";
        let tab = tabGroup.addTab({
            title: sitetitle,
            src: hrefwebview,
            visible: true,
            active: true,
            webviewAttributes: {
                nodeintegration: true,
                preload: '../includes/js/inyector.js',
                webviewTag: true,
                enableRemoteModule: true,
                nativeWindowOpen: true 
            }
        });
        // console.log(typeof web_tracked_data[hrefwebview]);
        if (typeof web_tracked_data[hrefwebview] === 'undefined') { /** will return true if exist */
            web_tracked_data[hrefwebview] = {
                'start': new Date(),
                'end': null,
                'time': 0,
                'isActive': true,
                'calculate_time': 0,
                'isElectron': null,
                'projectId': parseInt(projectId),
                // 'isInActive': false,
            }
        } 
        else {
            web_tracked_data[hrefwebview].start = new Date();
            web_tracked_data[hrefwebview].isActive = true;
            web_tracked_data[hrefwebview].calculate_time = 0;

            if(web_tracked_data[hrefwebview].isInActive != null) {
                web_tracked_data[hrefwebview].isInActive = false;
            }
            // web_tracked_data[hrefwebview].isInActive = false;
        }
        // console.log(web_tracked_data);

        tab.webview.addEventListener("dom-ready", function () {
            // Show devTools if you want
            // tab.webview.openDevTools();
            tab.webview.send("request");
        });
        // Process the data from the webview
        tab.webview.addEventListener('ipc-message', function (event) {
            openNewTabHandle(event);
        });

        //make a function which should be called whenever a user will add new tab all the other tabs
        // looped and their time will be logged
        tab.on("close", (tab) => {
            let remTabs = tabGroup.getTabs().length; console.log(remTabs + "111");
            console.log('remTabs-----', remTabs);
            if (remTabs == 0) {
                document.getElementById('tabsdiv').style = "display: none;";
                document.getElementById('mainDiv').style = "";
            }
            // web_tracked_data[hrefwebview].end = new Date();
            // const calc_time = web_tracked_data[hrefwebview].start - web_tracked_data[hrefwebview].end;
            // const calc_time_abs = Math.abs(calc_time) / 1000;
            // web_tracked_data[hrefwebview].time += calc_time_abs;

            web_tracked_data[hrefwebview].isActive = false;
            // web_tracked_data[hrefwebview].isInActive = false;
            
            // web_tracked_data[hrefwebview].calculate_time = 0;

            // if(web_tracked_data[hrefwebview].isInActive != null) {
            //     web_tracked_data[hrefwebview].isInActive = false;
            // }
            
            web_tracked_data[hrefwebview].isInActive = false;

            var tabsList = maintainTabslistsClose(hrefwebview);

            console.log("============checkRemainingTabsNotExisit==========");
            // checkRemainingTabsNotExisit(hrefwebview);
            checkRemainingTabsNotExisit(remTabs);
            console.log("============checkRemainingTabsNotExisit===============end");


        });
        tab.on("active", (tab) => {
            web_tracked_data[hrefwebview].start = new Date();
            web_tracked_data[hrefwebview].isActive = true;
            web_tracked_data[hrefwebview].calculate_time = 0;
            
            if(web_tracked_data[hrefwebview].isInActive != null) {
                web_tracked_data[hrefwebview].isInActive = false;
            }
        });

        tab.on("inactive", (tab) => {
            //this function will check if the same type of url are not openend that belong to the same project or task then task should also be closes according to the requirement
            console.log("===//////////==");
            let tabs = tabGroup.getTabs();
            console.log(tabs);
            console.log("===//////////==");
            // web_tracked_data[hrefwebview].end = new Date();
            // web_tracked_data[hrefwebview].time += Math.abs(web_tracked_data[hrefwebview].start - web_tracked_data[hrefwebview].end) / 1000;
            web_tracked_data[hrefwebview].isActive = false;
            web_tracked_data[hrefwebview].isInActive = true;
            web_tracked_data[hrefwebview].calculate_time = 0;
            // web_tracked_data[hrefwebview].isElectron = true;
        });
        console.log("============web_tracked_data==========");
        console.log(web_tracked_data);
        console.log("============web_tracked_data===============end");
        maintainTabslists(hrefwebview);

        // add refresh button in web apps code start
        // var refreshButtonHtml = '<button class="etabs-tab-button-left fa fa-arrow-left"></button> <button class="etabs-tab-button-right fa fa-arrow-right"></button> <button class="etabs-tab-button-refresh fa fa-refresh"></button>';
        // tab.tabElements.icon.insertAdjacentHTML('beforeend', refreshButtonHtml);
        // add refresh button in web apps code end

        let webview1 = document.querySelector('webview.etabs-view.visible')
        webview1.addEventListener('new-window', (e) => {
            const url = e.url;
            openNewTabHandleExternalLink(url)
            console.log("url 1", url)
            // used url to render new tabs.
        })
        
        // webview1.addEventListener('new-window', (e, url) => {
        //     e.preventDefault();
        //     console.log(e.url);
        //     Shell.openExternal(e.url)
        // })

        // tabs reload code start
        jQuery('.icon-bar  span.etabs-tab-icon button.etabs-tab-button-refresh').click(function() {
            let webview = document.querySelector('webview.etabs-view.visible')
            let output = compareJustTravelSpaceUrl(webview.src);
            if(output) {
                webview.reload()
            }
        });

        // left tabs code start
        jQuery('.icon-bar  span.etabs-tab-icon button.etabs-tab-button-left').click(function() {
            let webview = document.querySelector('webview.etabs-view.visible')
            // webview.goBack()
            let output = compareJustTravelSpaceUrl(webview.src);
            if(output) {
                // let atgTravelSpaceUrl = webview.src;
                webview.goBack()
            }
        });
        // left tabs code end

        // right tabs code start
        jQuery('.icon-bar  span.etabs-tab-icon button.etabs-tab-button-right').click(function() {
            let webview = document.querySelector('webview.etabs-view.visible')
            // webview.goForward()
            let output = compareJustTravelSpaceUrl(webview.src);
            if(output) {
                webview.goForward()
            }
        });
        // right tabs code end
    }
}

function compareJustTravelSpaceUrl(travelSpaceUrl) { 
    
    // var travelSpaceUrl = "https://travelspace.atgtravel.com/?atgts&CFID=4594549&CFTOKEN=97535956";
    let CFTOKEN = travelSpaceUrl.split("=").pop()
    console.log("CFTOKEN -----", CFTOKEN)
    if(CFTOKEN.length == 8) {
        return false;
    } else {
        return true;
    }

}

function mainfuncFloatingMenu(elem) {
    console.log('start elem', elem);
    // var taskTimer = sessions.get('isTaskTimerRunning');
    // console.log("taskTimer",taskTimer);
    // ipc.send('startTaskByWindow',"hello").then((result) => {
    //     ipc.on('startTaskWindow', (event, isTaskTimerRunning) => {
    //         console.log('isTaskTimerRunning----', isTaskTimerRunning);
    //     });
    // });
    // let myproj_selected = checkIfProjectSelected();
    if (document.getElementsByClassName('atgtimer')[0].innerText == "00:00:00") {
        const parser = new DOMParser();

        let timerContainer = document.getElementsByClassName('timer_alert_message')[0];
        // timerContainer.appendChild(parser.parseFromString(`<div class="start-task-alert"><div class="inner-start-task-alert"><a href="#" class="close-alert right-menu-alert"><i class="fa fa-close"></i></a><p><span><i class="fa fa-exclamation-triangle"></i></span>Do you want to continue without starting the timer?</p><div class='alert-button'><a href='' class="yes_btn">Yes</a><a href='' class="no_btn">No</a></div></div></div>`, 'text/html').firstChild);
        timerContainer.appendChild(parser.parseFromString(`<div class="start-task-alert"><div class="inner-start-task-alert"><a href="#" class="close-alert right-menu-alert"><i class="fa fa-close"></i></a><div class="inner-start-task-form"><div class="form-group"><label>Select Your Project</label><select class = "projects"><option>None</option></select></div><div class="form-group"><label>Select Your Task</label><select class ="tasks-sel"><option>None</option></select></div></div><div class='alert-button'><a href='' class="start_btn">Start</a></div></div></div>`, 'text/html').firstChild);
      
        if(timerContainer.innerHTML != null) {
            jQuery('.left-sidebar').on("keydown", function(e) {
                if (e.keyCode == 9) {
                    e.preventDefault();
                    return false;
                }
            })
        }

        var element = document.getElementsByClassName("left-sidebar")[0];
        element.classList.add("open-alert");

        jQuery('.right-content').on("keydown", function(e) {
            if (e.keyCode == 13) {
                e.preventDefault();
                return false;
            }
        })

        document.getElementsByClassName("right-menu-alert")[0].addEventListener('click', function (ev) {
            timerContainer.innerHTML = "";

            jQuery('.left-sidebar').unbind();

            var element = document.getElementsByClassName("left-sidebar")[0];
            element.classList.remove("open-alert");

            jQuery('.right-content').unbind();
        });

        if(addNewProject) {
            allProjectsTasks = list_prj; 
        }
        else {
            allProjectsTasks = sessions.get('Proj_tasks');
        }

        // let allProjectsTasks = sessions.get('Proj_tasks');

        var select = document.getElementsByClassName('projects')[0];
        for (var i = 0; i < allProjectsTasks.length; i++) {
            select.options[select.options.length] = new Option(allProjectsTasks[i].name, allProjectsTasks[i].id);
        }
        console.log('elem--', typeof(elem))
        console.log('elem.href web--', elem[0].href)
        // console.log('allProjectsTasks---', allProjectsTasks)

        let singular_object = allProjectsTasks.find(o => o.url === elem[0].href);
        console.log("singular_object_________>>>>>>>",singular_object)
        let  project_id = singular_object.id;
        console.log("project_id  >>>>>>>",singular_object.id)
        let tasks_projects = singular_object.tasks;
        var tasks_dd = document.getElementsByClassName('tasks-sel')[0];

        for (var i = 0; i < tasks_projects.length; i++) {
            tasks_dd.options[tasks_dd.options.length] = new Option(tasks_projects[i].name, tasks_projects[i].id);
        }
        // $('.tasks-sel').select2();

        // $(document).ready(function() {
        // document.getElementsByClassName('tasks-sel')[0].select2();
        // });

        document.getElementsByClassName('projects')[0].value = project_id;
        document.getElementsByClassName('projects')[0].setAttribute("disabled", "disabled");

        document.getElementsByClassName("start_btn")[0].addEventListener('click', function (ev) {

            var element = document.getElementsByClassName("left-sidebar")[0];
            element.classList.remove("open-alert");
            
            jQuery('.dynamic-web-sidebar li a.linkDisable').removeClass('linkDisabled');
            jQuery('.dynamic_desktop_sidebar li a.linkDisable').removeClass('linkDisabled');

            jQuery('.right-content').unbind();

            ev.preventDefault();
            console.log("oelelelelel");
            console.log(document.getElementsByClassName('projects')[0]);
            let projectId = document.getElementsByClassName('projects')[0].value;
            // console.log("oelelelelel");
            let tasks = document.getElementsByClassName("tasks-sel")[0].value;
            // sessions.set("hrefweb", elem.href)

            // appsUrl.href = elem.href;
            appsList.push(elem.href);

            sessions.set('task_id', tasks);
            sessions.set('sessionId', 0);
            console.log('task_id-----', tasks)
            if (tasks == null || tasks == "" || tasks == "None") {
                alert("Task is not selected");
                return;

            } else {
                sessions.set('isTaskTimerRunning', "1");
                let project_task_cache = {};
                console.log('currentTask-------web---', tasks);
                console.log('currentProject-------web---', project_id);
                project_task_cache.currentTask = btoa(tasks);
                project_task_cache.currentProject = btoa(project_id);
                console.log('project_task_cache-------web---', project_task_cache);
                ipc.invoke('StartTimerOnMainPage').then(res => {
                    ipc.invoke('SetCacheValues', project_task_cache).then(res => {
                        mainfuncTaskRunningFloating(elem);
                    });

                });
                // countDesktopAppsInc++;


            }
            timerContainer.innerHTML = "";

        });

    } else {
        mainfuncTaskRunningFloating(elem);
    }

}
function mainfuncTaskRunningFloating(elem) {
    
    var spinner = document.querySelectorAll(".icon-bar button.etabs-tab-button-refresh")[0];
    spinner.classList.add("fa-spin")

    document.getElementById("login-alert").style.display = "none";
    // desktopTracker.init()
    if(initDesktopApp == 0) {
        desktopTracker.init();
        initDesktopApp = 1;
    }
    closeDesktopApp = 0;
    isTimeLogStarted = true; 
    sessions.set('sessionId', 0);
    console.log("elem*********", elem);
    // console.log(elem.getAttribute("pd"));

    let projectId = elem[0].pd;

    document.body.classList.add("open-sidebar");
    let hrefwebview = elem[0].href;

    console.log("hrefwebview---", hrefwebview);
    sitetitle = elem[0].title;

    // tbgs.addTheTab();
    const ex = checkSameTab(tabGroup, hrefwebview);
    if (!ex) {

        document.getElementById('mainDiv').style = "display: none;";
        document.getElementById('tabsdiv').style = "";
        let tab = tabGroup.addTab({
            title: sitetitle,
            src: hrefwebview,
            visible: true,
            active: true,
            webviewAttributes: {
                nodeintegration: true,
                preload: '../includes/js/inyector.js',
                webviewTag: true,
                enableRemoteModule: true,
                nativeWindowOpen: true 
            }
        });
        // console.log(typeof web_tracked_data[hrefwebview]);
        if (typeof web_tracked_data[hrefwebview] === 'undefined') { /** will return true if exist */
            web_tracked_data[hrefwebview] = {
                'start': new Date(),
                'end': null,
                'time': 0,
                'isActive': true,
                'calculate_time': 0,
                'isElectron': null,
                'projectId': parseInt(projectId),
                // 'isInActive': false,
            }
        } 
        else {
            web_tracked_data[hrefwebview].start = new Date();
            web_tracked_data[hrefwebview].isActive = true;
            web_tracked_data[hrefwebview].calculate_time = 0;
            
            if(web_tracked_data[hrefwebview].isInActive != null) {
                web_tracked_data[hrefwebview].isInActive = false;
            }
            // web_tracked_data[hrefwebview].isInActive = false;
        }
        // console.log(web_tracked_data);

        tab.webview.addEventListener("dom-ready", function () {
            // Show devTools if you want
            // tab.webview.openDevTools();
            tab.webview.send("request");
        });
        // Process the data from the webview
        tab.webview.addEventListener('ipc-message', function (event) {
            openNewTabHandle(event);
        });

        //make a function which should be called whenever a user will add new tab all the other tabs
        // looped and their time will be logged
        tab.on("close", (tab) => {
            let remTabs = tabGroup.getTabs().length; console.log(remTabs + "111");
            console.log('remTabs-----', remTabs);
            if (remTabs == 0) {
                document.getElementById('tabsdiv').style = "display: none;";
                document.getElementById('mainDiv').style = "";
            }
            // web_tracked_data[hrefwebview].end = new Date();
            // const calc_time = web_tracked_data[hrefwebview].start - web_tracked_data[hrefwebview].end;
            // const calc_time_abs = Math.abs(calc_time) / 1000;
            // web_tracked_data[hrefwebview].time += calc_time_abs;
            
            web_tracked_data[hrefwebview].isActive = false;
            // web_tracked_data[hrefwebview].calculate_time = 0;
            
            // if(web_tracked_data[hrefwebview].isInActive != null) {
            //     web_tracked_data[hrefwebview].isInActive = false;
            // }
            
            web_tracked_data[hrefwebview].isInActive = false;

            var tabsList = maintainTabslistsClose(hrefwebview);

            console.log("============checkRemainingTabsNotExisit==========");
            // checkRemainingTabsNotExisit(hrefwebview);
            checkRemainingTabsNotExisit(remTabs);
            console.log("============checkRemainingTabsNotExisit===============end");


        });
        tab.on("active", (tab) => {
            web_tracked_data[hrefwebview].start = new Date();
            web_tracked_data[hrefwebview].isActive = true;
            web_tracked_data[hrefwebview].calculate_time = 0;
            if(web_tracked_data[hrefwebview].isInActive != null) {
                web_tracked_data[hrefwebview].isInActive = false;
            }
        });

        tab.on("inactive", (tab) => {
            //this function will check if the same type of url are not openend that belong to the same project or task then task should also be closes according to the requirement
            console.log("===//////////==");
            let tabs = tabGroup.getTabs();
            console.log(tabs);
            console.log("===//////////==");
            // web_tracked_data[hrefwebview].end = new Date();
            // web_tracked_data[hrefwebview].time += Math.abs(web_tracked_data[hrefwebview].start - web_tracked_data[hrefwebview].end) / 1000;
            web_tracked_data[hrefwebview].isActive = false;
            web_tracked_data[hrefwebview].isInActive = true;
            web_tracked_data[hrefwebview].calculate_time = 0;
            // web_tracked_data[hrefwebview].isElectron = true;
        });
        console.log("============web_tracked_data==========");
        console.log(web_tracked_data);
        console.log("============web_tracked_data===============end");
        maintainTabslists(hrefwebview);

        // add refresh button in web apps code start
        // var refreshButtonHtml = '<button class="etabs-tab-button-left fa fa-arrow-left"></button> <button class="etabs-tab-button-right fa fa-arrow-right"></button> <button class="etabs-tab-button-refresh fa fa-refresh"></button>';
        // tab.tabElements.icon.insertAdjacentHTML('beforeend', refreshButtonHtml);
        // add refresh button in web apps code end

        let webview1 = document.querySelector('webview.etabs-view.visible')
        webview1.addEventListener('new-window', (e) => {
            const url = e.url;
            // openNewTabHandleExternalLink(url,projectId)
            openNewTabHandleExternalLink(url)
            console.log("url 1", url)
            // used url to render new tabs.
        })
        
        // webview1.addEventListener('new-window', (e, url) => {
        //     e.preventDefault();
        //     console.log(e.url);
        //     Shell.openExternal(e.url)
        // })

        // tabs reload code start
        jQuery('.icon-bar  span.etabs-tab-icon button.etabs-tab-button-refresh').click(function() {
            let webview = document.querySelector('webview.etabs-view.visible')
            let output = compareJustTravelSpaceUrl(webview.src);
            if(output) {
                webview.reload()
            }
        });

        // left tabs code start
        jQuery('.icon-bar  span.etabs-tab-icon button.etabs-tab-button-left').click(function() {
            let webview = document.querySelector('webview.etabs-view.visible')
            // webview.goBack()
            let output = compareJustTravelSpaceUrl(webview.src);
            if(output) {
                webview.goBack()
            }
        });
        // left tabs code end

        // right tabs code start
        jQuery('.icon-bar  span.etabs-tab-icon button.etabs-tab-button-right').click(function() {
            let webview = document.querySelector('webview.etabs-view.visible')
            // webview.goForward()
            let output = compareJustTravelSpaceUrl(webview.src);
            if(output) {
                webview.goForward()
            }
        });
        // right tabs code end
    }
}

async function externalApp(elem) {
    console.log('start elem desktop', elem);
    let response  = await checkUsersApp(elem) 
    console.log("response test", response)
    if(response) {
        // let myproj_selected = checkIfProjectSelected();
        if (document.getElementsByClassName('atgtimer')[0].innerText == "00:00:00") {
            const parser = new DOMParser();

    
            // launchExternalApp(elem);
            let timerContainer = document.getElementsByClassName('timer_alert_message')[0];
            // timerContainer.appendChild(parser.parseFromString(`<div class="start-task-alert"><div class="inner-start-task-alert"><a href="#" class="close-alert right-menu-alert"><i class="fa fa-close"></i></a><p><span><i class="fa fa-exclamation-triangle"></i></span>Do you want to continue without starting the timer?</p><div class='alert-button'><a href='' class="yes_btn">Yes</a><a href='' class="no_btn">No</a></div></div></div>`, 'text/html').firstChild);
            timerContainer.appendChild(parser.parseFromString(`<div class="start-task-alert"><div class="inner-start-task-alert"><a href="#" class="close-alert right-menu-alert"><i class="fa fa-close"></i></a><div class="inner-start-task-form"><div class="form-group"><label>Select Your Project</label><select class = "projects"><option>None</option></select></div><div class="form-group"><label>Select Your Task</label><select class ="tasks-sel"><option>None</option></select></div></div><div class='alert-button'><a href='' class="start_btn">Start</a></div></div></div>`, 'text/html').firstChild);
            
            if(timerContainer.innerHTML != null) {
                jQuery('.left-sidebar').on("keydown", function(e) {
                    if (e.keyCode == 9) {
                        e.preventDefault();
                        return false;
                    }
                })
            }
    
            var element = document.getElementsByClassName("left-sidebar")[0];
            element.classList.add("open-alert");
    
            jQuery('.right-content').on("keydown", function(e) {
                if (e.keyCode == 13) {
                    e.preventDefault();
                    return false;
                }
            })
    
            document.getElementsByClassName("right-menu-alert")[0].addEventListener('click', function (ev) {
                timerContainer.innerHTML = "";
    
                jQuery('.left-sidebar').unbind();
    
                var element = document.getElementsByClassName("left-sidebar")[0];
                element.classList.remove("open-alert");
                jQuery('.right-content').unbind();
            });
    
            if(addNewProject) {
                allProjectsTasks = list_prj; 
            }
            else {
                allProjectsTasks = sessions.get('Proj_tasks');
            }
            // let allProjectsTasks = sessions.get('Proj_tasks');
    
            var select = document.getElementsByClassName('projects')[0];
            for (var i = 0; i < allProjectsTasks.length; i++) {
                select.options[select.options.length] = new Option(allProjectsTasks[i].name, allProjectsTasks[i].id);
            }
    
            console.log('elem.href web--', elem.href)
            let splithref = elem.href.split("/");
            // console.log('allProjectsTasks---', allProjectsTasks);
            var lastName = splithref[splithref.length - 1]
            // console.log('allProjectsTasks---', allProjectsTasks);
            let singular_object = allProjectsTasks.find(o => o.url === lastName);
            let project_id = singular_object.id;
            let tasks_projects = singular_object.tasks;
            console.log('project_id---', project_id);
            console.log('singular_object---', singular_object);
            var tasks_dd = document.getElementsByClassName('tasks-sel')[0];
    
            for (var i = 0; i < tasks_projects.length; i++) {
                tasks_dd.options[tasks_dd.options.length] = new Option(tasks_projects[i].name, tasks_projects[i].id);
            }
            // $('.tasks-sel').select2();
    
            // $(document).ready(function() {
            // document.getElementsByClassName('tasks-sel')[0].select2();
            // });
    
            document.getElementsByClassName('projects')[0].value = project_id;
            document.getElementsByClassName('projects')[0].setAttribute("disabled", "disabled");
    
            document.getElementsByClassName("start_btn")[0].addEventListener('click', function (ev) {
    
                var element = document.getElementsByClassName("left-sidebar")[0];
                element.classList.remove("open-alert");
                jQuery('.right-content').unbind();
    
                ev.preventDefault();
                console.log("oelelelelel");
                console.log(document.getElementsByClassName('projects')[0]);
                let projectId = document.getElementsByClassName('projects')[0].value;
                console.log("oelelelelel");
                let tasks = document.getElementsByClassName("tasks-sel")[0].value;
                sessions.set("hrefweb", lastName)
    
                // appsUrl.href = lastName;
                // appsList.push(appsUrl);
                console.log("tasks---", tasks);
    
                sessions.set('task_id', tasks);
                sessions.set('sessionId', 0);
                console.log('task_id-----', tasks)
                if (tasks == null || tasks == "" || tasks == "None") {
                    alert("Task is not selected");
                    return;
    
                } else {
                    sessions.set('isTaskTimerRunning', "1");
                    let project_task_cache_desktop = {};
                    console.log('currentTask-------desktop---', tasks);
                    console.log('currentProject-------desktop---', project_id);
                    
                    project_task_cache_desktop.currentTask = btoa(tasks);
                    project_task_cache_desktop.currentProject = btoa(project_id);
                    console.log('project_task_cache-------desktop---', project_task_cache_desktop);
                    ipc.invoke('StartTimerOnMainPage').then(res => {
                        ipc.invoke('SetCacheValuesDesktop', project_task_cache_desktop).then(res => {
                            launchExternalApp(elem)
                        });
                    });
                }
                timerContainer.innerHTML = "";
    
            });
        

        } else {
            launchExternalApp(elem);
            // VerifyDesktopAppLinkWithDB(elem,0)
        }
    } else {
      launchExternalAppAdminAcess(elem);
    }

}
 
async function launchExternalAppAdminAcess(ev) {
    document.getElementById("login-alert").style.display = "none";
    requestCountDesktop = 0;
    closeDesktopApp = 0;
    isTimeLogStarted = true; 
    sessions.set('sessionId', 0);
    console.log('ev------desktop--- 0', ev);
    let appname = ev;

    let deskAppNameString = ev.href;
    let deskAppNameSplited = deskAppNameString.split("/");
    let deskAppName = deskAppNameSplited[deskAppNameSplited.length - 1];

    let projectId = ev.getAttribute('pd');
    console.log("projectId test", projectId)

    let appnameexe = "";
    console.log("appname_-----##", appname);
    if (process.platform == 'win32')
        appnameexe = appname + ".exe";


    // let response  = await checkUsersApp(appname)

    // if (!response) {
    //if App link is already 
    console.log("isAppAttached++++++++++");
    //This if detects is the click is from left Menu 
    const parser = new DOMParser();
    let adminPassContainer = document.getElementsByClassName('desktop_alert_message')[0];
    adminPassContainer.appendChild(parser.parseFromString(`<div class="start-task-alert start-task-form">
      <div class="inner-start-task-alert">
        <a href="#" class="close-alert right-menu-alert"><i class="fa fa-close"></i></a>
        <form class="add-password-form"  onsubmit="event.preventDefault()">
        <div class="msg" id="msg"></div>
          <div class="form-group">
            <h3>Contact IT Dept to link this App.</h3>
          </div>
          <div class="form-group">
            <input type="password" id="pass" class="form-control" placeholder="Password">
          </div>
          <div class="form-group alert-button">
            <input type="submit" class="enter_btn yes_btn" value="Enter">
          </div>
        </form>
      </div>
    </div>`, 'text/html').firstChild);

    // jQuery('.left-sidebar .menu-list').addClass("open-alert");
    
    document.getElementsByClassName("enter_btn")[0].addEventListener('click', function (event) {
        event.preventDefault();
        document.getElementById("msg").innerHTML = '<div class="alert alert-success alert-dismissible fade show">' +
            '<strong>Authenticating!</strong> Wait...' +
            '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
            '</div>';
        let passval = document.getElementById("pass").value;
        validateAdminPassword(passval).then(result => {
            if (result) {
                adminPassContainer.innerHTML = "";
                dialog.showOpenDialog({
                    filters: [
                        { name: 'exe', extensions: ['exe'] },
                    ], properties: ['openFile', 'multiSelections']

                }).then((data) => {
                    console.log("data.filePaths----->>>>", data);
                    console.log("data.filePathsv----->>>>", data.filePaths);
                    
                    var chcekLength = data.filePaths;
                    if(chcekLength.length > 0) {
                        // if(project_task_cache_desktop != 0) {

                             // save exepath in databse
                            let exe_path = data.filePaths;
                            let exepath = new String(exe_path).replace(/\\/g, "\\\\");
                            console.log("exepath----->>>>", exepath);

                            saveExe(appname, exepath).then(data => {
                                // desktopTracker.init();
                                if(initDesktopApp == 0) {
                                    desktopTracker.init();
                                    initDesktopApp = 1;
                                }
                            })

                            // start task
                            // ipc.invoke('StartTimerOnMainPage').then(res => {
                            //     ipc.invoke('SetCacheValuesDesktop', project_task_cache_desktop).then(res => {
                                //     // setTimeout(launchExternalApp(elem),1000);
                                        setTimeout(()=> {
                                            externalApp(ev);
                                        },1000) 
                            //     });
                            // });
                            // countDesktopAppsInc++;
                        // }

                    jQuery('.left-sidebar .menu-list').removeClass("open-alert");
                
                  }
                });

            } else {
                // alert("Password is incorrect");
                document.getElementById("msg").innerHTML = '<div class="alert alert-danger alert-dismissible fade show">' +
                    '<strong>Error! </strong>Password is incorrect.' +
                    '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
                    '</div>';
            }

        });
    })
    document.getElementsByClassName("right-menu-alert")[0].addEventListener('click', function (ev) {
        adminPassContainer.innerHTML = "";
        
        jQuery('.left-sidebar .menu-list').removeClass("open-alert");
    })
    //if App link is already end
//   }
}
async function launchExternalApp(ev) {
    document.getElementById("login-alert").style.display = "none";
    requestCountDesktop = 0;
    closeDesktopApp = 0;
    isTimeLogStarted = true; 
    sessions.set('sessionId', 0);
    console.log('ev------desktop--- 0', ev);
    let appname = ev;

    let deskAppNameString = ev.href;
    let deskAppNameSplited = deskAppNameString.split("/");
    let deskAppName = deskAppNameSplited[deskAppNameSplited.length - 1];

    let appnameexe = "";
    console.log("appname_-----##", appname);
    if (process.platform == 'win32')
        appnameexe = appname + ".exe";


    let response  = await checkUsersApp(appname)
    // .then((response) => {
        if (response) {

        console.log("lanchedDesktopApp before-------", lanchedDesktopApp);
        console.log("response----->>>>", response);
        console.log("DesktopTracker------>>>>>>>>>",DesktopTracker);

            if (DesktopTracker.isrunning) {
                
                console.log("DesktopTracker test 1 ---");
                console.log("DesktopTracker check 1");
                console.log("DesktopTracker if condition yes------>>>>>>>>>");
                if (!DesktopTracker.myStaticProperty.includes(appnameexe)) {
                    DesktopTracker.pushtoDesktopList(appnameexe);
                    // desktopTracker.init()
                }

                let window_name1 = response.split("\\");
                console.log("exerun1.window_name1-------", window_name1);
                let lastElement1 = window_name1[window_name1.length - 1];
                console.log("exerun1.lastElement1-------", lastElement1);
                
                if(lastElement1 == "midoco.exe") {
                    lastElement1 = "javaw.exe"
                }

                
                if (!desktopAppList.includes(deskAppName)) {
                    desktopAppList.push(deskAppName);
                    // multi_pid_apps[lastElement1] = deskAppName;
                }

                // remove microsoft apps if manually close apps like outlook, excel etc
                if(microsoftPackageApps.includes(lastElement1)) {
                    console.log("DesktopTracker test 2 ---");
                    var resultPid = findPidFromTaskManager(lastElement1)
                    console.log("resultPid----",resultPid)
                    resultPid.then(function (list) {
                        console.log(list);
                        console.log("list length--",list.length);
                        if(list.length < 1) {
                            lanchedDesktopApp.forEach((element, index, array) => {
                                var x = Object.keys(element);
                                if(x[0] == lastElement1) {
                                    lanchedDesktopApp.splice(index, 1);
                                }
                            });
                        }
                    });
                }

                var exists = lanchedDesktopApp.filter(function (desktopApp) {
                    return desktopApp.hasOwnProperty(lastElement1);
                  }).length > 0;
                  
                  if (exists) {
                    console.log("DesktopTracker test 3 ---");
                      console.log('exists', exists);

                          lanchedDesktopApp.forEach(desktopApp => {
                            for (let key in desktopApp) {
                                console.log(`${key}: ${desktopApp[key]}`);
                                if(key == lastElement1) {
                                    console.log("matched element")
                                    spawn("Powershell.exe",['-ExecutionPolicy', 'ByPass', " C:/Users/"+ systemName +"/Documents/tmp1/test.ps1 -name " + desktopApp[key]]);
                
                                }
                            }
                        });

                  } else {

                    console.log("DesktopTracker test 3 else ---");
                    // just for microsoft apps like ms word, excel, outlook
                    let window_name_opened_apps = response.split("\\");
                    let lastElementName = window_name_opened_apps[window_name_opened_apps.length - 1];
                    console.log("lastElementName---",lastElementName)
                    if(lastElementName == "midoco.exe") {
                        lastElementName = "javaw.exe"
                    }

                    // if micrsoft apps include in array then continue otherwise skip this function because promise delay
                    if(microsoftPackageApps.includes(lastElementName)) {
                        var resultPid = findPidFromTaskManager(lastElementName)
                        resultPid.then(function (list) {
                            console.log(list);
                            console.log("list--",list.length);
                            if(list.length > 0) {
                    console.log("DesktopTracker test 4 ---");

                                console.log("list.pid", list[0].pid)
                                lanchedDesktopApp.push({[lastElementName] : list[0].pid});
                                lanchedDesktopApp.forEach(desktopApp => {
                                    for (let key in desktopApp) {
                                        console.log(`${key}: ${desktopApp[key]}`);
                                        if(key == lastElement1) {
                                            console.log("matched element 1")
                                            spawn("Powershell.exe",['-ExecutionPolicy', 'ByPass', " C:/Users/"+ systemName +"/Documents/tmp1/test.ps1 -name " + desktopApp[key]]);
                                            
                                        }
                                    }
                                });
                        
                            } else {
                                console.log("DesktopTracker test 3 else ---");

                                console.log('does not exist');
                                exerun1 = undefined;
                                console.log("lanchedDesktopApp after-------", lanchedDesktopApp);
                                console.log("response after-------", response);
                                // just for midoco app
                                if(lastElement1 == "javaw.exe") {
                                    exerun1 = child.execFile(response, ["http://midoffice.midoco.net/midoco/blue.jnlp"], {shell: true}, function (err, data, std) {
                                        if (err) {
                                            throw err;
                                        } else {
                
                                        }
                                    });
                                } else {
                                    exerun1 = child.execFile(response, function (err, data, std) {
                                        if (err) {
                                            throw err;
                                        } else {
                
                                        }
                                    });
                                }
            
                                console.log("exerun1-------", exerun1);
            
                                let spawn_file = exerun1.spawnfile;
                                let window_name = spawn_file.split("\\");
                                let lastElement = window_name[window_name.length - 1];
                                console.log("exerun1.window_name-------", lastElement);
            
                                lanchedDesktopApp.push({[lastElement] : exerun1.pid});
                                console.log("lanchedDesktopApp-------", lanchedDesktopApp);
                                
                                console.log("exerun1.pid-------", exerun1.pid);
                                
                                exerun1.on('close', function (data) {
                                    let close_pid = exerun1.pid;
                                    let spawn_file = exerun1.spawnfile;
                                    let window_name = spawn_file.split("\\");
                                    console.log("window_name 1", window_name);
                                    desktopTracker.changePidStatus(window_name[window_name.length - 1], close_pid);
                                    console.log("desktopTracker");
                                    console.log(desktopTracker);
                                    // sessions.set('sessionId', 1);
                                    // for (const href1 in desktop_time_spent) {
                                    //     desktop_time_spent[href1].sessionId = 1;
                                    // }
            
                                    // for (var key in lanchedDesktopApp) {
                                    //     console.log("key-value------", key);
                                    //     if(key == lastElement) {
                                    //         delete lanchedDesktopApp[key];
                                    //     }
                                    // }
                                    lanchedDesktopApp.forEach((element, index, array) => {
                                        var x = Object.keys(element);
                                        if(x[0] == lastElement) {
                                            lanchedDesktopApp.splice(index, 1);
                                        }
                                    });
            
                                    // handle apps of generate multiple pids like microsoft team
                                    if(!multiplePidsApps.includes(lastElement)) {
                                    
                                        for (var i = 0; i < desktopAppList.length; i++) {
                                            if (desktopAppList[i] === deskAppName) {
                                                desktopAppList.splice(i, 1);
                                            }
                                        }
                                        ipc.invoke('ReadDesktopTrackedData3', {});
                                    }
            
                                    // ipc.invoke('ReadDesktopTrackedData3', {});
                                    // desktopTracker.comparePidswithTaskManager(window_name[window_name.length - 1], close_pid).then(pidNotExist =>{
                                    //     if(pidNotExist){
                                    //         console.log("pid does not exit 2---", pidNotExist)
                                    //             desktopTracker.closeTheDesktopTracking()
                                    //             DesktopTracker.isrunning = false;
                                    //             closeDesktopApp = 1;
                                    //             exerun1 = undefined;
                                    //             // sessions.set('sessionId', 1);
                                    //             ipc.invoke('ReadDesktopTrackedData3', {});
                                    //     }else{
                                    //       console.log("pidExist in task manager---",)
                                    //     }
                                    // })
                                });
                            }
                        }, function (err) {
                            console.log(err.stack || err);
                        });
                    } else {
                        console.log('does not exist');
                        exerun1 = undefined;
                        console.log("lanchedDesktopApp after-------", lanchedDesktopApp);
                        console.log("response after-------", response);
                        // just for midoco app
                        if(lastElement1 == "javaw.exe") {
                            exerun1 = child.execFile(response, ["http://midoffice.midoco.net/midoco/blue.jnlp"], {shell: true}, function (err, data, std) {
                                if (err) {
                                    throw err;
                                } else {
        
                                }
                            });
                        } else {
                            exerun1 = child.execFile(response, function (err, data, std) {
                                if (err) {
                                    throw err;
                                } else {
        
                                }
                            });
                        }
    
                        console.log("exerun1-------", exerun1);
    
                        let spawn_file = exerun1.spawnfile;
                        let window_name = spawn_file.split("\\");
                        let lastElement = window_name[window_name.length - 1];
                        console.log("exerun1.window_name-------", lastElement);
    
                        lanchedDesktopApp.push({[lastElement] : exerun1.pid});
                        console.log("lanchedDesktopApp-------", lanchedDesktopApp);
                        
                        console.log("exerun1.pid-------", exerun1.pid);
                        
                        exerun1.on('close', function (data) {
                            let close_pid = exerun1.pid;
                            let spawn_file = exerun1.spawnfile;
                            let window_name = spawn_file.split("\\");
                            console.log("window_name 1", window_name);
                            desktopTracker.changePidStatus(window_name[window_name.length - 1], close_pid);
                            console.log("desktopTracker");
                            console.log(desktopTracker);
                            // sessions.set('sessionId', 1);
                            // for (const href1 in desktop_time_spent) {
                            //     desktop_time_spent[href1].sessionId = 1;
                            // }
    
                            // for (var key in lanchedDesktopApp) {
                            //     console.log("key-value------", key);
                            //     if(key == lastElement) {
                            //         delete lanchedDesktopApp[key];
                            //     }
                            // }
                            lanchedDesktopApp.forEach((element, index, array) => {
                                var x = Object.keys(element);
                                if(x[0] == lastElement) {
                                    lanchedDesktopApp.splice(index, 1);
                                }
                            });
    
                            // handle apps of generated multiple pids like microsoft team
                            if(!multiplePidsApps.includes(lastElement)) {
                            
                                for (var i = 0; i < desktopAppList.length; i++) {
                                    if (desktopAppList[i] === deskAppName) {
                                        desktopAppList.splice(i, 1);
                                    }
                                }
                                ipc.invoke('ReadDesktopTrackedData3', {});
                            }
    
                            // ipc.invoke('ReadDesktopTrackedData3', {});
                            // desktopTracker.comparePidswithTaskManager(window_name[window_name.length - 1], close_pid).then(pidNotExist =>{
                            //     if(pidNotExist){
                            //         console.log("pid does not exit 2---", pidNotExist)
                            //             desktopTracker.closeTheDesktopTracking()
                            //             DesktopTracker.isrunning = false;
                            //             closeDesktopApp = 1;
                            //             exerun1 = undefined;
                            //             // sessions.set('sessionId', 1);
                            //             ipc.invoke('ReadDesktopTrackedData3', {});
                            //     }else{
                            //       console.log("pidExist in task manager---",)
                            //     }
                            // })
                        });
                    }
                }
            }

            else {
                console.log("DesktopTracker test 1 else ---");
                console.log("DesktopTracker check 2");
                console.log("DesktopTracker if condition no------>>>>>>>>>");
                DesktopTracker.pushtoDesktopList(appnameexe);
                // desktopTracker.init()
                if(initDesktopApp == 0) {
                    desktopTracker.init();
                    initDesktopApp = 1;
                }

                let window_name2 = response.split("\\");
                console.log("exerun1.window_name1-------", window_name2);
                let lastElement2 = window_name2[window_name2.length - 1];
                console.log("exerun1.lastElement1-------", lastElement2);

                
                if(lastElement2 == "midoco.exe") {
                    lastElement2 = "javaw.exe"
                }

                if (!desktopAppList.includes(deskAppName)) {
                    desktopAppList.push(deskAppName);
                    // multi_pid_apps[lastElement2] = deskAppName;
                }

                var exists = lanchedDesktopApp.filter(function (desktopApp) {
                    return desktopApp.hasOwnProperty(lastElement2);
                  }).length > 0;
                  
                  if (exists) {
                      console.log('exists', exists);

                          lanchedDesktopApp.forEach(desktopApp => {
                            for (let key in desktopApp) {
                                console.log(`${key}: ${desktopApp[key]}`);
                                if(key == lastElement2) {
                                    console.log("matched element")

                                    spawn("Powershell.exe",['-ExecutionPolicy', 'ByPass', " C:/Users/"+ systemName +"/Documents/tmp1/test.ps1 -name " + desktopApp[key]]);
                                    
                                }
                            }
                        });

                  } else {
                    console.log('does not exist');
                    exerun2 = undefined;
                    // just for midoco app
                    if(lastElement2 == "javaw.exe") {
                        exerun2 = child.execFile(response, ["http://midoffice.midoco.net/midoco/blue.jnlp"], {shell: true}, function (err, data, std) {
                            if (err) {
                                throw err;
                            } else {
    
                            }
                        });
                    } else {
                        exerun2 = child.execFile(response, function (err, data, std) {
                            if (err) {
                                throw err;
                            } else {

                            }

                        });
                    }

                    console.log("exerun2-------", exerun2);

                    let spawn_file2 = exerun2.spawnfile;
                    let window_name2 = spawn_file2.split("\\");
                    let lastElement2 = window_name2[window_name2.length - 1];
                    console.log("exerun2.window_name-------", lastElement2);

                    lanchedDesktopApp.push({[lastElement2] : exerun2.pid});
                    console.log("lanchedDesktopApp-------", lanchedDesktopApp);

                    exerun2.on('close', function (data) {
                        let close_pid = exerun2.pid;
                        let spawn_file = exerun2.spawnfile;
                        console.log("spawn_file 2", spawn_file);
                        let window_name = spawn_file.split("\\");
                        console.log("window_name 2", window_name);
                        desktopTracker.changePidStatus(window_name[window_name.length - 1], close_pid);
                        console.log("desktopTracker");
                        console.log(desktopTracker);
                        // sessions.set('sessionId', 1);
                        // for (const href1 in desktop_time_spent) {
                        //     desktop_time_spent[href1].sessionId = 1;
                        // }

                        lanchedDesktopApp.forEach((element, index, array) => {
                            var x = Object.keys(element);
                            if(x[0] == lastElement2) {
                                lanchedDesktopApp.splice(index, 1);
                            }
                        });

                       // handle apps of generate multiple pids like microsoft team
                       if(!multiplePidsApps.includes(lastElement2)) {
                            for (var i = 0; i < desktopAppList.length; i++) {
                                if (desktopAppList[i] === deskAppName) {
                                    desktopAppList.splice(i, 1);
                                }
                            }
                            ipc.invoke('ReadDesktopTrackedData3', {});
                        }

                        // for (const [key, value] of Object.entries(complete_data_track)) {
                        //     if(complete_data_track[key].windowName );
                        //     delete complete_data_track[key];
                        // }

                        // ipc.invoke('ReadDesktopTrackedData3', {});
                        // desktopTracker.comparePidswithTaskManager(window_name[window_name.length - 1], close_pid).then(pidNotExist =>{
                        //     if(pidNotExist){
                        //         console.log("pid does not exist 1---", pidNotExist)
                        //         // if(pidNotExist && !(DesktopTracker.isrunning)) {
                        //             desktopTracker.closeTheDesktopTracking()
                        //             DesktopTracker.isrunning = false;
                        //             closeDesktopApp = 1;
                        //             exerun2 = undefined;
                        //             // sessions.set('sessionId', 1);
                        //             ipc.invoke('ReadDesktopTrackedData3', {});
                        //         // }
                        //     }else{
                        //       console.log("pidExist in task manager---",)
                        //     }
                        // })
                    });
                }

            }
            
            //if App Link is not attatched

        } 

}

async function externalAppFloatingMenu(elem) {
    console.log("elem____",elem);
    let appname = elem[0];
    let response  = await checkUsersAppFloatingMenu(appname) 
    console.log("response test", response)
    if(response) {
        // let myproj_selected = checkIfProjectSelected();
        if (document.getElementsByClassName('atgtimer')[0].innerText == "00:00:00") {
            const parser = new DOMParser();

            let timerContainer = document.getElementsByClassName('timer_alert_message')[0];
            // timerContainer.appendChild(parser.parseFromString(`<div class="start-task-alert"><div class="inner-start-task-alert"><a href="#" class="close-alert right-menu-alert"><i class="fa fa-close"></i></a><p><span><i class="fa fa-exclamation-triangle"></i></span>Do you want to continue without starting the timer?</p><div class='alert-button'><a href='' class="yes_btn">Yes</a><a href='' class="no_btn">No</a></div></div></div>`, 'text/html').firstChild);
            timerContainer.appendChild(parser.parseFromString(`<div class="start-task-alert"><div class="inner-start-task-alert"><a href="#" class="close-alert right-menu-alert"><i class="fa fa-close"></i></a><div class="inner-start-task-form"><div class="form-group"><label>Select Your Project</label><select class = "projects"><option>None</option></select></div><div class="form-group"><label>Select Your Task</label><select class ="tasks-sel"><option>None</option></select></div></div><div class='alert-button'><a href='' class="start_btn">Start</a></div></div></div>`, 'text/html').firstChild);
            
            if(timerContainer.innerHTML != null) {
                jQuery('.left-sidebar').on("keydown", function(e) {
                    if (e.keyCode == 9) {
                        e.preventDefault();
                        return false;
                    }
                })
            }

            var element = document.getElementsByClassName("left-sidebar")[0];
            element.classList.add("open-alert");

            jQuery('.right-content').on("keydown", function(e) {
                if (e.keyCode == 13) {
                    e.preventDefault();
                    return false;
                }
            })

            document.getElementsByClassName("right-menu-alert")[0].addEventListener('click', function (ev) {
                timerContainer.innerHTML = "";
    
                jQuery('.left-sidebar').unbind();

                var element = document.getElementsByClassName("left-sidebar")[0];
                element.classList.remove("open-alert");
                jQuery('.right-content').unbind();
            });
        
            if(addNewProject) {
                allProjectsTasks = list_prj; 
            }
            else {
                allProjectsTasks = sessions.get('Proj_tasks');
            }

            // let allProjectsTasks = sessions.get('Proj_tasks');

            var select = document.getElementsByClassName('projects')[0];
            for (var i = 0; i < allProjectsTasks.length; i++) {
                select.options[select.options.length] = new Option(allProjectsTasks[i].name, allProjectsTasks[i].id);
            }

            console.log('elem.href web--', elem[0].href)
            let splithref = elem[0].href.split("/");
            let pd = elem[0].pd;
            console.log("pd----", pd);
            console.log('allProjectsTasks---', allProjectsTasks);
            var lastName = splithref[splithref.length - 1]
            console.log('allProjectsTasks---', allProjectsTasks);
            // let singular_object = allProjectsTasks.find(o => o.url === lastName);
            let singular_object = allProjectsTasks.find(o => o.url === lastName);
            // let project_id = singular_object.id;
            let project_id = pd;
            let tasks_projects = singular_object.tasks;
            console.log('project_id---', project_id);
            console.log('singular_object---', singular_object);
            var tasks_dd = document.getElementsByClassName('tasks-sel')[0];

            for (var i = 0; i < tasks_projects.length; i++) {
                tasks_dd.options[tasks_dd.options.length] = new Option(tasks_projects[i].name, tasks_projects[i].id);
            }
            // $('.tasks-sel').select2();

            // $(document).ready(function() {
            // document.getElementsByClassName('tasks-sel')[0].select2();
            // });

            document.getElementsByClassName('projects')[0].value = project_id;
            document.getElementsByClassName('projects')[0].setAttribute("disabled", "disabled");

            document.getElementsByClassName("start_btn")[0].addEventListener('click', function (ev) {

                var element = document.getElementsByClassName("left-sidebar")[0];
                element.classList.remove("open-alert");
                jQuery('.right-content').unbind();

                ev.preventDefault();
                console.log("oelelelelel");
                console.log(document.getElementsByClassName('projects')[0]);
                let projectId = document.getElementsByClassName('projects')[0].value;
                console.log("oelelelelel");
                let tasks = document.getElementsByClassName("tasks-sel")[0].value;
                sessions.set("hrefweb", lastName)

                // appsUrl.href = lastName;
                // appsList.push(appsUrl);
                console.log("tasks---", tasks);

                sessions.set('task_id', tasks);
                sessions.set('sessionId', 0);
                console.log('task_id-----', tasks)
                if (tasks == null || tasks == "" || tasks == "None") {
                    alert("Task is not selected");
                    return;

                } else {
                    sessions.set('isTaskTimerRunning', "1");
                    let project_task_cache_desktop = {};
                    console.log('currentTask-------desktop---', tasks);
                    console.log('currentProject-------desktop---', project_id);
                    
                    project_task_cache_desktop.currentTask = btoa(tasks);
                    project_task_cache_desktop.currentProject = btoa(project_id);
                    console.log('project_task_cache-------desktop---', project_task_cache_desktop);

                    // VerifyDesktopAppLinkWithDBFloatingMenu(elem,project_task_cache_desktop)
                    ipc.invoke('StartTimerOnMainPage').then(res => {
                        ipc.invoke('SetCacheValuesDesktop', project_task_cache_desktop).then(res => {
                            // setTimeout(launchExternalApp(elem),1000);
                            launchExternalAppFloatingMenu(elem);
                        });

                    });


                }
                timerContainer.innerHTML = "";

            });

        } else {
            launchExternalAppFloatingMenu(elem);
            // VerifyDesktopAppLinkWithDBFloatingMenu(elem,0)
        }
    } else {
        launchExternalAppAdminAcessFloatingMenu(elem);
    }

}

async function launchExternalAppAdminAcessFloatingMenu(ev) {
    document.getElementById("login-alert").style.display = "none";

    console.log("ev---- floating", ev)
    requestCountDesktop = 0;
    closeDesktopApp = 0;
    isTimeLogStarted = true; 
    sessions.set('sessionId', 0);
    console.log('ev------desktop--- 1', ev[0]);
    let appname = ev[0];

    let deskAppNameString1 = ev[0].href;
    let deskAppNameSplited1 = deskAppNameString1.split("/");
    let deskAppName1 = deskAppNameSplited1[deskAppNameSplited1.length - 1];

    let appnameexe = "";
    if (process.platform == 'win32')
        appnameexe = appname + ".exe";
            
            //if App link is already 
            console.log("isAppAttached++++++++++");
            //This if detects is the click is from left Menu 
            const parser = new DOMParser();
            let adminPassContainer = document.getElementsByClassName('desktop_alert_message')[0];
            adminPassContainer.appendChild(parser.parseFromString(`<div class="start-task-alert start-task-form">
                <div class="inner-start-task-alert">
                <a href="#" class="close-alert right-menu-alert"><i class="fa fa-close"></i></a>
                <form class="add-password-form"  onsubmit="event.preventDefault()">
                <div class="msg" id="msg"></div>
                    <div class="form-group">
                    <h3>Contact IT Dept to link this App.</h3>
                    </div>
                    <div class="form-group">
                    <input type="password" id="pass" class="form-control" placeholder="Password">
                    </div>
                    <div class="form-group alert-button">
                    <input type="submit" class="enter_btn yes_btn" value="Enter">
                    </div>
                </form>
                </div>
            </div>`, 'text/html').firstChild);

            // jQuery('.left-sidebar .menu-list').addClass("open-alert");

        //   adminPassContainer.appendChild(parser.parseFromString(`<div class="start-task-alert"><div class="inner-start-task-alert"><a href="#" class="close-alert right-menu-alert"><i class="fa fa-close"></i></a><div class="inner-start-task-form"><div class="form-group"><label>Select Your Project</label><select class = "projects"><option>None</option></select></div><div class="form-group"><label>Select Your Task</label><select class ="tasks-sel"><option>None</option></select></div></div><div class='alert-button'><a href='' class="start_btn">Start</a></div></div></div>`, 'text/html').firstChild
        //   , parser.parseFromString(`<div class="start-task-alert start-task-form">
        //   <div class="inner-start-task-alert">
        //     <a href="#" class="close-alert right-menu-alert"><i class="fa fa-close"></i></a>
        //     <form class="add-password-form"  onsubmit="event.preventDefault()">
        //     <div class="msg" id="msg"></div>
        //       <div class="form-group">
        //         <h3>Enter password or contact IT department</h3>
        //       </div>
        //       <div class="form-group">
        //         <input type="password" id="pass" class="form-control" placeholder="password">
        //       </div>
        //       <div class="form-group alert-button">
        //         <input type="submit" class="enter_btn yes_btn" value="Enter">
        //       </div>
        //     </form>
        //   </div>
        // </div>`, 'text/html').lastChild);
            document.getElementsByClassName("enter_btn")[0].addEventListener('click', function (event) {
                event.preventDefault();
                document.getElementById("msg").innerHTML = '<div class="alert alert-success alert-dismissible fade show">' +
                    '<strong>Authenticating!</strong> Wait...' +
                    '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
                    '</div>';
                let passval = document.getElementById("pass").value;
                validateAdminPassword(passval).then(result => {
                    if (result) {
                        adminPassContainer.innerHTML = "";
                        dialog.showOpenDialog({
                            filters: [
                                { name: 'exe', extensions: ['exe'] },
                            ], properties: ['openFile', 'multiSelections']

                        }).then((data) => {
                            console.log("data.filePaths----->>>>", data.filePaths);
                            var chcekLength = data.filePaths;
                            if(chcekLength.length > 0) {
                                // if(project_task_cache_desktop != 0) {

                                    // save exepath in databse
                                    let exe_path = data.filePaths;
                                    let exepath = new String(exe_path).replace(/\\/g, "\\\\");
                                    console.log("exepath----->>>>", exepath);
        
                                    saveExeFloating(appname, exepath).then(data => {
                                        // desktopTracker.init();
                                        if(initDesktopApp == 0) {
                                            desktopTracker.init();
                                            initDesktopApp = 1;
                                        }
                                    })
                                    
                                    // start task
                                    // ipc.invoke('StartTimerOnMainPage').then(res => {
                                    //     ipc.invoke('SetCacheValuesDesktop', project_task_cache_desktop).then(res => {
                                            // setTimeout(launchExternalApp(elem),1000);
                                            setTimeout(()=> {
                                                externalAppFloatingMenu(ev);
                                            },1000) 
                                    //     });
                                    // });
                                    // countDesktopAppsInc++;
                                // }

                            $('.left-sidebar .menu-list').removeClass("open-alert");
                          }
                        });

                    } else {
                        // alert("Password is incorrect");
                        document.getElementById("msg").innerHTML = '<div class="alert alert-danger alert-dismissible fade show">' +
                            '<strong>Error! </strong>Password is incorrect.' +
                            '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
                            '</div>';
                    }

                });
            })
            document.getElementsByClassName("right-menu-alert")[0].addEventListener('click', function (ev) {
                adminPassContainer.innerHTML = "";

                jQuery('.left-sidebar .menu-list').removeClass("open-alert");
            })
            //if App link is already end
        

    // }).catch(err => {
    //     console.log(err)

    // });

}

async function launchExternalAppFloatingMenu(ev) {
    document.getElementById("login-alert").style.display = "none";

    console.log("ev---- floating", ev)
    requestCountDesktop = 0;
    closeDesktopApp = 0;
    isTimeLogStarted = true; 
    sessions.set('sessionId', 0);
    console.log('ev------desktop--- 1', ev[0]);
    let appname = ev[0];

    let deskAppNameString1 = ev[0].href;
    let deskAppNameSplited1 = deskAppNameString1.split("/");
    let deskAppName1 = deskAppNameSplited1[deskAppNameSplited1.length - 1];

    let appnameexe = "";
    if (process.platform == 'win32')
        appnameexe = appname + ".exe";

    let response  = await checkUsersAppFloatingMenu(appname)
    // .then((response) => {
        if (response) {

            console.log("response----->>>>", response);
            console.log("DesktopTracker------>>>>>>>>>",DesktopTracker);
            if (DesktopTracker.isrunning) {
                console.log("DesktopTracker if condition yes------>>>>>>>>>");
                if (!DesktopTracker.myStaticProperty.includes(appnameexe)) {
                    DesktopTracker.pushtoDesktopList(appnameexe);
                    // desktopTracker.init()
                }

                let window_name4 = response.split("\\");
                console.log("exerun1.window_name1-------", window_name4);
                let lastElement4 = window_name4[window_name4.length - 1];
                console.log("exerun1.lastElement1-------", lastElement4);
                
                if(lastElement4 == "midoco.exe") {
                    lastElement4 = "javaw.exe"
                }
                
                if (!desktopAppList.includes(deskAppName1)) {
                    desktopAppList.push(deskAppName1);
                    // multi_pid_apps[lastElement4] = deskAppName1;
                }

                // remove microsoft apps if manually close apps like outlook, excel etc
                if(microsoftPackageApps.includes(lastElement4)) {
                    var resultPid = findPidFromTaskManager(lastElement4)
                    resultPid.then(function (list) {
                        console.log(list);
                        console.log("list length--",list.length);
                        if(list.length < 1) {
                            lanchedDesktopApp.forEach((element, index, array) => {
                                var x = Object.keys(element);
                                if(x[0] == lastElement4) {
                                    lanchedDesktopApp.splice(index, 1);
                                }
                            });
                        }
                    });
                }

                var exists = lanchedDesktopApp.filter(function (desktopApp) {
                    return desktopApp.hasOwnProperty(lastElement4);
                  }).length > 0;
                  
                  if (exists) {
                      console.log('exists', exists);

                          lanchedDesktopApp.forEach(desktopApp => {
                            for (let key in desktopApp) {
                                console.log(`${key}: ${desktopApp[key]}`);
                                if(key == lastElement4) {
                                    console.log("matched element")

                                    // if (!desktopAppList.includes(deskAppName1)) {
                                    //     desktopAppList.push(deskAppName1);
                                    // }

                                    spawn("Powershell.exe",['-ExecutionPolicy', 'ByPass', " C:/Users/"+ systemName +"/Documents/tmp1/test.ps1 -name " + desktopApp[key]]);

                                    // callfunction(desktopApp[key])
                                    
                                }
                            }
                        });

                  }  else {

                    // just for microsoft apps like ms word, excel, outlook
                    let window_name_opened_apps = response.split("\\");
                    let lastElementName = window_name_opened_apps[window_name_opened_apps.length - 1];
                    console.log("lastElementName---",lastElementName)
                        
                    if(lastElementName == "midoco.exe") {
                        lastElementName = "javaw.exe"
                    }

                    // if micrsoft apps include in array then continue otherwise skip this function because promise delay
                    if(microsoftPackageApps.includes(lastElementName)) {
                        var resultPid = findPidFromTaskManager(lastElementName)
                        resultPid.then(function (list) {
                            console.log(list);
                            console.log("list--",list.length);
                            if(list.length > 0) {
                                console.log("list.pid", list[0].pid)
                                lanchedDesktopApp.push({[lastElementName] : list[0].pid});
                                lanchedDesktopApp.forEach(desktopApp => {
                                    for (let key in desktopApp) {
                                        console.log(`${key}: ${desktopApp[key]}`);
                                        if(key == lastElement4) {
                                            console.log("matched element 1")
                                            spawn("Powershell.exe",['-ExecutionPolicy', 'ByPass', " C:/Users/"+ systemName +"/Documents/tmp1/test.ps1 -name " + desktopApp[key]]);
                                            
                                        }
                                    }
                                });
                        
                            } else {
                                console.log('does not exist');
                                exerun4 = undefined;
                                // just for midoco app
                                if(lastElement4 == "javaw.exe") {
                                    exerun4 = child.execFile(response, ["http://midoffice.midoco.net/midoco/blue.jnlp"], {shell: true}, function (err, data, std) {
                                        if (err) {
                                            throw err;
                                        } else {
                
                                        }
                                    });
                                } else {
                                    exerun4 = child.execFile(response, function (err, data, std) {
                                        if (err) {
                                            throw err;
                                        } else {
                
                                        }
                                    });
                                }
            
                                let spawn_file4 = exerun4.spawnfile;
                                let window_name4 = spawn_file4.split("\\");
                                let lastElement4 = window_name4[window_name4.length - 1];
                                console.log("exerun4.window_name-------", lastElement4);
                
                                lanchedDesktopApp.push({[lastElement4] : exerun4.pid});
                                console.log("lanchedDesktopApp-------", lanchedDesktopApp);
                                exerun4.on('close', function (data) {
                                    let close_pid = exerun4.pid;
                                    let spawn_file = exerun4.spawnfile;
                                    let window_name = spawn_file.split("\\");
                                    desktopTracker.changePidStatus(window_name[window_name.length - 1], close_pid);
                                    console.log("desktopTracker");
                                    console.log(desktopTracker);
                                    // sessions.set('sessionId', 1);
                                    // for (const href1 in desktop_time_spent) {
                                    //     desktop_time_spent[href1].sessionId = 1;
                                    // }
            
                                    // for (var i = 0; i < desktopAppList.length; i++) {
                                    //     if (desktopAppList[i] === deskAppName1) {
                                    //         desktopAppList.splice(i, 1);
                                    //     }
                                    // }
            
                                    lanchedDesktopApp.forEach((element, index, array) => {
                                        var x = Object.keys(element);
                                        if(x[0] == lastElement4) {
                                            lanchedDesktopApp.splice(index, 1);
                                        }
                                    }); 
            
                                   // handle apps of generate multiple pids like microsoft team
                                   if(!multiplePidsApps.includes(lastElement4)) {
                                        for (var i = 0; i < desktopAppList.length; i++) {
                                            if (desktopAppList[i] === deskAppName1) {
                                                desktopAppList.splice(i, 1);
                                            }
                                        }
                                        ipc.invoke('ReadDesktopTrackedData3', {});
                                    }
                                    // desktopTracker.comparePidswithTaskManager(window_name[window_name.length - 1], close_pid).then(pidNotExist =>{
                                    //     if(pidNotExist){
                                    //         console.log("pid does not exit 2---", pidNotExist)
                                    //             desktopTracker.closeTheDesktopTracking()
                                    //             DesktopTracker.isrunning = false;
                                    //             closeDesktopApp = 1;
                                    //             exerun4 = undefined;
                                    //             // sessions.set('sessionId', 1);
                                    //             ipc.invoke('ReadDesktopTrackedData3', {});
                                    //     }else{
                                    //         console.log("pidExist in task manager---",)
                                    //     }
                                    // })
                                });
                            }
                        }, function (err) {
                            console.log(err.stack || err);
                        });
                    }  else {
                        console.log('does not exist');

                        let window_name_m = response.split("\\");
                        console.log("exerun1.window_name_m-------", window_name_m);
                        let lastElement_m = window_name_m[window_name_m.length - 1];
                        console.log("exerun1.lastElement1-------", lastElement_m);

                        
                        if(lastElement_m == "midoco.exe") {
                            lastElement_m = "javaw.exe"
                        }

                        exerun4 = undefined;
                        // just for midoco app
                        if(lastElement_m == "javaw.exe") {
                            exerun4 = child.execFile(response, ["http://midoffice.midoco.net/midoco/blue.jnlp"], {shell: true}, function (err, data, std) {
                                if (err) {
                                    throw err;
                                } else {
        
                                }
                            });
                        } else {
                            exerun4 = child.execFile(response, function (err, data, std) {
                                if (err) {
                                    throw err;
                                } else {
        
                                }
                            });
                        }
    
                        let spawn_file4 = exerun4.spawnfile;
                        let window_name4 = spawn_file4.split("\\");
                        let lastElement4 = window_name4[window_name4.length - 1];
                        console.log("exerun4.window_name-------", lastElement4);
        
                        lanchedDesktopApp.push({[lastElement4] : exerun4.pid});
                        console.log("lanchedDesktopApp-------", lanchedDesktopApp);
                        exerun4.on('close', function (data) {
                            let close_pid = exerun4.pid;
                            let spawn_file = exerun4.spawnfile;
                            let window_name = spawn_file.split("\\");
                            desktopTracker.changePidStatus(window_name[window_name.length - 1], close_pid);
                            console.log("desktopTracker");
                            console.log(desktopTracker);
                            // sessions.set('sessionId', 1);
                            // for (const href1 in desktop_time_spent) {
                            //     desktop_time_spent[href1].sessionId = 1;
                            // }
    
                            // for (var i = 0; i < desktopAppList.length; i++) {
                            //     if (desktopAppList[i] === deskAppName1) {
                            //         desktopAppList.splice(i, 1);
                            //     }
                            // }
    
                            lanchedDesktopApp.forEach((element, index, array) => {
                                var x = Object.keys(element);
                                if(x[0] == lastElement4) {
                                    lanchedDesktopApp.splice(index, 1);
                                }
                            }); 
    
                           // handle apps of generate multiple pids like microsoft team
                           if(!multiplePidsApps.includes(lastElement4)) {
                                for (var i = 0; i < desktopAppList.length; i++) {
                                    if (desktopAppList[i] === deskAppName1) {
                                        desktopAppList.splice(i, 1);
                                    }
                                }
                                ipc.invoke('ReadDesktopTrackedData3', {});
                            }
                        
                        });
                    }
                }
            }

            else {
                console.log("DesktopTracker if condition no------>>>>>>>>>");
                DesktopTracker.pushtoDesktopList(appnameexe);
                // desktopTracker.init()
                if(initDesktopApp == 0) {
                    desktopTracker.init();
                    initDesktopApp = 1;
                }

                let window_name5 = response.split("\\");
                console.log("exerun1.window_name1-------", window_name5);
                let lastElement5 = window_name5[window_name5.length - 1];
                console.log("exerun1.lastElement1-------", lastElement5);
                
                if(lastElement5 == "midoco.exe") {
                    lastElement5 = "javaw.exe"
                }

                if (!desktopAppList.includes(deskAppName1)) {
                    desktopAppList.push(deskAppName1);
                    // multi_pid_apps[lastElement5] = deskAppName1;
                }

                var exists = lanchedDesktopApp.filter(function (desktopApp) {
                    return desktopApp.hasOwnProperty(lastElement5);
                  }).length > 0;
                  
                  if (exists) {
                      console.log('exists', exists);

                          lanchedDesktopApp.forEach(desktopApp => {
                            for (let key in desktopApp) {
                                console.log(`${key}: ${desktopApp[key]}`);
                                if(key == lastElement5) {
                                    console.log("matched element")

                                    spawn("Powershell.exe",['-ExecutionPolicy', 'ByPass', " C:/Users/"+ systemName +"/Documents/tmp1/test.ps1 -name " + desktopApp[key]]);

                                // callfunction(desktopApp[key])
                                    
                                }
                            }
                        });

                  } else {
                      console.log('does not exist');
                    exerun5 = undefined;
                    // just for midoco app
                    if(lastElement5 == "javaw.exe") {
                        exerun5 = child.execFile(response, ["http://midoffice.midoco.net/midoco/blue.jnlp"], {shell: true}, function (err, data, std) {
                            if (err) {
                                throw err;
                            } else {
    
                            }
                        });
                    } else {
                        exerun5 = child.execFile(response, function (err, data, std) {
                            if (err) {
                                throw err;
                            } else {
    
                            }
    
                        });
                    }

                    let spawn_file5 = exerun5.spawnfile;
                    let window_name5 = spawn_file5.split("\\");
                    let lastElement5 = window_name5[window_name5.length - 1];
                    console.log("exerun2.window_name-------", lastElement5);
    
                    lanchedDesktopApp.push({[lastElement5] : exerun5.pid});
                    console.log("lanchedDesktopApp-------", lanchedDesktopApp);
    
                    exerun5 = undefined;
                    exerun5.on('close', function (data) {
                        let close_pid = exerun5.pid;
                        let spawn_file = exerun5.spawnfile;
                        let window_name = spawn_file.split("\\");
                        desktopTracker.changePidStatus(window_name[window_name.length - 1], close_pid);
                        console.log("desktopTracker");
                        console.log(desktopTracker);
                        // sessions.set('sessionId', 1);
                        // for (const href1 in desktop_time_spent) {
                        //     desktop_time_spent[href1].sessionId = 1;
                        // }

                        lanchedDesktopApp.forEach((element, index, array) => {
                            var x = Object.keys(element);
                            if(x[0] == lastElement5) {
                                lanchedDesktopApp.splice(index, 1);
                            }
                        });
                        
                       // handle apps of generate multiple pids like microsoft team
                       if(!multiplePidsApps.includes(lastElement5)) {
                            for (var i = 0; i < desktopAppList.length; i++) {
                                if (desktopAppList[i] === deskAppName1) {
                                    desktopAppList.splice(i, 1);
                                }
                            }
                            ipc.invoke('ReadDesktopTrackedData3', {});
                        }
                    });
                }

            }
            
            //if App Link is not attatched

        }


    // }).catch(err => {
    //     console.log(err)

    // });

}

function caneclTaskDialog() {
    minimizeDashboard = 1;
    let timerContainer = document.getElementsByClassName('timer_alert_message')[0];
    timerContainer.innerHTML = "";

    let adminPassContainer = document.getElementsByClassName('desktop_alert_message')[0];
    adminPassContainer.innerHTML = "";

    var element = document.getElementsByClassName("left-sidebar")[0];
    element.classList.remove("open-alert");
}


function logout() {
    clickedLogout = 1;
    var taskTimer = checkIsTaskRuning()
    if(taskTimer == true) {
         
        let logoutContainer = document.getElementsByClassName('logout-alert-message')[0];
        var parser = new DOMParser();
        logoutContainer.appendChild(parser.parseFromString(` <div class="start-task-alert">
            <div class="inner-start-task-alert">
                <a href="#" onclick="logoutModalCancel()" class="close-alert right-menu-alert">
                <i class="fa fa-close"></i>
                </a>
                <div class="inner-start-task-form">
                    <div class="form-group">
                        <label>Are you sure to logout</label>
                    </div>
                </div>
                <button class="alert-button logoutButton" onclick="logoutModal()">Yes</button>  
                <button class="alert-button logoutButton" onclick="logoutModalCancel()">No</button>
            </div>
        </div>`, 'text/html').firstChild);
        
        var element = document.getElementsByClassName("left-sidebar")[0];
        element.classList.add("open-alert");
    }
}

function SubmitAnError() {
    document.getElementsByClassName("errorBlock")[0].style.display = "block";
}

function SubmitAnErrorCancel() {
    document.getElementsByClassName("errorBlock")[0].style.display = "none";
}

// Report an error in db
document.getElementsByClassName("submitErrorBtn")[0].addEventListener("click", function() {
    let errorTitle = document.getElementsByClassName("errorTitle")[0].value;
    let errorDescription = document.getElementsByClassName("errorDescription")[0].value;
    console.log("errorTitle---",errorTitle);
    console.log("errorDescription---",errorDescription);

    if((errorTitle == null || errorTitle == "" || errorTitle == "None") && (errorDescription == null || errorDescription == "" || errorDescription == "None" || hasBlankSpaces(errorDescription) || errorDescription.length < 2)) {
        // document.getElementsByClassName("errorBlock")[0].style.display = "none";
        return false;
    } else {
        let userID = atob(sessions.get('userStaffID'));
        const params = new URLSearchParams();
        params.append("errorTitle",errorTitle)
        params.append("errorDescription",errorDescription)
        params.append("mac_address",macAdress)
        params.append("user_id",userID)

        const agent = new https.Agent({
            rejectUnauthorized: false
        });
        axios.defaults.headers.post['Content-Type'] = 'application/json';
        axios.post('https://crm.atgtravel.com/admin/api/atg_three_sixty/submit_an_error/', params, { httpsAgent: agent })

        document.getElementsByClassName("errorBlock")[0].style.display = "none";
        
        document.getElementsByClassName("errorTitle")[0].value  = '';
        document.getElementsByClassName("errorDescription")[0].value = '';
    }
})

function checkIsTaskRuning() {
    if (document.getElementsByClassName('atgtimer')[0].innerText == "00:00:00") {
        return true;
    } else {
        ipc.invoke('isTaskRunningLogout');

        // sessions.set('tCloseEW', '0');

        // sessions.set('sessionId', 1);
        // setTimeout(() => {
        //   open_task_window();
    
        // }, 300);
        open_task_window();
    }
}
function logoutModal() {
    console.log("logout----->>>");
    sessions.delete("userEMail");
    sessions.delete("isLoggedIn");
    sessions.delete("userPass");
    sessions.delete("userFirstname");
    sessions.delete("userLastname");
    sessions.delete("userStaffID");
    sessions.delete("isTaskTimerRunning");
    logintimer.stopCurrenttimer();
    atgTasktimer.stopCurrenttimer();
    ipc.invoke('logoutmainpage');
}

function logoutModalCancel() {
    console.log("logout----->>>");
    const parser = new DOMParser();
    let logoutContainer = document.getElementsByClassName('logout-alert-message')[0];
    logoutContainer.innerHTML = "";

    var element = document.getElementsByClassName("left-sidebar")[0];
    element.classList.remove("open-alert");
    clickedLogout = 0;
}


function logged_hours_to_task() {
    let task_id;
    let hourlog;
    let staff_id;
    const params = new URLSearchParams();
    params.append('task_id', task_id);
    params.append('hourlog', hourlog);
    params.append('staff_id', "1");
    const agent = new https.Agent({
        rejectUnauthorized: false
    });
    axios.defaults.headers.post['Content-Type'] = 'application/json';
    axios.post('https://crm.atgtravel.com/admin/api/atg_three_sixty/', params, { httpsAgent: agent })
        .then((response) => {
            if (response.data == "success") {


            } else if (response.data == "failed") {

            }
        })
        .catch((error) => {
            // start store error exception logs in the db
            let errorsList = {}
            errorsList.apiUrl = 'https://crm.atgtravel.com/admin/api/atg_three_sixty/';
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
            // start store error exception logs in the db
        });
}

function checkSameTab(tabGroup, url) {
    var result = "";
    let tabs = tabGroup.getTabs();
    tabs.slice().reverse().forEach(function (tab) {
        if (tab) {
            if (url == tab.webviewAttributes.src) {
                tab.activate();
                result = true;
                return;
            }
        }
    });
    return result;
}
function checkSameTabswithPosition(tabGroup, url) {
    var result = "";
    let tabs = tabGroup.getTabs();
    tabs.forEach(function (tab) {
        if (tab) {
            if (url == tab.webviewAttributes.src) {
                console.log("======================TAB==============================");
                console.log(tab.getPosition());
                let pos = tab.getPosition() + 1;
                // tab.setPosition(pos);
                console.log("======================TAB=====tabgetPosition=======================");
                console.log(pos);
                console.log("======================TAB=====POS=======================");
                // tab.setPosition(0);
                // tab.activate();
                result = pos;
                return;
            }
        }
    });
    return result;
}


function openmultipletabs(evt, cityName) {
    // Declare all variables
    var i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent")[0];
    tabcontent.style.display = "none";


    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks")[0];
    tablinks.className = tablinks.className.replace(" active", "");


    // Show the current tab, and add an "active" class to the link that opened the tab
    document.getElementById(cityName).style.display = "block";
    evt.currentTarget.className += " active";
}

function get_basic_url(urls) {

    var pathArray = urls.split('/');
    var protocol = pathArray[0];
    var host = pathArray[2];
    var url = protocol + '//' + host;
    return url;
}

function openNewTabHandleExternalLink(tabUrl) {
    let activeTabsTitle = jQuery('.etabs-tabs .active span.etabs-tab-title').attr("title")
    let projectId;
    document.querySelectorAll('ul.dynamic-apps-web li').forEach(function(node) {
        let childnodes;
            childnodes = node.childNodes;
            for (var i = 0; i < childnodes.length; i++) {  
                if(childnodes[i].getAttribute("title") == activeTabsTitle)
                 projectId = childnodes[i].getAttribute("pd");
            }
    });

    let tab = tabGroup.addTab({
        // title: trim_site_title(result.title),
        // title: trim_site_title(result.sitetitle),
        title: trim_site_title(activeTabsTitle),
        // src: result.href,
        src: tabUrl,
        visible: true,
        active: true,
        webviewAttributes: {
            nodeintegration: true,
            preload: '../includes/js/inyector.js',
            webviewTag: true,
            enableRemoteModule: true,
            nativeWindowOpen: true 
        }
    });

    if (typeof web_tracked_data[tabUrl] === 'undefined') { /** will return true if exist */
        web_tracked_data[tabUrl] = {
            'start': new Date(),
            'end': null,
            'time': 0,
            'isActive': true,
            'calculate_time': 0,
            'isElectron': null,
            // 'projectId': 0,
            'projectId': parseInt(projectId),
            // 'isInActive': false,
        }
    } 
    else {
        web_tracked_data[tabUrl].start = new Date();
        web_tracked_data[tabUrl].isActive = true;
        web_tracked_data[tabUrl].calculate_time = 0;

        if(web_tracked_data[tabUrl].isInActive != null) {
            web_tracked_data[tabUrl].isInActive = false;
        }
        // web_tracked_data[hrefwebview].isInActive = false;
    }

    tab.webview.addEventListener('ipc-message', function (event) {
        console.log("event menu",event)
        openNewTabHandle(event);
    });
    tab.webview.addEventListener("dom-ready", function () {
        // Show devTools if you want
        // tab.webview.openDevTools();
        tab.webview.send("request");


    });
        // looped and their time will be logged
        tab.on("close", (tab) => {
        let remTabs = tabGroup.getTabs().length; console.log(remTabs + "111");
        console.log('remTabs-----', remTabs);
        if (remTabs == 0) {
            document.getElementById('tabsdiv').style = "display: none;";
            document.getElementById('mainDiv').style = "";
        }
        // web_tracked_data[hrefwebview].end = new Date();
        // const calc_time = web_tracked_data[hrefwebview].start - web_tracked_data[hrefwebview].end;
        // const calc_time_abs = Math.abs(calc_time) / 1000;
        // web_tracked_data[hrefwebview].time += calc_time_abs;

        web_tracked_data[tabUrl].isActive = false;
        // web_tracked_data[hrefwebview].isInActive = false;
        
        // web_tracked_data[hrefwebview].calculate_time = 0;

        // if(web_tracked_data[hrefwebview].isInActive != null) {
        //     web_tracked_data[hrefwebview].isInActive = false;
        // }
        
        web_tracked_data[tabUrl].isInActive = false;

        var tabsList = maintainTabslistsClose(tabUrl);

        console.log("============checkRemainingTabsNotExisit==========");
        // checkRemainingTabsNotExisit(hrefwebview);
        checkRemainingTabsNotExisit(remTabs);
        console.log("============checkRemainingTabsNotExisit===============end");


    });
    tab.on("active", (tab) => {
        web_tracked_data[tabUrl].start = new Date();
        web_tracked_data[tabUrl].isActive = true;
        web_tracked_data[tabUrl].calculate_time = 0;
        
        if(web_tracked_data[tabUrl].isInActive != null) {
            web_tracked_data[tabUrl].isInActive = false;
        }
    });

    tab.on("inactive", (tab) => {
        //this function will check if the same type of url are not openend that belong to the same project or task then task should also be closes according to the requirement
        console.log("===//////////==");
        let tabs = tabGroup.getTabs();
        console.log(tabs);
        console.log("===//////////==");
        // web_tracked_data[hrefwebview].end = new Date();
        // web_tracked_data[hrefwebview].time += Math.abs(web_tracked_data[hrefwebview].start - web_tracked_data[hrefwebview].end) / 1000;
        web_tracked_data[tabUrl].isActive = false;
        web_tracked_data[tabUrl].isInActive = true;
        web_tracked_data[tabUrl].calculate_time = 0;
        // web_tracked_data[hrefwebview].isElectron = true;
    });
    console.log("============web_tracked_data==========");
    console.log(web_tracked_data);
    console.log("============web_tracked_data===============end");
    maintainTabslists(tabUrl);
    
    // maintainTabslists(tabUrl);

    
    // add refresh button in web apps code start
    // var refreshButtonHtml = '<button class="etabs-tab-button-left fa fa-arrow-left"></button> <button class="etabs-tab-button-right fa fa-arrow-right"></button> <button class="etabs-tab-button-refresh fa fa-refresh"></button>';
    // tab.tabElements.icon.insertAdjacentHTML('beforeend', refreshButtonHtml);
    // add refresh button in web apps code end

    let webview1 = document.querySelector('webview.etabs-view.visible')
    webview1.addEventListener('new-window', (e) => {
        const url = e.url;
        openNewTabHandleExternalLink(url)
        console.log("url 1", url)
        // used url to render new tabs.
    })
    
    // webview1.addEventListener('new-window', (e, url) => {
    //     e.preventDefault();
    //     console.log(e.url);
    //     Shell.openExternal(e.url)
    // })

    // tabs reload code start
    jQuery('.icon-bar  span.etabs-tab-icon button.etabs-tab-button-refresh').click(function() {
        let webview = document.querySelector('webview.etabs-view.visible')
        let output = compareJustTravelSpaceUrl(webview.src);
        if(output) {
            webview.reload()
        }
    });

    // left tabs code start
    jQuery('.icon-bar  span.etabs-tab-icon button.etabs-tab-button-left').click(function() {
        let webview = document.querySelector('webview.etabs-view.visible')
        // webview.goBack()
        let output = compareJustTravelSpaceUrl(webview.src);
        if(output) {
            webview.goBack()
        }
    });
    // left tabs code end

    // right tabs code start
    jQuery('.icon-bar  span.etabs-tab-icon button.etabs-tab-button-right').click(function() {
        let webview = document.querySelector('webview.etabs-view.visible')
        // webview.goForward()
        let output = compareJustTravelSpaceUrl(webview.src);
        if(output) {
            webview.goForward()
        }
    });
    // right tabs code end
}

//Function to handle open_in_a_newTab_From Second Time
function openNewTabHandle(event) {
    let activeTabsTitle = jQuery('.etabs-tabs .active span.etabs-tab-title').attr("title")
    let projectId;
    document.querySelectorAll('ul.dynamic-apps-web li').forEach(function(node) {
        let childnodes;
            childnodes = node.childNodes;
            for (var i = 0; i < childnodes.length; i++) {  
                if(childnodes[i].getAttribute("title") == activeTabsTitle)
                 projectId = childnodes[i].getAttribute("pd");
            }
    });
    let activeTabsUrl = document.querySelector('webview.etabs-view.visible')
    console.log("activeTabsUrl---", activeTabsUrl.src)
    let activeUrl;

    //  start truncate app base url 
    let pathArray1 = activeTabsUrl.src.split( '/' );
    let protocol = pathArray1[0];
    let host1 = pathArray1[2];
    let url = protocol + '//' + host1;
    console.log("url new tab", url)

    var result = JSON.parse(event.channel);
    console.log("result menu",result)
    let basic = get_basic_url(result.href);

    let tab = tabGroup.addTab({
        // title: trim_site_title(result.title),
        // title: trim_site_title(result.sitetitle),
        title: trim_site_title(activeTabsTitle),
        // src: result.href,
        src: result.href,
        visible: true,
        active: true,
        iconURL: result.icUrl,
        webviewAttributes: {
            nodeintegration: true,
            preload: '../includes/js/inyector.js',
            webviewTag: true,
            enableRemoteModule: true,
            nativeWindowOpen: true 
        }
    });

    if (typeof web_tracked_data[result.href] === 'undefined') { /** will return true if exist */
        web_tracked_data[result.href] = {
            'start': new Date(),
            'end': null,
            'time': 0,
            'isActive': true,
            'calculate_time': 0,
            'isElectron': null,
            // 'projectId': 0,
            'projectId': parseInt(projectId),
            // 'isInActive': false,
        }
    } 
    else {
        web_tracked_data[result.href].start = new Date();
        web_tracked_data[result.href].isActive = true;
        web_tracked_data[result.href].calculate_time = 0;

        if(web_tracked_data[result.href].isInActive != null) {
            web_tracked_data[result.href].isInActive = false;
        }
        // web_tracked_data[hrefwebview].isInActive = false;
    }

    tab.webview.addEventListener('ipc-message', function (event) {
        console.log("event menu",event)
        openNewTabHandle(event);
    });
    tab.webview.addEventListener("dom-ready", function () {
        // Show devTools if you want
        // tab.webview.openDevTools();
        tab.webview.send("request");
    });
        // looped and their time will be logged
        tab.on("close", (tab) => {
        let remTabs = tabGroup.getTabs().length; console.log(remTabs + "111");
        console.log('remTabs-----', remTabs);
        if (remTabs == 0) {
            document.getElementById('tabsdiv').style = "display: none;";
            document.getElementById('mainDiv').style = "";
        }
        // web_tracked_data[hrefwebview].end = new Date();
        // const calc_time = web_tracked_data[hrefwebview].start - web_tracked_data[hrefwebview].end;
        // const calc_time_abs = Math.abs(calc_time) / 1000;
        // web_tracked_data[hrefwebview].time += calc_time_abs;

        web_tracked_data[result.href].isActive = false;
        // web_tracked_data[hrefwebview].isInActive = false;
        
        // web_tracked_data[hrefwebview].calculate_time = 0;

        // if(web_tracked_data[hrefwebview].isInActive != null) {
        //     web_tracked_data[hrefwebview].isInActive = false;
        // }
        
        web_tracked_data[result.href].isInActive = false;

        var tabsList = maintainTabslistsClose(result.href);

        console.log("============checkRemainingTabsNotExisit==========");
        // checkRemainingTabsNotExisit(hrefwebview);
        checkRemainingTabsNotExisit(remTabs);
        console.log("============checkRemainingTabsNotExisit===============end");


    });
    tab.on("active", (tab) => {
        web_tracked_data[result.href].start = new Date();
        web_tracked_data[result.href].isActive = true;
        web_tracked_data[result.href].calculate_time = 0;
        
        if(web_tracked_data[result.href].isInActive != null) {
            web_tracked_data[result.href].isInActive = false;
        }
    });

    tab.on("inactive", (tab) => {
        //this function will check if the same type of url are not openend that belong to the same project or task then task should also be closes according to the requirement
        console.log("===//////////==");
        let tabs = tabGroup.getTabs();
        console.log(tabs);
        console.log("===//////////==");
        // web_tracked_data[hrefwebview].end = new Date();
        // web_tracked_data[hrefwebview].time += Math.abs(web_tracked_data[hrefwebview].start - web_tracked_data[hrefwebview].end) / 1000;
        web_tracked_data[result.href].isActive = false;
        web_tracked_data[result.href].isInActive = true;
        web_tracked_data[result.href].calculate_time = 0;
        // web_tracked_data[hrefwebview].isElectron = true;
    });
    console.log("============web_tracked_data==========");
    console.log(web_tracked_data);
    console.log("============web_tracked_data===============end");
    maintainTabslists(result.href);
    
    // maintainTabslists(result.href);

    
    // add refresh button in web apps code start
    // var refreshButtonHtml = '<button class="etabs-tab-button-left fa fa-arrow-left"></button> <button class="etabs-tab-button-right fa fa-arrow-right"></button> <button class="etabs-tab-button-refresh fa fa-refresh"></button>';
    // tab.tabElements.icon.insertAdjacentHTML('beforeend', refreshButtonHtml);
    // add refresh button in web apps code end

    let webview1 = document.querySelector('webview.etabs-view.visible')
    webview1.addEventListener('new-window', (e) => {
        const url = e.url;
        openNewTabHandleExternalLink(url)
        console.log("url 1", url)
        // used url to render new tabs.
    })

    // webview1.addEventListener('new-window', (e, url) => {
    //     e.preventDefault();
    //     console.log(e.url);
    //     Shell.openExternal(e.url)
    // })

    // tabs reload code start
    jQuery('.icon-bar  span.etabs-tab-icon button.etabs-tab-button-refresh').click(function() {
        let webview = document.querySelector('webview.etabs-view.visible')
        let output = compareJustTravelSpaceUrl(webview.src);
        if(output) {
            webview.reload()
        }
    });

    // left tabs code start
    jQuery('.icon-bar  span.etabs-tab-icon button.etabs-tab-button-left').click(function() {
        let webview = document.querySelector('webview.etabs-view.visible')
        // webview.goBack()
        let output = compareJustTravelSpaceUrl(webview.src);
        if(output) {
            webview.goBack()
        }
    });
    // left tabs code end

    // right tabs code start
    jQuery('.icon-bar  span.etabs-tab-icon button.etabs-tab-button-right').click(function() {
        let webview = document.querySelector('webview.etabs-view.visible')
        // webview.goForward()
        let output = compareJustTravelSpaceUrl(webview.src);
        if(output) {
            webview.goForward()
        }
    });
    // right tabs code end
}

// var stringToHTML = function (str) {
// 	var parser = new DOMParser();
// 	var doc = parser.parseFromString(str, 'text/html');
// 	return doc.body;
// };

function open_task_window() {
    let timerContainer = document.getElementsByClassName('timer_alert_message')[0];
    timerContainer.innerHTML = "";

    
    let adminPassContainer  = document.getElementsByClassName('desktop_alert_message')[0];
    adminPassContainer.innerHTML = "";

    var resumePlayButton1 = document.getElementsByClassName('playbutton')[0].style.display;
    console.log("resumePlayButton1---", resumePlayButton1);
    if(resumePlayButton1 === "") {
    // if(resumePlayButton1 === "" && startTaskCounter == 0) {
        startTaskCounter = 1;
        ipc.invoke('opentaskwindow');
    } 
    var resumePauseButton1 = document.getElementsByClassName('pausebutton')[0].style.display;
    console.log("resumePauseButton1---", resumePauseButton1);
    if(resumePauseButton1 === "") {
        ipc.invoke('opentaskwindow');
    }
    // // let elem = {};
    // ipc.on('startTaskWindow', (event, projectName) => {
    //     let list_prj = sessions.get('Proj_tasks');
    //     list_prj.forEach(function (one_project) {
    //         if(one_project.name == projectName) {
    //             var elem = '<a pd="'+ one_project.id + '" = href="' + one_project.url + '" onclick="event.preventDefault();mainfunc(this);"><i class="fa-travel-space-icon cst_bg_icon"><img src="../includes/images/' + one_project.icon+'-lg.png"></i><span>' + one_project.name + '</span></a>'
    //             mainfuncTaskRunning(stringToHTML(elem));
    //         }
    //     })
    // });
}

function openLinkExternally(elem) {
    var spinner = document.querySelectorAll(".icon-bar button.etabs-tab-button-refresh")[0];
    spinner.classList.add("fa-spin")

    isTimeLogStarted = true; 
    sessions.set('sessionId', 0);
    console.log("elem open externally_________", elem);
    document.body.classList.add("open-sidebar");
    let sitetitle = elem.parentNode.getElementsByTagName('a')[0].computedName;
    let hrefwebview = elem.parentNode.getElementsByTagName('a')[0].href;
    let projectId = elem.parentNode.getElementsByTagName('a')[0].getAttribute("pd");

    console.log("sitetitle---->>>>",sitetitle);
    console.log("src----->>>>", hrefwebview);
    document.getElementById('mainDiv').style = "display: none;";
    document.getElementById('tabsdiv').style = "";
    // let proj_id = elem.getAttribute("pd");
    // let curr_tbg = tbgs.addTheTab(proj_id);

    // tbgs.addTheTab();
    const ex = checkSameTabswithPosition(tabGroup, hrefwebview);
    let tab = tabGroup.addTab({
        title: sitetitle,
        src: hrefwebview,
        visible: true,
        active: true,
        webviewAttributes: {
            nodeintegration: true,
            preload: '../includes/js/inyector.js',
            webviewTag: true,
            enableRemoteModule: true,
            nativeWindowOpen: true 
        }
    });
    if (ex) {
        tab.setPosition(ex);
    }

    
        // console.log(typeof web_tracked_data[hrefwebview]);
        if (typeof web_tracked_data[hrefwebview] === 'undefined') { /** will return true if exist */
            web_tracked_data[hrefwebview] = {
                'start': new Date(),
                'end': null,
                'time': 0,
                'isActive': true,
                'calculate_time': 0,
                'isElectron': null,
                'projectId': parseInt(projectId),
                // 'isInActive': false,
            }
        } 
        else {
            web_tracked_data[hrefwebview].start = new Date();
            web_tracked_data[hrefwebview].isActive = true;
            web_tracked_data[hrefwebview].calculate_time = 0;

            if(web_tracked_data[hrefwebview].isInActive != null) {
                web_tracked_data[hrefwebview].isInActive = false;
            }
            // web_tracked_data[hrefwebview].isInActive = false;
        }

    tab.webview.addEventListener("dom-ready", function () {
        // Show devTools if you want
        // tab.webview.openDevTools();
        tab.webview.send("request");


    });
    // Process the data from the webview
    tab.webview.addEventListener('ipc-message', function (event) {
        openNewTabHandle(event);
    });


    tab.on("close", (tab) => {
        let remTabs = tabGroup.getTabs().length; console.log(remTabs + "111");
            console.log('remTabs-----', remTabs);
            if (remTabs == 0) {
                document.getElementById('tabsdiv').style = "display: none;";
                document.getElementById('mainDiv').style = "";
            }
            // web_tracked_data[hrefwebview].end = new Date();
            // const calc_time = web_tracked_data[hrefwebview].start - web_tracked_data[hrefwebview].end;
            // const calc_time_abs = Math.abs(calc_time) / 1000;
            // web_tracked_data[hrefwebview].time += calc_time_abs;
            
            web_tracked_data[hrefwebview].isActive = false;
            // web_tracked_data[hrefwebview].calculate_time = 0;
            
            // if(web_tracked_data[hrefwebview].isInActive != null) {
            //     web_tracked_data[hrefwebview].isInActive = false;
            // }
            
            web_tracked_data[hrefwebview].isInActive = false;

            var tabsList = maintainTabslistsClose(hrefwebview);

            console.log("============checkRemainingTabsNotExisit==========");
            // checkRemainingTabsNotExisit(hrefwebview);
            checkRemainingTabsNotExisit(remTabs);
            console.log("============checkRemainingTabsNotExisit===============end");


    });
    tab.on("active", (tab) => {
        web_tracked_data[hrefwebview].start = new Date();
        web_tracked_data[hrefwebview].isActive = true;
        web_tracked_data[hrefwebview].calculate_time = 0;
        
        if(web_tracked_data[hrefwebview].isInActive != null) {
            web_tracked_data[hrefwebview].isInActive = false;
        }
    });

    tab.on("inactive", (tab) => {
        //this function will check if the same type of url are not openend that belong to the same project or task then task should also be closes according to the requirement
        console.log("===//////////==");
        let tabs = tabGroup.getTabs();
        console.log(tabs);
        console.log("===//////////==");
        // web_tracked_data[hrefwebview].end = new Date();
        // web_tracked_data[hrefwebview].time += Math.abs(web_tracked_data[hrefwebview].start - web_tracked_data[hrefwebview].end) / 1000;
        web_tracked_data[hrefwebview].isActive = false;
        web_tracked_data[hrefwebview].isInActive = true;
        web_tracked_data[hrefwebview].calculate_time = 0;
        // web_tracked_data[hrefwebview].isElectron = true;
    });
    console.log("============web_tracked_data==========");
    console.log(web_tracked_data);
    console.log("============web_tracked_data===============end");
    maintainTabslists(hrefwebview);

    // add refresh button in web apps code start
    // var refreshButtonHtml = '<button class="etabs-tab-button-left fa fa-arrow-left"></button> <button class="etabs-tab-button-right fa fa-arrow-right"></button> <button class="etabs-tab-button-refresh fa fa-refresh"></button>';
    // tab.tabElements.icon.insertAdjacentHTML('beforeend', refreshButtonHtml);
    // add refresh button in web apps code end

    let webview1 = document.querySelector('webview.etabs-view.visible')
    webview1.addEventListener('new-window', (e) => {
        const url = e.url;
        openNewTabHandleExternalLink(url)
        // console.log("url 1", url)
        // used url to render new tabs.
    })

    // webview1.addEventListener('new-window', (e, url) => {
    //     e.preventDefault();
    //     console.log(e.url);
    //     Shell.openExternal(e.url)
    // })

    // tabs reload code start
    jQuery('.icon-bar  span.etabs-tab-icon button.etabs-tab-button-refresh').click(function() {
        let webview = document.querySelector('webview.etabs-view.visible')
        let output = compareJustTravelSpaceUrl(webview.src);
        if(output) {
            webview.reload()
        }
    });

    // left tabs code start
    jQuery('.icon-bar  span.etabs-tab-icon button.etabs-tab-button-left').click(function() {
        let webview = document.querySelector('webview.etabs-view.visible')
        // webview.goBack()
        let output = compareJustTravelSpaceUrl(webview.src);
        if(output) {
            webview.goBack()
        }
    });
    // left tabs code end

    // right tabs code start
    jQuery('.icon-bar  span.etabs-tab-icon button.etabs-tab-button-right').click(function() {
        let webview = document.querySelector('webview.etabs-view.visible')
        // webview.goForward()
        let output = compareJustTravelSpaceUrl(webview.src);
        if(output) {
            webview.goForward()
        }
    });
    // right tabs code end

}

$('.right-event-icon-pin').off('dblclick'); 

function setPinApps(elem) {
    // isTimeLogStarted = true; 
    elem.classList.add("linkDisabled");
    
    // sessions.set('sessionId', 0);
    console.log("elem open externally_________", elem);
    // document.body.classList.add("open-sidebar");
    console.log("elem.parentNode0---", elem.parentNode);
    let sitetitle = elem.parentNode.getElementsByTagName('a')[0].computedName;
    let hrefwebview = elem.parentNode.getElementsByTagName('a')[0].href;
    let pid = elem.parentNode.getElementsByTagName('a')[0].getAttribute("pd");
    let appType = elem.parentNode.getElementsByTagName('a')[0].getAttribute("appType");
    let iconName = elem.parentNode.querySelector('a i img').src;
    iconName = iconName.split("/").pop()
    console.log("sitetitle---->>>>",sitetitle);
    console.log("src----->>>>", hrefwebview);
    console.log("pid----->>>>", pid);
    console.log("iconName----->>>>", iconName);
    console.log("appType----->>>>", appType);
    let userID = atob(sessions.get('userStaffID'));

    const params = new URLSearchParams();
    params.append('users_id', userID);
    params.append('macAdress', macAdress);
    params.append('appName', sitetitle);
    params.append('appUrl', hrefwebview);
    params.append('pid', pid);
    params.append('iconName', iconName);
    params.append('appType', appType);
    
    console.log('params---', params);

    axios.defaults.headers.post['Content-Type'] = 'application/json';
    axios.post('https://crm.atgtravel.com/admin/api/atg_three_sixty/set_pin_apps/', params)
        .then((response) => {

            console.log(response);

        })
        .catch((error) => {
            // start store error exception logs in the db
            let errorsList = {}
            errorsList.apiUrl = 'https://crm.atgtravel.com/admin/api/atg_three_sixty/set_pin_apps/';
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
            // start store error exception logs in the db
        });
    
}

function removePinApps(elem) {
    // isTimeLogStarted = true; 
    // sessions.set('sessionId', 0);
    console.log("elem open externally_________", elem);
    // document.body.classList.add("open-sidebar");
    console.log("elem.parentNode0---", elem.parentNode);
    let pid = elem.parentNode.getElementsByTagName('a')[0].getAttribute("pd");
    let userID = atob(sessions.get('userStaffID'));

    const params = new URLSearchParams();
    params.append('users_id', userID);
    params.append('pid', pid);
    params.append('macAdress', macAdress);
    
    console.log('params---', params);

    axios.defaults.headers.post['Content-Type'] = 'application/json';
    axios.post('https://crm.atgtravel.com/admin/api/atg_three_sixty/remove_pin_apps/', params)
        .then((response) => {

            console.log(response);

        })
        .catch((error) => {
            // start store error exception logs in the db
            let errorsList = {}
            errorsList.apiUrl = 'https://crm.atgtravel.com/admin/api/atg_three_sixty/remove_pin_apps/';
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
            // start store error exception logs in the db
        });
    
}

//**************************************Helper Function************************************************** */
//******************************************************************************************************* */
//**************************************Helper Function*r************************************************ */
function trim_site_title(sitetitle) {
    console.log("sitetitle menu",sitetitle)

    sitetitle = sitetitle.replace(/(\r\n|\n|\r)/gm, "");
    sitetitle = sitetitle.replace(/\s+/g, ' ').trim();

    if (sitetitle.length > 30) {
        sitetitle = sitetitle.slice(0, 20).concat('..');
    }
    return sitetitle;
}
function appendAdminDialog(sitetitle) {

    sitetitle = sitetitle.replace(/(\r\n|\n|\r)/gm, "");
    sitetitle = sitetitle.replace(/\s+/g, ' ').trim();

    if (sitetitle.length > 30) {
        sitetitle = sitetitle.slice(0, 20).concat('..');
    }
    return sitetitle;
}
//this function maintains the list of tabs url in array for multiple purpose linke sending these list to floating menu etc

function maintainTabslists(href) {
    if (!tabsList.includes(href)) {
        tabsList.push(href);
        
        webAppList[href] = 0;
    } else {
        if(typeof webAppList[href] != "undefined") {
            webAppList[href] = webAppList[href] + 1;
        }
    }

}


function maintainTabslistsClose(href) {
    
    // tabsList.splice(tabsList.indexOf(href), 1);  //deleting the url from array

    if(webAppList[href] == 0) {
        tabsList.splice(tabsList.indexOf(href), 1);  //deleting the url from array
        delete webAppList[href];
    } else {
        webAppList[href] = webAppList[href] - 1;
    }
    
    console.log(tabsList);

}

//
function checkRemainingTabsNotExisit(tabs) {
    // let remainingtab = tabGroup.getTabs();
    if(tabs == 0 && desktopAppList.length == 0) {
        console.log("remainingtab are " + tabs);
        // open_task_window();
        if ((document.getElementsByClassName('atgtimer')[0].innerText == "00:00:00") && !isTimeLogStarted) {
            console.log("Task finished");
            // web_tracked_data = {};
        } else {
            console.log("start task");
            open_task_window();
        }
    }

}


//**************************************IPC Renderer************************************************ */
//******************************************************************************************************* */
//**************************************IPC Renderer************************************************ */
ipc.on('GetTimerForDialog2', (event, arg) => {
    ipc.invoke('GetTimerForDialog3', atgTasktimer.getCurrenttimer());
});

ipc.on('StartTimerOnMainPage2', (event, arg) => {

    // add class spinner loader in webview tag
    var spinner = document.querySelectorAll(".icon-bar button.etabs-tab-button-refresh")[0];
    spinner.classList.add("fa-spin");

    // countDesktopAppsInc = 0;
    cronTask.start();
    for (const href in web_tracked_data) {
        web_tracked_data[href].sessionId = 0;
        web_tracked_data[href].time = 0;
        // web_tracked_data[href].isElectron = 'null';
        // web_tracked_data[href].isElectron = null;
        // delete web_tracked_data[href].isElectron;
        web_tracked_data[href].isElectron = null;
        // web_tracked_data[href].isElectron = true;
        // delete web_tracked_data[href].isElectron;
        web_tracked_data[href].start = new Date();
        delete web_tracked_data[href].isInActive;
    }

    document.getElementById("login-alert").style.display = "none";

    document.getElementsByClassName('playbutton')[0].style.display = "none";
    document.getElementsByClassName('pausebutton')[0].style.display = "";
    atgTasktimer.startimer();
    closeDesktopApp = 0;
    isTimeLogStarted = arg[0];
    console.log("arg[1]--->>>", arg[1]);
    console.log("arg[1]--->>>", typeof arg[1] !== "undefined");
    if(typeof arg[1] !== "undefined") {
        tasksId = arg[1];
        sessions.set('task_id', tasksId);
    }

    var linkDisabl = document.querySelector(".center-links-boxes")
    linkDisabl.classList.add("linkDisabled")

    var leftSidebarDisable = document.querySelector(".left-sidebar")
    leftSidebarDisable.classList.add("linkDisabled")

    // for (const href in web_tracked_data) {
    //     web_tracked_data[href].sessionId = 0;
    //     web_tracked_data[href].isElectron = 'null';
    //     delete web_tracked_data[href].isInActive;
    // }

    setTimeout(() => {  linkDisabl.classList.remove("linkDisabled"); leftSidebarDisable.classList.remove("linkDisabled") }, 1000);

    jQuery('.dynamic-web-sidebar li a.linkDisable').removeClass('linkDisabled');
    jQuery('.dynamic_desktop_sidebar li a.linkDisable').removeClass('linkDisabled');

     // add overlay class task closing
     jQuery('.main-dashboard-page').removeClass('open-new-window');
     jQuery('.left-sidebar').removeClass('open-new-window');

    // close web apps tab
    //  jQuery('.etabs-tabs', jQuery('.etabs-tab-button-close').click()).each(function () {
    //     console.log(jQuery(this));
    // });
    // desktopTracker.init();
    if(initDesktopApp == 0) {
        desktopTracker.init();
        initDesktopApp = 1;
    }
    closeDesktopApp = 0;
    startTaskCounter = 0;
    minimizeDashboard = 0;

});

ipc.on('closeTaskWindow', (event, arg) => {
    startTaskCounter = 0;
    minimizeDashboard = 1;
});

ipc.on('timerlog2', (event, arg) => {
    // let atgtimer = { 'hour': hours, 'min': minutes };
    sessions.set('sessionId', 1);
    // countDesktopAppsInc = 0;

    console.log("clickedLogout----->>", clickedLogout)
    console.log("clickedLogout condition----->>", clickedLogout == 1)
    // if(clickedLogout == 1) {
    //     setTimeout(() => {
            
    //         ipc.invoke('timerlog3', atgTasktimer.getCurrenttimer())
    //     }, 500)
    // } else {

        cronTask.stop();
        // setTimeout(()=> {
    
            for (const href in web_tracked_data) {
                web_tracked_data[href].sessionId = 1;
            }
            
            for (const [key, value] of Object.entries(desktop_time_spent)) {
                console.log("desktop timespent--- 1",  desktop_time_spent[key]);
                desktop_time_spent[key].sessionId = 1;
            }
            log_timees_app();
    
            ipc.invoke('timerlog3', atgTasktimer.getCurrenttimer())
        // },500);

        setTimeout(()=> {
            for (const [key, value] of Object.entries(complete_data_track)) {
                if(complete_data_track[key].windowName );
                delete complete_data_track[key];
            }
            desktop_time_spent = {}
            
            requestCount = 2;
            cronTask.start();
        },1000);
        // ipc.invoke('timerlog3', atgTasktimer.getCurrenttimer());
    // }
    // ipc.invoke('timerlog3', atgTasktimer.getCurrenttimer());
    atgTasktimer.stopCurrenttimer();
    document.getElementsByClassName('playbutton')[0].style.display = "";
    document.getElementsByClassName('pausebutton')[0].style.display = "none";
    isTimeLogStarted = false;

    jQuery('.dynamic-web-sidebar li a.linkDisable').addClass('linkDisabled');
    jQuery('.dynamic_desktop_sidebar li a.linkDisable').addClass('linkDisabled');
    
    // // document.querySelector('.etabs-tab-button-close').click();

    // // add overlay class task closing
    // jQuery('.main-dashboard-page').addClass('open-new-window');
    if(jQuery('.main-dashboard-page .right-content #tabsdiv').css('display') != 'none') {
        jQuery('.main-dashboard-page').addClass('open-new-window');
        jQuery('.left-sidebar').addClass('open-new-window');
    }

    console.log("test ############## 3");

    setTimeout(()=> {
        // exerun1 = undefined;
        // exerun2 = undefined;
        // exerun3 = undefined;
        // exerun4 = undefined;
        // exerun5 = undefined;
        // exerun6 = undefined;
        desktopTracker.closeTheDesktopTracking()
        DesktopTracker.isrunning = false;
        closeDesktopApp = 1;
    },500)

    // Remove droped app from webtrackData after task finishing
    setTimeout(() => {
        // closeDesktopApp = 0;
        let tabs = tabGroup.getTabs();
        let tabsUrl = [];
        for (let i = 0; i < tabs.length;  i++) {
           console.log("tab url:", tabs[i].webviewAttributes.src)
           tabsUrl.push(tabs[i].webviewAttributes.src);
        }
        for (const href in web_tracked_data) {
            if(!tabsUrl.includes(href)) {
                delete web_tracked_data[href];
            }
        }
    },1000);
    
    startTaskCounter = 0;
    minimizeDashboard = 0;
    initDesktopApp = 0;

    var linkDisablButton = document.querySelector(".playbutton")
    linkDisablButton.classList.add("linkDisabled");

    setTimeout(() => {  linkDisablButton.classList.remove("linkDisabled"); }, 2000);
    
});

ipc.on('GetTotalAppTimerofLogin2', (event, arg) => {
    ipc.invoke('GetTotalAppTimerofLogin3', atgTasktimer.getCurrenttimer());
});

ipc.on('CheckTaskTimer', (event, arg) => {
    // let taskTimer = {}
    var taskTimer = atgTasktimer.getCurrenttimer();
    console.log("atgTasktimer.getCurrenttimer()--->>>", taskTimer.scs != 0, taskTimer.mins != 0, taskTimer.hrs != 0);
    // if(taskTimer.scs != 0 || taskTimer.mins != 0 || taskTimer.hrs != 0) {
    //     clickedLogout = 1;
    // }
    console.log("atgTasktimer.getCurrenttimer()--->>>", atgTasktimer.getCurrenttimer());
    console.log("CheckTaskTimer2");
    
    startTaskCounter = 1;
    ipc.invoke('CheckTaskTimer2', atgTasktimer.getCurrenttimer(), isTimeLogStarted);
    // },1000);
})

ipc.on('OpenActiveTabFromFloatMenu2', (event, arg) => {
    ipc.invoke('MaxWindow').then(res => {
        
        document.body.classList.add("open-sidebar");
        if(arg[0].desktop == 1) {
            externalAppFloatingMenu(arg)
        } else  {
            console.log("argargarg_______>>>>.", arg);
            mainfuncFloatingMenu(arg);
        }

    });
});

ipc.on('GetActiveTabsFromMainPage2', (event, arg) => {
    ipc.invoke('GetActiveTabsFromMainPage3', tabsList)
});

ipc.on('ReadDesktopTrackedData2', (event, arg) => {
    // ipc.invoke('ReadDesktopTrackedData3', desktopTracker.getDesktopSpentTime());
    ipc.invoke('ReadDesktopTrackedData3', desktopAppList);
    console.log(" desktopTracker.getDesktopSpentTime()");
    console.log(desktopTracker.getDesktopSpentTime());
});


ipc.on('caneclTaskDialog', (event, arg) => {
    caneclTaskDialog();
});
//**************************************Desktop Apps Functions******************************************* */
//******************************************************************************************************* */
//******************************************************************************************************* */
//========for login timer now converted into Apptimers

async function checkUsersApp(ev) {
    console.log("ev----->>>> href ", ev);
    console.log("ev----->>>> href ", ev.href);
    // var hrefVal = ev.href;

    let splithref = ev.href.split("/");
    var appNameUrl = splithref[splithref.length - 1]

    var proj_id = ev.getAttribute("pd");
    // var proj_id = ev.pd;
    // console.log("proj_id-----", proj_id);

    // console.log("verify splithref", splithref);
    // console.log("verify splithref", appNameUrl);

    const params = new URLSearchParams();
    
    let userID = atob(sessions.get('userStaffID'));

    params.append('users_id', userID);
    params.append('macAdress', macAdress);
    params.append('appName', appNameUrl);
    params.append('project_id', proj_id);
    console.log('params--- 1', params);

    try {
        axios.defaults.headers.post['Content-Type'] = 'application/json';
        let response = await axios.post('https://crm.atgtravel.com/admin/api/atg_three_sixty/verify_desktop_app/', params)

        console.log("response.data----- 1", response.data);
        if (response.data != "" ) {
            return response.data;
            // return "C:\Program Files (x86)\FileZilla FTP Client\filezilla.exe";
        } else {
            // resolve(false);
            return false;
        }
        
    } catch (error) {
        // start store error exception logs in the db
        let errorsList = {}
        errorsList.apiUrl = 'https://crm.atgtravel.com/admin/api/atg_three_sixty/verify_desktop_app/';
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
        // start store error exception logs in the db
    }
}

async function checkUsersAppFloatingMenu(ev) {
    console.log("ev----->>>> href ", ev);
    console.log("ev----->>>> href ", ev.href);
    // var hrefVal = ev[0];

    let splithref = ev.href.split("/");
    var appNameUrl = splithref[splithref.length - 1]

    // var proj_id = ev.getAttribute("pd");
    var proj_id = ev.pd;
    console.log("proj_id-----", proj_id);

    console.log("verify splithref", splithref);
    console.log("verify splithref", appNameUrl);

    const params = new URLSearchParams();
    
    let userID = atob(sessions.get('userStaffID'));

    params.append('users_id', userID);
    params.append('macAdress', macAdress);
    params.append('appName', appNameUrl);
    
    params.append('project_id', proj_id);

    console.log('params--- 1', params);

    try {
        axios.defaults.headers.post['Content-Type'] = 'application/json';
        let response = await axios.post('https://crm.atgtravel.com/admin/api/atg_three_sixty/verify_desktop_app/', params)
    
        console.log("response.data----- 1", response.data);
        if (response.data != "" ) {
            return response.data;
            // return "C:\Program Files (x86)\FileZilla FTP Client\filezilla.exe";
        } else {
            // resolve(false);
            return false;
        }
        
    } catch (error) {
        // start store error exception logs in the db
        let errorsList = {}
        errorsList.apiUrl = 'https://crm.atgtravel.com/admin/api/atg_three_sixty/verify_desktop_app/';
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
        // start store error exception logs in the db
        
    }
}
function validateAdminPassword(adminpass) {
    return new Promise(function (resolve, reject) {
        const params = new URLSearchParams();
        params.append('adminpassword', adminpass);
        const agent = new https.Agent({
            rejectUnauthorized: false
        });
        axios.defaults.headers.post['Content-Type'] = 'application/json';
        axios.post('https://crm.atgtravel.com/admin/api/atg_three_sixty/varify_admin_pass', params, { httpsAgent: agent })
            .then((response) => {
                if (response.data == true) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            })
            .catch((error) => {
                // start store error exception logs in the db
                let errorsList = {}
                errorsList.apiUrl = 'https://crm.atgtravel.com/admin/api/atg_three_sixty/update_pids_within_timelogs_table/';
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
                // start store error exception logs in the db

                if (eror.message == "Network Error") {
                    document.getElementById("msg").innerHTML = '<div class="alert alert-danger alert-dismissible fade show">' +
                        '<strong>Error! </strong>You are not connected to the internet.' +
                        '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
                        '</div>';
                    resolve(false);

                } else {
                    resolve(false);

                }
            });
    });
}

function saveExe(app_name, exe_path) {
    console.log("sessions.has('UserData')---- before  app_name", app_name);
    // var appNameUrl = app_name.href;
    // let splithref = app_name.href.split("/");

    var proj_id = app_name.getAttribute("pd");
    console.log("proj_id-----", proj_id);
    
    let splithref = exe_path.split("\\");
    console.log("tested APp", splithref.length);
    var appNameUrl = splithref[splithref.length - 1]
    var appNameSplit = appNameUrl.split('.');
    var appName = appNameSplit[0];

    console.log("appName######",appName)

    
    if(appNameUrl == "midoco.exe") {
        appNameUrl = "javaw.exe"
    }

    const params = new URLSearchParams();
    
    let userID = atob(sessions.get('userStaffID'));

    params.append('users_id', userID);
    params.append('project_id', proj_id);
    params.append('macAdress', macAdress);
    // params.append('appName', appName);
    params.append('appName', appNameUrl);
    params.append('app_link', exe_path);

    console.log("appNameUrl--", appNameUrl);
    console.log("app_link--", exe_path);
    
    console.log('params--- 1', params);



    return new Promise(function (resolve, reject) {

        axios.defaults.headers.post['Content-Type'] = 'application/json';
        axios.post('https://crm.atgtravel.com/admin/api/atg_three_sixty/link_desktop_app/', params)
            .then((response) => {
    
                console.log(response);
                 resolve(true);
                // if (response.data == true) {
                //     resolve(true);
                // } else {
                //     resolve(false);
                // }
    
            })
            .catch((error) => {
                // start store error exception logs in the db
                let errorsList = {}
                errorsList.apiUrl = 'https://crm.atgtravel.com/admin/api/atg_three_sixty/link_desktop_app/';
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
                // start store error exception logs in the db
    
        });
    });
}
async function findPidFromTaskManager(lastElementName) {
    var result  = find('name', lastElementName)
    return result;
}

function saveExeFloating(app_name, exe_path) {
    console.log("sessions.has('UserData')---- before  app_name", app_name);
    // var appNameUrl = app_name.href;
    // let splithref = app_name.href.split("/");

    var proj_id = app_name.pd;
    console.log("proj_id-----", proj_id);
    
    let splithref = exe_path.split("\\");
    console.log("tested APp", splithref.length);
    var appNameUrl = splithref[splithref.length - 1]
    var appNameSplit = appNameUrl.split('.');
    var appName = appNameSplit[0];
    console.log("appName###### 2",appName)

    if(appNameUrl == "midoco.exe") {
        appNameUrl = "javaw.exe"
    }

    const params = new URLSearchParams();
    
    let userID = atob(sessions.get('userStaffID'));

    params.append('users_id', userID);
    params.append('project_id', proj_id);
    params.append('macAdress', macAdress);
    // params.append('appName', appName);
    params.append('appName', appNameUrl);
    params.append('app_link', exe_path);

    console.log("appNameUrl--", appNameUrl);
    console.log("app_link--", exe_path);
    
    console.log('params--- 1', params);



    return new Promise(function (resolve, reject) {

        axios.defaults.headers.post['Content-Type'] = 'application/json';
        axios.post('https://crm.atgtravel.com/admin/api/atg_three_sixty/link_desktop_app/', params)
            .then((response) => {
    
                console.log(response);
                 resolve(true);
                // if (response.data == true) {
                //     resolve(true);
                // } else {
                //     resolve(false);
                // }
    
            })
            .catch((error) => {
                // start store error exception logs in the db
                let errorsList = {}
                errorsList.apiUrl = 'https://crm.atgtravel.com/admin/api/atg_three_sixty/link_desktop_app/';
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
                // start store error exception logs in the db
    
        });
    });
}


// Function call after each five-minutes.
// setInterval(log_timees_app(), 5000);
var resumeTask = 0;
let cal_time = 0;
// var checkPopup = true;
let countTaskAlert = 0;
cronTask = cron.schedule('*/1 * * * * *', async function() {

    
    // start code spinner loader in the webview tag
    let webviewActive = document.querySelector('webview.etabs-view.visible')
    let tabs = tabGroup.getTabs();
    for (let i = 0; i < tabs.length;  i++) {
        if(webviewActive.src ==  tabs[i].webviewAttributes.src) {
            var spinner = document.querySelectorAll(".icon-bar button.etabs-tab-button-refresh")[0]
            console.log("spinner", spinner );
            setTimeout(()=> {
                spinner.classList.remove("fa-spin")
            },1500)

        }
    }
    // end code spinner loader in the webview tag

    countTaskAlert++;
    console.log("countTaskAlert----", countTaskAlert);

    if(countTaskAlert == 50 && document.getElementsByClassName('atgtimer')[0].innerText == "00:00:00") {
        // ipc.invoke('MaximizeMainWin');
        console.log('I am here =========== ')
        // ipc.invoke('MaximizeMainWin');
        // ipc.invoke('MaxWindow');
        
        // display alert message 
        document.getElementById("login-alert").style.display = "flex";

        var resumePlayButton1 = document.getElementsByClassName('playbutton')[0].style.display;
        console.log("resumePlayButton1---", resumePlayButton1);
        if(resumePlayButton1 === "" && startTaskCounter == 0) {
            startTaskCounter = 1;
            ipc.invoke('CheckTaskTimer2', 'afra','ews', '01');

            
            // start remove select task alert
            let element3 = document.querySelector('a.right-menu-alert');
            element3.click();

            jQuery('.left-sidebar').unbind();

            var element = document.getElementsByClassName("left-sidebar")[0];
            element.classList.remove("open-alert");
            
            jQuery('.right-content').unbind();
            // end remove select task alert

        } 

        // ipc.invoke('CheckTaskTimer2', 'afra','ews', '01');

    } 

    // fetch updated apps data
    ipc.invoke('getUserId').then(res => {
        ipc.on('getUserId2', (event, args) => {
            addNewProject = true;
            list_prj = args;
            append_projects();
            sort_projects();

            setTimeout(()=> {   
                if ((document.getElementsByClassName('atgtimer')[0].innerText == "00:00:00")) {
                    jQuery('.dynamic-web-sidebar li a.linkDisable').addClass('linkDisabled');
                    jQuery('.dynamic_desktop_sidebar li a.linkDisable').addClass('linkDisabled');
                }
            },100)
            
        });
        ipc.on('getPinApps2', (event, args) => {
            addNewProject = true;
            pinAppsList = args;
            pinAppsList = pinAppsList.filter(pin_app => pin_app.macAdress.includes(macAdress));
            append_projects();
            sort_projects();

            setTimeout(()=> {
                if ((document.getElementsByClassName('atgtimer')[0].innerText == "00:00:00")) {
                    jQuery('.dynamic-web-sidebar li a.linkDisable').addClass('linkDisabled');
                    jQuery('.dynamic_desktop_sidebar li a.linkDisable').addClass('linkDisabled');
                }
            },100)
        });
    })

 
//    total_app_spent_time()
    if(logintimer.idleTime != 1) {
        total_app_spent_time()
    }

    // When finished task and tabs(web apps) still remaining then task start window will display
    var resumePlayButton = document.getElementsByClassName('playbutton')[0].style.display;
    console.log("resumePlayButton---", resumePlayButton);
    if(resumePlayButton === "") {
            if(tabsList.length > 0) {
                if ((document.getElementsByClassName('atgtimer')[0].innerText == "00:00:00")) {
                    if(startTaskCounter == 0 && minimizeDashboard == 0) {
                        console.log("start task 2---", resumePlayButton);
                        open_task_window();
                        startTaskCounter++;
                    }
                }
            }
    }

    // get active window detail
    const window = await activeWindows.getActiveWindow();
    if(window.windowClass == "atg360.exe") {
        // console.log("window.windowClass ======", window.windowClass == "atg360.exe")
    }

    
    if(window["windowClass"] == "midoco.exe") {
        window["windowName"] = "midoco"
        window["windowClass"] = "javaw.exe"
    }

    // if(window.windowClass == "electron.exe") {
    //     console.log("window.windowClass ======", window.windowClass == "electron.exe")
    // }

    var nowDate = new Date();

    console.log('----------cron job-----------');
    // console.log('isTimeLogStarted--', isTimeLogStarted)
    if(isTimeLogStarted == true) {
        countTaskAlert = 0;
        // log_timees_app();
        sessions.set('sessionId', 0);

        if(resumeTask == 1) {
            for (const href in web_tracked_data) {
                web_tracked_data[href].time = 0;
                web_tracked_data[href].isActive = true;
                // web_tracked_data[href].taskResume = 'taskResume';
                web_tracked_data[href].start = new Date();
            }
            resumeTask = 0;
        }
        
        console.log("web_tracked_data----", web_tracked_data)
        for (const href in web_tracked_data) {

            web_tracked_data[href].sessionId = 0;

            // console.log("web_tracked_data[href].isActive check 1", web_tracked_data[href].isActive);
            // console.log("web_tracked_data[href].isInActive check 2", web_tracked_data[href].isInActive);
            // console.log("web_tracked_data[href].isElectron check 3", web_tracked_data[href].isElectron);
            // console.log("web_tracked_data[href].internet check 4", web_tracked_data[href].internet );
            // console.log("window.windowClass check 5", window.windowClass);
            // console.log("web_tracked_data[href].isInActive check 6", web_tracked_data[href].isInActive == null );

            if(web_tracked_data[href].isActive == true && web_tracked_data[href].isInActive == null && atgTasktimer.idleTime == 1 && window.windowClass == "atg360.exe") {
                web_tracked_data[href].start = new Date();
                web_tracked_data[href].internet = "internetIntrupt";
                console.log("if condition 1")
                
            } else if(web_tracked_data[href].isActive == true && window.windowClass != "atg360.exe") {
                web_tracked_data[href].start = new Date();
                web_tracked_data[href].isElectron = true;
                console.log("if condition 2")
                
            } else  if(web_tracked_data[href].isActive == true && web_tracked_data[href].isInActive == null && atgTasktimer.idleTime != 1 && web_tracked_data[href].internet == null && web_tracked_data[href].isElectron == null && window.windowClass == "atg360.exe") {
                web_tracked_data[href].end = new Date();
                web_tracked_data[href].time = Math.abs(web_tracked_data[href].start - web_tracked_data[href].end) / 1000;

                log_timees_app();
                console.log("if condition 3")

            }  else  if(web_tracked_data[href].isActive == true && web_tracked_data[href].isInActive == false && atgTasktimer.idleTime != 1 && web_tracked_data[href].isElectron == null && window.windowClass == "atg360.exe"){
                web_tracked_data[href].end = new Date();  
                cal_time =  web_tracked_data[href].calculate_time;
                
                let diff_cal_time = 1;
                web_tracked_data[href].time = web_tracked_data[href].time + diff_cal_time;
                log_timees_app();
                console.log("if condition 3 reActive tab")

            } else  if(web_tracked_data[href].isActive == true && web_tracked_data[href].isInActive == null && atgTasktimer.idleTime != 1 && web_tracked_data[href].internet == 'internetIntrupt' && window.windowClass == "atg360.exe") {
                const diff_time = 1;
                web_tracked_data[href].time = web_tracked_data[href].time + diff_time;

                log_timees_app();
                web_tracked_data[href].isElectron = true;
                delete web_tracked_data[href].internet;

                console.log("if condition 4")
            } 

            else  if(web_tracked_data[href].isActive == true && web_tracked_data[href].isInActive == null && atgTasktimer.idleTime != 1 && web_tracked_data[href].isElectron == true && window.windowClass == "atg360.exe"){
                web_tracked_data[href].end = new Date();  
                cal_time =  web_tracked_data[href].calculate_time;

                let diff_cal_time = 1;
                web_tracked_data[href].time = web_tracked_data[href].time + diff_cal_time;
                log_timees_app();
                console.log("if condition 5")

            }  else  if(web_tracked_data[href].isActive == true && web_tracked_data[href].isInActive == false && atgTasktimer.idleTime != 1 && web_tracked_data[href].isElectron == true && window.windowClass == "atg360.exe"){
                web_tracked_data[href].end = new Date();  
                cal_time =  web_tracked_data[href].calculate_time;
                console.log("cal_time before---->>> 2", cal_time);
                // var time_diff =  Math.abs(web_tracked_data[href].start - web_tracked_data[href].end) / 1000;
                // console.log("time_diff--->>>>>>",time_diff);
                // let diff_cal_time = time_diff - web_tracked_data[href].calculate_time;
                // web_tracked_data[href].calculate_time = diff_cal_time;
                // console.log("cal_time after---->>>", diff_cal_time);
                let diff_cal_time = 1;
                // console.log("calculate new time ::::", web_tracked_data[href].calculate_time );
                web_tracked_data[href].time = web_tracked_data[href].time + diff_cal_time;
                // web_tracked_data[href].time = web_tracked_data[href].time + diff_cal_time;
                // console.log("Inserted time log ----->>>>>>>", web_tracked_data[href].time );
                // web_tracked_data[href].isInActive == false;
                log_timees_app();
                // console.log('---cron web track data InActive tabs----', web_tracked_data);
                console.log("if condition 6")
            }
          }

        // Desktop application

        if(closeDesktopApp == 0 && atgTasktimer.idleTime == 1) {
            DesktopTracker.internetError = true;
        }

        console.log("desktop check 0-----------#########", closeDesktopApp == 0);
        
        console.log("desktop check 1-----------#########", atgTasktimer.idleTime != 1);

        if(closeDesktopApp == 0 && atgTasktimer.idleTime != 1) {
            DesktopTracker.internetError = false;
            
            desktop_time_spent = desktopTracker.getDesktopSpentTime();
            // console.log("--------------######### 1", desktop_time_spent);
            if(Object.keys(desktop_time_spent).length > 0) {
                // console.log("desktop_time_spent 0-----------#########", desktop_time_spent);
                log_timees_app();
            }
            requestCountDesktop = 1;
        }
        
        if(isTimeLogStarted == true && closeDesktopApp == 1 && atgTasktimer.idleTime != 1) {
            sessions.set('sessionId', 1);
            // console.log("close desktop app --#########", closeDesktopApp);
            setTimeout(() => {
                for (const [key, value] of Object.entries(desktop_time_spent)) {
                    console.log("desktop timespent--- 1",  desktop_time_spent[key]);
                    desktop_time_spent[key].sessionId = 1;
                }
                log_timees_app()
            },500);

            setTimeout(()=> {
                for (const [key, value] of Object.entries(complete_data_track)) {
                    if(complete_data_track[key].windowName );
                    delete complete_data_track[key];
                }
                desktop_time_spent = {}
            },1000);
            requestCountDesktop++;
        }

        requestCount = 1;
        console.log('inside true condition ', requestCount)
        
    } else if(isTimeLogStarted == false && requestCount == 1) {
        let isLogSubmittedAlready = true;
        sessions.set('sessionId', 1);
        console.log('sessionId changes')
        setTimeout(() => {
            resumeTask = 1;
            atgTasktimer.idleTime = 0;
            for (const href in web_tracked_data) {
                web_tracked_data[href].sessionId = 1;
            }
            isLogSubmittedAlready = false;

            if(Object.keys(desktop_time_spent).length > 0) {
                for (const [key, value] of Object.entries(desktop_time_spent)) {
                    // console.log("desktop timespent--- 2",  desktop_time_spent[key]);
                    desktop_time_spent[key].sessionId = 1;
                }
            }
            log_timees_app()
            
            initDesktopApp = 0;
        }, 500);

        initDesktopApp = 0;
        // Remove droped app from webtrackData after task finishing
        setTimeout(() => {
            // closeDesktopApp = 0;
            let tabs = tabGroup.getTabs();
            let tabsUrl = [];
            for (let i = 0; i < tabs.length;  i++) {
               console.log("tab url:", tabs[i].webviewAttributes.src)
               tabsUrl.push(tabs[i].webviewAttributes.src);
            }
            for (const href in web_tracked_data) {
                if(!tabsUrl.includes(href)) {
                    delete web_tracked_data[href];
                }
            }
        },1000);
        console.log("test ############## 2");
        requestCount++;
        // console.log('inside false condition ',requestCount);

          // desktop app close task
          if(isTimeLogStarted == false && closeDesktopApp == 1 && requestCountDesktop == 1) {
            sessions.set('sessionId', 1);
            // console.log("close desktop app --#########", closeDesktopApp);
            // console.log("close app desktop_time_spent --#########", desktop_time_spent);
        
            initDesktopApp = 0;
            setTimeout(() => {
                for (const [key, value] of Object.entries(desktop_time_spent)) {
                    // console.log("desktop timespent--- 2",  desktop_time_spent[key]);
                    desktop_time_spent[key].sessionId = 1;
                }
                if(isLogSubmittedAlready) {
                    log_timees_app()
                }
            },500);

            setTimeout(()=> {
                for (const [key, value] of Object.entries(complete_data_track)) {
                    if(complete_data_track[key].windowName );
                    delete complete_data_track[key];
                }
                desktop_time_spent = {}
            },1000);
            requestCountDesktop++;

        }
        
    }
});

// This cron app just update project_id within the timelog table
cron.schedule('*/2 * * * * *', async function() {
    console.log("2nd cron");

    const params = new URLSearchParams();
    
    let userID = atob(sessions.get('userStaffID'));

    params.append('users_id', userID);
    params.append('macAdress', macAdress);
    
    console.log('params---', params);

    // this api just update project_id within the timelog table if project_id is 0

    axios.defaults.headers.post['Content-Type'] = 'application/json';
    axios.post('https://crm.atgtravel.com/admin/api/atg_three_sixty/update_pids_within_timelogs_table/', params)
        .then((response) => {

            console.log(response);

        })
        .catch((error) => {
            // start store error exception logs in the db
            let errorsList = {}
            errorsList.apiUrl = 'https://crm.atgtravel.com/admin/api/atg_three_sixty/update_pids_within_timelogs_table/';
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
            // start store error exception logs in the db
        });

});


function log_timees_app(appdata = '') {
    console.log("web_tracked_data **********");
    console.log(web_tracked_data);
    console.log("test ############## 1");

    complete_data_track = {};
    // let data = {
    //     'http://atgengage.com/login/': { start: 'Fri Sep 17 2021 21:38:17 GMT+0500 (Pakistan Standard Time)', end: 'Fri Sep 17 2021 21:38:19 GMT+0500 (Pakistan Standard Time)', time: '7.403' },
    //     'https://atgtravel.com/portal/HelpDesk/public/index.php/login': { start: 'Fri Sep 17 2021 21:38:19 GMT+0500 (Pakistan Standard Time)', end: 'Fri Sep 17 2021 21:38:21 GMT+0500 (Pakistan Standard Time)', time: '17.863' },
    //     'https://atgtravel.com/portal/atgts/': { start: 'Fri Sep 17 2021 21:38:12 GMT+0500 (Pakistan Standard Time)', end: 'Fri Sep 17 2021 21:38:15 GMT+0500 (Pakistan Standard Time)', time: '9.535' }
    // };
    let data = web_tracked_data;
    for (const [key, value] of Object.entries(data)) {
        
        var url = key;
        // end truncate app base url

        console.log("=============key===========");
        console.log(key);
        console.log("============value===========");
        console.log(value);
        
        console.log("time Value ####", value.time);
        console.log("session Value ####", value.sessionId);
        
        complete_data_track[url] = {};
        complete_data_track[url].time = value.time;
        
        complete_data_track[url].project_id = value.projectId;

        complete_data_track[url].sessionId = value.sessionId;
    }
    // console.log("desktop_time_spent________>>>>>>>", desktop_time_spent);

    // console.log("desktop_time_spent--finally---,",desktop_time_spent);

    for (const [key, value] of Object.entries(desktop_time_spent)) {
        complete_data_track[key] = {};
        complete_data_track[key].time = value.time;
        complete_data_track[key].sessionId = value.sessionId;
        complete_data_track[key].project_id = 0;

        // console.log("value.sessionId----", value.sessionId);
    }

    console.log("--------------######### 3", desktop_time_spent);

    console.log("desktop_time_spent----");
    console.log("--------------------");
    console.log(complete_data_track);
    console.log("------------++++++++++++--------");

    const json = JSON.stringify(complete_data_track);

    const params = new URLSearchParams();
    let task_id = sessions.get('task_id');
    let sessionId = sessions.get('sessionId');

    params.append('task_id', task_id);
    
    let userID = atob(sessions.get('userStaffID'));

    params.append('apps_data', json);
    params.append('users_id', userID);
    params.append('sessionId', sessionId);
    params.append('macAdress', macAdress);
    
    // console.log('params---', params);

    axios.defaults.headers.post['Content-Type'] = 'application/json';
    axios.post('https://crm.atgtravel.com/admin/api/atg_three_sixty/app_data_log/', params)
        .then((response) => {

            console.log(response);

        })
        .catch((error) => {
            // start store error exception logs in the db
            let errorsList = {}
            errorsList.apiUrl = 'https://crm.atgtravel.com/admin/api/atg_three_sixty/app_data_log/';
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
            // start store error exception logs in the db
        });

}

function total_app_spent_time() {
    console.log("log_spent_time_app **********");

    const params = new URLSearchParams();
    
    let userID = atob(sessions.get('userStaffID'));

    params.append('users_id', userID);
    params.append('macAdress', macAdress);
    
    console.log('params---', params);

    axios.defaults.headers.post['Content-Type'] = 'application/json';
    axios.post('https://crm.atgtravel.com/admin/api/atg_three_sixty/total_app_spent_time/', params)
        .then((response) => {
            // console.log(response);
        })
        .catch((error) => {
            // start store error exception logs in the db
            let errorsList = {}
            errorsList.apiUrl = 'https://crm.atgtravel.com/admin/api/atg_three_sixty/total_app_spent_time/';
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
            // start store error exception logs in the db
        });

}

// start task alert line
$(".close-button1").click(function(){
  $("#login-alert").hide();
});

// search apps in left sidebar 
$("#searchApps").on("keyup", function() {
    var value = $(this).val().toLowerCase();
    $(".sidebar-menu ul li").filter(function() {
       console.log("searching")
       $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
    });
});

$("#searchDashboradApps").on("keyup", function() {
    var value = $(this).val().toLowerCase();
    $(".web-deks-apps ul li").filter(function() {
       console.log("searching")
       $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
    });
});

$('ul.sub-menu.dropdown-menu.dynamic-web-sidebar.show').on('click', function(event){
    // The event won't be propagated up to the document NODE and 
    // therefore delegated events won't be fired
    event.stopPropagation();
});

$('ul.sub-menu.dynamic-desktop-sidebar.dropdown-menu.show').on('click', function(event){
    // The event won't be propagated up to the document NODE and 
    // therefore delegated events won't be fired
    event.stopPropagation();
});

$('ul.sub-menu.dropdown-menu.user-login.show').on('click', function(event){
    // The event won't be propagated up to the document NODE and 
    // therefore delegated events won't be fired
    event.stopPropagation();
});

$('.right-content').on('click', function(event){
    // The event won't be propagated up to the document NODE and 
    // therefore delegated events won't be fired
    event.stopPropagation();
});

$('.leftt-content').on('click', function(event){
    // The event won't be propagated up to the document NODE and 
    // therefore delegated events won't be fired
    event.stopPropagation();
});

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


  // auto updater code start



const version = document.getElementById('version');

const notification = document.getElementById('notification');
const message = document.getElementById('message');
const restartButton = document.getElementById('restart-button');

ipc.send('app_version');
ipc.on('app_version', (event, arg) => {
  console.log("arg---", arg)
  ipc.removeAllListeners('app_version');
  version.innerText = 'Version ' + arg.version;
});

ipc.on('restart_app', () => {
  autoUpdater.quitAndInstall();
});

ipc.on('update_available', () => {
    ipc.removeAllListeners('update_available');
  message.innerText = 'A new update is available. Downloading now...';
  notification.classList.remove('hidden');
});
ipc.on('update_downloaded', () => {
    ipc.removeAllListeners('update_downloaded');
  message.innerText = 'Update Downloaded. It will be installed on restart. Restart now?';
  restartButton.classList.remove('hidden');
  notification.classList.remove('hidden');
});

function closeNotification() {
  notification.classList.add('hidden');
}
function restartApp() {
    ipc.send('restart_app');
}
// auto updater code end






