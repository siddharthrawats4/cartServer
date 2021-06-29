const express= require('express');
const router= express.Router();
const _ = require('lodash');
const formidable = require("formidable");
const fs = require("fs");
const { Cart } = require('../models/cart');
const {SubCategory}= require('../models/subCategory');
const {Product}= require('../models/product');
const authAdmin = require('../middleware/authAdmin');

router.get('/',async function(req,res){
    const products = await Product.find();
    res.send(products);
});

router.get('/search',async function(req,res){
  var regex = new RegExp(req.query.name,'i');
  console.log(regex);
  const products = await Product.find({name: regex});
  // console.log(products);
  res.send(products);
});

router.get('/filter',async function(req,res){
    var products=[];
    if(req.query.sorting)
      req.query.sorting= JSON.parse(req.query.sorting);

    if(req.query.search=="number"){
      products= await Product.aggregate([
        { 
          $sample: { 
            size : Number(req.query.size)
          } 
        } 
      ]);
    }
    else if(req.query.search=="all"){
      products = await Product.find().sort(req.query.sorting);
    }
    else{
      products = await Product.find({
        parent: {
          $in: req.query.search
        }
      }).sort(req.query.sorting);
    }

    res.send(products);
});


router.get('/:subCategoryId',authAdmin,async function(req,res){
    const products = await Product.find({parent:req.params.subCategoryId}).populate('parent');
    
    if(!products[0])
      return res.status(404).send('No Product Added');

    res.render("index.ejs", { 
        array: products,
        type:'product',
        text: null,
        link:'',
        title: `Sub-Category:${products[0].parent.name}`
    });
});

router.get('/createForm/:subCategoryId',authAdmin,(req , res)=>{
    res.render('productForm.ejs', {
      link: `/product/creating/${req.params.subCategoryId}`,
      id: null,
      name: "",
      price: "",
      description: "",
      stockQuantity: "",
      src: [],
      discount: "",
    });
});

router.get('/editForm/:id',authAdmin,async(req , res)=>{

    const product = await Product.findById(req.params.id);

    if (!product)
      return res.status(404).send("Given ID was not found");

    const { name, description, price, src, discount,parent,stockQuantity } = product;
    res.render("productForm.ejs", {
      link: `/product/editing/${parent}/${req.params.id}`,
      id: product._id,
      name,
      description,
      price,
      src,
      stockQuantity,
      discount
    });
});

router.post('/creating/:subCategoryId',authAdmin,async (req,res)=>{
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    
    form.parse(req,async (err, fields, file) => {

      file = Object.values(file);

      if (err) {
        console.log('Error is there');
        return res.status(400).json({
          error: "problem with image",
        });
      }

    const subCategory= await SubCategory.findById(req.params.subCategoryId);

    if(!subCategory)
        return res.status(404).send('Sub Category Not Found');
      
      //destructure the fields
      const { name, price, discount , description, stockQuantity} = fields;
  
      if (!name || !discount || !price || !description || !stockQuantity ) {
        return res.status(400).json({
          error: "Please include all fields",
        });
      }

      let product = new Product({...fields,parent: subCategory._id});
      //handle file here

      for(j = 0; j< 4; j++){
        console.log(file[j]);
        if (file[j]) {
            if (file[j].size > 200000) {
              return res.status(400).json({
                error: "File size too big!",
              });
            }
            product.src.push({
              data: fs.readFileSync(file[j].path),
              contentType: file[j].type
            });
          }
      }
      //save to the DB

      product.save(async(err, product) => {

        subCategory.children.push(product._id);

        await subCategory.save();

        if (err) {
          res.status(400).json({
            error: "Saving product in DB failed",
          });
        }

        res.redirect(`/product/createForm/${req.params.subCategoryId}`);
      });
    });
});

router.post('/editing/:subCategoryId/:id',authAdmin,async (req,res)=>{

  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, async (err, fields, file) => {
    file = Object.values(file);
    if (err) {
      return res.status(400).json({
        error: "problem with image",
      });
    }

    //destructure the fields
   
    const subCategory= await SubCategory.findById(req.params.subCategoryId);

    if(!subCategory)
        return res.status(404).send('Sub Category Not Found');
      
      //destructure the fields
    const { name, price, discount , description, stockQuantity} = fields;

    if (!name || !discount || !price || !description || !stockQuantity) {
      return res.status(400).json({
        error: "Please include all fields",
      });
    }

    let product = await Product.findByIdAndUpdate(req.params.id, {...fields,parent: subCategory._id}, {
      new: true,
    });
    if (!product) return res.status(404).send("Given ID was not found"); //404 is error not found
    // var file = Object.values(file);
    console.log(file);

    //handle file here
    for(j = 0; j< 4; j++){
      if (file[j].size != 0) {
        console.log('pres');
        console.log(j);
        if (file[j].size > 200000) {
          return res.status(400).json({
            error: "File size too big!",
          });
        }
        console.log(file[j].path);
        product.src[j] = {
          data: fs.readFileSync(file[j].path),
          contentType: file[j].type
        }
    }
  }
    // save to the DB
    product.save((err, product) => {
      if (err) {
        res.status(400).json({
          error: "Saving product in DB failed",
        });
      }
      res.redirect(`/product/${req.params.subCategoryId}`);
    });
  });
});

router.post('/delete/:id', authAdmin,async (req,res)=>{

    const carts= await Cart.find();

    for await (let item of carts){
      await Cart.findByIdAndUpdate(item._id, {
        $pull:{
          product:{
            productId: req.params.id
          }
        }
      }  ,{new:true});
    }

    const removedProduct= await Product.findByIdAndDelete(req.params.id);

    if(!removedProduct)
      return res.status(404).send("Given ID was not found");//404 is error not found*/

    await SubCategory.findByIdAndUpdate(removedProduct.parent, {$pull:{children: req.params.id}} ,{new:true});
    
    res.redirect(`/product/${removedProduct.parent}`);
});

router.get('/photos/:id/:index' , async (req, res, next) => {
  const product = await Product.findById( req.params.id );

  if (product.src[req.params.index].data) {
    res.set("Content-Type", product.src[req.params.index].contentType);
    return res.send( product.src[req.params.index].data);
  }
  res.send("not found");
});

module.exports= router;