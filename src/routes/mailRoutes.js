const express= require('express');
const router= express.Router();
const mailer = require("nodemailer");
const {Login}= require('../public/login_template');
const {User} = require('../models/user');
const config = require('config');

const getEmailData = (to,template,rand , host) => {
    let data = null;

    switch (template) {
        case "verify":
            const link = `http://${host}/mail/success` ;
            data = {
                from: config.get('company_email'),
                to,
                subject: `Hello subject verify ${to}`,
                html: Login(link,rand,to)
            }
            break;

        case "success":
            data = {
                from: config.get('company_email'),
                to,
                subject: `Hello success ${to}`,
                html: "Success"
            }
            break;
        default:
            data;
    }
    return data;
}

const sendEmail = async(to,type,rand,host) => {

    const smtpTransport = mailer.createTransport({
        service: "gmail",
        auth: {
            user: config.get('company_email'),
            pass: config.get('company_password')
        }
    })

    const mail = getEmailData(to,type,rand,host);

    console.log(mail);
    try {
        await smtpTransport.sendMail(mail);
        console.log( "email sent successfully");
    } 
    catch(error){
        console.log('Error');
        console.log(error);
        smtpTransport.close();
    }
}

router.post("/verify", async(req, res) => {
    const rand = Math.floor((Math.random() * 100) + 54);
    const host = req.get('host') ;
    await sendEmail(req.body.email, "verify" , rand ,host);
    res.end();
});

router.post('/success',async(req,res)=>{
    const host = req.get('host') ;

    if((`${req.protocol}://${host}` != `http://${host}`))
        return res.send("<h3>Request is from unknown source</h3>");

    console.log("Domain is matched. Information is from Authentic email");
   
    if(!req.body.rand){
        console.log("email is not verified");
        return res.end();
    }

    const user= await User.findOneAndUpdate({email: req.body.email}, {
        isUserVerified: true
    },{new:true}).select('-password');

    console.log(user);
    
    await sendEmail(req.body.email,"success",0,null);
    res.cookie('user', user , {secure : false , expires: new Date(Number(new Date()) + 24*60*60*1000), httpOnly: false }).redirect(`${req.protocol}://localhost:3000`);
});

module.exports = router ;