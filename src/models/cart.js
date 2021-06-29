const mongoose =require('mongoose');

const productsInCartSchema={
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'products'
    },
    quantity:{
        type: Number
    }
};

const Cart= mongoose.model('cart', new mongoose.Schema({
    product: {
        type: [productsInCartSchema],
        ref: 'products',
    }
},{  timestamps: true }
));

module.exports.Cart= Cart;