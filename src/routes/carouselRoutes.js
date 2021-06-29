const express= require('express');
const router= express.Router();
const {Carousel} = require('../models/carousel');
const { Category } = require('../models/category');
const formidable = require("formidable");
const fs = require("fs");
const authAdmin = require('../middleware/authAdmin');

router.get('/',async (req, res) => {
    const carousels = await Carousel.find();
    res.send(carousels);
});

router.get('/show',authAdmin ,async (req, res) => {
  console.log('HI');
    const carousels = await Carousel.find().populate('category');
    console.log(carousels);
    res.render('showCarousel.ejs', {
        type: "carousel",
        title: "Carousel Images",
        photo: "",
        label: "Category : ",
        array: carousels,
    });
});

router.get('/createForm' ,authAdmin , async(req,res)=>{
    let categories = await Category.find();
    res.render('carouselForm.ejs', {
        link: '/carousel/newImg',
        photo: "",
        label: "Choose Category",
        title: "Add Carousel Image",
        array: categories,
    });
});

router.post('/newImg',authAdmin, async (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
  
    form.parse(req, async (err, fields, file) => {
      if (err) {
        return res.status(400).json({
          error: "problem with image",
        });
      }

      //destructure the fields
      const { category } = fields;

      if (!category) {
        return res.status(400).json({
          error: "Please include all fields",
        });
      }
      let carousel = new Carousel(fields);
      //handle file here
      if (file.photo) {
        if (file.photo.size > 1000000) {
          return res.status(400).json({
            error: "File size too big!",
          });
        }
        carousel.photo.data = fs.readFileSync(file.photo.path);
        carousel.photo.contentType = file.photo.type;
      }
      //save to the DB
      carousel.save((err, carousel) => {
        if (err) {
          res.status(400).json({
            error: "Saving product in DB failed",
          });
        }
        res.redirect("/carousel/show");
      });
    });
});

router.post('/delete/:id',authAdmin,async (req,res)=>{
    
    const remove= await Carousel.deleteOne({_id:req.params.id});
    if(!remove)
        return res.status(404).send("Given ID was not found");//404 is error not found
    
    res.redirect('/carousel/show');
});

router.get('/photos/:id' , async (req, res, next) => {
  const carousel = await Carousel.findById( req.params.id );
  if (carousel.photo.data) {
    res.set("Content-Type", carousel.photo.contentType);
    return res.send( carousel.photo.data);
  }
  res.send("not found");
});

module.exports= router;
