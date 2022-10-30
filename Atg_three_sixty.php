<?php

defined('BASEPATH') or exit('No direct script access allowed');
require APPPATH . 'third_party/REST_Controller.php';
// print_r(APP_BASE_URL);
class Atg_three_sixty extends CI_Controller
{

    public function __construct()

    {

        parent::__construct();
        $this->load->model('user_autologin');
        $this->load->helper(array('form', 'url'));
        $this->load->model('Tasks_automate_model');
        $this->load->model('projects_model');
        $this->load->model('User_project_model');
    }

    public function login_user_desktop_withoutencryption()
    {

        $email = $this->input->post('email');
        $password = $this->input->post('password');
        $staff = $this->input->post('staff');

        if ((!empty($email)) and (!empty($password))) {
            $table = db_prefix() . 'contacts';
            $_id = 'id';
            if ($staff == true) {
                $table = db_prefix() . 'staff';
                $_id = 'staffid';
            }
            $this->db->where('email', $email);
            $user = $this->db->get($table)->row();
            if ($user) {
                // Email is okey lets check the password now
                if (!app_hasher()->CheckPassword($password, $user->password)) {

                    // Password failed, return
                    echo json_encode("failed");
                } else {

                    echo json_encode("success");
                }
            } else {
                echo json_encode("failed");
            }
        } else {
            echo json_encode("Empty Fields");
        }
    }
    public function login_user_desktop()
    {
        $encryptionMethod = 'AES-256-CBC';
        $secret = "MY32ATGSEcretPasswordandinitVect"; //must be 32 char length
        $iv = "MY32ATGSEcretPas";
        $encemail = $this->input->post('email');
        $encpassword = $this->input->post('password');
        $staff = $this->input->post('staff');

        $email = openssl_decrypt($encemail, $encryptionMethod, $secret, 0, $iv);
        $password = openssl_decrypt($encpassword, $encryptionMethod, $secret, 0, $iv);
        // echo json_encode($encemail);
        // echo json_encode("===");
        // echo json_encode($email);
        // echo json_encode("===");
        // echo json_encode($password );exit;
        if ((!empty($email)) and (!empty($password))) {
            $table = db_prefix() . 'contacts';
            $_id = 'id';
            if ($staff == true) {
                $table = db_prefix() . 'staff';
                $_id = 'staffid';
            }
            $this->db->where('email', $email);
            $user = $this->db->get($table)->row();
            if ($user) {
                // Email is okey lets check the password now
                if (!app_hasher()->CheckPassword($password, $user->password)) {

                    // Password failed, return
                    echo json_encode("failed");
                } else {

                    echo json_encode("success");
                }
            } else {
                echo json_encode("failed");
            }
        } else {
            echo json_encode("Empty Fields");
        }
    }

    public function get_user_id_from_param()
    {
        $encryptionMethod = 'AES-256-CBC';
        $secret = "MY32ATGSEcretPasswordandinitVect"; //must be 32 char length
        $iv = "MY32ATGSEcretPas";
        $encemail = $this->input->post('email');
        $encpassword = $this->input->post('password');
        $staff = $this->input->post('staff');

        $email = openssl_decrypt($encemail, $encryptionMethod, $secret, 0, $iv);
        $password = openssl_decrypt($encpassword, $encryptionMethod, $secret, 0, $iv);

        if ((!empty($email)) and (!empty($password))) {
            $table = db_prefix() . 'contacts';
            $_id = 'id';
            if ($staff == true) {
                $table = db_prefix() . 'staff';
                $_id = 'staffid';
            }
            $this->db->where('email', $email);
            $user = $this->db->query("CALL atg360_get_user_id('" . $email . "','" . $password . "')")->row();;

            if ($user) {
                // Email is okey lets check the password now
                if (!app_hasher()->CheckPassword($password, $user->password)) {

                    // Password failed, return
                    echo json_encode("failed1");
                } else {

                    echo json_encode($user);
                }
            } else {

                echo json_encode("failed2");
            }
        } else {
            echo json_encode("Empty Fields");
        }
    }
    public function app_data_log()
    {
        $encryptionMethod = 'AES-256-CBC';
        $secret = "MY32ATGSEcretPasswordandinitVect"; //must be 32 char length
        $iv = "MY32ATGSEcretPas";
        // $encemail = $this->input->post('apps_data');
        // $encpassword = $this->input->post('password');
        $app_data =  $this->input->post('apps_data');
        $users_id =  $this->input->post('users_id');
        $task_id =  $this->input->post('task_id');
        
        $sessionId =  $this->input->post('sessionId');
        

        echo json_encode($app_data);   
        echo json_encode($task_id);
        echo json_encode($sessionId);
        
        $today = date("Y/m/d");
        echo $today;
        $app_data1 = json_decode($app_data);
        try {
            $query = "SELECT * FROM atg_360_apps_track_log WHERE task_id = $task_id && user_id = $users_id && date = '$today' && sessionId = 0 ";
            // $query = "SELECT * FROM atg_360_apps_track_log ";
            $result =  $this->db->query($query);

            $app_list = array();
            $appsName = array();
            echo "------------";
            $countRow = 0;
            /* fetch associative array */
            foreach ($result->result_array() as $row)
            {
   
                $app_list[] = array('app_name' => $row['app_name'],'spent_time' => $row['spent_time']);

                $appsName[] = $row['app_name'];
                $countRow = $countRow + 1;
            }
            echo "------------";
            echo count($app_list);
            echo "------------";
            echo $countRow;
            $appsNewArray = array_column($app_list, 'app_name','spent_time');
            print_r($appsNewArray);
            print_r($appsName);

            var_dump($app_list);
            if($countRow == 0) {
                foreach ($app_data1 as $x => $val) {
                    // get current time
                    echo $x;
                    $startTime = gmdate('H:i:s', strtotime('+5 hours'));
                    echo json_encode($startTime);

                    echo "insert query empty record";
                    $insert_query = "INSERT INTO atg_360_apps_track_log(app_name, spent_time, date, start_time, task_id, user_id, sessionId) VALUES ('$x', $val,'$today','$startTime',$task_id, $users_id, $sessionId)";
                    echo $insert_query;
                    $result = $this->db->query($insert_query);
                    echo $result;
                }
            }
            else 
            {
                foreach ($app_data1 as $x => $val) {
                    if(in_array($x, $appsName)) {
                            echo "updated query";
                            $update_query = "UPDATE atg_360_apps_track_log SET spent_time = $val, sessionId = $sessionId WHERE task_id = $task_id && user_id = $users_id && app_name = '$x' && date = '$today' && sessionId = 0 ";
                            echo $update_query;
                            $result = $this->db->query($update_query);
                        // foreach ($appsNewArray as $key => $value) {
                        //      if($value == $x) {
                        //         echo $key;
                        //         echo "updated query";
                        //         $update_query = "UPDATE atg_360_apps_track_log SET spent_time = $val, sessionValue = $sessionId WHERE project_id = $project_id && task_id = $task_id && user_id = $users_id && app_name = '$x' && date = '$today' && sessionValue = 0 ";
                        //         echo $update_query;
                        //         $result = $this->db->query($update_query);
                        //      } 
                        // }
                        // $app_list = array();
                        // $appsNewArray = array();
                    } 
                    else 
                    {
                        // get current time
                        $startTime = gmdate('H:i:s', strtotime('+5 hours'));
                        echo json_encode($startTime);
                        
                        $insert_query = "INSERT INTO atg_360_apps_track_log(app_name, spent_time, date, start_time, task_id, user_id, sessionId) VALUES ('$x', $val,'$today','$startTime',$task_id, $users_id, $sessionId)";
                        echo $insert_query;
                        $result = $this->db->query($insert_query);
                        echo $result;
                        echo "insert query";
                    }
                }
            }

        } catch (\Throwable $th) {
            echo $th;
            exit;
        }
    }

