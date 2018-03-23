const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const fs = require('fs');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const config = require('./config/database');
const CryptoJS = require('crypto-js');
const fileUpload = require('express-fileupload');
//const logger = require('mongo-morgan-ext');
const dateAndTime = require('date-and-time');
//const async = require('async');
const Promise = require('promise');

const winston = require('winston');
const files = new winston.transports.File({ filename: 'combined.log' });
const console = new winston.transports.Console();
winston.add(console);
winston.add(files);

var siteClosed = true;

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
    mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL,
    mongoURLLabel = "";

("port=" + port);
("ip=" + ip);
("mongoURL=" + mongoURL);

if (mongoURL == null && process.env.DATABASE_SERVICE_NAME) {
  var mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase(),
      mongoHost = process.env[mongoServiceName + '_SERVICE_HOST'],
      mongoPort = process.env[mongoServiceName + '_SERVICE_PORT'],
      mongoDatabase = process.env[mongoServiceName + '_DATABASE'],
      mongoPassword = process.env[mongoServiceName + '_PASSWORD']
      mongoUser = process.env[mongoServiceName + '_USER'];

  if (mongoHost && mongoPort && mongoDatabase) {
    mongoURLLabel = mongoURL = 'mongodb://';
    if (mongoUser && mongoPassword) {
      mongoURL += mongoUser + ':' + mongoPassword + '@';
    }
    // Provide UI label that excludes user id and pw
    mongoURLLabel += mongoHost + ':' + mongoPort + '/' + mongoDatabase;
    mongoURL += mongoHost + ':' +  mongoPort + '/' + mongoDatabase;

  }
}

("mongoHost=" + mongoHost);
("mongoPort=" + mongoPort);
("mongoDatabas=" + mongoDatabase);
("mongoURL=" + mongoURL);

//if ( process.env.LOCAL_SERVER == 'PFC') {
//  mongoURL = "mongodb://localhost/dgidgital"
//}
("BIS mongoURL=" + mongoURL);

// MongoDB
// -------
mongoose.connect(mongoURL); //'mongodb://localhost/dgidgital'
var db = mongoose.connection;
db.once('open', function() {
  ('Connecté à MongoDB');
});
db.on('error', function(err) {
  (err);
});

// initialisation de l'appli
// -------------------------
const app = express();

// Modèles
// -------
var Post = require('./models/post');
var Image = require('./models/image');
var User = require('./models/user');
var Log = require('./models/log');

//app.use(logger(mongoURL,'logs'));

//  view engine
// ------------
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
//app.set('view engine', 'ejs');

app.use(fileUpload());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(express.static('static'));

// Express Session Middleware
app.use(session({
  secret: 'j\'ai Péère au téléphone',
  resave: true,
  saveUninitialized: true
}));

// Express Messages Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Express Validator Middleware
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

// Passport midlleware
// -------------------
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(req, res, next) {
  //('');
  //('');
  //('>> DEBUG passage dans get *');
  //('>> res.req');
  //(res.req);
  res.locals.user = req.user || null;
  next();
});

app.get('*', function(req, res, next) {

  res.locals.siteClosed = siteClosed;

  //('');
  //('suspect [1] next=' + typeof next  + "req.next=" + typeof req.next);
  var url = req.url || "";
  if ((url == '/pagecount') || (url.indexOf('/avatar') !== -1)  || (url.indexOf('favicon') !== -1) || (url.indexOf('images') !== -1)) {
    next();
  } else {
    var userId = "";
    if (req.user) {
      userId = req.user.userId;
    }
    var dt = dateAndTime.format(new Date(), "YYYY-MM-DD HH:mm:ss");
    var l = {
      dt : dt,
      userId : userId,
      url : url,
      ip : req.ip
    };
    var newLog = new Log(l);

    //(l);
    //("[log] userId=" + userId  + ", url=" + req.url + ", ip=" + req.connection.remoteAddress);
    newLog.save(function(err) {
      //('suspect [2] next=' + typeof next  + "req.next=" + typeof req.next);
      if(err){
        //(l);
        //("Erreur à la sauvegarde de l\'avatar userId=" + userId + " : " + err);
        next();
      } else {
        next();
      }
    });
    //('suspect [3] next=' + typeof next  + "req.next=" + typeof req.next);
  }
});


// définition des routes
// ---------------------
app.get('/', function(req, res) {
  res.render('cover', {
    bodyClass: 'cover-body'
  });
});

app.get('/test/:page', function(req, res) {
  res.render('test/' +req.params.page );
});

app.get('/a_propos_de_lui', function(req, res) {
  res.render('a_propos_de_lui', {
    bodyClass: 'a-propos-de-lui-body'
  });
});

app.get('/pagecount', function(req, res) {
  res.send('COUCOU');
});

