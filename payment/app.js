const express = require('express');
const app =express();
const bodyparser = require('body-parser');
const port=3030;
const  controller = require('./controller/user.js');
app.use(bodyparser.urlencoded({extended:true}));

const {validatebody,schemas,schemas2,schemas3,schemas4,schemas5} =require('./route/user.js')






app.post('/createbooking',validatebody(schemas.authschema),controller.createbooking);
app.post('/adduser',validatebody(schemas2.authschema),controller.adduser);
app.post('/addcard',validatebody(schemas4.authschema),controller.addcard)
app.post('/admin',validatebody(schemas3.authschema),controller.admin);
app.post('/wallettopup',validatebody(schemas5.authschema),controller.wallettopup);
app.post('/shop',controller.shop)
app.post('/addbank',controller.addbank)//add connect account of shop
/* redirect url for stripe connect
https://connect.stripe.com/express/oauth/authorize?redirect_uri=https://stripe.com/connect/default/oauth/test&client_id=ca_E1D8CZBNus6PTCS5BsnJjCsag5KaEz6W&
*/
app.listen(port);
console.log("server running at ",port);
