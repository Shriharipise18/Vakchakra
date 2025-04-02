const { Router } = require('express');
const multer = require('multer');
const path = require('path');
const router = Router();
const Blog = require('../models/blog');
const Comment = require('../models/comments');

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.resolve(`./public/uploads/`));
    },
    filename: function (req, file, cb) {
        const fileName = `${Date.now()}-${file.originalname}`;
        cb(null, fileName);
    },
});

const upload = multer({ storage: storage });

// Add New Blog Page Route
router.get('/add-new', (req, res) => {
    return res.render('addBlog', {
        user: req.user, // Pass the logged-in user to the view
    });
});

// Create New Blog Route
router.post('/', upload.single('coverImage'), async (req, res) => {
    try {
        const { title, body, category } = req.body;

        // Create a new blog with the provided data
        const blog = await Blog.create({
            title,
            body,
            category,
            createdBy: req.user._id, // Associate the blog with the logged-in user
            coverImageURL: req.file ? `/uploads/${req.file.filename}` : null, // Handle cover image upload
        });

        // Redirect to the newly created blog's page
        return res.redirect(`/blog/${blog._id}`);
    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal Server Error');
    }
});
router.post('/', upload.single('coverImage'), async (req, res) => {
    try {
        const { title, body, category } = req.body;

        // Create a new blog with the provided data
        const blog = await Blog.create({
            title,
            body, // Rich text content from TinyMCE
            category,
            createdBy: req.user._id,
            coverImageURL: req.file ? `/uploads/${req.file.filename}` : null,
        });

        // Redirect to the newly created blog's page
        return res.redirect(`/blog/${blog._id}`);
    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal Server Error');
    }
});
router.delete('/:id', async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).send('Blog not found');
        }

        // Check if the logged-in user is the creator of the blog
        if (blog.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).send('You are not authorized to delete this blog');
        }

        await Blog.findByIdAndDelete(req.params.id);
        return res.redirect('/profile'); // Redirect to profile page after deletion
    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal Server Error');
    }
});
// View Blog Route
router.get('/:id', async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id).populate('createdBy');
        const comments = await Comment.find({ blogId: req.params.id }).populate('createdBy');

        // Render the blog page with the blog and comments data
        return res.render('blog', {
            user: req.user,
            blog,
            comments,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal Server Error');
    }
});

// Add Comment Route
router.post('/comment/:blogId', async (req, res) => {
    try {
        await Comment.create({
            content: req.body.content,
            blogId: req.params.blogId,
            createdBy: req.user._id,
        });

        // Redirect back to the blog page after adding the comment
        return res.redirect(`/blog/${req.params.blogId}`);
    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal Server Error');
    }
});

module.exports = router;