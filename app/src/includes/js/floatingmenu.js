const remote = require('electron').remote;
const ipc = require('electron').ipcRenderer;
const TabGroup = require("electron-tabs");
var child = require('child_process');
const { webFrame, BrowserWindow } = require('electron');
const url = require('url');
const sessions = require('electron-json-config');
const fs = require("fs-extra");
const _ = require("lodash");
var path = require('path');
webFrame.setZoomFactor(1);
const win = remote.getCurrentWindow();
const AppTimers = require("./render_module/AppTimers");
const focusWindow = require('node-process-windows');
let floatingtimer;
let total_time_spent_in_secs = 0;
let total_time_spent = 0;
request = require('request');

const axios = require('axios');
const https = require('https');
let list_prj;
var addNewProject = false;


/*Extending AppTimers Functionality due to the UI change of floating menu*/

class FloatingTimer extends AppTimers {
    startimer() {
        this.tme = setInterval(async () => {
            this.scs++;
            if (this.scs >= 60) {
                this.scs = 0;
                this.mins++;
                if (this.mins >= 60) {
                    this.mins = 0;
                    this.hrs++;
                }
            }
            this.selector.textContent = (this.hrs ? (this.hrs > 9 ? this.hrs : "0" + this.hrs) : "00") + " " + (this.mins ? (this.mins > 9 ? this.mins : "0" + this.mins) : "00") + " " + (this.scs ? (this.scs > 9 ? this.scs : "0" + this.scs) : "00");
            // console.log("running starttimer");

        }, 1000);

    }
    stopCurrenttimer() {
        clearInterval(this.tme);
        this.selector.textContent = "00 00 00";
    }

}

function get_this_users_projects() {
    let userID = atob(sessions.get('userStaffID'));
    const agent = new https.Agent({
      rejectUnauthorized: false
    });
    axios.defaults.headers.post['Content-Type'] = 'application/json';
    return axios.get('https://crm.atgtravel.com/admin/api/atg_three_sixty/get_projects_tasks2/' + userID, { httpsAgent: agent })
}

get_this_users_projects().then((projs) => {
list_prj = projs.data;
// setTimeout(()=> {
    append_projects();
// },400)
console.log("updated floating apps")
});

function append_projects() {
    let float_web_icons = document.getElementsByClassName('float-web-icons')[0];
    let float_desktop_icons = document.getElementsByClassName('float-desktop-icons')[0];

    // list_prj = sessions.get('Proj_tasks');
    // console.log(list_prj);

    let i = 0;

    const testFolder = '../includes/images/';
    //joining path of directory 
    const directoryPath = path.join(__dirname, testFolder);
    fs.readdir(directoryPath, function (err, files) {

        list_prj.forEach(function (one_project) {
            // if (i < 8) {
                if(one_project.appType == 'web' && one_project.url !== null && one_project["url"].length > 1) {
                    if(!files.includes(one_project.icon) && one_project.icon !== null) {
                        float_web_icons.insertAdjacentHTML("beforeend", `<li>
                        <a class="web-icone" pd="${one_project.id}" onclick="event.preventDefault();clickWebApps(this);" href="${one_project.url}" data-toggle="tooltip" title="${one_project.name}" >
                            <i class="web-icone fa-arc-icon cst_bg_icon"><img src="https://crm.atgtravel.com/assets/images/${one_project.icon}"></i>
                        </a>
                    </li>`); 
                    } else {
                        if(one_project.icon === null) { 
                            float_web_icons.insertAdjacentHTML("beforeend", `<li>
                                <a class="web-icone" pd="${one_project.id}" onclick="event.preventDefault();clickWebApps(this);" href="${one_project.url}" data-toggle="tooltip" title="${one_project.name}" >
                                    <i class="web-icone fa-arc-icon cst_bg_icon"><img src="../includes/images/global-leadership-02.png"></i>
                                </a>
                            </li>`); 
                        } else {
                            var iconName = one_project.icon.split( '.' )[0];
                            float_web_icons.insertAdjacentHTML("beforeend", `<li>
                                <a class="web-icone" pd="${one_project.id}" onclick="event.preventDefault();clickWebApps(this);" href="${one_project.url}" data-toggle="tooltip" title="${one_project.name}" >
                                    <i class="web-icone fa-arc-icon cst_bg_icon"><img src="../includes/images/${iconName}.png"></i>
                                </a>
                            </li>`); 
                        }
                    }
                // i++;
                // }
            }
            
            if(one_project.appType == 'desktop' && one_project.url !== null && one_project["url"].length > 1) {
                // if (i < 5) {
                    if(!files.includes(one_project.icon) && one_project.icon !== null) {
                        float_desktop_icons.insertAdjacentHTML("beforeend", `<li>
                        <a class="desktop-icone" href="${one_project.url}" id="${one_project.id}" onclick="event.preventDefault();clickDesktopApps(this);" data-toggle="tooltip" title="${one_project.name}" >
                            <i class="desktop-icone fa-fz-icon cst_bg_desktop_icon"><img src="https://crm.atgtravel.com/assets/images/${one_project.icon}"></i>
                        </a>
                    </li>`); 
                    } else {
                        if(one_project.icon === null) { 
                            float_desktop_icons.insertAdjacentHTML("beforeend", `<li>
                                <a class="desktop-icone" href="${one_project.url}" id="${one_project.id}" onclick="event.preventDefault();clickDesktopApps(this);" data-toggle="tooltip" title="${one_project.name}" >
                                    <i class="desktop-icone fa-fz-icon cst_bg_desktop_icon"><img src="../includes/images/global-leadership-02.png"></i>
                                </a>
                            </li>`);
                        } else {
                            var desktopIconName = one_project.icon.split( '.' )[0]; 
                            float_desktop_icons.insertAdjacentHTML("beforeend", `<li>
                                <a class="desktop-icone" href="${one_project.url}" id="${one_project.id}" onclick="event.preventDefault();clickDesktopApps(this);" data-toggle="tooltip" title="${one_project.name}" >
                                    <i class="desktop-icone fa-fz-icon cst_bg_desktop_icon"><img src="../includes/images/${desktopIconName}.png"></i>
                                </a>
                            </li>`);

                        }
                        
                    }
                // i++;
                // }
            }
        });
    });
}

