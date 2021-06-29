const express= require('express');
const router= express.Router();
const {Order}= require('../models/order');
const {Product } = require('../models/product');
const { User } = require('../models/user');
const { Cart } = require('../models/cart');

router.get('/', async function(req,res){
    const orders = await Order.find().sort({createdAt:1}).populate('products.product');
    res.render("orders", { orders: orders });
});

router.get('/:email', async function(req,res){

    if(req.params.id=="null")
        return res.send(null);

    const orders = await Order.find({emailOfUser: req.params.email}).sort({orderNo:-1}).populate(['products.product']);
    res.send(orders);
});

router.get('/products/:id',  async (req, res) => {
    const order = await Order.findById(req.params.id).populate('products.product');
    const products= order.products;
    const enumValues= Order.schema.path('products.status').enumValues;
    console.log(enumValues);
    res.render("orderDetails", { orderId: order._id, products: products,enumValues: enumValues});
});

router.post('/searchByOrder',  async (req, res) => {
    const order = await Order.find({ orderNo : req.body.orderNo });
    res.render("orders", { orders: order });
});


router.post('/cart/:userId', async function(req,res){

    const order = new Order(req.body);   
    await order.save();

    const user= await User.findByIdAndUpdate(req.params.userId, {
        $push:{
            orders: order._id
        }
    }  ,{new:true});

    const cart= await Cart.findByIdAndUpdate(user.cart, {
        product: []
    }  ,{new:true});

    for await (let item of order.products){
        console.log(item.quantity);
        const product= await Product.findByIdAndUpdate(item.product, {
            $inc: {
                stockQuantity : -Number(item.quantity)
            }
        }  ,{new:true});
    }

    const orderInfo= await Order.findById(order._id).populate(['products.product'])
    res.send(orderInfo);
});

router.post('/buyNow/:userId', async function(req,res){

    console.log(req.body);
    const order = new Order(req.body);   
    await order.save();

    const user= await User.findByIdAndUpdate(req.params.userId, {
        $push:{
            orders: order._id
        }
    }  ,{new:true});

    for await (let item of order.products){
        console.log(item.quantity);
        const product= await Product.findByIdAndUpdate(item.product, {
            $inc: {
                stockQuantity : -Number(item.quantity)
            }
        }  ,{new:true});
    }

    const orderInfo= await Order.findById(order._id).populate(['products.product'])

    res.send(orderInfo);
});

router.post('/:type/:productId/:id',  async (req, res) => {

    let order;

    if(req.body.status=='Delivered')
        order = await Order.findByIdAndUpdate(req.params.id, {
            $set: {
                "products.$[filter].deliveredDate": Date.now(),
                "products.$[filter].status": req.body.status  
            } 
        },{ 
            arrayFilters: [{ "filter.product": req.params.productId }],
            new: true
        }).populate('products.product');
    else
        order = await Order.findByIdAndUpdate(req.params.id, {
            $set: {
                "products.$[filter].status": req.body.status 
            } 
        },{ 
            arrayFilters: [{ "filter.product": req.params.productId }],
            new: true
        }).populate('products.product');

    if(req.params.type=='admin')
        return res.redirect(`/order/products/${req.params.id}`);

    return res.send(order);
});

module.exports= router;