const route = require('express').Router();
const {check, validationResult} = require('express-validator');
const bcrypt = require('bcryptjs');
const User = require("../../models/User");
const config = require('config');
const jwt = require('jsonwebtoken');
const auth = require('../../middleware/auth');

//for creating users
route.post('/createuser', [
    check("name", "User must have a name.").notEmpty(),
    check("email", "User must have a email.").isEmail(),
    check("password", "User must have a proper password.").notEmpty(),
    check("username", "User must have a username.").notEmpty(),
], async (req,res) => {
    const err = validationResult(req);
    if(!err.isEmpty()){
        return res.status(400).json({success:false, data:err.array()});
    }
    const {email, password, name, username} = req.body;
    try{
        let user = await User.findOne({email, username});
        if(user)
        {
            return res.status(400).json({success:false, data:["User already exists."]});
        }
        let un = username;
        if(username == "")
        {
            let pos = email.lastIndexOf('@');
            un = email.slice(0, pos);
        }
        user = new User({email:email, name:name, password:password, username:username});
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();
        const payload = {
            user :{
                id: user.id,
            }
        }
        jwt.sign(payload, config.get('jwtsecret'), (err, token)=>{
            if(err){
                throw err;
            }
            return res.status(200).json({success:true, data:["User Created Successfully"], token: token});
        });
    }catch(err){
        console.log(err.message);
        res.status(500).json({success:false, data:["We have a server error"]});
    }
});


//for logging in users.
route.post('/login', [
    check("email", "Please provide us with a proper email.").isEmail(),
    check("password", "Please provide us with a proper password").isLength(6),
], async (req, res) => {
    const error = validationResult(req);
    if(!error.isEmpty())
    {
        return res.status(400).json({success:false, data:error.array()});
    }
    const {email, password} = req.body;
    try{
        const user = await User.findOne({email});
        if(!user)
        {
            return res.status(400).json({success:false, data:["User with the following credentials does not exists."]});
        }
        const match = await bcrypt.compare(password, user.password);
        if(!match)
        {
            return res.status(400).json({success:false, data:["Incorrect Password."]});
        }
        const payload = {
            user:{
                id:user.id,
            }
        }
        jwt.sign(payload, config.get('jwtsecret'), (err, token) => {
            if(err)
            {
                throw error;
            }
            return res.status(200).json({success:true, data:["User logged in successfully."], token:token,});
        })
    }catch(err){
        console.log(err.message);
        res.status(500).json({success:false, data:["We have a server error"]});
    }
});

// get the logged in user
route.get('/getUser', auth, async(req, res)=>{
    try{
        const user = await User.findById(req.user.id).select('-password');
        res.status(200).json({success:true, data:["User Found."], user:user});
    }catch(err)
    {
        console.log(err.message);
        res.status(500).json({success:false, data:["We have a server error"]});
    }
})

exports = module.exports = {route}