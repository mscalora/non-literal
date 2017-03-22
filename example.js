
var nl = require('./dist/NonLiteral.js');

var models = [{
  name: "Sally",
  scores: [87, 92, 78, 91]
},{
  name: "Fred",
  scores: [77, 83, 98, 72]
},{
  name: "Mario",
  scores: [76, 88, 75, 89]
}];

var textTemplate = '${name} has a score of ${eval(scores.join("+"))/scores.length}\n';
var htmlTemplate = '<p><b>${name}</b> has a score of <b>${eval(scores.join("+"))/scores.length}</b></p>\n';

for(var i = 0; i < models.length; i++) {
  // render text template
  var line = nl.render(models[i], textTemplate);
  // write to stdout
  process.stdout.write(line);

  // render html template and write to stderr
  process.stderr.write(nl.renderHtml(models[i], htmlTemplate));
}