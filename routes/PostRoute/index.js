const route = require('express').Router();
const Post = require('../../models/Post');
const User = require('../../models/User');
const auth = require('../../middleware/auth');
const {check, validationResult} = require('express-validator');

route.get('/allPosts', auth, async(req, res) => {
    try{
        const posts = await Post.find();
        res.status(200).json({success:true, posts: posts});
    }catch(err){console.log(err.message);
        res.status(500).json({success:false, data:["We have a server error"]});}
});

//get all posts of a logged in user
route.get('/getCurrentUserPosts', auth, async (req, res)=>{
    try{
        const posts = await Post.find({user:req.user.id});
        res.status(200).json({success:true, data:posts});
    }catch(err){
        111
    }
});

// get all post of a particular user
route.get('/getUserPosts', auth, async (req, res) => {
    try{
        const user = await User.findOne({username:req.body.username});
        if(!user)
        {
            return res.status(400).json({success:false, data:["The Particular User does not exists."]});
        }
        const posts = await Post.find({user:user.id});
        res.status(200).json({success:true, data:posts});
    }
    catch(err){
        console.log(err.message);
        res.status(500).json({success:false, data:["We have a server error"]});
    }
});

// Add a post 
route.get('/addPost',auth, [
    check("posturl", "Please have a post.").notEmpty(),
], async (req, res) => {
    const error = validationResult(req);
    if(!error.isEmpty())
    {
        return res.status(400).json({success:false, data:error.array()});
    }
    const {posturl, caption} = req.body;
    try{
        const post = new Post({post:posturl, comment:[], user:req.user.id, caption:caption});
        await post.save();
        return res.status(200).json({success:true, data:["Post created successfully"], post:post});
    }catch(err){
        console.log(err.message);
        res.status(500).json({success:false, data:["We have a server error"]});
    }
});

//comment on a particular post
route.post('/comment', auth, [check("comment", "Please enter a comment").notEmpty()], async (req, res) => {
    const error = validationResult(req);
    if(!error.isEmpty())
    {
        return res.status(400).json({success:false, data:error.array()});
    }
    const {comment, postid} = req.body;
    try{
        const posts = await Post.findById(postid);
        const com = {
            comment: comment, 
            user: req.user.id,
        }
        posts.comments.unshift(com);
        await posts.save();
        return res.status(200).json({success:true, data:["Comment registered."]});
    }
    catch(err){
        console.log(err.message);
        res.status(500).json({success:false, data:["We have a server error"]});
    }
});

exports = module.exports = {route}