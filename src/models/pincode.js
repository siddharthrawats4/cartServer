const mongoose =require('mongoose');

const Pincode = mongoose.model('pincodes', new mongoose.Schema({
    pin: {
        type: Number,
        required: true
    }
},{  timestamps: true }
));

module.exports.Pincode= Pincode;