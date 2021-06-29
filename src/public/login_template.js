const Login = (link,rand,email) => {
    console.log(link,rand,email);
    return `
      <!DOCTYPE html>
     <html style="margin: 0; padding: 0;">
     
         <head>
             <title>Hello verify</title>
         </head>
     
             <body style="margin: 0; padding: 0;">
                <br />
                <br />
                <div>Hello this is login email </div>
                <form action=${link} method="post">
                    <input type="hidden" name="email" id="email" value=${email} />
                    <input type="hidden" name="rand" id="rand" value=${rand} />
                    <button type="submit">
                        Click here to verify
                    </button>
                <form>
                <br />
                <br />
             </body>
       </html>
      `;
  };
  
  module.exports = { Login };
  