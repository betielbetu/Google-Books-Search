require('./db/prepdb');
const express = require('express');
const routes = require('./routes');
const bodyParser = require("body-parser");
const path = require('path');
const port = process.env.PORT || 3000;
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname,'client/build')));
app.get('*', (req, res) => {
	res.sendFile(path.resolve(__dirname , "client","build","index.html"));
});
app.use('/', routes);


app.listen(port, function(){
	console.log(`Express started on http://localhost:${port} - press Ctrl-C to exit`);
});
