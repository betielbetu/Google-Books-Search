require('./db/prepdb');
const express = require('express');
const routes = require('./routes');
const bodyParser = require("body-parser");
const path = require('path');
const port = 3001;
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/', routes);
app.use(express.static(path.join(__dirname, 'client/build')))

app.listen(port, function(){
	console.log(`Express started on http://localhost:${port} - press Ctrl-C to exit`);
});
