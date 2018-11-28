const express = require('express');
const app =express();
const bodyparser = require('body-parser');
const port=3030;
const  controller = require('./controller/user.js');
app.use(bodyparser.urlencoded({extended:true}));

const {validatebody,schemas,schemas2,schemas3,schemas4,schemas5} =require('./route/user.js')





app.post('/showcards',controller.showcard);
app.post('/createbooking',validatebody(schemas.authschema),controller.createbooking);//payvia 1 for wallet_pay and 0 for card pay
app.post('/adduser',validatebody(schemas2.authschema),controller.adduser);// add user and get a unique id and password for futher api
app.post('/addcard',validatebody(schemas4.authschema),controller.addcard)//user add card
app.post('/admin',validatebody(schemas3.authschema),controller.admin);// view data of admin
app.post('/wallettopup',validatebody(schemas5.authschema),controller.wallettopup);//add amount to wallet of user
app.post('/shop',controller.shop)// view shop data
app.post('/addbank',controller.addbank)//add connect account of shop
/* redirect url for stripe connect
https://connect.stripe.com/express/oauth/authorize?redirect_uri=https://stripe.com/connect/default/oauth/test&client_id=ca_E1D8CZBNus6PTCS5BsnJjCsag5KaEz6W&
*/
app.listen(port);
console.log("server running at ",port);
