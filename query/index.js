const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const posts = {};

const handleEvent = (type, data) => {
	if (type === 'PostCreated') {
		const { id, title } = data;

		posts[id] = { id, title, comments: [] };
	}

	if (type === 'CommentCreated') {
		const { id, content, postId, status } = data;

		const post = posts[postId];
		post.comments.push({ id, content, status });
	}

	if (type === 'CommentUpdated') {
		const { id, content, postId, status } = data;

		const post = posts[postId];

		const comment = post.comments.find(comment => {
			return comment.id === id;
		});

		comment.status = status;
		comment.content = content;
	}
};

app.get('/posts', (req, res, next) => {
	res.send(posts);
});

app.post('/events', (req, res, next) => {
	const { type, data } = req.body;

	handleEvent(type, data);

	res.status(200);
});

app.listen(4002, async () => {
	console.log('Listening on 4002');

	const events = await axios
		.get('http://localhost:4005/events')
		.catch('There was an error reaching out to the event bus.');

	for (let event of events.data) {
		console.log('Processing event: ', event.type);

		handleEvent(event.type, event.data);
	}
});
