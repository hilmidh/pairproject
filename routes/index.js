const routes = require('express').Router();
const {Controller} = require('../controller/controller');
const session = require('express-session')

routes.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false,
        sameSite: true
     }
  }))

routes.get('/', Controller.home)


module.exports = {
    routes
};
