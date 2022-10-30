const { electron } = require('electron')
const axios = require('axios');
const https = require('https');
const ipc = require('electron').ipcRenderer;
const path = require("path");
const sessions = require('electron-json-config')
const remote = require('electron').remote;
var task_window = remote.getCurrentWindow();
const AppTimers = require("./render_module/AppTimers");
let task_dialog_timer;
var allProjectsTasks;
var taskStop = 1;
let isTimeLogStarted = false;

document.addEventListener('DOMContentLoaded', (event) => {
    ipc.invoke('getCacheValues', "hello world").then((result) => {
        ipc.on('getCurrentTaskCasheValue', (event, arg1, arg2, arg3, Proj_tasks) => {
          const currentTask = arg1;
          const currentProject = arg2;
          const userStaffID = arg3;
            if (currentTask) {
                document.getElementsByClassName('tasklabel')[0].textContent = "Finish Your Task";
                document.getElementsByClassName('finishbtn')[0].style = "";
                document.getElementsByClassName('upperdiv')[0].style = "";
            }
            else {
                document.getElementsByClassName('startbtn')[0].style = "";
            }
            let sID = atob(userStaffID);
            allProjectsTasks = Proj_tasks;
            let res = Proj_tasks;
            var select = document.getElementsByClassName('projects')[0];
            for (var i = 0; i < res.length; i++) {
                if((res[i].appType == 'web' || res[i].appType == 'desktop') && res[i].url !== null && res[i]["url"].length > 1) {
                    select.options[select.options.length] = new Option(res[i].name, res[i].id);
                }
            }
            if (currentTask) {
                onProjectChange(atob(currentProject));
                document.getElementsByClassName('projects')[0].value = atob(currentProject);
                document.getElementsByClassName('projects')[0].setAttribute("disabled", "disabled");

                document.getElementsByClassName('tasks')[0].value = atob(currentTask);
                document.getElementsByClassName('tasks')[0].setAttribute("disabled", "disabled");
                ipc.invoke('GetTimerForDialog');
                ipc.on('GetTimerForDialog4', (event, arg) => {
                    console.log("arg=======");
                    console.log(arg);
                    console.log("arg=======end===");
                    let returntimer = arg[0];
                    hours = returntimer.hrs;
                    minutes = returntimer.mins;
                    // seconds = returntimer.scs;
                    seconds = Math.round(returntimer.scs + 0.50);
                    task_dialog_timer = new AppTimers(seconds, minutes, hours, document.getElementsByClassName('tasktimer')[0]);
                    task_dialog_timer.startimer();

                });

            }
        });
    })
    // if (sessions.get("currentTask")) {
    //     document.getElementsByClassName('tasklabel')[0].textContent = "Finish Your Task";
    //     document.getElementsByClassName('finishbtn')[0].style = "";
    // }
    // else {
    //     document.getElementsByClassName('startbtn')[0].style = "";
    // }
    // let sID = atob(sessions.get("userStaffID"));
    // console.log("sID---",sID);
    // const agent = new https.Agent({  
    //     rejectUnauthorized: false
    //    });
    // axios.defaults.headers.post['Content-Type'] = 'application/json';
    // axios.get('https://crm.atgtravel.com/admin/api/atg_three_sixty/get_projects_tasks/' + sID,{ httpsAgent: agent })
    //     .then((response) => {
    //         allProjectsTasks = response.data;
    //         console.log("allProjectsTasks-----", allProjectsTasks);
    //         let res = response.data;
    //         var select = document.getElementsByClassName('projects')[0];
    //         for (var i = 0; i < res.length; i++) {
    //             select.options[select.options.length] = new Option(res[i].name, res[i].id);
    //         }
    //         if (sessions.get("currentTask")) {
    //             console.log("------------", sessions.get("currentTask"));
    //             onProjectChange(atob(sessions.get("currentProject")));
    //             document.getElementsByClassName('projects')[0].value = atob(sessions.get("currentProject"));
    //             document.getElementsByClassName('projects')[0].setAttribute("disabled", "disabled");

    //             document.getElementsByClassName('tasks')[0].value = atob(sessions.get("currentTask"));
    //             document.getElementsByClassName('tasks')[0].setAttribute("disabled", "disabled");
    //             ipc.invoke('GetTimerForDialog');
    //             ipc.on('GetTimerForDialog4', (event, arg) => {
    //                 console.log("arg=======");
    //                 console.log(arg);
    //                 console.log("arg=======end===");
    //                 let returntimer = arg[0];
    //                 hours = returntimer.hrs;
    //                 minutes = returntimer.mins;
    //                 seconds = returntimer.scs;
    //                 task_dialog_timer = new AppTimers(seconds, minutes, hours, document.getElementsByClassName('tasktimer')[0]);
    //                 task_dialog_timer.startimer();

    //             });

    //         }

    //     })
    //     .catch((error) => {
    //         console.error(error);
    //     });

});
// setTimeout(()=> {
//     document.getElementsByClassName("clickTaskButton")[0].click();
//     console.log("auto clicked")
// },1000);

