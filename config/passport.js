const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');
const config = require('../config/database');
const CryptoJS = require('crypto-js');
const winston = require('winston');

module.exports = function(passport) {

  passport.use(
    // stratégie locale d'authentification
    new LocalStrategy(
      // ce 1er objet est important car on n'utilise pas les
      // noms de champ par défaut (usernname, password)
      {
        usernameField: 'userId',
        passwordField: 'encPassword'
      },
      // La fonction ci-dessous ne semble appelée que si
      // Passport a su extraire de la requête les deux champs
      // définis au dessus et que ces deux champs ne sont
      // pas vides.
      function(userId, encPassword, done) {

        //winston.info('Passport - stratégie locale userId=' + userId + ", encPassword=" + encPassword);

        // on tente de trouver l'utilisateur dans MongoDB
        var query = {userId:userId};
        User.findOne(query, function(err, user) {
          if (err) {
            throw err;

          } else if (!user) {
            //winston.info('Utilisateur non trouvé - userId=' + userId);
            return done(null, false, {message:'Utilisateur non trouvé'});
          }

          var d1 = CryptoJS.AES.decrypt(user.encPassword, userId).toString(CryptoJS.enc.Utf8);
          var d2 = CryptoJS.AES.decrypt(encPassword, userId).toString(CryptoJS.enc.Utf8);
          if (d1 == d2) {
            //winston.info('ET LE USER EST ... %j', user);
            return done(null, user);
          } else {
            //winston.info('Mot de passe erroné d2=' + d2);
            return done(null, false, {message:'Mot de passe erroné'});
          }
        });
      }
  ));

  passport.serializeUser(function(user, done) {
      done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });
}
