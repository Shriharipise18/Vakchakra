const express = require('express');
const router = express.Router();
const Comment = require('../models/comments');

// Delete Comment Route
router.delete('/:id', async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            return res.status(404).send('Comment not found');
        }

        // Check if the logged-in user is the creator of the comment
        if (comment.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).send('You are not authorized to delete this comment');
        }

        await Comment.findByIdAndDelete(req.params.id);
        return res.redirect('/profile'); // Redirect to profile page after deletion
    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal Server Error');
    }
});

module.exports = router;