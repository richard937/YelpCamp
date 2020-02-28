var express = require("express");
var router = express.Router(),
    passport = require('passport'),
    User = require('../models/user');

//root route
router.get('/', (req, res) => {
    res.render('landing');
});

//===========
//AUTH ROUTES
//===========
//show sign up form
router.get('/register', (req, res) => {
    res.render("register");
});
//haldle sign up
router.post('/register', (req, res) => {
    var newUser = new User({ username: req.body.username });
    User.register(newUser, req.body.password, (err, user) => {
        if (err) {
            req.flash("error", err.message);
            return res.render('register');
        }
        passport.authenticate("local")(req, res, () => {
            req.flash("success", "Welcome to YelpCamp! " + user.username);
            res.redirect('/campgrounds');
        });
    });
});

//login route
//render login form
router.get('/login', (req, res) => {
    res.render("login", { message: req.flash("error") });
});
//login logic
//app.post('/login',middleware, callback)
router.post('/login', passport.authenticate("local", {
    successRedirect: "/campgrounds",
    failureRedirect: "/login",
}), (req, res) => {
});

//logout logic
router.get('/logout', (req, res) => {
    req.logOut();
    req.flash("success", "logged you out");
    res.redirect('/campgrounds');
})
//middleware
function isLoggedin(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

module.exports = router;