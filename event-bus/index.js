const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

const events = [];

app.post('/events', (req, res, next) => {
	const event = req.body;

	events.push(event);

	try {
		axios.post('http://localhost:4000/events', event);
	} catch (err) {
		console.log('Error trying to post message to the post service.', err);
		return next(err.message);
	}

	try {
		axios.post('http://localhost:4001/events', event);
	} catch (err) {
		console.log(
			'Error trying to post message to the comment service.',
			err
		);
		return next(err.message);
	}

	try {
		axios.post('http://localhost:4002/events', event);
	} catch (err) {
		console.log('Error trying to post message to the query service.', err);
		return next(err.message);
	}

	try {
		axios.post('http://localhost:4003/events', event);
	} catch (err) {
		console.log(
			'Error trying to post message to the moderation service.',
			err.message
		);
		return next(err.message);
	}

	res.status(200).json({ status: 'OK' });
});

app.get('/events', (req, res, next) => {
	res.send(events);
});

app.listen(4005, () => {
	console.log('Listening on 4005');
});
