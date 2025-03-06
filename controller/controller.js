const {Category, Course, Profile, User} = require('../models/index.js');
const {comparePassword} = require('../helpers/helper.js');

class Controller {
    // static async home(req, res){
    //     res.render('home')
    // }

    static async showHomepage (req,res){
        try {
            let {success} = req.query
            res.render('Homepage', {success})
        } catch (error) {
            res.send(error)
        }
    }

    static async showRegis(req, res){
        try {
            res.render('signup')
        } catch (error) {
            res.send(error)
        }
    }

    static async postRegis (req,res){
        try {
            let {email, password, role} = req.body
            await User.create({email, password, role})
            // console.log(req.body)
            res.redirect(`/login`)
        } catch (error) {
            res.send(error)
        }
    }

    static async showLogin (req,res){
        try {
            res.render('login')
        } catch (error) {
            res.send(error)
        }
    }

    static async postLogin (req,res){
        try {
            // console.log(req.body)
            let {email, password} = req.body

            let user = await User.findOne({
                where: {
                    email:email
                }
            })

            if (user) {
                let isLoggedIn = comparePassword(password, user.password)
                if (isLoggedIn) {
                    req.session.userId = user.id
                    req.session.role = user.role
                    if (req.session.role==="admin") {
                        req.session.isAdmin=true
                    }
                    res.redirect(`/courses`)
                } else {
                    res.redirect(`/login?msg=Incorrect username/password`)
                }
            } else {
                res.redirect(`/login?msg=Incorrect username/password`)
            }
        } catch (error) {
            res.send(error)
        }
    }

    static async showCourses(req, res){
        try {
            let {msg} = req.query
            let data = await Course.findAll()
            res.render('showCourseUser', {data, msg})
        } catch (error) {
            res.send(error)
        }
    }

    static async showCoursesAdmin(req, res){
        try {
            let msg
            let data = await Course.findAll()
            res.render('showCourseAdmin', {data, msg})
        } catch (error) {
            res.send(error)
        }
    }

    static async logout(req, res){
        try {
            req.session.userId = null
            req.session.role = null
            res.redirect('/login')
        } catch (error) {
            res.send(error)
        }
    }

    static async addCourse(req, res){
        try {
            res.render('formaddCourse')
        } catch (error) {
            res.send(error)
        }
    }

    static async handleAddCourse(req, res){
        try {
            let {name, duration, material, description, CategoryId} = req.body
            await Course.create({name, duration, material, description, CategoryId})
            res.redirect('/admin')
        } catch (error) {
            res.send(error)
        }
    }


}

module.exports = {
    Controller
};
