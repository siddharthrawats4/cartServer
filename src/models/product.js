const mongoose =require('mongoose');

const Product = mongoose.model('products', new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    src:[{
        data: Buffer,
        contentType: String
    }],
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    discount: {
        type: String,
        required: true
    },
    stockQuantity:{
        type: Number,
        required:true
    },
    parent:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'subCategories'
    }
},{  timestamps: true }
));

module.exports.Product= Product;