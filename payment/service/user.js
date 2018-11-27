const connection = require('../dao/data.js').connection;
const express = require('express');
const multer = require('multer');
const app=express();
const randomstring = require("randomstring");
const stripe = require('stripe')("sk_test_yzle9vRHc8IgcQBhonZB68re");
const stripepay = require('stripe')("pk_test_vYQRJHg0qpwGLwXLZ6jRuzIt")
const request = require('request');
const secretkey = "sk_test_yzle9vRHc8IgcQBhonZB68re"
let adduser=(name,cb)=>{
let username =name.name;
let role = "USER";
// console.log(username);
let password = randomstring.generate(
  length =10
);
let sql ="INSERT INTO `user`(`name`, `password`,`role`) VALUES (?,?,?)"
let parms =[username,password,'user']
connection.query(sql,parms,(err,result)=>{
  if(err)
  {
    cb(err)
  }
  else{
    response={
      status:200,
      message:"success",
      data:{
        userId :result.insertId,
        password :password
      }
    }
    cb(null,response)
    }

})
}
let admin = (data ,cb)=>{
  console.log(data);
  let sql ="SELECT * FROM admin WHERE name=? AND password=?"
  let params =[data.name,data.password]
  connection.query(sql,params,(err,result)=>{
    console.log(err,data);
    if(err)
    {
      cb(err)
    }else {
      if(result.length)
      {
        response={
          status:200,
          message:"success ",
          data
        }
        cb(null,response)

      }else{
        response={
          status:201,
          message:"username or password does not match ",
          data:{
          }
        }
        cb(null,response)
      }

    }

  })


}

const shop=(cb)=>{
  let sql ="SELECT * FROM shop"
  connection.query(sql,[],(err,data)=>{
    if(err){
      cb(err)
    }else {
      response={
        status:200,
        message:"success ",
        data
      }
      cb(null,response)
    }
  })

}
const addcard =(data,cb)=>{
console.log(data);
  const card = {
       number:data.card_number,
       exp_month: data.exp_month,
       exp_year: data.exp_year,
       cvc:data.cvc ,

     };
  let sql="SELECT * FROM user WHERE user_id=?"
  let parms =[data.userid]
  connection.query(sql,parms,(err,result)=>{
    if(err)
    {
      cb(err)
    }
    else{
      stripepay.tokens.create({ card }, (err, cardTokenInfo) => {
        if (err) {
             cb(err);
        } else {
          stripe.customers.create({source:cardTokenInfo.id,email:"aa@yopmail.com"},function(err,card){

             if(err) {
                 cb(err);
             }
             else
             {
               // console.log(card);
                 let cardDetails = card;
                 card_number = cardDetails.sources.data[0].last4;
                 card_type = cardDetails.sources.data[0].brand;
                 card_token = cardDetails.sources.data[0].id;
                 customerStripeId = cardDetails.id;
                 // console.log(card_token,card_number,card_type,customerStripeId,data.userid);
                 let sql = "INSERT INTO `customer_card`(`user_id`, `card_number`, `card_type`, `card_token`, `customer_stripe_id`) VALUES (?,?,?,?,?)";
                 let parms = [data.userid,card_number,card_type,card_token,customerStripeId]
                 connection.query(sql,parms,(err,result)=>{
                   if(err)
                   {
                     cb(err)
                   }else{
                     let sql1 ="UPDATE `user` SET `is_accountadded`=? WHERE user_id = ?"
                     let params =[1,data.userid]
                     connection.query(sql1,params,(err,success)=>{
                       console.log(err,success,sql1,params);
                       if(err)
                       {
                         cb(err)
                       }
                       else{
                         response={
                           status:200,
                           message:"success ",
                           data:{}
                         }
                         cb(null,response)
                       }
                     })

                   }
                 })

             }
         });


        }
         });
    }
  })


}