document.onreadystatechange = (event) => {
    if (document.readyState == "complete") {
        ipc.invoke('ReadDesktopTrackedData');
        let right_swipe = document.getElementsByClassName('right-toggle-menu')[0];
        let right_toggle_menu = document.getElementsByClassName('right-toggle-menu')[0];
        right_swipe.addEventListener("click", function (e) {
            right_toggle_menu.classList.toggle("main");
        });
        right_toggle_menu.classList.toggle("main");

        let fl_timer = 0;
        setInterval(() => {
            fl_timer++;
            if (fl_timer == 5) {
                fl_timer = 0;
                if (right_toggle_menu.classList.contains("main")) {
                    right_toggle_menu.classList.remove("main");
                }
            }

        }, 1000);
        document.addEventListener('mousemove', e => {
            fl_timer = 0;
        });

        // append_projects();
        // setTimeout(append_projects, 400);


        setTimeout(webAppsClicked, 400);

        function webAppsClicked () {
        
            let webicons = document.getElementsByClassName('web-icone');
            console.log("webicons_______", webicons);

            // console.log("webicons_______", webicons);
            // for (const [key, value] of Object.entries(webicons)) {
            //     // console.log("key");
            //     // console.log(key);
            //     // console.log("value");
            //     // console.log(value);
            //     webicons[key].addEventListener('click', function (event) {
            //         event.preventDefault();
            //         // ipc.invoke('MaxWindow');
            //         let hrefVal = webicons[key].href;
            //         let title = webicons[key].title;
            //         var args = { };
            //         if(hrefVal != "undefined" && title != "")
            //         {
            //             args.href = hrefVal;
            //             args.title = title;
            //             console.log("args-----", args);
            //             ipc.invoke('OpenActiveTabFromFloatMenu', args);
            //         }

            //     });
            // }

            let desktop = document.getElementsByClassName('desktop-icone');

            document.getElementsByClassName('arrows')[0].addEventListener('click', function (event) {
                event.preventDefault();
                ipc.invoke('MaxWindow');
            });
            // document.getElementsByClassName('web-icone')[0];
            ipc.invoke('GetActiveTabsFromMainPage');       // sessions.set('gggggggggggggggg', "1");

        }


    }
};


window.onbeforeunload = (event) => {
    /* If window is reloaded, remove win event listeners
    (DOM element listeners get auto garbage collected but not
    Electron win listeners as the win is not dereferenced unless closed) */
    win.removeAllListeners();
}



function clickWebApps(elem) {
    console.log("elem-----", elem);
    console.log('elem.href web--', elem.href);
    console.log('elem.title web--', elem.title);

    let hrefVal = elem.href;
    let title = elem.title;
    let pd = elem.getAttribute("pd");
    var args = { };
    if(hrefVal != "undefined" && title != "")
    {
        args.href = hrefVal;
        args.title = title;
        args.pd = pd;
        ipc.invoke('OpenActiveTabFromFloatMenu', args);
    }
}

