const mongoose =require('mongoose');

const addressSchema= {
    colony: {
        type: String
    },
    locality: {
        type: String
    },
    city: {
        type: String
    },
    pincode: {
        type: Number
    }
};

const User= mongoose.model('users', new mongoose.Schema({
    name: {
        type: String
    },
    email:{
        type: String,
        unique: true,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    contact: {
        type: Number
    },
    address:{
        type: addressSchema,
    },
    cart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'cart',
        required:true
    },
    orders:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'orders'
    }],
    isUserVerified:{
        type: Boolean,
        default: false
    }
},{  timestamps: true }
));

module.exports.User= User;