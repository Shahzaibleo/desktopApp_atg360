var connection = require('../../../db');

var executeQuery = function (sql, res) {
    // const conn = new mssql.ConnectionPool(dbConfig);
    // conn.connect().then(function () {
    //     const req = new mssql.Request(conn);
    console.log(sql);
    connection.query(sql, function (err, data) {
        if (err) {
            res(null, err);
        } else {
            res(data, null);
        }
    });
}

module.exports = {
    executeQuery
}