function clickDesktopApps(elem) {
    let hrefVal = elem.href;
    let title = elem.title;
    let pd = elem.id;
    var args = { };
    if(hrefVal != "undefined" && title != "")
    {
        args.href = hrefVal;
        args.title = title;
        args.desktop = 1;
        args.pd = pd;
        ipc.invoke('OpenActiveTabFromFloatMenu', args);
    }
}


function renderDesktopIcons(desktoptracks) {
    console.log("desktoptracks");
    console.log(desktoptracks);
    console.log("desktoptracks====");
   setTimeout(() => {
    let icons_six = document.getElementsByClassName('desktopicons')[0];
   var count = 0;
    if (desktoptracks) {
        if (icons_six.childNodes) {
            let nodes;
            nodes = icons_six.childNodes;
            for (var i = 0; i < nodes.length; i++) {
                node = nodes[i];
                if (node.tagName == 'LI') {
                    nodechild = node.childNodes;
                    for (var j = 0; j < nodechild.length; j++) {
                        nde = nodechild[j];
                        if (nde.nodeType === 1 && nde.tagName === 'A') {
                            let hrf_link = nde.getAttribute("href");
                            desktoptracks.forEach(element => {
                                console.log("==========================node=================");
                                console.log(node);
                                console.log("==========================node=====end============");
                                console.log("==========================node=================");
                                console.log(element);
                                console.log("==========================node=====end============");
                                if (element.startsWith(hrf_link)) {
                                    // node.setAttribute("class", "active "+count);
                                    node.setAttribute("class", "active");
                                    // node.setAttribute("class", count);
                                    nde.setAttribute("href", element)
                                    count++;
                                }
                            });

                        }
                    }

                }

            }
        }
    }


   // active apps sorting loop start 
   
    let desktopicons = document.getElementsByClassName('desktopicons')[0];
    console.log("desktopicons----",desktopicons);
    sortFlag = true;
    while (sortFlag) {
       sortFlag = false;
       LiEle = desktopicons.getElementsByTagName("LI");
       console.log("LiEle-----", LiEle);
       for (i = 0; i < LiEle.length - 1; i++) {
          sorted = false;
        //   if ( LiEle[i].classList.contains('active'))
        console.log("LiEle[i].classList----",LiEle[i].classList);
          if (LiEle[i].classList < LiEle[i + 1].classList) {
             console.log("yes matched")
             sorted = true;
             break;
          }
       }
       if (sorted) {
          LiEle[i].parentNode.insertBefore(LiEle[i + 1], LiEle[i]);
          sortFlag = true;
       }
    }

  }, 700);


    ipc.invoke('GetTotalAppTimerofLogin');

}
function webDesktopIcons(webtracks) {
    console.log("webtracks");
    console.log(webtracks);
    console.log("webtracks====");

setTimeout(() => {
    let icons_six = document.getElementsByClassName('web-icons')[0];
   var count = 0;
    if (webtracks) {
        if (icons_six.childNodes) {
            let nodes;
            nodes = icons_six.childNodes;
            for (var i = 0; i < nodes.length; i++) {
                node = nodes[i];
                if (node.tagName == 'LI') {
                    nodechild = node.childNodes;
                    for (var j = 0; j < nodechild.length; j++) {
                        nde = nodechild[j];
                        if (nde.nodeType === 1 && nde.tagName === 'A') {
                            let hrf_link = nde.getAttribute("href");
                            webtracks.forEach(element => {
                                console.log("==========================node=================");
                                console.log(node);
                                console.log("==========================node=====end============");
                                console.log("==========================node=================");
                                console.log(element);
                                console.log("==========================node=====end============");
                                if (element.startsWith(hrf_link)) {
                                    // node.setAttribute("class", "active "+count);
                                    node.setAttribute("class", "active");
                                    // node.setAttribute("class", count);
                                    nde.setAttribute("href", element)
                                    count++;
                                }
                            });

                        }
                    }

                }

            }
        }
    }


   // active apps sorting loop start 
   
    let webIcons = document.getElementsByClassName('web-icons')[0];
    console.log("webIcons----",webIcons);
    sortFlag = true;
    while (sortFlag) {
       sortFlag = false;
       LiEle = webIcons.getElementsByTagName("LI");
       console.log("LiEle-----", LiEle);
       for (i = 0; i < LiEle.length - 1; i++) {
          sorted = false;
        //   if ( LiEle[i].classList.contains('active'))
        console.log("LiEle[i].classList----",LiEle[i].classList);
          if (LiEle[i].classList < LiEle[i + 1].classList) {
             console.log("yes matched")
             sorted = true;
             break;
          }
       }
       if (sorted) {
          LiEle[i].parentNode.insertBefore(LiEle[i + 1], LiEle[i]);
          sortFlag = true;
       }
    }
   }, 500);

}
function calculateTotalAppSpentTimer(clb) {

    return new Promise(function (resolve, reject) {

        if (ev == 1122) {
            resolve(true);
        } else {
            resolve(false);

        }

    });
}
function convertHMS(value) {
    const sec = parseInt(value, 10); // convert value to number if it's string
    let hours = Math.floor(sec / 3600); // get hours
    let minutes = Math.floor((sec - (hours * 3600)) / 60); // get minutes
    let seconds = sec - (hours * 3600) - (minutes * 60); //  get seconds
    // add 0 if value < 10; Example: 2 => 02
    // if (hours < 10) { hours = "0" + hours; }
    // if (minutes < 10) { minutes = "0" + minutes; }
    // if (seconds < 10) { seconds = "0" + seconds; }
    let timers = {};
    return timers = {
        scs: seconds,
        mins: minutes,
        hrs: hours
    };
}
function HMSconvert(hms) {
    // var hms = '00:04:33';   // your input string
    var a = hms.split(':'); // split it at the colons

    // minutes are worth 60 seconds. Hours are worth 60 minutes.
    var seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]);
    return seconds;
}

