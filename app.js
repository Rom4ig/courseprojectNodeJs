const express = require('express');
const https = require('https');
const fs = require('fs');
const bodyParser = require('body-parser');
const path = require('path');
const staticAsset = require('static-asset');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

require('./webSocket');

const config = require('./config');
const routes = require('./routes');

const cert = {
  // Replace private key and cert with the appropriate names of the credentials you use
  key: fs.readFileSync('./certificates/key.pem', 'utf8'),
  cert: fs.readFileSync('./certificates/cert.pem', 'utf8')
};

//Database
mongoose.Promise = global.Promise;
mongoose.set('debug', config.IS_PRODUCTION);
mongoose.connection
  .on('error', error => console.log(error))
  .on('close', () => console.log('Database connection closed.'))
  .once('open', () => {
    const info = mongoose.connections[0];
    console.log(`Connected to ${info.host}:${info.port}/${info.name}`);
    //require('./mocks')();
  });
mongoose.connect(config.MONGO_URL, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false});

//Express
const app = express();
// sessions

app.use(
  session({
    secret: config.SESSION_SECRET,
    resave: true,
    saveUninitialized: false,
    store: new MongoStore({
      mongooseConnection: mongoose.connection
    })
  })
);
//Sets and uses
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(staticAsset(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  `/${config.UPLOADS_ROUTE}`,
  express.static(path.join(__dirname, config.DESTINATION))
);
app.use(
  '/javascripts',
  express.static(path.join(__dirname, 'node_modules', 'jquery', 'dist')));

//routers

app.use('/api/auth', routes.auth);
app.use('/post', routes.post);
app.use('/', routes.archive);
app.use('/comment', routes.comment);
app.use('/upload', routes.upload);

// catch 404
app.use((req, res, next) => {
  const err = new Error('Not found');
  err.status = 404;
  next(err);
});

//error handler
// eslint-disable-next-line no-unused-vars
app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.render('error', {
    message: error.message,
    error: !config.IS_PRODUCTION ? error : {}
  });
});
const httpsServer = https.createServer(cert, app);
httpsServer.listen(config.PORT, () => console.log(`App listening on port ${config.PORT}`));

module.exports = app;