const mongoose = require('mongoose');
const { isEmail } = require('validator').default;
const { validatePassword, isPasswordValid, generatePassword } = require('../security/password_utils');


const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: [true, "please enter an email"],
        unique: true,
        lowercase: true,
        validate: [isEmail, "please enter a valid email"]
    },
    password: {
        type: String,
        required: [true, "please enter a password"],
        minlength: [8, "password must be up to eight characters in length"],
        //validate: [validatePassword, ""]
    },
    salt: String,
    isValidated: {
        type: Boolean,
        default: false
    },
    isEditor: {
        type: Boolean,
        default: false
    },
    dateOfBirth: Date,
    gender: String,
    isAdmin: {
        type: Boolean, 
        default: false
    },
    address: {
        type: String,
        required: false
    },
    imageUrl: String
});

userSchema.statics.login = async function(email, password, isEmail) {
    let user = null;
    if(isEmail) {
        user = await this.findOne({ email });
    } else {
        user = await this.findOne({ username: email });
    }
    if(user != null) {
        console.log(user)
        const valid = isPasswordValid(password, user.password, user.salt)
        if(valid) {
            return user;
        } else {
            throw Error("Incorrect password")
        }
    } else {
        throw Error("Email does not exist")
    }
}

userSchema.statics.changePassword = async function(id, password) {
    const { hash, salt } = generatePassword(password);
    try {
        const user = await this.findOneAndUpdate({ _id: id }, { password: hash, salt: salt })
        return user;
    } catch (error) {
        throw error;
    }
}

userSchema.post('save', (doc, next) => {
    next();
});

userSchema.pre('save', async function(next) {
    const { hash, salt } = generatePassword(this.password)
    this.password = hash,
    this.salt = salt
    console.log(hash, salt, this.password, this.salt)
    next();
})

const User = mongoose.model('User', userSchema);

module.exports = User;