const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

const events = [];

app.post('/events', (req, res, next) => {
	const event = req.body;

	events.push(event);

	axios
		.post('http://posts-clusterip-srv:4000/events', event)
		.catch(function () {
			console.log('Error trying to post message to the post service.');
			return res.status(500);
		});

	axios.post('http://comments-srv:4001/events', event).catch(function () {
		console.log('Error trying to post message to the comment service.');
		return res.status(500);
	});

	axios.post('http://query-srv:4002/events', event).catch(function () {
		console.log('Error trying to post message to the query service.');
		return res.status(500);
	});

	axios.post('http://moderation-srv:4003/events', event).catch(function () {
		console.log('Error trying to post message to the moderation service.');
		return next(res.status(500));
	});

	res.status(200).json({ status: 'OK' });
});

app.get('/events', (req, res, next) => {
	res.send(events);
});

app.listen(4005, () => {
	console.log('Listening on 4005');
});
