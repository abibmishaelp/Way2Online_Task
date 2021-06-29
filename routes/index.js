var express = require('express');
var router = express.Router();

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.Client_Id);

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Way2Online_Task' });
});

router.get('/login', function (req, res) {
  res.render('login');
});

router.post('/login', function (req, res) {
  let token = req.body.token;
  // console.log("TOke", token);
  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.Client_Id
    });
    const payload = ticket.getPayload();
    const userid = payload['sub'];
    // console.log("UserDEtails", payload);
  }
  verify()
    .then(() => {
      res.cookie('session-token', token),
        res.send('success')
    })
    .catch(console.error);
});

router.get('/profile', verifyToken, function (req, res) {
  let user = req.user;
  res.render('dashboard', { user });
});

router.get('/logout', function (req, res) {
  res.clearCookie('session-token');
  res.redirect('/login');
});

function verifyToken(req, res, next) {
  let token = req.cookies['session-token'];
  let user = {};

  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.Client_Id
    });
    const payload = ticket.getPayload();
    const userid = payload['sub'];
    // console.log("UserDetails in Payload", payload);
    user.name = payload.name;
    user.email = payload.email;
    user.picture = payload.picture;
    // console.log("UserDetails", user);
  }
  verify()
    .then(() => {
      req.user = user;
      next();
    })
    .catch(err => {
      res.redirect("/login");
    });
}
module.exports = router;
