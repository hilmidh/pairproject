const bcrypt = require('bcryptjs')

const hashPassword = (password) => {
    const salt = bcrypt.genSaltSync(10)
    return bcrypt.hashSync(password, salt)
}

const comparePassword = (password, hashedPassword) => {
    
    return bcrypt.compareSync(password, hashedPassword)
}

const getOnlyName = email => {
    return email.substring(0, email.indexOf("@"))
}


module.exports = {hashPassword, comparePassword, getOnlyName};