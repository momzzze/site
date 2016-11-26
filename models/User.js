const mongoose = require('mongoose');
const encryption = require('./../utilities/encryption');
const Role = mongoose.model('Role');

let userSchema = mongoose.Schema(
    {
        email: {type: String, required: true, unique: true},
        passwordHash: {type: String, required: true},
        fullName: {type: String, required: true},
        articles: [{type: mongoose.Schema.Types.ObjectId, ref: 'Article'}],
        roles: [{type: mongoose.Schema.Types.ObjectId, ref: 'Role'}],
        salt: {type: String, required: true}
    }
);

userSchema.method ({
    authenticate: function (password) {
        let inputPasswordHash = encryption.hashPassword(password, this.salt);
        let isSamePasswordHash = inputPasswordHash === this.passwordHash;

        return isSamePasswordHash;
    },
    isAuthor: function(article) {

        if(!article){
            return false;
        }
        let isAuthor = article.author.equals(this.id);
        return isAuthor;
    },
    isInRole: function (roleName){
        return Role.findOne({name: roleName}).then(role => {

            if(!role){
                return false;
            }

            let isInRole = this.roles.indexOf(role.id) !== -1;

            return isInRole;
        })
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;

module.exports.seedAdmin = () =>{
    let email = 'admin@gmail.com';
    User.findOne({email: email}).then( user => {
        if(!user){
            let salt = encryption.generateSalt();
            let passwordHash = encryption.hashPassword('admin', salt);

            let userObject = {
                email: email,
                passwordHash: passwordHash,
                fullName: 'Admin',
                salt: salt
            };
            let roles = [];
            Role.findOne({name: 'Admin'}).then(role => {
                roles.push(role.id);
                userObject.roles = roles;

                User.create(userObject).then(user =>{
                    role.users.push(user.id);
                    role.save((err =>{
                        if(err){
                            console.log(err.message);
                        }else{
                            console.log('Admin user registered');
                        }
                    }))
                });
            })
        }
    })
};