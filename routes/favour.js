const express = require('express');
const router = express.Router();
const Blog = require('../models/blog');
const Comment = require('../models/comments');
const { isLoggedIn } = require('../middleware/authentication'); // Middleware to ensure user is logged in

// Like a blog
router.post('/blog/:id/like', isLoggedIn, async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        const userId = req.user._id;

        // Check if the user has already liked the blog
        if (blog.likedBy.includes(userId)) {
            return res.status(400).json({ error: 'You have already liked this blog.' });
        }

        // Remove user from dislikedBy if they previously disliked
        if (blog.dislikedBy.includes(userId)) {
            blog.dislikes -= 1;
            blog.dislikedBy = blog.dislikedBy.filter(id => !id.equals(userId));
        }

        // Add like
        blog.likes += 1;
        blog.likedBy.push(userId);
        await blog.save();

        res.json({ likes: blog.likes, dislikes: blog.dislikes });
    } catch (error) {
        console.error('Error liking blog:', error);
        res.status(500).json({ error: 'An error occurred while liking the blog.' });
    }
});

// Dislike a blog
router.post('/blog/:id/dislike', isLoggedIn, async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        const userId = req.user._id;

        // Check if the user has already disliked the blog
        if (blog.dislikedBy.includes(userId)) {
            return res.status(400).json({ error: 'You have already disliked this blog.' });
        }

        // Remove user from likedBy if they previously liked
        if (blog.likedBy.includes(userId)) {
            blog.likes -= 1;
            blog.likedBy = blog.likedBy.filter(id => !id.equals(userId));
        }

        // Add dislike
        blog.dislikes += 1;
        blog.dislikedBy.push(userId);
        await blog.save();

        res.json({ likes: blog.likes, dislikes: blog.dislikes });
    } catch (error) {
        console.error('Error disliking blog:', error);
        res.status(500).json({ error: 'An error occurred while disliking the blog.' });
    }
});

// Like a comment
router.post('/comment/:id/like', isLoggedIn, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        const userId = req.user._id;

        // Check if the user has already liked the comment
        if (comment.likedBy.includes(userId)) {
            return res.status(400).json({ error: 'You have already liked this comment.' });
        }

        // Remove user from dislikedBy if they previously disliked
        if (comment.dislikedBy.includes(userId)) {
            comment.dislikes -= 1;
            comment.dislikedBy = comment.dislikedBy.filter(id => !id.equals(userId));
        }

        // Add like
        comment.likes += 1;
        comment.likedBy.push(userId);
        await comment.save();

        res.json({ likes: comment.likes, dislikes: comment.dislikes });
    } catch (error) {
        console.error('Error liking comment:', error);
        res.status(500).json({ error: 'An error occurred while liking the comment.' });
    }
});

// Dislike a comment
router.post('/comment/:id/dislike', isLoggedIn, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        const userId = req.user._id;

        // Check if the user has already disliked the comment
        if (comment.dislikedBy.includes(userId)) {
            return res.status(400).json({ error: 'You have already disliked this comment.' });
        }

        // Remove user from likedBy if they previously liked
        if (comment.likedBy.includes(userId)) {
            comment.likes -= 1;
            comment.likedBy = comment.likedBy.filter(id => !id.equals(userId));
        }

        // Add dislike
        comment.dislikes += 1;
        comment.dislikedBy.push(userId);
        await comment.save();

        res.json({ likes: comment.likes, dislikes: comment.dislikes });
    } catch (error) {
        console.error('Error disliking comment:', error);
        res.status(500).json({ error: 'An error occurred while disliking the comment.' });
    }
});

module.exports = router;