app.get('/hashtags', function(req, res) {
  var user = req.user;
  if (!user) {
    res.redirect('/');
    return;
  }
  Post.distinct('hashtags').exec(function (err, hashtags) {
    if (err) {
      req.flash('success','Une erreur s\'est produite : ' + err);
    }
    //winston.info(">> hashtags:" + hashtags);
    res.render('hashtags_list', {
      hashtags:hashtags
    });
  });
});

function getPostsForHashtag(hashtag) {
  return new Promise(function (fulfill, reject) {
    Post.find({hashtags:hashtag})
    .sort({ _id: -1 })
    .exec()
    .then(posts => fulfill(posts))
    .catch(err => reject(err));
  });
}

app.get('/hashtags/:hashtag', function(req, res) {
  var user = req.user;
  if (!user) {
    res.redirect('/');
    return;
  }

  var hashtag = req.params.hashtag;

  getPostsForHashtag(hashtag)
    .then(posts => {
      res.render('hashtags_home', {
        hashtag: hashtag,
        posts : posts
      });
    })
    .catch((err)=>{
      //("##### err catchee : " + err);
      req.flash('success','Une erreur s\'est produite : ' + err);
      res.render('hashtags_home', {
        hashtag: hashtag
      });
    });
});

var maxInPage = 30;

function getPostsStarting(first) {
  return new Promise(function (fulfill, reject) {
    Post.find({_id : {$lte: first}})
    .limit(maxInPage + 1)
    .sort({ _id: -1 })
    .exec()
    .then(posts => fulfill(posts))
    .catch(err => reject(err));
  });
}

function getLastPosts() {
  return new Promise(function (fulfill, reject) {
    Post.find()
    .limit(maxInPage + 1)
    .sort({ _id: -1 })
    .exec()
    .then(lastPosts => fulfill(lastPosts))
    .catch(err => reject(err));
  });
}

function getPostById(postId) {
  return new Promise(function (fulfill, reject) {
    Post.findById(postId)
    .then(post => fulfill(post))
    .catch(err => reject(err));
  });
}

/*
function updatePost(post) {
  return new Promise(function (fulfill, reject) {
    updatedPost.save(function(err) {
      if (err) {
        reject(err);
      } else {
        fulfill(post);
      }
    });
  });
}
*/

app.post('/posts/:postId/comment', function(req, res) {
  var user = req.user;
  if (!user) {
    res.redirect('/');
    return;
  }

  var postId = req.params.postId

  var comment = req.body.comment

  winston.info('postId=' + postId + ', comment=' + comment);
  if (comment && (comment.trim().length > 0)) {
    getPostById(postId)
    .then((post)=> {
      winston.info('>> [DEBUG] 1 debut then');
      return new Promise(function (fulfill, reject) {
        winston.info('>> [DEBUG] 2 debut PROMISE');

        var now = dateAndTime.format(new Date(), "YYYY-MM-DD HH:mm:ss");
        var commentId = new mongoose.Types.ObjectId();

        commentId = new mongoose.Types.ObjectId();
        var newComment = {
          _id: commentId,
          userId: user.userId,
          postId: postId,
          date : now,
          content : comment
        };

        if (!post.comments) {
            post.comments = [];
        }
        post.comments.push(newComment);

        var hashtagsSet = new Set(post.hashtags.concat(findHashtags(comment)));
        post.hashtags = Array.from(hashtagsSet);

        var youGuysSet = new Set(post.youGuys.concat(findYouGuys(comment)));
        post.youGuys = Array.from(youGuysSet);

        winston.info('>> [DEBUG] 3 avant save Post');
        post.save(function(err) {
          winston.info('>> [DEBUG] 4 retour save err=' + err);
          if (err) {
            reject(err);
          } else {
            fulfill(post);
          }
        });
      });
    })
    .then((post)=> {
      winston.info('>> [DEBUG] 5 2eme then');
      res.render('comments', {
        post
      })
    })
    .catch((err)=>{
      winston.info('>> [DEBUG] 6 CATCH err=' + err);
      res.status(500).send({error: err});
    });
  } else {
    winston.info('>> [DEBUG] 7 no comment');
    res.status(500).send({error: 'no comment'});
  }
});

app.get('/posts/:page/:first', function(req, res) {
  var user = req.user;
  if (!user) {
    res.redirect('/');
    return;
  }

  var page = parseInt(req.params.page);
  var first = req.params.first;
  getPostsStarting(first)
  .then(posts => {
    var nextPost;
    if (posts.length > maxInPage) {
      nextPost = posts[maxInPage];
      posts.pop();
    }

    res.render('posts_list_pug', {
      posts : posts,
      nextPost : nextPost,
      title : "Page " + page,
      page : page + 1
    });
  })
  .catch((err)=>{
    //("##### err catchee : " + err);
    req.flash('success','Une erreur s\'est produite : ' + err);
    res.render('posts_last_pug');
  });
});

