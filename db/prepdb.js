const mongoose = require('mongoose');

const url = process.env.URL || 'mongodb://localhost:27017/';
mongoose.connect(url, {useNewUrlParser: true}, (err) => {
	if (!err) {
		console.log('Successfully Established Connection with MongoDB')
	}
	else {
		console.log('Failed to Establish Connection with MongoDB with Error: '+ err)
	}
});

require('../model/book.model');
