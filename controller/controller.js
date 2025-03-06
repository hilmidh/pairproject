const {Category, Course, Profile, User, CourseUser} = require('../models/index.js');
const {comparePassword} = require('../helpers/helper.js');
var pdf = require("pdf-node");
var fs = require("fs");
const { Op } = require("sequelize");

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
            let {msg} = req.query
            res.render('signup', {msg})
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
            if(error.name === "SequelizeValidationError"){
                let msg = error.errors.map(e => e.message)
                res.redirect(`./regis?msg=${msg}`)
            }
            else{
                res.send(error)
            }
        }
    }

    static async showLogin (req,res){
        try {
            let {msg} = req.query
            res.render('login', {msg})
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
            let {msg, search} = req.query
            let data = await Course.getCoursesAndCat()
            if(search){
                data = await Course.findAll({
                    order:[["id", "ASC"]],
                    include: [{model: Category}],
                    where: {name: {[Op.iLike]: `%${search}%`}}
                  })
            }
            res.render('showCourseUser', {data, msg, userId})
        } catch (error) {
            console.log(error)
            res.send(error)
        }
    }

    static async showCoursesAdmin(req, res){
        try {
            let userId = req.session.userId
            let {msg, search} = req.query
            let data = await Course.getCoursesAndCat()
            
            if(search){
                data = await Course.findAll({
                    order:[["id", "ASC"]],
                    include: [{model: Category}],
                    where: {name: {[Op.iLike]: `%${search}%`}}
                  })
            }

            let courses = await Course.findAll({
                include: [{model: User}],
                order:  [["id", "ASC"]]
            })
            // res.send(courses)
            courses = courses.map(e =>{
                let users = e.Users.map(el => el.email.substring(0, el.email.indexOf("@")))
                return users
            })

            // res.send(courses)
           
            res.render('showCourseAdmin', {data, msg, userId, courses})
        } catch (error) {
            res.send(error)
        }
    }

    static async logout(req, res){
        try {
            req.session.destroy((err) => {
                if(err) res.send(err)
                else {
                    res.redirect('/')
                }
            })
        } catch (error) {
            res.send(error)
        }
    }

    static async addCourse(req, res){
        try {
            let userId = req.session.userId
            let data = await Category.findAll()
            res.render('formAddCourse', {userId, data})
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
            let courses = await User.findOne({
                where:{id},
                include: Course
            })
            courses = courses.Courses
            // res.send(courses)
            // res.send(profile)
            let profile = user.Profile
            res.render('profile', {user, msg, profile, userId, courses})
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
            let {fullName, photo, address, phoneNumber} = req.body
            
           
            
            let user = await User.findOne({
                where:{id},
                include: Profile
            })
            
            if(!user.Profile){
                await Profile.create({fullName, photo, address, phoneNumber, UserId: id})
                res.redirect(`/profile/${id}`)
            }
            else{
                await Profile.update({fullName, photo, address, phoneNumber}, {where: {UserId: id}})
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
            let userId = req.session.userId
            let data = await Course.findByPk(id)
            let categories = await Category.findAll()
            res.render('editCourse', {data, categories, userId})
        } catch (error) {
            res.send(error)
        }
    }

    static async handleEditCourse(req, res){
        try {
            let {id} = req.params
            let {name, duration, material, description, CategoryId} = req.body
            let course = await Course.findByPk(id)
            await course.update({name, duration, material, description, CategoryId})
            res.redirect('/admin')
        } catch (error) {
            res.send(error)
        }
    }

    static async takeCourse(req, res){
        try {
            let {id} = req.params
            let userId = req.session.userId
            let data = await Course.findByPk(id)
            let cat = await Category.findByPk(data.CategoryId)

            let conjunction = await CourseUser.findAll({
                where:{[Op.and]:[{UserId: userId}, {CourseId: id}]}
            })
            // res.send(conjunction)

            let msg
            if(conjunction.length = 0){
                msg = "You've already enrolled this course"
            }
            else{
                await CourseUser.create({UserId: userId, CourseId: id})
            }

            res.render('courseDetail', {data, msg, userId, cat})
        } catch (error) {
            res.send(error)
        }
    }

    static async delete(req, res){
        try {
            let {id} = req.params
            let course = await Course.findByPk(id)
            let deleted = course.name
            await course.destroy()
            res.redirect(`/admin?msg=${deleted}`)
        } catch (error) {
            res.send(error)
        }
    }

    static async pdf(req, res){
        try {
            let {id} = req.params
            let course = await Course.findByPk(id)

            var html = fs.readFileSync("template.html", "utf8");
            var options = {
                format: "A4",
                orientation: "portrait",
                border: "10mm",
                header: {
                    height: "45mm",
                    contents: '<div style="text-align: center;">Author: Shyam Hajare</div>'
                },
                footer: {
                    height: "28mm",
                    contents: {
                        first: 'Cover page',
                        2: 'Second page', // Any page number is working. 1-based index
                        default: '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>', // fallback value
                        last: 'Last Page'
                    }
                }
            };

            var users = [
                {
                  name: course.name,
                  material: course.material,
                },
              ];
              var document = {
                html: html,
                data: {
                  users: users,
                },
                path: `./output/${course.name}.pdf`,
                type: "pdf",
              };
            
              pdf(document, options)
              .then((res) => {
                console.log(res);
              })
              .catch((error) => {
                console.error(error);
              });

            res.redirect(`/courses/${course.id}`)
        } catch (error) {
            res.send(error)
        }
    }


}

module.exports = {
    Controller
};
