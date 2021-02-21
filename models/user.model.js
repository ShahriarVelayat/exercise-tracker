const mongoose = require('mongoose'), uniqueValidator = require('mongoose-unique-validator');
const userSchema = new mongoose.Schema({
    username:{
        type : 'string',
        unique : true
    }
})

userSchema.plugin(uniqueValidator , {message : 'is already exist'});

module.exports = mongoose.model('USER' , userSchema);