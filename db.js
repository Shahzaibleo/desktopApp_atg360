var mysql = require('mysql');
var connection = mysql.createConnection({
  host: 'crm.atgtravel.com',
  user: 'crm_live',
  password: '1=dlh4E7S)05h]=BecZ.=hhL',
  database: 'crm_live',
  port : 21,
  encrypt: true,
});
// connection.connect();

try {
  connection.connect(function (err) {
    console.log('Connected')
    if (err) {
      // console.log(err);
      // throw err;
    }
  });
} catch (error) {
  console.log("Database connection error ", error);
}

module.exports = connection;
