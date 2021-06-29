var mongoose = require("mongoose");
var express= require("express");
var app = express();
var bodyParser = require("body-parser");
const config= require('config');
var cookieParser = require('cookie-parser');
const cors= require('cors');
const { Category }= require('./models/category');
const jwt  = require('jsonwebtoken');
const authAdmin = require('./middleware/authAdmin');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const cartRoutes = require('./routes/cartRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const mailRoutes = require('./routes/mailRoutes');
const subCategoryRoutes = require('./routes/subCategoryRoutes');
const orderRoutes = require('./routes/orderRoutes');
const carouselRoutes = require('./routes/carouselRoutes');
const offerRoutes = require('./routes/offerRoutes');
const pincodeRoutes = require('./routes/pincodeRoutes');

if(!config.get('jwtPrivateKey')){
    console.error('Fatal error: jwtPrivateKey is not defined.');
    process.exit(1);
}

mongoose.connect(config.get('db'),{useNewUrlParser: true,useUnifiedTopology: true})
    .then(()=> console.log(`Connected to ${config.get('db')}...`))
    .catch(err => console.log(`Could not connect to ${config.get('db')}...`,err));

mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);

app.set("view engine", "ejs");
app.set('views', './src/views');

app.use(express.static("./src/public"));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());

app.use('/product',productRoutes);
app.use('/cart',cartRoutes);
app.use('/user',userRoutes);
app.use('/category',categoryRoutes);
app.use('/subCategory',subCategoryRoutes);
app.use('/order',orderRoutes);
app.use('/carousel',carouselRoutes);
app.use('/offer', offerRoutes);
app.use('/mail', mailRoutes);
app.use('/pincode', pincodeRoutes);

app.get('/login' , async(req,res)=> {
    res.render("login.ejs", {
        email: "",
        password: ""
    });
}); 
app.post('/getLogin' , async(req,res)=>{
    console.log(req.body);
    if(req.body.password === config.get('password') && req.body.email=== config.get('email'))
    {
        const token = jwt.sign({email: req.body.email , password: req.body.password} , config.get('jwtPrivateKey'));
        console.log(token);
        res.cookie('x-auth-token-admin', token , {secure : false , expires: new Date(Number(new Date()) + 24*60*60*1000), httpOnly: false });
        res.redirect('/');
    }
    res.status(401).send('Incorrect Password');
}); 

app.get('/',authAdmin,async function(req,res){
    const categories = await Category.find().populate('subCategories');
    res.render("index.ejs", { 
        array: categories,
        type:'category',
        text: 'Add Sub Category',
        link:'subCategory',
        title: 'Categories'
    });
});

const port=process.env.PORT || 8080;
console.log(port);
const server=app.listen(port, ()=> console.log(`Listening on port ${port}...`));
var env = process.env.NODE_ENV || 'development';
console.log(env);
module.exports= server;