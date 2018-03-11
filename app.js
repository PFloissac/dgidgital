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

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
    mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL,
    mongoURLLabel = "";

console.log("port=" + port);
console.log("ip=" + ip);
console.log("mongoURL=" + mongoURL);

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

console.log("mongoHost=" + mongoHost);
console.log("mongoPort=" + mongoPort);
console.log("mongoDatabas=" + mongoDatabase);
console.log("mongoURL=" + mongoURL);
 
if ( process.env.LOCAL_SERVER = 'PFC') {
  mongoURL = "mongodb://localhost/dgidgital"
}
console.log("BIS mongoURL=" + mongoURL);

// MongoDB
// -------
mongoose.connect(mongoURL); //'mongodb://localhost/dgidgital'
var db = mongoose.connection;
db.once('open', function() {
  console.log('Connecté à MongoDB');
});
db.on('error', function(err) {
  console.log(err);
});

// initialisation de l'appli
// -------------------------
const app = express();

// Modèles
// -------
var Post = require('./models/post');
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
  //console.log('');
  //console.log('');
  //console.log('>> DEBUG passage dans get *');
  //console.log('>> res.req');
  //console.log(res.req);
  res.locals.user = req.user || null;
  next();
});

app.get('*', function(req, res, next) {
  //console.log('');
  //console.log('suspect [1] next=' + typeof next  + "req.next=" + typeof req.next);
  var url = req.url || "";
  if (url.indexOf('/avatar') !== -1) {
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
      ip : req.connection.remoteAddress
    };
    var newLog = new Log(l);

    //console.log(l);
    //console.log("[log] userId=" + userId  + ", url=" + req.url + ", ip=" + req.connection.remoteAddress);
    newLog.save(function(err) {
      //console.log('suspect [2] next=' + typeof next  + "req.next=" + typeof req.next);
      if(err){
        //console.log(l);
        //console.log("Erreur à la sauvegarde de l\'avatar userId=" + userId + " : " + err);
        next();
      } else {
        next();
      }
    });
    //console.log('suspect [3] next=' + typeof next  + "req.next=" + typeof req.next);
  }
});


// définition des routes
// ---------------------
app.get('/', function(req, res) {
  res.render('cover', {
    bodyClass: 'cover-body'
  });
});

app.get('/a_propos_de_lui', function(req, res) {
  res.render('a_propos_de_lui', {
    bodyClass: 'a-propos-de-lui-body'
  });
});

app.get('/test/:page', function(req, res) {
  var path = "test/" + req.params.page;
  res.render(path);
});

app.get('/login_register', function(req, res) {
  res.render('login_register');
});

app.get('/posts/add', function(req, res) {
  res.render('posts_add', {
    title: 'Nouvelle dgidgitalisation'
  })
});

app.post('/posts/add', function(req, res) {
  var user = req.user;
  //console.log(user);

  if (!user) {
    res.redirect('/');
  }
  var newPost = new Post();
  newPost._id = new mongoose.Types.ObjectId(),
  newPost.user = user._id,
  newPost.date = dateAndTime.format(new Date(), "YYYY-MM-DD HH:mm:ss");
  newPost.content = req.body.content;

  newPost.save(function(err){
    if (err){
      console.log(err);
      return;
    } else {
      res.redirect('/users/' + user.userId);
    }
  });
});

app.get('/auth', passport.authenticate('local'), function(req, res){
  console.log("passport user", req.user);
});

/*
app.use(function printSession(req, res, next) {
  console.log('[printSession] req.session', req.session);
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
  console.log('d1=' + d1 + " " + encPassword);
  console.log('d2=' + d2 + " " + encPassword2);

  // vérification dez champs
  req.checkBody('magic', 'Le mot magique est obligatoire').trim().equals('stp');
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
          console.log("Création de l\'utilisateur " + userId);

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
              console.log("Erreur à la création de l\'utilisateur " + userId + " : " + err);
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
  var successRedirect = "/users/" + req.body.userId;
  passport.authenticate('local', {
    successRedirect: successRedirect,
    failureRedirect: '/login',
    failureFlash: false
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
app.listen(3000, function() {
  console.log('Serveur started ...');
});
