const jwt = require('jsonwebtoken');
const config  = require('config');

module.exports = function auth(req,res,next){
    const authcookie = req.cookies['x-auth-token-admin'] ;
    
    if(!authcookie) 
        return res.redirect('/login');
    
    jwt.verify(authcookie, config.get('jwtPrivateKey'));
    next();
}