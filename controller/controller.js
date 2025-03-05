const {Category, Course, Profile, User} = require('../models/index.js');

class Controller {
    static async home(req, res){
        res.render('home')
    }
}

module.exports = {
    Controller
};
