const express = require('express');
const bodyParser = require('body-parser');
const { randomBytes } = require('crypto');
const cors = require('cors');
const axios = require('axios');

const app = express();
// Body parser generates JSON
app.use(bodyParser.json());
app.use(cors());

// Fake DB made for education purposes
const posts = {};

app.get('/posts', (req, res) => {
    res.send(posts);
});

app.post('/posts', async (req, res) => {
    // Since there is no real DB, let's create an ID
    const id = randomBytes(4).toString('hex');
    // Title is the input of our simple form
    const { title } = req.body;

    // Attach post to our fake DB
    posts[id] = {
        id, title
    }

    await axios.post(`http://event-bus-srv:4005/events`, {
        type: 'PostCreated',
        data: {
            id, title
        }
    });
    
    // Simulate a 200 answer from server
    // Showing what we just added
    res.status(201).send(posts[id]);
});

// Confirms communication with event bus
app.post('/events', (req, res) => {
    console.log('Received Event', req.body.type);

    res.send({});
});

app.listen(4000, () => {
    console.log('V2.0');
    console.log('Listening on Port 4000 - Posts');
});