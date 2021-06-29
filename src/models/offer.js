const mongoose =require('mongoose');

const Offer = mongoose.model('offers', new mongoose.Schema({
    photo:[{
        src:{
            data: Buffer,
            contentType: String
        },
        subCategory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'subCategories'
        }
    }],
},{  timestamps: true }
));

module.exports.Offer = Offer;