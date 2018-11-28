const async = require('async');

const memServices = require('../service/user.js');

const createbooking = (req,res)=>{
  let body = req.body;
  let unit_price = 0;
// console.log(req.body)
  async.series([
    (cb)=>{

      memServices.checkuser(body,(err,result)=>{
        if(err){
          cb(err)
        }
        else {
          cb(null,result);
        }
      });
    },
    (cb)=>{

      memServices.checkstock(body,(err,result)=>{
        if(err){
          cb(err)
        }
        else {
          unit_price = result[0].unit_price
          body.total_price = unit_price * body.quantity
          cb(null,result);
        }
      });
    },
    (cb)=>{
      if(parseInt(body.payvia)){
        // console.log("wallet pay",body);
        memServices.createbooking(body,(err,result)=>{//booking for wallet pay
          if(err){
            cb(err)
          }
          else {
            cb(null,result);
          }
        });
      }else{
        // console.log("card pay",body);
        memServices.createbooking2(body,(err,result)=>{// booking for card pay
          if(err){
            cb(err)
          }
          else {
            cb(null,result);
          }
        });
      }

    }


  ],
  (error,response)=>{
    if(error){
      console.log("eeeee",error);
      res.send(error)
    }
    else {
    console.log(response);
    responseToSend={
      status:200,
      message:"success ",
      data:{
        job_id : response[2]
      }
    }
    res.send(responseToSend);
    }
  }
)
}
const adduser=(req,res)=>{
  console.log("req",req.body);
  let name = req.body;
  memServices.adduser(name,(err,result)=>{
    if(err){
      res.send(err)
    }
    else {
      res.send(result);
    }
  });

}
const admin=(req,res)=>{
  console.log("req admin",req.body);
  let data = req.body
  memServices.admin(data,(err,result)=>{
    if(err){
      res.send(err)
    }
    else {
      res.send(result);
    }
  });

}
const shop=(req,res)=>{
  console.log("req shop");

  memServices.shop((err,result)=>{
    if(err){
      res.send(err)
    }
    else {
      res.send(result);
    }
  });

}

const addcard=(req,res)=>{
  console.log("req addcard",req.body);

  memServices.addcard(req.body,(err,result)=>{
    if(err){
      res.send(err)
    }
    else {
      res.send(result);
    }
  });

}

const wallettopup=(req,res)=>{
  console.log("req wallettopup",req.body);

  memServices.wallettopup(req.body,(err,result)=>{
    if(err){
      res.send(err)
    }
    else {
      res.send(result);
    }
  });

}
const addbank=(req,res)=>{
  console.log("req addbank",req.body);

  memServices.addbank(req.body,(err,result)=>{
    if(err){
      res.send(err)
    }
    else {
      res.send(result);
    }
  });

}

const showcard = (req,res)=>{
  console.log("show card of userId");
  let userid = req.body.userid;
  memServices.showcard(userid,(err,result)=>{
    if(err){
      res.send(err)
    }
    else {
      res.send(result);
    }
  });
}

module.exports = {

  adduser:adduser,
  admin:admin,
  shop:shop,
  addcard:addcard,
  wallettopup:wallettopup,
  addbank:addbank,
  createbooking:createbooking,
  showcard:showcard
}