app.get('/posts_last', function(req, res) {
  var user = req.user;
  if (!user) {
    res.redirect('/');
    return;
  }

 getLastPosts()
  .then(posts => {
    //('/posts_last AVANT render');
    var nextPost;
    if (posts.length > maxInPage) {
      nextPost = posts[maxInPage];
      posts.pop();
    }

    res.render('posts_list_pug', {
      posts : posts,
      nextPost : nextPost,
      title : "Les dernières dgidgi.talisations",
      page : 2
    });
  })
  .catch((err)=>{
    //("##### err catchee : " + err);
    req.flash('success','Une erreur s\'est produite : ' + err);
    res.render('posts_last_pug');
  });
});

app.get('/images/:imageId', function(req, res) {
  var user = req.user;
  if (!user) {
    res.sendStatus(500);
    return;
  }

  var imageId = req.params.imageId;
  res.contentType("image/jpeg"); //avatar.contentType

  //("imageId=" + imageId);
  var query = {_i:new mongoose.Types.ObjectId(imageId)}
  Image.findById(imageId, function(err, image) {
    if (err) {
      ("err=" + err + " pour image " + imageId);
      res.sendStatus(500);
    } else {
      if (image) {
        //("TROUVE !!!!");
        //(avatar);
        res.send(image.image);
      } else {
        res.sendStatus(404);
      }
    }
  });
});

app.get('/posts/add', function(req, res) {
  var user = req.user;
  if (!user) {
    res.redirect('/');
    return;
  }
  res.render('posts_add');
});

function saveNewPost(newPost) {
  //("newPost - AVANT lancement promise");
  return new Promise(function (fulfill, reject) {
    newPost.save(function(err) {
      //("newPost -save err=" + err);
      if (err) {
        reject(err);
      } else {
        fulfill();
      }
    });
  });
}

function saveNewImage(newImage) {
  //("newImage - AVANT lancement promise");
  return new Promise(function (fulfill, reject) {
    if (!newImage) {
      //("newImage RIEN A FAIRE");
      fulfill();
    } else {
      newImage.save(function(err) {
        //("newImage -save err=" + err);
        if (err) {
          reject(err);
        } else {
          fulfill();
        }
      });
    }
  });
}

function findYouGuys(searchText) {
    var regexp = /@[A-zÀ-ú_-]+/g
    result = searchText.match(regexp);
    if (result) {
        result = result.map(function(s){ return s.trim().toLowerCase().substr(1);});
        return result;
    } else {
        return [];
    }
}

function findHashtags(searchText) {
    //("find dans " + searchText);
    var regexp = /#[A-zÀ-ú_-]+/g
    result = searchText.match(regexp);
    if (result) {
        result = result.map(function(s){ return s.trim().toLowerCase().substr(1);});
        //(result);
        return result;
    } else {
        //("pas result");
        return [];
    }
}

app.post('/posts/add', function(req, res) {
  var user = req.user;
  if (!user) {
    res.redirect('/');
    return;
  }

  var hasImage = false;
  if (req.files && req.files.fileUpload && req.files.fileUpload.data) {
    hasImage = true;
  }
  ("hasImage:" + hasImage);

  var now = dateAndTime.format(new Date(), "YYYY-MM-DD HH:mm:ss");
  var postId = new mongoose.Types.ObjectId();

  var imageId;
  var newImage;

  if (hasImage) {
    imageId = new mongoose.Types.ObjectId();
    var newImage = new Image({
      _id: imageId,
      userId: user.userId,
      postId: postId,
      date : now
    });
    newImage.image = req.files.fileUpload.data;
  }

  var newPost = new Post({
    _id: postId,
    userId: user.userId,
    imageId: imageId,
    date : now
  });
  newPost.content = req.body.content;

  var hashtags = findHashtags(req.body.content);
  //("hashtags: " + hashtags);
  newPost.hashtags = hashtags;

  var youGuys = findYouGuys(req.body.content);
  ("youGuys: " + youGuys);
  newPost.youGuys = youGuys;

  saveNewPost(newPost)
  .then(saveNewImage(newImage))
  .then(()=> {
    //("##### OKKKKKK : ");
    res.redirect('/users/' + user.userId);
  })
  .catch((err)=>{
    //("##### err catchee : " + err);
    req.flash('success','Une erreur s\'est produite : ' + err);
    res.redirect('/users/' + user.userId);
  });
});

app.get('/auth', passport.authenticate('local'), function(req, res){
  ("passport user", req.user);
});

