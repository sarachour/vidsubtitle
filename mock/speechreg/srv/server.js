var speech = require('google-speech-api');
 
var opts = {
  file: 'speech.mp3',
  key: 'AIzaSyCkEmwQs7I2cuFTJJB5A9R8ZSGmrKcYCfA'
};

// this works, but the quota is ridiculously low
console.log("beginning speech recognition process.")
speech(opts, function (err, results) {
  console.log(JSON.stringify(results));
  // [{result: [{alternative: [{transcript: '...'}]}]}] 
});