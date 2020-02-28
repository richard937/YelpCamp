var mongoose = require("mongoose");

// Schema setup
var commentSchema = new mongoose.Schema({
    // _id: String,
    text: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        username: String,
    },
});

// model conversion

module.exports = mongoose.model("Comment", commentSchema);