const wallettopup =(data,cb)=>{
    console.log(data);
    let userid = data.userid,amount= data.amount,stripecard_id=data.stripecard_id;
    let sql="SELECT * FROM `customer_card` WHERE user_id =? AND customer_stripe_id =?"
    let parms =[userid,stripecard_id]
    connection.query(sql,parms,(err,result)=>{
          if(err)
          {
            console.log(err);
              cb(err)
          }
          else{
            console.log(result);
            if(result.length)
            {
              const token = result[0].card_token;
              const customer =result[0].customer_stripe_id
              stripe.charges.create({
                    amount: amount,
                    currency: 'usd',
                    description: 'add for wallet',
                    customer: customer,
                    card:token ,
                }, function (err, charge) {
                    if(err)
                    {
                        console.log("error in srtipe");
                        cb(err)
                    }
                    else{
                        console.log("success");
                        let sql1 ="UPDATE `user` SET `wallet_amount`= wallet_amount + ? WHERE user_id = ?"
                        let params=[amount/100,userid]
                        connection.query(sql1,params,(err,result)=>{
                          if(err)
                          {
                            cb(err)
                          }
                          else{
                            console.log(result);

                            response={
                              status:200,
                              message:"success ",
                              data:{
                                amount: amount/100
                              }
                            }
                            cb(null,response)
                          }
                        })

                    }
                  });
                }
                else{
                  response={
                    status:201,
                    message:"no card added ",
                    data:{
                    }
                  }
                  cb(response)
                }
          }
        })



}