document.getElementsByClassName("projects")[0].addEventListener("change", function (e) {
    let project = e.target.value;
    onProjectChange(project);

});
document.getElementsByClassName("start")[0].addEventListener("click", function (e) {
    let projects = document.getElementsByClassName("projects")[0].value;
    let tasks = document.getElementsByClassName("tasks")[0].value;
    // let description = document.getElementsByClassName("description")[0].value;
    // var projectName = jQuery(".projects option:selected").text();

    if (projects == null || projects == "" || projects == "None") {
        alert("Project is not selected");
        return false;
    } else if (tasks == null || tasks == "" || tasks == "None") {
        alert("Task is not selected");
        return false;

    } else { 
        let task_id = tasks;
        // sessions.set('isTaskTimerRunning', "1");
        let project_task_cache = {};
        project_task_cache.currentTask = btoa(tasks);
        project_task_cache.currentProject = btoa(projects);
        project_task_cache.isTaskTimerRunning = 1;
        
       isTimeLogStarted = true;
        console.log('project_task_cache---', project_task_cache);
        ipc.invoke('StartTimerOnMainPage', isTimeLogStarted, task_id).then(res=>{
            ipc.invoke('SetCacheValues',project_task_cache).then(res=>{
                // setTimeout(function (){
                //     task_window.close();
                //   }, 1000); 
                task_window.close();
            });

        });
   
        // sessions.set("currentTask", btoa(tasks)); console.log(tasks);
        // sessions.set('currentProject', btoa(projects));
    }

});

function hasBlankSpaces(str){
    return  str.match(/^\s+$/) !== null;
}

