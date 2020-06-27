const express = require('express');
const bodyParser = require('body-parser');
const { randomBytes } = require('crypto');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Fake DB for comments
const commentsByPostId = {};

app.get('/posts/:id/comments', (req, res) => {
    // Show what you have!
    res.send(commentsByPostId[req.params.id] || []);
});

app.post('/posts/:id/comments', async (req, res) => {
    // Since there is no real DB, let's create an ID
    const commentId = randomBytes(4).toString('hex');
    const { content } = req.body;

    // In case it doesn't exsist equals to empty array
    const comments = commentsByPostId[req.params.id] || [];

    // Push Object to comments Array
    comments.push({ id: commentId, status: 'pending', content });
    // This adds the value to the fake DB
    commentsByPostId[req.params.id] = comments;

    // Here create comment in the event service
    await axios.post('http://localhost:4005/events', {
        type: 'CommentCreated',
        data: {
            id: commentId,
            content,
            postId: req.params.id,
            status: 'pending'
        }

    });

    res.status(201).send(comments);
});

// Confirms communication with event bus
app.post('/events', async (req, res) => {
    console.log('Received Event', req.body.type);

    const { type, data } = req.body;

    if(type === 'CommentModerated') {
        const { postId, id, status, content } = data;
        const comments = commentsByPostId[postId];

        const comment = comments.find(comment => {
            return comment.id === id;
        });
        comment.status = status;

        await axios.post('http://localhost:4005/events', {
            type: 'CommentUpdated',
            data: {
                id,
                status,
                postId,
                content
            }
        });
    }

    res.send({});
});

app.listen(4001, () => {
    console.log('Listening on Port 4001 - Comments');
})