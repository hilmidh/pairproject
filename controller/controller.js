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
            let userId = req.session.userId
            let {msg} = req.query
            let data = await Course.findAll()
            res.render('showCourseUser', {data, msg, userId})
        } catch (error) {
            res.send(error)
        }
    }

    static async showCoursesAdmin(req, res){
        try {
            let userId = req.session.userId
            let msg
            let data = await Course.findAll()
            res.render('showCourseAdmin', {data, msg, userId})
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
            let userId = req.session.userId
            res.render('formAddCourse', {userId})
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

    static async showProfile(req, res){
        try {
            let {id} = req.params
            let userId = req.session.userId
            let user = await User.findOne({
                where:{id},
                include: Profile
            })
            let msg = null
            if(!user.Profile){
                msg = "Your profile is empty, please edit your profile"
            }
            // res.send(profile)
            let profile = user.Profile
            res.render('profile', {user, msg, profile, userId})
        } catch (error) {
            res.send(error)
        }
    }

    static async showEditProfile(req, res){
        try {
            let {id} = req.params
            let userId = req.session.userId
            let user = await User.findOne({
                where:{id},
                include: Profile
            })
            res.render('editProfile', {user, userId})
        } catch (error) {
            res.send(error)
        }
    }

    static async handleEditProfile(req, res){
        try {
            let {id} = req.params
            let {fullname, photo, address, phoneNumber} = req.body
            
           
            
            let user = await User.findOne({
                where:{id},
                include: Profile
            })
            
            if(!user.Profile){
                await Profile.create({fullname, photo, address, phoneNumber, UserId: id})
                res.redirect(`/profile/${id}`)
            }
            else{
                await Profile.update({fullname, photo, address, phoneNumber}, {where: {UserId: id}})
                    res.redirect(`/profile/${id}`)
            }
        } catch (error) {
            console.log(error)
            res.send(error)
        }
    }

    static async showEditCourse(req, res){
        try {
            let {id} = req.params
            let data = await Course.findByPk(id)
            let categories = await Category.findAll()
            res.render('editCourse', {data, categories})
        } catch (error) {
            res.send(error)
        }
    }

    static async takeCourse(req, res){
        try {
            let {id} = req.params
            let data = await Course.findByPk(id)
            let msg
            res.render('courseDetail', {data, msg})
        } catch (error) {
            res.send(error)
        }
    }


}

module.exports = {
    Controller
};
