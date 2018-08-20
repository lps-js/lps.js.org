var outputArea = document.getElementById('outputArea');
var codeInput = document.getElementById('codeInput');

if (window.LPS === undefined) {
  outputArea.innerHTML = 'You need to compile lps.bundle.js first by running the command "npm run build:browser".';
}

function runProgram() {
  var source = codeInput.value;
  outputArea.innerHTML = '';
  LPS.loadString(source)
    .then((engine) => {
      engine.on('error', (err) => {
        outputArea.innerHTML += '<p>Error: ' + err + '</p>';
      });
      engine.on('postCycle', () => {
        console.log('TIME ' + engine.getCurrentTime());
        outputArea.innerHTML += '<p>TIME ' + engine.getCurrentTime() + '</p>';
      });
      engine.on('done', () => {
        console.log('Execution Done!');
        outputArea.innerHTML += '<p>Execution Done!</p>';
      });
      engine.run();
    })
    .catch((err) => {
      outputArea.innerHTML += '<p>Error: ' + err + '</p>';
    });
}
