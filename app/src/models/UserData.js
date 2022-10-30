var dbUsage = require('./dbUsage');

var getUserDesktopApplication = function (userid, res) {
    // const conn = new mssql.ConnectionPool(dbConfig);
    // conn.connect().then(function () {
    //     const req = new mssql.Request(conn);
    dbUsage.executeQuery("SELECT * FROM atg360_userappdata as tb1 LEFT JOIN atg360_userdesktopappdata as tb2 ON tb1.desktop_id = tb2.desktop_id WHERE tb1.user_id = " + userid, function (data, err) {
        if (err) {
            res(null, err);
        } else {
            res(data, null);
        }
    });


}
var saveExeinDatabse = function (userid, appname, exepath, res) {

    dbUsage.executeQuery("SELECT desktop_id FROM atg360_userappdata as tb1 WHERE tb1.user_id = " + userid, function (data, err) {
        // console.log(data);
        if (err) {
            res(null, err);
        } else {
            // res(data, null);
            //if already data present in the atg360_userdesktopappdata against a specific 
            if (data.length > 0) {
                // check if appname already exist in the atg360_userdesktopappdata
                dbUsage.executeQuery(`SELECT app_name FROM atg360_userdesktopappdata as tb1 WHERE tb1.user_id = ${userid} and tb1.desktop_id = ${data.desk_id}`, function (data1, err) {
                    // console.log(data1);
                    if (err) {
                        res(null, err);
                    } else {
                        if (data1) {
                            // console.log(data1);
                            dbUsage.executeQuery(`UPDATE atg360_userdesktopappdata SET app_link = '${exepath}' WHERE user_id = '${userid}' and desktop_id = '${data1.desk_id}' `, function (data2, err) {
                                if (err) {
                                    res(null, err);
                                } else {
                                    res(data2, null);
                                }
                            });
                        } else {
                            // dbUsage.executeQuery("INSERT INTO atg360_userdesktopappdata(app_name,app_link) VALUES ("+data.desk_id+",") , function (data, err) {
                            dbUsage.executeQuery(`INSERT INTO atg360_userdesktopappdata(user_id,desktop_id,app_name,app_link) VALUES ('${userid}','${data.desk_id}','${appname}','${exepath}')`, function (data3, err) {
                                if (err) {
                                    res(null, err);
                                } else {
                                    res(data3, null);

                                }
                            });
                        }

                    }
                });


                // check if appname already exist in the atg360_userdesktopappdata==========END

            } else {
                //if not data present in the atg360_userdesktopappdata against a specific user
                // if (data) {
                dbUsage.executeQuery("SELECT COUNT(desktop_id)+1 as desk_id FROM atg360_userappdata as tb1 WHERE tb1.user_id = " + userid, function (data4, err) {
                    // console.log(data4);
                    if (err) {
                        res(null, err);
                    } else {
                        // dbUsage.executeQuery("INSERT INTO atg360_userdesktopappdata(app_name,app_link) VALUES ("+data.desk_id+",") , function (data, err) {
                        dbUsage.executeQuery(`INSERT INTO atg360_userappdata(user_id,desktop_id,is_normal_app) VALUES ('${userid}','${data4[0].desk_id}',1)`, function (data5, err) {
                            if (err) {
                                res(null, err);
                            } else {
                                //insert into second table
                                dbUsage.executeQuery(`INSERT INTO atg360_userdesktopappdata(user_id,desktop_id,app_name,app_link) VALUES ('${userid}','${data4[0].desk_id}','${appname}','${exepath}')`, function (data6, err) {
                                    if (err) {
                                        res(null, err);
                                    } else {
                                        res(data6, null);
        
                                    }
                                });
                                //insert into second table end
 
                            }
                        });
                    }
                });
            }
        }
    });//end of dbexecute





}//end of function

module.exports = {
    getUserDesktopApplication,
    saveExeinDatabse
}