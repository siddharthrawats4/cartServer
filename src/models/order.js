const mongoose = require("mongoose");
const AutoIncrement = require('mongoose-sequence')(mongoose);

const productSchema=  {
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'products'
    },
    quantity:{
        type: Number
    },
    status: {
      type: String,
      default: "Processing",
      enum: ["Processing","Shipped","Recieved","Delivered","Returning", "Refunded", "Request Return","Cancelled"]
    },
    expectedDate: {
      type: Date,
      default: Date.now()+4*24*60*60*1000
    },
    deliveredDate:{
        type: Date
    },
};

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

const OrderSchema = new mongoose.Schema({
    orderNo:{
        type: Number
    },
    nameOfUser: {
        type: String
    },
    emailOfUser:{
        type: String
    },
    contactOfUser: {
        type: Number
    },
    addressOfUser: {
        type: addressSchema,
    },
    products: {
        type: [productSchema]
    },
    typeOfPayment:{
        type: String,
        required: true
    },
    amount: { 
        type: Number, 
        required: true
    }
  },{  timestamps: true }
);

OrderSchema.plugin(AutoIncrement, {id: 'order_counter',inc_field: 'orderNo',start_seq:100001});

const Order = mongoose.model("orders", OrderSchema);

module.exports.Order = Order