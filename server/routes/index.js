var express = require('express');
var router = express.Router();
var fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const multer = require('multer');
const upload = multer({ dest: './images'});
/* Cloud initialize */
const automl = require('@google-cloud/automl');
const fs = require('fs');
const projectId = "floorplanai";
const computeRegion = "us-central1";
const modelId = "IOD469100038920863744";
const scoreThreshold = "0.5";
const client = new automl.PredictionServiceClient();
const modelFullId = client.modelPath(projectId, computeRegion, modelId);

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express',
  	test: 'Hello'
	});
});

router.post('/', async function(req, res, next) {
	
	//let filePath = req.body.image;
	const filePath = './test_img/file_25.jpg';
	console.log('filePath:::::' + filePath);
	console.log('DIR name test::::' + __dirname);
	console.log("testetst");
	// Read the file content for prediction.
	const content = fs.readFileSync(filePath, 'base64');
	const params = {};

	if (scoreThreshold) {
	  params.score_threshold = scoreThreshold;
	}

	// Set the payload by giving the content and type of the file.
	const payload = {};
	payload.image = {imageBytes: content};

	// params is additional domain-specific parameters.
	// currently there is no additional parameters supported.
	const [response] = await client.predict({
	  name: modelFullId,
	  payload: payload,
	  params: params,
	});
	console.log(`Prediction results:`);
	response.payload.forEach(result => {
		console.log('results: ' + JSON.stringify(result));
	});
});


module.exports = router;
