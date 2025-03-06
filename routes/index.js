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


routes.get('/', Controller.showHomepage)
routes.get('/regis', Controller.showRegis)
routes.post('/regis', Controller.postRegis)
routes.get('/login', Controller.showLogin)
routes.post('/login', Controller.postLogin)
routes.get('/logout', Controller.logout)


let userLoggedIn = (req,res,next) => {
    if (!req.session.userId) {
        res.redirect(`/login?msg=Please login first!`)
    } else {
        next()
    }
}

let userIsAdmin = (req,res,next) => {
    if(req.session.role!=="admin") {
        res.redirect(`/courses?msg=Unfortunately, only admin can do that`)
    } else {
        next()
    }  
}


routes.get('/courses', userLoggedIn, Controller.showCourses)
routes.get('/admin', userLoggedIn, userIsAdmin, Controller.showCoursesAdmin)
routes.get('/admin/addCourse', userLoggedIn, userIsAdmin, Controller.addCourse)
routes.post('/admin/addCourse', userLoggedIn, userIsAdmin, Controller.handleAddCourse)




module.exports = {
    routes
};