document.getElementsByClassName("finish")[0].addEventListener("click", function (e) {
    var elementExists = document.getElementsByClassName("upperdiv")[0];
    if (elementExists == null) {
        // var d1 = document.querySelector('.inner-form-scroll');
        // d1.insertAdjacentHTML('beforebegin', '<div class="alert alert-danger alert-dismissible fade show" id="description_alert" style="display: none; background-color: #fc0729; opacity: 1; color: #fff; max-width: 500px; margin: 20px auto 20px; text-align: center;"> <strong>Error! </strong>Description are required. </div>');

        // let elementdiv = document.getElementsByClassName('inner-form-scroll')[0];
        // let upperDiv = document.createElement("DIV");
        // upperDiv.classList.add('row', 'justify-content-between', 'text-left', 'upperdiv');
        // // let secDiv = document.createElement("DIV");
        // secDiv.classList.add('form-group', 'col-sm-12', 'flex-column', 'd-flex');
        // let labelDiv = document.createElement("label");
        // labelDiv.classList.add("form-control-label");
        // labelDiv.innerHTML = 'What have you achieved? <span class="text-danger">*</span>';
        // let textareaDiv = document.createElement("textarea");
        // textareaDiv.classList.add("description");
        // textareaDiv.setAttribute('rows', 3);
        // textareaDiv.setAttribute('type', "text");
        // textareaDiv.setAttribute('name', "description");
        // textareaDiv.setAttribute('placeholder', "Description");
        // secDiv.appendChild(labelDiv);
        // secDiv.appendChild(textareaDiv);
        // upperDiv.appendChild(secDiv);
        // elementdiv.appendChild(upperDiv);
        // elementdiv.insertBefore(upperDiv, elementdiv.children[2]);

    } else {
        let projects = document.getElementsByClassName("projects")[0].value;
        let tasks = document.getElementsByClassName("tasks")[0].value;
        let description = document.getElementsByClassName("description")[0].value;
        console.log("description_____", description);

        if (projects == null || projects == "" || projects == "None") {
            alert("Project is not selected");
            return false;
        } else if (tasks == null || tasks == "" || tasks == "None") {
            alert("Task is not selected");
            return false;

        } else if (description == null || description == "" || description == "None" || hasBlankSpaces(description) || description.length < 2) {
            // alert("Description are required ");
            document.getElementById("description_alert").style.display = "block";
            return false;
        } else {
            task_dialog_timer.stopCurrenttimer();
            ipc.invoke('timerlog');

        }
    }

});

function onProjectChange(project) {
    let tasks = allProjectsTasks.find(o => o.id === project).tasks;
    var select = document.getElementsByClassName('tasks')[0];
    //remove the options
    var length = select.options.length;
    for (i = length - 1; i > 0; i--) {
        select.options[i] = null;
    }
    for (var i = 0; i < tasks.length; i++) {
        select.options[select.options.length] = new Option(tasks[i].name, tasks[i].id);
    }

}
document.getElementsByClassName('close')[0].addEventListener('click', function (e) {
    var taskDialog = remote.getCurrentWindow();
    e.preventDefault();
    ipc.invoke('runningTaskContinue');
        // clearTimeout(t);
        taskDialog.close();

})
//**************************************IPC Renderer************************************************ */
//******************************************************************************************************* */
//**************************************IPC Renderer************************************************ */

ipc.on('timerlog4', (event, arg) => { 
    let projects = document.getElementsByClassName("projects")[0].value;
    let tasks = document.getElementsByClassName("tasks")[0].value;
    let description = document.getElementsByClassName("description")[0].value;

    let mnt = arg.mins / 60;
    let hr = arg.hrs + mnt;

    const params = new URLSearchParams();
    params.append('task_id', tasks);
    params.append('description', description);
    params.append('hourlog', hr);
    params.append('staff', 5);
    const agent = new https.Agent({  
        rejectUnauthorized: false
       });

    // axios.defaults.headers.post['Content-Type'] = 'application/json';
    // axios.post('https://crm.atgtravel.com/admin/api/atg_three_sixty/post_hours_log/', params,{ httpsAgent: agent })
    //     .then((response) => {



    //     })
    //     .catch((error) => {


    //     });
    sessions.delete('currentTask');
    sessions.delete('currentProject');
    sessions.delete('isTaskTimerRunning');
    let project_task_cache = {};
    project_task_cache.currentTask = tasks;
    project_task_cache.currentProject = projects;
    ipc.invoke('DeleteCacheValues', project_task_cache).then(res => {
    });

    console.log("aa tCloseEW chak");
    console.log(sessions.get("tCloseEW"));
    console.log(sessions.get('tCloseEW'));
    
    if (sessions.get('tCloseEW') == 1) {
        ipc.invoke('CloseWindowAndApplication');

    } else if (sessions.get('tCloseEW') == 0 ) {
        ipc.invoke('logoutmainpage');
    }
    task_window.close();


})

// Close Description alert button
$(".close-alert").click(function(){
  $(".alert.alert-danger ").hide();
});