const fs = require('fs');
const AJV = require('ajv');
const ajv = new AJV();

function AJVInstance(path) {
  let arraySchemas = fs.readdirSync(path);
  arraySchemas.forEach((item) => {
    item = path + item;
    if (fs.statSync(item).isDirectory()) {
      item = item + '/';
      AJVInstance(item);
    } else {
      if (item.endsWith('.json')) {
        if (ajv.validateSchema(require(item))) {
          ajv.addSchema(require(item), item);
          console.log('Added schema')
        } else console.log(`Wrong schema`)
      } else console.log(`Skipped ${item} `);
    }
  });
  return ajv;
}

module.exports = (dir) => AJVInstance(dir);