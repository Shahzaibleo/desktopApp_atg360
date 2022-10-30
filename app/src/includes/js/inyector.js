// inyector.js
// Get the ipcRenderer of electron
const { ipcRenderer } = require('electron');
const remote = require('electron').remote;
const Menu = remote.Menu;
const MenuItem = remote.MenuItem;
var getTitleAtUrl = require('get-title-at-url');

let clcikcedElem = "";
let mysitetitle = "";
let faviconURL = "";
var menu = new Menu();
menu.append(new MenuItem({
    label: 'Open in a new Tab', click: function (e) {
        console.log("e2-------", e)
        if (clcikcedElem.href) {

            fetch(clcikcedElem.href,{
                method: 'POST', // *GET, POST, PUT, DELETE, etc.
                mode: 'cors', // no-cors, *cors, same-origin
                cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                // credentials: 'same-origin', // include, *same-origin, omit
                headers: {
                  'Content-Type': 'application/json'
                  // 'Content-Type': 'application/x-www-form-urlencoded',
                },
                redirect: 'follow', // manual, *follow, error
                referrerPolicy: 'no-referrer'}
                )
            .then((response) => response.text())
            .then((html) => {
                console.log("open new tab html",html)
              const doc = new DOMParser().parseFromString(html, "text/html");
              const title = doc.querySelectorAll('title')[0];
              var data = {
                href: clcikcedElem.href,
                title: clcikcedElem.innerText,
                sitetitle: title.innerText,
                icUrl: faviconURL
            }
            ipcRenderer.sendToHost(JSON.stringify(data));
            });
        }
    }
}));

window.addEventListener('contextmenu', function (e) {
    e.preventDefault();
    console.log("e1--------", e);
    menu.popup(remote.getCurrentWindow());
}, false);


var getFavicon = function () {
    var favicon = undefined;
    var nodeList = document.getElementsByTagName("link");
    for (var i = 0; i < nodeList.length; i++) {
        if ((nodeList[i].getAttribute("rel") == "icon") || (nodeList[i].getAttribute("rel") == "shortcut icon")) {
            favicon = nodeList[i].getAttribute("href");
        }
    }
    return favicon;
}
const getTitle = (url) => {  
    return fetch(url)
      .then((response) => response.text())
      .then((html) => {
        const doc = new DOMParser().parseFromString(html, "text/html");
        const title = doc.querySelectorAll('title')[0];
        return title.innerText;
      });
  };
  
 
//**************************************IPC Renderer************************************************ */
//******************************************************************************************************* */
//**************************************IPC Renderer************************************************ */

ipcRenderer.on('request', function () {
    document.addEventListener('contextmenu', function (e) {
        console.log("e3--------",e)
        // e.target.removeAttribute("target");
        if (e.which == 3) {
            e = e || window.event;
            var target = e.target || e.srcElement,
                text = target.textContent || target.innerText;
            clcikcedElem = target;
        }

    }, false);
});

ipcRenderer.on('requestExternal', function () {
    document.addEventListener('contextmenu', function (e) {
        console.log("e3--------",e)
        // e.target.removeAttribute("target");
        if (e.which == 1) {
            e = e || window.event;
            var target = e.target || e.srcElement,
                text = target.textContent || target.innerText;
            clcikcedElem = target;
        }

    }, false);
});



