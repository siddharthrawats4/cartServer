const Joi = require('joi');
const mongoose = require('mongoose');

const SubCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: true
    },
    children: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'products'
    }],
    parent:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'categories'
    }
});

const SubCategory = mongoose.model('subCategories',SubCategorySchema);

function validateSubCategory(input)
{
    const schema = Joi.object({
        name: Joi.string().required()
    });
    return result = schema.validate(input);
}

module.exports.SubCategory = SubCategory ;
module.exports.validate= validateSubCategory ;
