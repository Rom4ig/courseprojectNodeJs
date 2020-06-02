const Log4js = require('log4js');

const date = new Date();
const time = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()
}_${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`;

Log4js.configure({
    appenders: {
        file: {type: 'file', filename: `./testResults/debug.log`},
        console: {type: 'console'},
    },
    categories: {default: {appenders: ['file', 'console'], level: 'info'}},
});

const Logger = Log4js.getLogger();

module.exports = Logger;
