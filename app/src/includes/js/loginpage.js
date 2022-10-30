const { electron } = require('electron')
const axios = require('axios');
const ipc = require('electron').ipcRenderer;
const path = require("path");
var cryptos_ = require("./render_module/encs_decr");
const https = require('https');
const shell = require('electron').shell;
let rememberMe = false;
var pjson = require('../../../package.json');

var get = document.getElementById('submit');

get.addEventListener('click', () => {
  if (validateform()) {
    validate_User();
  }
});

function rememberMeFun() {
  var checkBox = document.getElementById("rememberId");
  if (checkBox.checked == true){
    rememberMe = true;
  } else {
    rememberMe = false;
  }
}

function forgotPasswordFun() {
  shell.openExternal("https://crm.atgtravel.com/admin/authentication/forgot_password")
}

function validate_User() {

  let username = document.getElementById("username").value;
  let password = document.getElementById("password").value;
  var encryptedusename = cryptos_.encrypt(username);
  var encryptedPassword = cryptos_.encrypt(password);
  const params = new URLSearchParams();
  params.append('email', encryptedusename);
  params.append('password', encryptedPassword);
  params.append('staff', "1");
  var data = {
    'email': username,
    'password': password,
    'staff': "1",
    'rememberMe': rememberMe,
  }
  const agent = new https.Agent({  
    rejectUnauthorized: false
   });
  axios.defaults.headers.post['Content-Type'] = 'application/json';
  axios.post('https://crm.atgtravel.com/admin/api/atg_three_sixty/login_user_desktop', params,{ httpsAgent: agent })
    .then((response) => {

      // document.getElementsByClassName("loadimg")[0].style.display = "none";
    //  let testResponse = "success";
    //   if (testResponse == "success") {
      if (response.data == "success") {
        document.getElementById("msg").innerHTML = '<div class="alert alert-success alert-dismissible fade show">' +
          '<strong>Success!</strong> Authentication Success. Loading...' +
          '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
          '</div>';
          
        // loader code start
        setTimeout(loader, 700);
        function loader() {
          jQuery(".main-login-page").css('display','none');
          jQuery(".preload").css('display','block');
          jQuery(".preload").fadeOut(4000, function() {
            jQuery(".main-login-page").fadeIn(0);        
          });
        }
        // loader code end

        ipc.invoke('loadmainpage', data);

      // } else if (testResponse == "failed") {
      } else if (response.data == "failed") {
        document.getElementById("msg").innerHTML = '<div class="alert alert-danger alert-dismissible fade show">' +
          '<strong>Error! </strong>You are not a valid User.' +
          '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
          '</div>';
        // ipc.invoke('loadmainpage', data)
      }
    })
    .catch((error) => {

      // start store error exception logs in the db
      let errorsList = {}
      errorsList.apiUrl = 'https://crm.atgtravel.com/admin/api/atg_three_sixty/login_user_desktop/';
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

      if (error.message == "Network Error") {
        document.getElementById("msg").innerHTML = '<div class="alert alert-danger alert-dismissible fade show">' +
          '<strong>Error! </strong>You do not have internet connection.' +
          '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
          '</div>';
      }else{
        console.log(error);
      }
    });
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
// end error logs function store logs in the db `

function validateform() {
  let username = document.getElementById("username").value;
  let password = document.getElementById("password").value;

  if (username == null || password == "") {
      document.getElementById("msg").innerHTML = '<div class="alert alert-danger alert-dismissible fade show">' +
      '<strong>Error! </strong>Username or Password cannot be Empty.' +
      '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
      '</div>';
    // alert("Username or Password cannot be Empty");
    return false;
  }
  return true;

}
function ValidateEmail(username) {
  if (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(username)) {
    return true;
  } else {
    return false;
  }

}


//to solve the build error
// function encrypt(plain_text) {
//   var encryptor = cryptomodule.createCipheriv(encryptionMethod, secret, iv);
//   return encryptor.update(plain_text, 'utf8', 'base64') + encryptor.final('base64');

// };
//to solve the build error

//**************************************IPC Renderer************************************************ */
//******************************************************************************************************* */
//**************************************IPC Renderer************************************************ */