function recursivelyDomChildren(start) {
    var nodes;
    if (start.childNodes) {
        nodes = start.childNodes;
        loopOnNodeChilds(nodes);
    }
}

function loopOnNodeChilds(nodes) {
    var node;
    for (var i = 0; i < nodes.length; i++) {
        node = nodes[i];
        console.log("node: " + i);
        console.log(node);
        console.log("--------");
        if (node.nodeType === 1 && node.tagName === 'A') {
            console.log("element:tag: " + node.tagName);
            console.log("element:getAttribute: " + node.getAttribute("href"));
        }
        if (node.childNodes) {
            recursivelyDomChildren(node);
        }
    }
}

function outputNode(node) {
    var whitespace = /^\s+$/g;
    if (node.nodeType === 1) {
        console.log("element:tag: " + node.tagName);
        console.log("element:getAttribute: " + node.getAttribute("href"));
    } else if (node.nodeType === 3) {
        //clear whitespace text nodes
        node.data = node.data.replace(whitespace, "");
        if (node.data) {
            console.log("text: " + node.data);
        }
    }
}


//**************************************IPC Renderer************************************************ */
//******************************************************************************************************* */
//**************************************IPC Renderer************************************************ */

ipc.on('GetTotalAppTimerofLogin4', (event, arg) => {
    // console.log("arg");
    // console.log(arg);
    //timer issue start here
    let returntimer = arg[0];
    let stringtime = returntimer.hrs + ":" + returntimer.mins + ":" + returntimer.scs;
    let desktop_app_time_secs = HMSconvert(stringtime);
    let login_app_time = HMSconvert(stringtime);
    // total_time_spent = total_time_spent_in_secs + desktop_app_time_secs;
    total_time_spent = login_app_time;
    let timers = convertHMS(total_time_spent);
    floatingtimer = new FloatingTimer(timers.scs, timers.mins, timers.hrs, document.getElementsByClassName('floating-timer')[0]);
    // floatingtimer.startimer();
    if (returntimer.scs != '0'){
        floatingtimer.startimer();
    }

});
ipc.on('GetActiveTabsFromMainPage4', (event, arg) => {
    console.log("_____________Active Tabs_________", arg);
    webDesktopIcons(arg[0]);
});
ipc.on('ReadDesktopTrackedData4', (event, arg) => {
    // setTimeout(
    // renderDesktopIcons(), 3000);
    (async () => {
        // const content = await fs.readJson("desktop_track_app.json");
        const content = arg[0];
        console.log("content---", content);
        // var otp = [];
        // for (const [key, value] of Object.entries(content)) {
        //     let apps_with_time = {};
        //     let totaltime = value.time;
        //     for (const [key1, value1] of Object.entries(value.pids)) {
        //         if (value1 == "active") {
        //             // apps_with_time = { "appname": key, "time": totaltime };
        //             otp.push(key);
        //             break;
        //         }
        //     }
        // }
        // console.log("otp", otp);
        renderDesktopIcons(content);
    })();

});