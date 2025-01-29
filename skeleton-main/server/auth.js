const { OAuth2Client } = require("google-auth-library");
const User = require("./models/user");
const socketManager = require("./server-socket");

// create a new OAuth client used to verify google sign-in
// Use localhost Client ID
const CLIENT_ID = "389341642898-aifd0k55aa53c4g1uvvh6krv1480956r.apps.googleusercontent.com";
const client = new OAuth2Client(CLIENT_ID);

// accepts a login token from the frontend, and verifies that it's legit
function verify(token) {
  return client
    .verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    })
    .then((ticket) => ticket.getPayload());
}

// gets user from DB, or makes a new account if it doesn't exist yet
function getOrCreateUser(user) {
  // the "sub" field means "subject", which is a unique identifier for each user
  return User.findOne({ googleid: user.sub }).then((existingUser) => {
    if (existingUser) {
      // Update email if it has changed
      if (existingUser.email !== user.email) {
        existingUser.email = user.email;
        return existingUser.save();
      }
      return existingUser;
    }

    const newUser = new User({
      name: user.name,
      googleid: user.sub,
      email: user.email,
    });

    return newUser.save();
  });
}

function login(req, res) {
  verify(req.body.token)
    .then((user) => getOrCreateUser(user))
    .then((user) => {
      // persist user in the session
      req.session.user = user;
      res.send(user);
    })
    .catch((err) => {
      console.log(`Failed to log in: ${err}`);
      res.status(401).send({ err });
    });
}

function logout(req, res) {
  req.session.user = null;
  res.send({});
}

function populateCurrentUser(req, res, next) {
  // simply populate "req.user" for convenience
  req.user = req.session.user;
  next();
}

function ensureLoggedIn(req, res, next) {
  if (!req.user) {
    return res.status(401).send({ err: "not logged in" });
  }

  next();
}

/*
router.get("/login/callback", function (req, res) {
  // ... existing code ...
  res.redirect("/home"); // Change this to redirect to home after login
});
*/

module.exports = {
  login,
  logout,
  populateCurrentUser,
  ensureLoggedIn,
};
