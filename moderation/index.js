const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

app.post('/events', async (req, res, next) => {
	const { type, data } = req.body;

	if (type === 'CommentedCreated') {
		const status = data.content.include('orange') ? 'Rejected' : 'Approved';

		try {
			await axios.post('http://localhost:4005/events', {
				type: 'CommentModerated',
				data: {
					id: data.id,
					postId: data.postId,
					status,
					content: data.content,
				},
			});
		} catch (err) {
			return next(err);
		}
	}

	res.status(200).json({ status: 'ok' });
});

app.listen(4003, () => {
	console.log('Listening on 4003');
});