const addbank = (data,cb)=>{
  let stripe_account_code = data.stripe_account_code
  let shop_id = data.shop_id
  let dataToSend = {
    client_secret:secretkey,
    code:stripe_account_code,
    grant_type:"authorization_code"
    }
    request({
    url: "https://connect.stripe.com/oauth/token",
    method: "POST",
    json: dataToSend
    }, function (err, response, results) {

        console.log("====err",err,results);

        if (err) {
              cb(err)
        } else {
              if(results && results.stripe_user_id){
                console.log(results);
                var sql ="UPDATE shop SET stripe_account_key = ? WHERE id=?"
                var parms = [results.stripe_user_id,shop_id]
                connection.query(sql,parms,(err,result)=>{
                  if(err)
                  {
                    cb(err)
                  }
                  else{
                    stripe_account_id = results.stripe_user_id;
                    response={
                      status:200,
                      message:"success ",
                      data:{
                        stripe_account_id : stripe_account_id
                      }
                    }
                    cb(null,response)
                  }
                })

              } else {
                response={
                  status:201,
                  message:"stripe error ",
                  data:{
                  }
                }
                cb(response)

                }
        }
    });
}
const checkuser = (data,cb)=>{
  let user_id = data.userid ,password = data.password ;
  let sql ="SELECT * FROM user WHERE user_id =? AND password = ? "
  let parms = [user_id , password]

  connection.query(sql,parms,(err,result)=>{
    if(err)
    {
      cb(err)
    }
    else{
      if(result.length)
      {
        cb(null,true)
      }
      else{
        response={
          status:201,
          message:"userId or password doesnot match ",
          data:{
          }
        }
        cb(response)
      }
    }
  })
}
// wallet pay
const createbooking = (data,cb)=>{
  let userid = data.userid,quantity = data.quantity, promo = data.promo ? data.promo : "",total_price = data.total_price;
  let is_promo=promo ? 1 : 0
  let priceafterpromo = 0
  let user_wallet = 0
  /* Begin transaction */
  connection.beginTransaction(function(err) {
              if (err) {
                 cb(err)
                }
                let sql ="INSERT INTO `tb_jobs`(`quantity`, `payvia`, `is_promo`) VALUES (?,?,?)"
                let params = [quantity,1,is_promo]
                // console.log(params);
              connection.query(sql,params, function(err, result) {
                // console.log(err,result);
                  if (err) {
                    connection.rollback(function() {
                      cb(err)
                    });
                  }
                  console.log(result);
                let job_id = result.insertId;
                let amount_to_shop = total_price * .8
                if(is_promo){
                  priceafterpromo = total_price*.7
                }else{
                  priceafterpromo = total_price
                }
                sql = "INSERT INTO `tb_booking`( `quantity`, `price`, `priceafetpromo`, `user_id`, `paymentstatus`,`job_id`,`amount_to_shop`) VALUES (?,?,?,?,?,?,?)"
                params = [quantity,total_price,priceafterpromo,userid,'PENDING',job_id,amount_to_shop]
              connection.query(sql,params, function(err, result2) {
                  if (err) {
                    connection.rollback(function() {
                      cb(err)
                    });
                  }
              sql = "SELECT wallet_amount FROM user WHERE user_id=?"
              params = [userid]
              connection.query(sql,params, function(err, result) {
                  if (err) {
                    connection.rollback(function() {
                      cb(err)
                    });
                  }
                  user_wallet = result[0].wallet_amount


              sql ="UPDATE `user` SET `wallet_amount`= wallet_amount - ? WHERE user_id = ?"
              params = [priceafterpromo,userid]
              connection.query(sql,params, function(err, result) {
                  if (err) {
                    connection.rollback(function() {
                      cb(err)
                    });
                  }
              sql ="UPDATE `shop` SET `total_earning`= total_earning + ?,total_sold  = total_sold +?,in_stock=in_stock-? WHERE 1"
              params = [amount_to_shop,quantity,quantity]
              connection.query(sql,params, function(err, result) {
                  if (err) {
                    connection.rollback(function() {
                      cb(err)
                    });
                  }
              sql ="UPDATE `admin` SET `wallet_pay`= wallet_pay + ?,total_amount  = total_amount +?,total_booking = total_booking + ? WHERE 1"
              params = [priceafterpromo,priceafterpromo,quantity]
              connection.query(sql,params, function(err, result) {
                    if (err) {
                        connection.rollback(function() {
                          cb(err)
                        });
                      }

            sql = "SELECT stripe_account_key FROM shop WHERE 1"
            params = []
            connection.query(sql,params, function(err, result) {
                  if (err) {
                      connection.rollback(function() {
                        cb(err)
                      });
                    }
              let stripe_account_key = result[0].stripe_account_key
              sql ="UPDATE `tb_booking` SET `paymentstatus`=? WHERE booking_id =? "
              params = ["SUCCESS",result2.insertId]
              connection.query(sql,params, function(err, result) {
                  if (err) {
                    connection.rollback(function() {
                      cb(err)
                    });
                  }
                  if(user_wallet< priceafterpromo ){
                    console.log("111111111111111111111",user_wallet< priceafterpromo,user_wallet,priceafterpromo);
                    connection.rollback(function() {
                              response={
                                status:201,
                                message:"kindly rechage your wallet or select another payment method",
                                data:{
                                }
                              }
                                cb(response)
                              });
                          }
              stripe.transfers.create({
                  amount: Math.round(amount_to_shop * 100, 2),
                  currency: 'usd',
                  destination: stripe_account_key,
                  // destination:"acct_1DZAmSBZG49bNJiu" ,

                },function (err0r, result) {
                    console.log("********",err0r,result)
                    if (err0r) {

                      connection.rollback(function() {
                        response={
                          status:401,
                          message:"stripe error check logs ",
                          data:{
                          }
                        }
                          cb(response)
                      });

                    }else
                    {
              connection.commit(function(err) {
                if (err) {
                  connection.rollback(function() {
                    cb(err)
                  });
                }
                else{
                  cb(null,job_id)
                }
              console.log('Transaction Complete.');
              // cb(null,1)
            });
          }
          });
          });
          });
        });
        });
        });
        });
        });
        });
 });
  /* End transaction */


}
// card booking
const createbooking2 = (data,cb)=>{
  let userid = data.userid,quantity = data.quantity, promo = data.promo ? data.promo : "",card = data.card ? data.card:"",total_price = data.total_price;
  let is_promo=promo ? 1 : 0
  let priceafterpromo = 0
  let amount_to_shop = total_price * .8
  if(is_promo){
    priceafterpromo = total_price*.7
  }else{
    priceafterpromo = total_price
  }
  let sql ="SELECT customer_card.*  FROM customer_card WHERE user_id=? AND customer_stripe_id=?"
  let params = [userid,card]
  console.log(sql,params);
  connection.query(sql,params,(err,result)=>{
    if(err)
    {
      cb(err)
    }
    else{
      if(result.length)
      {
        // console.log(result);
        const token = result[0].card_token;
        const customer =result[0].customer_stripe_id
        stripe.charges.create({
              amount: priceafterpromo*100,
              currency: 'usd',
              description: 'pay for booiking',
              customer: customer,
              card:token ,
          }, (err, charge)=>{
            if(err)
            {
              console.log(err);
              response={
                status:401,
                message:"stripe check logs for details",
                data:{
                }
              }
                cb(response)
            }
            else{
              sql = "SELECT stripe_account_key FROM shop WHERE 1"
              params = []
              connection.query(sql,params, (err, result)=>{
                if(err)
                {
                  cb(err)
                }
                  let stripe_account_key = result[0].stripe_account_key
                  stripe.transfers.create({
                      amount: Math.round(amount_to_shop * 100, 2),
                      currency: 'usd',
                      destination: stripe_account_key,
                      // destination:"acct_1DZAmSBZG49bNJiu" ,

                    },function (err0r, result) {
                        console.log("********",err0r,result)
                        if (err0r) {
                          let sql2="UPDATE `admin` SET `pending_amount_tofleet`= pending_amount_tofleet + ? WHERE 1"
                          let parm =[amount_to_shop]
                          connection.query(sql2,parm,(err,result)=>{


                            response={
                              status:401,
                              message:"stripe error check logs ",
                              data:{
                              }
                            }
                              cb(response)
                              })
                        }
                        else{
                          console.log(1);
                          sql ="UPDATE `shop` SET `total_earning`= total_earning + ?,total_sold  = total_sold +?,in_stock=in_stock-? WHERE 1"
                          params = [amount_to_shop,quantity,quantity]
                          connection.query(sql,params, function(err, result) {
                              if (err) {

                                  cb(err)

                              }
                          sql ="UPDATE `admin` SET `account_pay`= account_pay + ?,total_amount  = total_amount +?,total_booking = total_booking + ? WHERE 1"
                          params = [priceafterpromo,priceafterpromo,quantity]
                          connection.query(sql,params, function(err, result) {
                                if (err) {

                                      cb(err)

                                  }
                          sql ="INSERT INTO `tb_jobs`(`quantity`, `payvia`, `is_promo`) VALUES (?,?,?)"
                          params = [quantity,1,is_promo]
                          connection.query(sql,params, function(err, result) {
                                    if (err) {

                                        cb(err)

                                    }

                          let job_id = result.insertId;

                          sql = "INSERT INTO `tb_booking`( `quantity`, `price`, `priceafetpromo`, `user_id`, `paymentstatus`,`job_id`,`amount_to_shop`) VALUES (?,?,?,?,?,?,?)"
                          params = [quantity,total_price,priceafterpromo,userid,'SUCCESS',job_id,amount_to_shop]
                          connection.query(sql,params, function(err, result2) {
                                    if (err) {
                                        cb(err)
                                    }
                                    cb(null,job_id)
                                  })
                                })
                              })
                            })
                        }
                  })

              })

            }
          })


      }else{

        response={
          status:401,
          message:"no card added kindly add a card to continue booking",
          data:{
          }
        }
          cb(response)
      }

    }
  })

}

// to check stock from shop
const checkstock =(data,cb)=>{
  let quantity = data.quantity
  let sql = "SELECT in_stock,unit_price FROM shop WHERE 1"
  connection.query(sql,[],(err,result)=>{
    if(err)
    {
      cb(err)
    }else{
      if(result[0].in_stock>=quantity){
        cb(null,result)
      }else{
        response={
          status:201,
          message:"out of stock",
          data:{
          }
        }
        cb(response)
      }
    }
  })
}
  //
  module.exports = {
    adduser :adduser,
    admin : admin,
    shop:shop,
    addcard:addcard,
    wallettopup:wallettopup,
    addbank:addbank,
    createbooking:createbooking,
    checkuser:checkuser,
    checkstock:checkstock,
    createbooking2:createbooking2
}
