var outputArea = document.getElementById('outputArea');
var txtCodeInput = document.getElementById('txtCodeInput');
var btnRunProgram = document.getElementById('btnRunProgram');

if (window.LPS === undefined) {
  outputArea.innerHTML = 'For some reason, LPS is not available.';
}

function loadExample(element) {
  var url = element.getAttribute('data-source');
  var request = new XMLHttpRequest();
  request.open('GET', url);
  request.responseType = 'text';

  request.onload = function() {
    txtCodeInput.value = request.response;
    txtCodeInput.disabled = false;
    btnRunProgram.disabled = false;
  };

  txtCodeInput.value = 'Loading from ' + url;
  txtCodeInput.disabled = true;
  btnRunProgram.disabled = true;
  request.send();
}

function buildTableForResults(result) {
  var tableElement = document.createElement('table');
  tableElement.classList.add('timeline-table');
  tableElement.classList.add('table');
  tableElement.classList.add('table-striped');

  var timeRow = document.createElement('tr');
  timeRow.innerHTML += '<th>Time</th>';
  for (let i = 0; i < result.length; i += 1) {
    var timeRowCell = document.createElement('td');
    timeRowCell.innerHTML = '<div><span>' + result[i].time + ' <small>(' + result[i].duration + ' ms)</small></span></div>'
    timeRow.appendChild(timeRowCell);
  }
  tableElement.appendChild(timeRow);

  var eventsRow = document.createElement('tr');
  eventsRow.innerHTML += '<th>Events</th>';
  for (let i = 0; i < result.length; i += 1) {
    var eventsRowCell = document.createElement('td');
    eventsRowCell.classList.add('timeline-event');
    result[i].observations.forEach((event) => {
      var trimmedEvent = event.length > 20 ? (event.slice(0, 17) + '...') : event;
      eventsRowCell.innerHTML += '<div title="' + event + '">&bull; ' + trimmedEvent + '</div>';
    });
    eventsRow.appendChild(eventsRowCell);
  }
  tableElement.appendChild(eventsRow);

  var actionsRow = document.createElement('tr');
  actionsRow.innerHTML += '<th>Actions</th>';
  for (let i = 0; i < result.length; i += 1) {
    var actionsRowCell = document.createElement('td');
    actionsRowCell.classList.add('timeline-action');
    result[i].actions.forEach((action) => {
      var trimmedAction = action.length > 20 ? (action.slice(0, 17) + '...') : action;
      actionsRowCell.innerHTML += '<div title="' + action + '">&bull; ' + trimmedAction + '</div>';
    });
   actionsRow.appendChild(actionsRowCell);
  }
  tableElement.appendChild(actionsRow);

  var fluentsRow = document.createElement('tr');
  fluentsRow.innerHTML += '<th>Fluents</th>';
  for (let i = 0; i < result.length; i += 1) {
    var fluentsRowCell = document.createElement('td');
    fluentsRowCell.classList.add('timeline-fluent');
    var fluentsCellInnerDiv = document.createElement('div');
    fluentsCellInnerDiv.style.marginTop = (result[i].overlappingFluents * 32) + 'px';
    result[i].fluents.forEach((fluent) => {
      fluentsCellInnerDiv.innerHTML += '<div class="timeline-fluent-box" style="width: ' + (fluent.length * 224 - 2) + 'px">' + fluent.term + '</div>';
    });
    fluentsRowCell.appendChild(fluentsCellInnerDiv);
    fluentsRow.appendChild(fluentsRowCell);
  }
  tableElement.appendChild(fluentsRow);

  return tableElement;
};

function runProgram() {
  var source = txtCodeInput.value;
  outputArea.innerHTML = '';
  btnRunProgram.disabled = true;

  LPS.loadString(source)
    .then((engine) => {
      let profiler = engine.getProfiler();
      let result = [];

      engine.setContinuousExecution(true);

      engine.on('error', (err) => {
        outputArea.innerHTML += '<p>Error: ' + err + '</p>';
      });
      engine.on('postCycle', () => {
        result.push({
          time: engine.getCurrentTime(),
          fluents: engine.getActiveFluents(),
          actions: engine.getLastCycleActions(),
          observations: engine.getLastCycleObservations(),
          duration: profiler.get('lastCycleExecutionTime')
        });
      });

      engine.on('done', () => {
        let maxCycles = result.length;
        for (let i = 0; i < maxCycles; i += 1) {
          result[i].fluents = result[i].fluents
            .map((f) => {
              return {
                term: f,
                length: 1
              };
            });
          result[i].overlappingFluents = 0;
        }

        for (let i = 0; i < maxCycles; i += 1) {
          let newFluents = [];
          let lastSeenCycle = i;
          let numInCycle = {};

          for (let j = i + 1; j < maxCycles; j += 1) {
            numInCycle[j] = 0;
          }
          result[i].fluents
            .forEach((fArg) => {
              let f = fArg;
              for (let j = i + 1; j < maxCycles; j += 1) {
                let hasSameFluent = false;
                result[j].fluents = result[j].fluents
                  .filter((otherF) => {
                    if (otherF.term === f.term) {
                      numInCycle[j] += 1;
                      f.length += 1;
                      hasSameFluent = true;
                      return false;
                    }
                    return true;
                  });
                if (!hasSameFluent) {
                  break;
                }
                if (j > lastSeenCycle) {
                  lastSeenCycle = j;
                }
              }
              for (let j = i + 1; j <= lastSeenCycle; j += 1) {
                result[j].overlappingFluents
                  = result[i].overlappingFluents
                    + numInCycle[j];
              }
              newFluents.push(f);
            });
          newFluents.sort((a, b) => {
            if (a.length === b.length) {
              return 0;
            }
            return a.length > b.length ? -1 : 1;
          });
          result[i].fluents = newFluents;
        }
        btnRunProgram.disabled = false;
        let table = buildTableForResults(result);
        outputArea.appendChild(table);
      });

      engine.run();
    })
    .catch((err) => {
      outputArea.innerHTML += '<p>Error: ' + err + '</p>';
    });
}
