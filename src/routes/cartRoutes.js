const express= require('express');
const router= express.Router();
const  _ = require('lodash');
const {Cart}= require('../models/cart');
const { Product } = require('../models/product');
const { User } = require('../models/user');

router.get('/', async function(req,res){
    const carts= await Cart.find();
    res.send(carts);
});

router.get('/:id', async function(req,res){
    console.log(req.params.id);

    if(req.params.id=="null")
        return res.send(null);

    console.log(req.params.id);

    var arr=[];
    const cart= await Cart.find({_id:req.params.id});
    for await (let item of cart[0].product){
        const pro= await Product.find({_id:item.productId});
        const {_id,description,discount,name,src,price,stockQuantity}= pro[0];
        if(stockQuantity!=0)
            arr.push({quantity:item.quantity,_id,discount,name,src,price,description,stockQuantity});
    }
    console.log(Object.values(arr));
    res.send(arr);
});

router.post('/',async (req,res)=>{

    const cart = new Cart(req.body);
    await cart.save();

    res.send(cart._id);
});

router.post('/:id',async (req,res)=>{

    let cart= await Cart.find({_id:req.params.id});

    cart[0].product.push(req.body);

    console.log(cart[0].product);

    const ob= {
        product: cart[0].product
    }

    cart = await Cart.findByIdAndUpdate(req.params.id, ob,{new:true});
    
    await cart.save();

    const pro = await Product.find({_id:req.body.productId});
    const {_id,discount,description,name,src,price,stockQuantity}= pro[0];

    res.send({quantity:req.body.quantity,_id,discount,name,src,price,description,stockQuantity});
});

router.patch('/:id/:productId/:quantity',async (req,res)=>{

    let cart = await Cart.findByIdAndUpdate(req.params.id, req.body,{new:true});

    const pro= await Product.find({_id:req.params.productId});
    const {_id,discount,description,name,src,price,stockQuantity}= pro[0];
    
    res.send({quantity:req.params.quantity,_id,discount,name,src,price,description,stockQuantity});
});

router.delete('/:id/:productId', async (req,res)=>{
    
    let cart= await Cart.find({_id:req.params.id});
    console.log(req.params.productId);
    console.log(cart[0].product);
    await _.remove(cart[0].product,(item)=> {
        return item.productId==req.params.productId;
    });

    console.log(cart[0].product);

    const ob= {
        product: cart[0].product
    }

    cart = await Cart.findByIdAndUpdate(req.params.id, ob,{new:true});

    if(!cart)
        return res.status(404).send("Given ID was not found");//404 is error not found
    res.end();
});

module.exports= router;