// routes/blogRoutes.js
const express = require('express');
const router = express.Router();
const Blog = require('./models/Blog');
const upload = require('../utils/multer');

// Middleware to check if the user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
};

// Route to display the edit blog form
router.get('/edit-blog/:id', isAuthenticated, async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        // Check if the logged-in user is the author of the blog
        if (blog.author.toString() !== req.user._id.toString()) {
            return res.status(403).send('You are not authorized to edit this blog.');
        }

        res.render('edit-blog', { blog });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching blog');
    }
});

// Route to handle blog updates
router.post('/update-blog/:id', isAuthenticated, upload.single('coverImage'), async (req, res) => {
    try {
        const { title, category, body } = req.body;
        const coverImage = req.file ? `/uploads/${req.file.filename}` : null;

        const updatedBlog = await Blog.findByIdAndUpdate(
            req.params.id,
            { title, category, body, coverImage, updatedAt: Date.now() },
            { new: true }
        );

        res.redirect(`/blog/${updatedBlog._id}`); // Redirect to the updated blog
    } catch (error) {
        console.error(error);
        res.status(500).send('Error updating blog');
    }
});

module.exports = router;