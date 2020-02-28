var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    mongoose = require("mongoose"),
    Campground = require("./models/campground"),
    Comment = require("./models/comment"),
    LocalStrategy = require('passport-local'),
    methodOverride = require('method-override'),
    passport = require('passport'),
    User = require('./models/user'),
    passportLocalMongoose = require('passport-local-mongoose'),
    seedDB = require("./seeds"),
    flash = require("connect-flash");


var commentRoutes = require("./routes/comments"),
    campgroundRoutes = require("./routes/campgrounds"),
    indexRoutes = require("./routes/index");


//seedDB();  //seed the db
//mongoose.connect("mongodb://localhost:27017/yelp_camp", { useNewUrlParser: true, useUnifiedTopology: true });
//mongodb+srv://user:<password>@yelpcamp-923fg.mongodb.net/test?retryWrites=true&w=majority
mongoose.connect("mongodb+srv://user:<meme>@yelpcamp-923fg.mongodb.net/test?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true });
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));
app.use(express.static(__dirname + "/public"));
app.use(flash());

//PASSPORT SESSION
app.use(require('express-session')({
    secret: "I am the best",
    resave: false,
    saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.use("/", indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);


app.listen(process.env.PORT, process.env.IP, () => {
    console.log("YelpCamp has started");
});