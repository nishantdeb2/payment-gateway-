const joi = require('joi');
module.exports={
  validatebody:(schemas)=>{
    return(req,res,next)=>{
    const result=joi.validate(req.body,schemas);
    if(result.error)
    {
      return res.status(400).json(result.error);
    }
    if(!req.value)
    {
      req.value={};
    }
    req.value ['body']=result.value;
    next();
  }
  },

schemas:{
  authschema:joi.object().keys({
    userid:joi.string(),
    password:joi.string(),
    quantity:joi.number(),
    promo:joi.string().optional(true),
    payvia:joi.number(),
    card :joi.string().optional()
  })
},
schemas2:{
  authschema:joi.object().keys({
    name:joi.string(),
  })
},
schemas3:{
  authschema:joi.object().keys({
    name:joi.string(),
    password:joi.string(),
  })
},
schemas4:{
  authschema:joi.object().keys({
    userid:joi.number(),
    card_number: joi.string(),
    exp_month: joi.number(),
    exp_year:joi.number(),
    cvc:joi.number(),
  })
},
schemas5:{
  authschema:joi.object().keys({
    userid:joi.string(),
    stripecard_id: joi.string(),
    amount: joi.number()
  })
}

}