/*
app.use(function printSession(req, res, next) {
  ('[printSession] req.session', req.session);
  return next();
});
*/

var users = require('./routes/users');
app.use('/users', users);

// création de compte
// ------------------
// GET  /register : affiche le formulaire d'inscription
// POST /register : traite la réponse
app.get('/register', function(req, res) {
  res.render('register', {
    title: 'Connexion'
  })
});

app.post('/register', function(req, res) {
  // extraction de tous les champs de la réponse
  var magic = req.body.magic;
  var userId = req.body.userId;
  var userName = req.body.userName;
  var email = req.body.email;
  var description = req.body.description;
  var encPassword = req.body.encPassword;
  var encPassword2 = req.body.encPassword2;

  var d1 = CryptoJS.AES.decrypt(encPassword, userId).toString(CryptoJS.enc.Utf8);
  var d2 = CryptoJS.AES.decrypt(encPassword2, userId).toString(CryptoJS.enc.Utf8);

  // vérification dez champs
  req.checkBody('magic', 'Le mot magique est obligatoire').trim().equals('svp');
  //req.checkBody('magic', 'LE SITE VA BIENTOT OUVRIR').trim().equals('install');
  req.checkBody('userId', 'L\'identifiant doit être au minimum un trigramme. Il peut contenir des caractères minuscules, des chiffres ou _').trim().matches('[a-z][a-z0-9_]{1,}[a-z]');
  req.checkBody('userName', 'Le nom/prénom est obligatoire').trim().notEmpty();
  req.checkBody('email', 'L`\'email est obligatoire (mettez un email où Guillaume peut vous contacter)').trim().notEmpty();
  req.checkBody('encPassword', 'Le mot de passe est obligatoire').notEmpty();
  if (d1 != d2) {
    req.checkBody('encPassword2', 'Le mot de passe et sa confirmation ne sont pas identiques').equals(req.body.encPassword);
  }

  var errors = req.validationErrors();
  if (errors) {
    res.render('register', {
      errors:errors,
      magic:magic,
      userId:userId,
      userName:userName,
      email:email,
      description:description
    });
  } else {
    // La vérification du userId, asynchrone par nature, est traitée maintenant
    var query = {userId:userId}
    User.findOne(query, function(err, user) {
      if (err) {
        res.render('register', {
          errors : [{location:"body", param:"userId", msg:"Une erreur est produite lors de la recherche d\'un utilisateur existant : " + err}],
          magic:magic,
          userId:userId,
          userName:userName,
          email:email,
          description:description
        });
      } else {
        if (user) {
          res.render('register', {
            errors : [{location:"body", param:"userId", msg:"Il y a déjà un utilisateur avec cet identifiant"}],
            magic:magic,
            userId:userId,
            userName:userName,
            email:email,
            description:description
          });
        } else {
          ("Création de l\'utilisateur " + userId);

          var newUser = new User({
            _id: new mongoose.Types.ObjectId(),
            userId: userId,
            userName: userName,
            creationDate: new Date(),
            email: email,
            encPassword: encPassword,
            description: description
          });

          newUser.save(function(err){
            if(err){
              ("Erreur à la création de l\'utilisateur " + userId + " : " + err);
              res.render('register', {
                errors : [{location:"body", param:"userId", msg:"Une erreur s'est produite : " + err}],
                magic:magic,
                userId:userId,
                userName:userName,
                email:email,
                description:description
              });
            } else {
              req.flash('success','Votre compte est enregistré');
              res.redirect('/login');
            }
          });
        }
      }
    });
  }
});

app.get('/admin/debug_routes', function(req, res) {
  res.send(JSON.stringify(app._router.stack));
});

app.get('/admin/logs', function(req, res) {
  Log.find().sort({dt:-1}).exec(function(err, logs) {
    var errors = null;
    if (err) {
      req.flash('success', err);
    }
    res.render('admin_logs', {
      logs: logs
    });
  });
});

// login
// -----
// GET  /login  : affiche le formulaire de login
// POST /login  : traite la réponse
app.get('/login', function(req, res) {
  res.render('login', {
    title: 'Connexion'
  })
});

app.post('/login', function(req, res, next) {
  ('DEBUG /login Firefox ');
  (req.body);
  var successRedirect = "/users/" + req.body.userId;
  passport.authenticate('local', {
    successRedirect: successRedirect,
    failureRedirect: '/login',
    failureFlash: true
  }) (req, res, next);
});

// logout
// ------
// GET  /logout  : déconnecte l'utilisateur
app.get('/logout', function(req, res) {
  req.logout();
  req.flash('success', 'Vous êtes déconnecté');
  res.redirect('/login');
});

// start server
// ------------
app.listen(port, ip, function() {
  ('Serveur started ...');
});
