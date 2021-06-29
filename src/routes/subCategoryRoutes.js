const express= require('express');
const router= express.Router();
const {SubCategory , validate} = require('../models/subCategory');
const {Category } = require('../models/category');
const {Product } = require('../models/product');
const {Cart } = require('../models/cart');
const authAdmin = require('../middleware/authAdmin');

router.get('/', async function(req,res){
    const subCategory= await SubCategory.find();
    res.send(subCategory);
});

router.get('/:categoryId',authAdmin ,async function(req,res){
    const subCategories = await SubCategory.find({parent:req.params.categoryId}).populate('parent');
    if(!subCategories[0])
        return res.status(404).send('No Sub-Category Added');
    res.render("index.ejs", { 
        array: subCategories,
        type:'subCategory',
        text: 'Add Product',
        link:'product',
        title: `Category:${subCategories[0].parent.name}`
    });
});

router.get('/createForm/:categoryId' ,authAdmin,async(req , res)=>{
    res.render('subCategoryForm.ejs', {
        link: `/subCategory/creating/${req.params.categoryId}`,
        name:"",
        src:[]
    });
});
  
router.get('/editForm/:id',authAdmin,async(req , res)=>{
    const subCategory = await SubCategory.findById(req.params.id);
    
    if (!subCategory)
        return res.status(404).send("Given ID was not found");
  
    const {name,category}= subCategory;
    res.render('subCategoryForm.ejs', {
        link: `/subCategory/editing/${category}/${req.params.id}`,
        name
    });
});
  
router.post('/creating/:categoryId',authAdmin,async (req,res)=>{
   console.log(req.body);
    const { error } = validate(req.body) ;
    if(error) return res.status(400).send(error.details[0].message) ;
    
    const category= await Category.findById(req.params.categoryId);
    if(!category)
        return res.status(404).send('Category Not Found');

    const subCategory = new SubCategory({
        name: req.body.name,
        parent: req.params.categoryId
    });
    category.children.push(subCategory._id);

    await category.save();
    await subCategory.save();

    res.redirect(`/subCategory/createForm/${req.params.categoryId}`);
});

router.post('/editing/:categoryId/:id',authAdmin,async (req,res)=>{
    const { error } = validate(req.body) ;
    if(error) return res.status(400).send(error.details[0].message) ;

    let subCategory = await SubCategory.findByIdAndUpdate(req.params.id, req.body,{new:true});
    await subCategory.save();
    res.redirect(`/subCategory/${req.params.categoryId}`);
});

router.post('/delete/:id', authAdmin ,async (req,res)=>{
    const subCategory = await SubCategory.findById(req.params.id);

    if(!subCategory)
        return res.status(404).send("Given ID was not found");//404 is error not found

    const carts= await Cart.find();
    for await (let item of carts){  
        await Cart.findByIdAndUpdate(item._id, {
            $pull:{
                product:{
                    productId: {
                        $in: subCategory.children
                    }
                }
            }
        }  ,{new:true});
    }
    const deleteProducts = await Product.deleteMany({
        _id:{
            $in:subCategory.children
        }
    });

    const removedSubCategory= await SubCategory.findByIdAndDelete(req.params.id);
    await Category.findByIdAndUpdate(removedSubCategory.parent, {
        $pull:{
            children: req.params.id
        }
    } ,{new:true});

    res.redirect(`/subCategory/${removedSubCategory.parent}`);
});

module.exports= router;
