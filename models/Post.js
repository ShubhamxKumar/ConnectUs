const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    post:{
        type:String,
        required:true,
    },
    date:{
        type:Date,
        default:Date.now(),
        required:true,
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'users',
    },
    caption:{
        type: String,
    },
    comments:[
        {
            user:{
                type:mongoose.Schema.Types.ObjectId,
                ref:'users'
            },
            comment:{
                type:String,
                required:true,
            }
        }
    ]
});

module.exports = mongoose.model('post', PostSchema);