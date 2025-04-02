const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Blog = require('../models/blog');
const Comment = require('../models/comments');

// Profile Route
router.get('/', async (req, res) => {
    try {
        console.log('Profile route hit'); // Debugging
        if (!req.user) {
            console.log('User not logged in, redirecting to signin'); // Debugging
            return res.redirect('/user/signin');
        }

        // Fetch the logged-in user's data
        const user = await User.findById(req.user._id);

        // Fetch blogs created by the user
        const blogs = await Blog.find({ createdBy: req.user._id }).populate('createdBy');

        // Fetch comments made by the user and populate the blogId field
        const comments = await Comment.find({ createdBy: req.user._id })
            .populate({
                path: 'blogId',
                select: 'title', // Only populate the title field of the blog
            })
            .then(comments => comments.filter(comment => comment.blogId)); // Filter out comments with null blogId

        console.log('User:', user); // Debugging
        console.log('Blogs:', blogs); // Debugging
        console.log('Comments:', comments); // Debugging

        // Render the profile page with user data, blogs, and comments
        return res.render('profile', {
            user: req.user,
            blogs,
            comments,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal Server Error');
    }
});

module.exports = router;