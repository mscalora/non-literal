# non-literal

A module to make ES6 templates work non-literally so you can load templates from strings, files, DOM Elements, etc.

## Installation

`npm install non-literal --save`

## Usage

### Simple string variable template

```javascript
  var nonLiteral = require('non-literal'),
      // this string could be read from a file, database, localization mechanism, etc.
      template = 'Hi ${name}, your score was ${score}!',
      model = {
        name: "Mike",
        score: 97
      };
  console.log(nonLiteral.render(model, template));
```
