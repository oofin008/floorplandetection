const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors'); // addition we make
const fileUpload = require('express-fileupload'); //addition we make

const index = require('./routes/index');
const users = require('./routes/users');
//Cloud part
const automl = require('@google-cloud/automl');
const fs = require('fs');
const projectId = "floorplanai";
const computeRegion = "us-central1";
const modelId = "IOD469100038920863744";
const scoreThreshold = "0.5";
const client = new automl.PredictionServiceClient();
const modelFullId = client.modelPath(projectId, computeRegion, modelId);
//
const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Use CORS and File Upload modules here
app.use(cors());
app.use(fileUpload());

app.use('/public', express.static(__dirname + '/public'));

app.use('/', index);

//For Cross-Origin
app.post('/upload', (req, res, next) => {
	let imageFile = req.files.file;

	imageFile.mv(`${__dirname}/public/${imageFile.name}`, err => {
	if (err) {
		return res.status(500).send(err);
	}
	});
	next();
}, async function(req, res, next){
	console.log('Test imageFile: ' + req.files.file.name);
	console.log('__dirname: ' + __dirname);

	const filePath = `${__dirname}/public/${req.files.file.name}`
	const payload = {};
	fs.readFile(filePath, 'base64', (err, content)=>{
		if(err){
			console.log(err.message);
		}else{
			console.log('Successful fetch Image');
			payload.image = {imageBytes: content};
			const params = {};
			if (scoreThreshold) {
			  params.score_threshold = scoreThreshold;
			}
			client.predict({
				name: modelFullId,
				payload: payload,
				params: params,
			}, (err, response)=>{
				if(err){
					console.log(err.message);
					req.testresult = { error: 'There some errors happen'};
					next();

				}else{
					console.log(`Prediction results:`);
					console.log(response);
					req.testresult = response;
					next();
				}
			})
		}
	});
}, async function(req, res, next){
	console.log('3rd function test req: ' + JSON.stringify(req.testresult));
	res.json(req.testresult);
}
);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
const err = new Error('Not Found');
err.status = 404;
next(err);
});

// error handler
app.use(function(err, req, res, next) {
// set locals, only providing error in development
res.locals.message = err.message;
res.locals.error = req.app.get('env') === 'development' ? err : {};

// render the error page
res.status(err.status || 500);
res.render('error');
});

module.exports = app;