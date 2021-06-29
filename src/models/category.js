const Joi = require('joi');
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: true 
    },
    src:[{
        data: Buffer,
        contentType: String
    }],
    children: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'subCategories'
    }]
});

const Category = mongoose.model('categories' , categorySchema);

function validateCategory(input)
{
    const schema = Joi.object({
        name: Joi.string().required(),
    });
    return result = schema.validate(input);
}

module.exports.Category = Category ;
module.exports.validate = validateCategory ;