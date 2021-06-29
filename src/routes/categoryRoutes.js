const express= require('express');
const router = express.Router();
const formidable = require("formidable");
const fs = require("fs");
const { Cart } = require('../models/cart');
const {Category } = require('../models/category');
const {SubCategory} = require('../models/subCategory');
const {Product} = require('../models/product');
const authAdmin = require('../middleware/authAdmin');

router.get('/',async function(req,res){
    const categories = await Category.find().populate({
        path: "children",
        populate:{
            path:"children"
        }
    });
    res.send(categories);
});

router.get('/only',async function(req,res){
  const categories = await Category.find();
  res.send(categories);
});

router.get('/createForm',authAdmin, (req , res)=>{
    res.render('categoryForm.ejs', {
      link: "/category/creating",
      name:"",
      src:[],
    });
});

router.get('/editForm/:id',authAdmin,async(req , res)=>{
  const category = await Category.findById(req.params.id);
  if (!category) return res.status(404).send("Given ID was not found");

  const { name } = category;

  res.render('categoryForm.ejs', {
    link: `/category/editing/${req.params.id}`,
    name
  });
});

router.post('/creating',authAdmin,async (req,res)=>{
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    
    form.parse(req, (err, fields, file) => {

      file = Object.values(file);

      if (err) {
        console.log('Error is there');
        return res.status(400).json({
          error: "problem with image",
        });
      }
      
      //destructure the fields
      const { name} = fields;
  
      if (!name) {
        return res.status(400).json({
          error: "Please include all fields",
        });
      }

      let category = new Category(fields);
      
      //handle file here
      for(j = 0; j< 1; j++){
        // console.log(file[j]);
        if (file[j]) {
            if (file[j].size > 50000) {
              return res.status(400).json({
                error: "File size too big!",
              });
            }
            category.src.push({
              data: fs.readFileSync(file[j].path),
              contentType: file[j].type
            });
          }
      }
      //save to the DB
      category.save((err, category) => {
        if (err) {
          res.status(400).json({
            error: "Saving product in DB failed",
          });
        }
        // console.log('Successs');
        res.redirect('/category/createForm');
      });
    });
});

router.post('/editing/:id',authAdmin,async (req,res)=>{

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
      const { name} = fields;
  
      if (!name) {
        return res.status(400).json({
          error: "Please include all fields",
        });
      }
  
      let category = await Category.findByIdAndUpdate(req.params.id, {name}, {
        new: true,
      });
      if (!category) return res.status(404).send("Given ID was not found"); //404 is error not found
      
      //Clearing previous Images
  
      //handle file here
      for(j = 0; j< 1; j++){
        if (file[j].size !=0) {
          if (file[j].size > 50000) {
            return res.status(400).json({
              error: "File size too big!",
            });
          }
          category.src.splice( j , 1 , {
            data: fs.readFileSync(file[j].path),
            contentType: file[j].type
          });
          // console.log(category.src[j]);
      }
    }
      //save to the DB
    category.save((err, category) => {
        if (err) {
          res.status(400).json({
            error: "Saving product in DB failed",
          });
        }
        res.redirect('/');
      });
    });
});

router.post('/delete/:id',authAdmin, async (req,res)=>{
    const category= await Category.findById(req.params.id).populate('children');
    const subCategories= category.children;

    var productIds=[];
    var subCategoryIds=[];

    await subCategories.map((subCategory)=>{
        // console.log(`hi=${subCategory}`);
        subCategoryIds.push(subCategory._id);
        productIds= [...productIds,...subCategory.children]
    });

    const carts= await Cart.find();
    for await (let item of carts){  
        await Cart.findByIdAndUpdate(item._id, {
            $pull:{
                product:{
                    productId: {
                        $in: productIds
                    }
                }
            }
        }  ,{new:true});
    }
    const deleteProducts = await Product.deleteMany({
        _id:{
            $in: productIds
        }
    });
    const deleteSubCategories = await SubCategory.deleteMany({
        _id:{
            $in: subCategoryIds
        }
    });

    const removedCategory= await Category.findByIdAndDelete(req.params.id);
    
    res.redirect('/');
});

router.get('/photos/:id/:index', async (req, res, next) => {
    const category = await Category.findById( req.params.id );
  
    if (category.src[req.params.index].data) {
      res.set("Content-Type", category.src[req.params.index].contentType);
      return res.send( category.src[req.params.index].data);
    }
    res.send("not found");
});

module.exports= router;