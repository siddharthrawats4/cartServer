const mongoose =require('mongoose');

const Carousel = mongoose.model('carousel', new mongoose.Schema({
    photo: {
        data: Buffer,
        contentType: String
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'categories',
        required: true
    }
},{  timestamps: true }
));

module.exports.Carousel= Carousel;