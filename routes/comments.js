var express = require("express");
var router = express.Router({ mergeParams: true });
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");


//===============//
//COMMENT ROUTE
//==============//


//comments new
router.get("/new", isLoggedin, (req, res) => {
    //find campground by id
    Campground.findById(req.params.id, (err, campground) => {
        if (err) {
            console.log(err);
        } else {
            res.render("comments/new", { campground: campground });
        }
    });

});
//comments create
router.post("/", isLoggedin, (req, res) => {
    //lookup campground using id
    Campground.findById(req.params.id, (err, campground) => {
        if (err) {
            console.log(err);
            res.redirect("/campgrounds");
        } else {
            //Comment create
            // console.log(req.body.comment);
            Comment.create(req.body.comment, (err, comment) => {
                if (err) {
                    req.flash("error", "Something went wrong!");
                    console.log(err);
                } else {
                    //add username and id to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    //save comment
                    comment.save();
                    campground.comments.push(comment);
                    campground.save();
                    req.flash("error", "Successfully added comment!");
                    res.redirect('/campgrounds/' + campground._id);
                }
            })
        }

    });
});

//EDIT COMMENTS ROUTE
router.get("/:comment_id/edit", checkCommentOwnership, (req, res) => {
    Comment.findById(req.params.comment_id, (err, foundComment) => {
        if (err) {
            res.redirect("back");
        } else {
            res.render("comments/edit", { campground_id: req.params.id, comment: foundComment });
        }
    });
});

//COMMENT ROUTE
router.put("/:comment_id", checkCommentOwnership, (req, res) => {
    //find and update campground
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err, updatedComment) => {
        if (err) {
            //console.log(err);
            res.redirect("back");
        } else {
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

//DESTROY COMMENT ROUTE
router.delete("/:comment_id", checkCommentOwnership, (req, res) => {
    //destroy
    Comment.findByIdAndRemove(req.params.comment_id, (err) => {
        if (err) {
            res.redirect("back");
        } else {
            req.flash("success", "Comment deleted!");
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
    //redirect
});

// //middleware
function isLoggedin(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "Please log in first!");
    res.redirect('/login');
}

function checkCommentOwnership(req, res, next) {
    //is user logged in?
    if (req.isAuthenticated()) {
        Comment.findById(req.params.comment_id, (err, foundComment) => {
            if (err) {
                req.flash("error", "Campground not found!");
                res.redirect("back");
            } else {
                //dose user own the campground
                if (foundComment.author.id.equals(req.user._id)) {
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