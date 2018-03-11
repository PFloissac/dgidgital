const express = require('express');
const router = express.Router();
const passport = require('passport');
const fs = require('fs');
const mongoose = require('mongoose');
const winston = require('winston');

// Modèle
// ------
var User = require('../models/user');
var Post = require('../models/post');
var Avatar = require('../models/avatar.js');


router.get('/', function(req, res) {
  var targetUserId = req.params.targetUserId;

  User.find(function(err, allUsers) {
    //winston.info("allUsers");
    //winston.info(allUsers);
    var errors = null;
    if (err) {
      errors = [{location:"body", param:"body", msg:err}]
    }
    res.render('users_list', {
      errors : errors,
      allUsers : allUsers
    });
  });
});

router.get('/exists/:userId', function(req, res) {
  var userId = req.params.userId;

  var query = {userId:userId}
  User.findOne(query, function(err, user) {
    if (err) {
      res.send(userId + "err");
    } else {
      if (user) {
        res.send(userId + "TROUVE");
      } else {
        res.send(userId + " NOT FOUND");
      }
    }
  });
});

router.get('/:targetUserId/avatar', function(req, res) {
  var targetUserId = req.params.targetUserId;

  var query = {userId:targetUserId}
  Avatar.findOne(query, function(err, avatar) {
    if (err) {
      winston.info("err=" + err);
      res.status(500);
      return;
    } else {
      if (avatar) {
        //winston.info("TROUVE !!!!");
        //winston.info(avatar);
        res.contentType("image/jpeg"); //avatar.contentType
        res.send(avatar.image);
      } else {
        //winston.info("avatar non trouvé");
        res.redirect("/img/no_avatar.jpg");
      }
    }
  });
});

router.post('/:targetUserId/avatar/change', function(req, res) {
  var targetUserId = req.params.targetUserId;
  if (req.user && (req.user.userId == targetUserId)) {
    //winston.info("upload DEB");
    //winston.info(req.files.fileUpload);

    var err = null;
    if (!req.files.fileUpload) {
      err = "Pas de fichier";
    } else if (req.files.fileUpload.mimetype > 1000) {
      err = "La taille est trop importante : " + req.files.fileUpload.byteLength;
    } else if (req.files.fileUpload.mimetype != 'image/jpeg') {
      err = "Le type de fichier doit être jpeg";
    }

    if (err != null) {
      //winston.info(">> ERREUR = " + err);
      req.flash('success', err);
      res.redirect('/users/' + targetUserId);
      return;
      //res.redirect('users_avatar_change', {
      //  errors : [{location:"body", param:"fileUpload", msg:err}]
      //});
    }

    var query = {userId:targetUserId}
    Avatar.findOne(query, function(err, avatar) {
      if (err) {
        res.send("avatar " + targetUserId + " err");
        return;
      } else {
        if (!avatar) {
          avatar = new Avatar({
            _id: new mongoose.Types.ObjectId(),
            userId: targetUserId
          });
        }
        avatar.image = req.files.fileUpload.data;
        avatar.contentType = req.files.fileUpload.mimeType;

        avatar.save(function(err) {
          if(err){
            winston.info("Erreur à la sauvegarde de l\'avatar userId=" + userId + " : " + err);
            res.redirect('/users/' + targetUserId);
            return;
          } else {
            req.flash('success','L\'avatar a été mis à jour');
            res.redirect('/users/' + targetUserId);
            return;
          }
        });
      }
    });
  } else {
    res.redirect('/users');
    return;
  }
});

router.get('/:targetUserId/avatar/change', function(req, res) {
  var targetUserId = req.params.targetUserId;
  if (req.user && (req.user.userId == targetUserId)) {
    res.render('users_avatar_change',{
      title:'Charger un avatar'
    });
  } else {
    res.redirect('/users');
  }
});

router.get('/:targetUserId', function(req, res, next) {
  var user = res.locals.user || {};
  var targetUserId = req.params.targetUserId;
  var title = "Home, sweet home";
  var queryUser = {userId:targetUserId}
  //winston.info(">> [1] ICI req.next=" + typeof req.next);

  User.
  findOne(queryUser).
  populate('posts').
  exec(function (err, targetUser) {
    if (err) {
      winston.info(">> [2] ERR req.next=" + typeof req.next);
      res.render('users_home', {
        errors : [{location:"body", param:"targetUserId", msg:"Une erreur est produite lors de la recherche d\'un utilisateur existant : " + err}],
        posts:null,
        targetUser:null,
        user:user
      });
    } else {
      if (!targetUser) {
        res.render('users_home', {
          posts:null,
          targetUser:null,
          user:user
        });
      } else {
        //winston.info("targetUser.posts-------------------");
        //winston.info(targetUser.posts);
        res.render('users_home', {
          posts:targetUser.posts,
          targetUser:targetUser,
          user:user
        });
      }
    }
  });
});
/*
router.get('/A_DETRUIRE/:targetUserId', function(req, res, next) {
  var user = res.locals.user || {};
  var targetUserId = req.params.targetUserId;
  var title = "Home, sweet home";
  var queryUser = {userId:targetUserId}
  winston.info(">> [1] ICI req.next=" + typeof req.next);
  User.findOne(queryUser, function(err, targetUser, next) {
    if (err) {
      winston.info(">> [2] ERR req.next=" + typeof req.next);
      res.render('users_home', {
        errors : [{location:"body", param:"targetUserId", msg:"Une erreur est produite lors de la recherche d\'un utilisateur existant : " + err}],
        posts:null,
        targetUser:null,
        user:user
      });
    } else {
      winston.info(">> [2] PAS ERR req.next=" + typeof req.next);
      if (targetUser) {
        winston.info(">> [3] recherche Post  req.next=" + typeof req.next);
        var queryPosts = {userId:targetUserId}
        Post.find(queryPosts, function(err, posts, next) {
          if (err) {
            winston.info(">> [4] ERR req.next=" + typeof req.next);
            res.render('users_home', {
              errors : [{location:"body", param:"targetUserId", msg:"Une erreur est produite lors de la recherche des posts de l'utilisateur : " + err}],
              posts:null,
              targetUser:null,
              user:user
            });
          } else {
            winston.info(">> [5] OK req.next=" + typeof req.next);
            if (posts) {
              res.render('users_home', {
                posts:posts,
                targetUser:targetUser,
                user:user
              });
            } else {
              res.render('users_home', {
                posts:null,
                targetUser:null,
                user:user
              });
            }
          }
        });
      } else {
        // pas de user
        res.render('users_home', {
          targetUser:null,
          user:user
        });
      }
    }
  });
});
*/
module.exports = router;
