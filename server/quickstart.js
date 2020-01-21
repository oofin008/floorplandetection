'use strict';

const quickstartPredict = async function main(
  projectId_t,
  computeRegion_t,
  modelId_t,
  filePath_t,
  scoreThreshold_t
  ) {
  // [START automl_quickstart]
  const automl = require('@google-cloud/automl');
  const fs = require('fs');
  const projectId = "floorplanai";
  const computeRegion = "us-central1";
  const modelId = "IOD469100038920863744";
  const filePath = "./test_img/file_25.jpg";
  const scoreThreshold = "0.5";

  // Create client for prediction service.
  const client = new automl.PredictionServiceClient();

  // Get the full path of the model.
  const modelFullId = client.modelPath(projectId, computeRegion, modelId);

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
    //console.log(`Predicted class name: ${result.displayName}`);
    //console.log(`Predicted class score: ${result.classification.score}`);
  });
}
module.exports = { quickstartPredict };
// main(...process.argv.slice(2)).catch(err => {
//   console.error(err);
//   process.exitCode = 1;
// });
