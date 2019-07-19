var mysql = require('mysql');
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'robin9421',
  password: 'robin9421',
  database: 'RGS'
});
connection.connect(function (err) {
  if (!err) {
    console.log("Database is connected ...");
  } else {
    console.log("Error connecting database ...");
  }
});

module.exports = connection;