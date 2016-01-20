var fs = require('fs');
var path = require('path');
var express = require('express');


function serve(port, directory) {

  var app = express();
  app.use(express.static(directory));

  app.get('/', function (request, response){
    response.sendFile(path.resolve(directory, 'index.html'));
  });

  var server = app.listen(port, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('App listening at http://%s:%s', host, port);
  });
}

module.exports = serve;


if(require.main === module) {
  var yargs = require('yargs');

  var argv = yargs
    .usage('Usage: $0 port path/to/app_root')
    .demand(2)
    .argv;

  var port = argv._[0];
  var appRoot = argv._[1];

  serve(port, appRoot);
}
