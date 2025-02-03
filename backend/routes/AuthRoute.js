const router = require('express').Router();

const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const {resetTokenExists, expireJwtToken} = require('../services/AuthService');
const {randomUUID} = require('crypto');
const {OAuth2Client} = require('google-auth-library');

const env = require('dotenv').config().parsed;
const isAuth = require('../middleware/isAuth.js');
const {registerValidation, loginValidation, forgotPasswordValidation, resetPasswordValidation} = require('../validation/UserValidation');
const {generateResetToken} = require('../services/IdService');
const ResetToken = require('../models/ResetToken');

const {loginLimiter, registerLimiter, forgotPasswordLimiter} = require('../ratelimiting/Ratelimiter');
const oAuth2Client = new OAuth2Client(env.GOOGLE_OAUTH_CLIENT_ID, env.GOOGLE_OAUTH_CLIENT_SECRET, env.GOOGLE_OAUTH_CALLBACK_URL);

//Register route
router.post('/register', registerLimiter, async (req, res, next) => {
  const { error } = registerValidation.validate(req.body);
  if(error) return res.status(400).send(error.details[0].message);

  const userExists = await User.findOne({email: req.body.email});

  if(userExists) return res.status(400).send('Account with that email already exists');

  if(req.body.password != req.body.confirmPassword) return res.status(400).send('Passwords do not match');

  const hashedPassword = await bcrypt.hash(req.body.password, 12);

  emailLower = req.body.email.toLowerCase();
  const uuid = randomUUID().toString();
  const newUser = new User({
    uuid: uuid,
    name: req.body.name,
    email: emailLower,
    password: hashedPassword
  });

  try{
    const savedUser = await newUser.save();
    logger.info(`Successfully registered with UUID ${savedUser.uuid}`);
    
    res.send(`Successfully registered with UUID ${savedUser.uuid}`); 
  } catch (err){
    next(err)
  }

});

//Login route
router.post('/login', loginLimiter, async (req, res) => {
  try {  
    const {error} = loginValidation.validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const user = await User.findOne({email: req.body.email.toLowerCase()});

    if(!user) return res.status(400).send('Invalid email or password');

    if(user.provider != 'local') return res.status(400).send('Invalid email or password');

    const validPassword = await bcrypt.compare(req.body.password, user.password);

    if(!validPassword) return res.status(400).send('Invalid email or password');
    const token = jwt.sign({uuid: user.uuid, email: user.email}, env.JWT_SECRET, {expiresIn: env.JWT_EXPIRES_IN});

    user.activeToken = token;
    await user.save();
  
    res.header('auth-token', token).send({token: token});
  } catch (err) {
    next(err);
  }
});

//Google OAuth route
router.get('/google', async (req, res) => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['email', 'profile']
  });
  res.redirect(authUrl);
});

//Google OAuth callback route
router.get('/google/callback', async (req, res) => {
  try {
    const code = req.query.code;
    const {tokens} = await oAuth2Client.getToken(code);

    oAuth2Client.setCredentials(tokens);

    const {data} = await oAuth2Client.request({
      url: 'https://www.googleapis.com/oauth2/v2/userinfo'
    });
  
    const user = await User.findOne({email: data.email});
  
    if(user){
      const token = jwt.sign({uuid: user.uuid, email: user.email}, env.JWT_SECRET, {expiresIn: env.JWT_EXPIRES_IN});
      user.activeToken = token;
      await user.save();

      const encodedToken = encodeURIComponent(token);
      const redirctUrl = env.GOOGLE_OAUTH_REDIRECT_URL + `?st=success&s=${encodedToken}`;
      return res.redirect(redirctUrl);
    } 
  
    const newUser = new User({
      name: data.name,
      email: data.email,
      provider: 'google',
      providerId: data.id,
      profileIcon: data.picture
    });
  
    const savedUser = await newUser.save();
    const token = jwt.sign({uuid: savedUser.uuid, email: savedUser.email}, env.JWT_SECRET, {expiresIn: env.JWT_EXPIRES_IN});
    savedUser.activeToken = token;
    await savedUser.save();

    const encodedToken = encodeURIComponent(token);
    const redirctUrl = env.GOOGLE_OAUTH_REDIRECT_URL + `?st=success&s=${encodedToken}`;
    return res.redirect(redirctUrl)
  } catch (err) {
    logger.error(err);
    const redirctUrl = env.GOOGLE_OAUTH_REDIRECT_URL + `?st=success&s=${encodedToken}`;
    res.redirect(redirctUrl);
  }

});

//Reset password route
router.post('/forgotPassword', forgotPasswordLimiter, async (req, res) => {
  const {error} = forgotPasswordValidation.validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findOne({email: req.body.email.toLowerCase()}).lean();
  if (!user) return res.status(404).send('User with that email not found');

  try{
    const token = await generateResetToken();

    const resetToken = new ResetToken({
      userId: user.uuid,
      token: token,
      expireIn: () => Date.now() + (env.RESET_PASSWORD_TTL * 1000)
    });   
    
    await resetToken.save();
    const reqIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;

    const emailResult = await sendMail(
      user.email,
      `${env.APP_NAME} Password Reset Request`,
      "${env.APP_NAME} Password Reset Request\n",
      `<h2>${env.APP_NAME} Password Reset Request</h2>
        <h3>Requested by IP: ${reqIP}</h3>
        <h4>Link to reset your password: <a href="${env.RESET_PASSWORD_URL}/${token}">Reset Password</a></h4>`
    )

    //Send email
    if(!emailResult.success){
        logger.error(`Error sending reset password email to ${user.email}`);
        res.status(500).send('Error occoured while sending reset password email');
    } else {
        logger.info(`Reset password email sent to ${user.email}`);
        res.status(200).send('Check your email for instructions on resetting your password');
    }
  } catch (err){
    next(err);
  }
});

//Route to handle the reset token
router.get('/resetPassword/:token', async (req, res) => {
  const { token } = req.params;
  try {
    const resetToken = await resetTokenExists(token);
    if(!resetToken) return res.status(400).send('Invalid or expired token');
  
    const currentTime = Date.now();
    if(currentTime > resetToken.expireIn) return res.status(400).send('Invalid or expired token');
  
    res.send('<form method="post" action="/auth/resetPassword"><input type="password" name="password" required><input type="submit" value="Reset Password"></form>');
  } catch (err) {
    next(err);
  }
});

//Route to update the password 
router.post('/resetPassword', async (req, res) => {
  const {error} = resetPasswordValidation.validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  try {
    const resetToken = await resetTokenExists(req.body.token);
    if(!resetToken) return res.status(400).send('Invalid or expired token');

    const user = await User.findOne({uuid: resetToken.userId});
    if(!user) return res.status(400).send('User not found');

    const hashedPassword = await bcrypt.hash(password, 12);
    user.password = hashedPassword;
    await user.save();

    await ResetToken.deleteOne({token: token});
    
    logger.info(`Password reset successfully with token: ${resetToken}`);

    res.send('Password reset successfully');
  } catch (err) { 
    next(err);
  }
});

//Logout route
router.get('/logout', isAuth, async (req, res, next) => {
  try {
    const token = req.header('auth-token');
    const user = await User.findOne({uuid: req.user.uuid});
    
    //Expire the token
    await expireJwtToken(user, token);
    
    res.send('Successfully logged out');
  } catch (err) {
    next(err);
  }
});

module.exports = router;