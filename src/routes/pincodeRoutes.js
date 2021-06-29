const express= require('express');
const router= express.Router();
const {Pincode}= require('../models/pincode');
const authAdmin = require('../middleware/authAdmin');

router.get('/', authAdmin,async function(req,res){
    const pincodes= await Pincode.find();
    res.send(pincodes);
});

router.get('/:id', async function(req,res){
    const pincode= await Pincode.findById(req.params.id);
    res.send(pincode);
});

router.post('/',async (req,res)=>{

    if(req.body.pin.length!=6)
        return res.status(404).send('Pincode is not of valid length');

    const pincode = new Pincode(req.body);

    await pincode.save();

    res.send(pincode);
});

router.put('/editing/:id', authAdmin,async (req,res)=>{

    let pincode = await Pincode.findByIdAndUpdate(req.params.id, req.body,{new:true});

    console.log(pincode);

    res.end();
});

router.post('/delete/:id', authAdmin ,async (req,res)=>{

    const pincode = await Pincode.findById(req.params.id);

    if(!pincode)
        return res.status(404).send("Given ID was not found");//404 is error not found
  

    res.redirect('/');
});

module.exports= router;