const mysql = require("mysql");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "data"
});
try{

connection.connect((err) => {
  if(err) {
    console.log("Connection error");
  }
  else {
    console.log("connected to data base");
  }
});
}catch(err)
{
  if (err)
     console.log("errr");
     
}

module.exports = {
  connection : connection
};