    public function get_projects_tasks($staff_id)
    {
        $pinned_projects = $this->User_project_model->get_projects_from_staff($staff_id);
        $projects_list = array();
        foreach ($pinned_projects as $pp) {
            $data = array();
            $data['id'] = $pp['id'];
            $data['name'] = $pp['name'];
            $data['tasks'] = $this->get_task_list($pp['id']);
            $projects_list[] = $data;
        }
        echo json_encode($projects_list);
    }
    public function get_projects_tasks2($staff_id)
    {
        $pinned_projects = $this->User_project_model->get_projects_from_staff2($staff_id);
        $projects_list = array();
        foreach ($pinned_projects as $pp) {
            $data = array();
            $data['id'] = $pp['id'];
            $data['name'] = $pp['name'];
            $data['url'] = $pp['url'];
            $data['icon'] = $pp['icon'];
            $data['appType'] = $pp['appType'];
            $data['tasks'] = $this->get_task_list($pp['id']);
            $projects_list[] = $data;
        }
        echo json_encode($projects_list);
    }

    function get_task_list($project_id)
    {
        $all_tasks = $this->Tasks_automate_model->get_user_tasks_assign($project_id);
        $tasks_list = array();
        for ($n = 0; $n < count($all_tasks); $n++) {
            $data = array();
            $data['id'] = $all_tasks[$n]['id'];
            $data['name'] = $all_tasks[$n]['name'];
            $tasks_list[] = $data;
        }
        return $tasks_list;
    }

    // public function post_hours_log()
    // {
    //     die($this->input->post('task_id'));
    //     // $project_id = $this->input->post('project_id');
    //     $task_id = $this->input->post('task_id');
    //     // $description = $this->input->post('description');
    //     $hourlog = $this->input->post('hourlog');
    //     $staff_id = $this->input->post('staff_id');

    //     $finalDbArray = array();
    //     $finalDbArray['timesheet_duration'] = $hourlog;
    //     $finalDbArray['timesheet_task_id']  = $task_id;
    //     $finalDbArray['timesheet_staff_id'] = $staff_id;
    //     $finalDbArray['note'] = "noteTXTss";  

    // //    $result = $this->tasks_model->timesheet($finalDbArray);   
    //     $result = true;

    //     if($result){
    //         echo json_encode($finalDbArray);
    //     }

    // }
    public function varify_admin_pass()
    {
        $adminPassword = '1122';
        $apass = $this->input->post('adminpassword');
        if ($adminPassword == $apass) {
            echo json_encode(true);
        }
    }

    public function index_post()
    {
        // die("sdfnkjdsjkfdsnjfndskjdfnndjknjk");
        // $project_id = $this->input->post('project_id');
        $task_id = $this->input->post('task_id');
        // $description = $this->input->post('description');
        $hourlog = $this->input->post('hourlog');
        $staff_id = $this->input->post('staff_id');

        $finalDbArray = array();
        $finalDbArray['timesheet_duration'] = $hourlog;
        $finalDbArray['timesheet_task_id']  = $task_id;
        $finalDbArray['timesheet_staff_id'] = $staff_id;
        $finalDbArray['note'] = "noteTXTss";

        //    $result = $this->tasks_model->timesheet($finalDbArray);   
        $result = true;

        if ($result) {
            echo json_encode($finalDbArray);
        }
    }
}
