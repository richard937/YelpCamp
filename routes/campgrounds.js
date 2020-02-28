var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");

// INDEX - show all campgrounds
router.get('/', (req, res) => {

    // get all campgrounds from DB
    Campground.find({}, (err, allcampgrounds) => {
        if (err) {
            console.log(err);
        } else {
            res.render("campgrounds/index", { campgrounds: allcampgrounds });
        }
    });
});


// CREATE - add new campground to DB
router.post('/', isLoggedin, (req, res) => {
    //get the form data and add to the campground array
    var name = req.body.name;
    var price = req.body.price;
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username,
    };
    var newCampground = { name: name, price: price, image: image, description: desc, author: author };

    // create new camp and save to the DB
    Campground.create(newCampground, (err, newlyCreated) => {
        if (err) {
            console.log(err);
        } else {
            //redirect to camgrounds page
            res.redirect('/campgrounds');
        }
    });
});


//NEW show form to create new 
router.get('/new', isLoggedin, (req, res) => {
    res.render('campgrounds/new');
});


// SHOW - shows more info about a campground
router.get("/:id", (req, res) => {
    //find the campground with given id
    Campground.findById(req.params.id).populate("comments").exec((err, foundCampground) => {
        //console.log(req.params.id);
        if (err) {
            console.log(err);
        } else {
            //console.log(foundCampground);
            //render sow template with that campground
            res.render('campgrounds/show', { campground: foundCampground });
        }
    });
});

//EDIT CAMPGROUND ROUTE
router.get("/:id/edit", checkCampgroundOwnership, (req, res) => {
    Campground.findById(req.params.id, (err, foundCampground) => {
        res.render("campgrounds/edit", { campground: foundCampground });
    });
});

//UPDATE CAPGROUND ROUTE
router.put(":/id", checkCampgroundOwnership, (req, res) => {
    //find and update campground
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, (err, updatedCampground) => {
        if (err) {
            //console.log(err);
            res.redirect("/campgrounds");
        } else {
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});


//DESTROY CAMPGROUND ROUTE
router.delete("/:id", checkCampgroundOwnership, (req, res) => {
    //destroy
    Campground.findByIdAndRemove(req.params.id, (err) => {
        if (err) {
            res.redirect("/campgrounds");
        } else {
            res.redirect("/campgrounds");
        }
    });
    //redirect
});

//middleware
function isLoggedin(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "Please log in first!");
    res.redirect('/login');
}

function checkCampgroundOwnership(req, res, next) {
    //is user logged in?
    if (req.isAuthenticated()) {
        Campground.findById(req.params.id, (err, foundCampground) => {
            if (err) {
                req.flash("error", "Campground not found!");
                res.redirect("back");
            } else {
                //dose user own the campground
                if (foundCampground.author.id.equals(req.user._id)) {
                    next();
                    //res.render("campgrounds/edit", { campground: foundCampground });
                } else {
                    req.flash("error", "You don't have permission to do that!");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "Please login first!");
        res.redirect("back");
    }
}

module.exports = router;