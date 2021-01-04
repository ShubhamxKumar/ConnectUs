const jwt  = require('jsonwebtoken');
const config = require('config');

module.exports = async (req, res, next) => {
    const token = req.header('x-auth-token');
    if(!token)
    {
        return res.status(400).json({success:false, data:["Invalid auth token."]});
    }
    try{
        const result = await jwt.verify(token, config.get('jwtsecret'));
        req.user = result.user;
        next();
    }catch(err){
        return res.status(401).json({success:false, data:["Invalid auth token."]});
    }

}