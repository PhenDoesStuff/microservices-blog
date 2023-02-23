const express = require('express');
const bodyParser = require('body-parser');
const { randomBytes } = require('crypto');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const commentsByPostId = {};

app.get('/posts/:id/comments', (req, res, next) => {
	res.send(commentsByPostId[req.params.id] || []);
});

app.post('/posts/:id/comments', async (req, res, next) => {
	const commentId = randomBytes(4).toString('hex');
	const { content } = req.body;

	const comments = commentsByPostId[req.params.id] || [];

	comments.push({ id: commentId, content, status: 'Pending' });

	commentsByPostId[req.params.id] = comments;

	try {
		await axios.post('http://localhost:4005/events', {
			type: 'CommentCreated',
			data: {
				id: commentId,
				content,
				postId: req.params.id,
				status: 'Pending',
			},
		});
	} catch (err) {
		return next(err);
	}

	res.status(201).send(comments);
});

app.post('/events', async (req, res, next) => {
	console.log('Received Event: ', req.body.type);

	const { type, data } = req.body;

	if (type === 'CommentModerated') {
		const { id, postId, status, content } = data;

		const comments = commentsByPostId[postId];

		const comment = comments.find(comment => {
			return comment.id === id;
		});
		comment.status = status;

		try {
			await axios.post('http://localhost:4005/events', {
				type: 'CommentUpdated',
				data: {
					id,
					status,
					postId,
					content,
				},
			});
		} catch (err) {
			return next(`An error occurred: ${err.message}`);
		}
	}

	res.status(200);
});

app.listen(4001, () => {
	console.log('Listening on 4001');
});
