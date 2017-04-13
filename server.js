require('dotenv').load();
var express = require('express');
var passport = require('passport');
var bodyParser = require('body-parser');
var Strategy = require('passport-twitter').Strategy;
var path = require('path');
var mongoose = require('mongoose');
var Venue = require('./app/models/venues.js');

passport.use(new Strategy({
  consumerKey : process.env.CONSUMER_KEY,
  consumerSecret : process.env.CONSUMER_SECRET,
  callbackURL : 'https://venuekodama.herokuapp.com/login/twitter/return'
},
  function(token,tokenSecret,profile,cb){
    return cb(null,profile);
}));
passport.serializeUser(function(user,cb){
  cb(null,user);
});
passport.deserializeUser(function(obj,cb){
  cb(null,obj);
});

var app = express();

app.set('view engine','ejs');
app.use(express.static(__dirname));
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(require('express-session')({ secret: 'ifartafterbeans', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

mongoose.Promise = global.Promise;
var options = { server: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } },
replset: { socketOptions: { keepAlive: 300000, connectTimeoutMS : 30000 } } };
mongoose.connect('mongodb://wisekodama:farter@ds155150.mlab.com:55150/restaurantfinder',options);
var conn = mongoose.connection;
conn.on('error',console.error.bind(console,'Connection Error'));
conn.once('open',function(){console.log('Connected to DB');});

app.get('/',function(req,res){
  if(req.isAuthenticated()){
  res.render('index.ejs',{user:req.user,userLoc:req.headers['x-forwarded-for']});}
  else{res.render('index.ejs',{user:'',userLoc:req.headers['x-forwarded-for']});}
});
app.post('/checkGuests/:city',function(req,res){
  Venue.find({venueCity:req.params.city},function(err,venue){
    if(err) return console.error(err);
    if(venue) res.status(200).json(venue);
  });
});
app.post('/:name/:id/:city',function(req,res){
  if(req.isAuthenticated()){
  Venue.findOne({venueID:req.params.id},function(err,venue){
    if(err) return console(err);
    if(venue){
      if(venue.userList.indexOf(req.user.id) <= -1){
        venue.userList.push(req.user.id);
        venue.save(function(error,data){
          if(error) return console.error(error);
          res.status(201).send(' ');
        });
      }
      else{
        venue.userList.splice(venue.userList.indexOf(req.user.id),1);
        venue.save(function(error,data){
          if(error) return console.error(error);
          res.status(202).send(' ');
        })
      }
    }
    else{
      var newVenue = new Venue();
      newVenue.venueCity = req.params.city.toLowerCase();
      newVenue.venueName = req.params.name;
      newVenue.venueID = req.params.id;
      newVenue.userList.push(req.user.id);
      newVenue.save(function(error,data){
              if(error) return console.error(error);
              console.log('Venue Added');
              res.status(200).send(' ');
          });
      }
  });
}
else{res.status(500).send(' ');}
});

app.get('/login/twitter',passport.authenticate('twitter'));

app.get('/login/twitter/return',passport.authenticate('twitter',{failureRedirect : '/'}),function(req,res){res.redirect('/');});

app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
});

function isLoggedIn(req,res,next){
  if(req.isAuthenticated()) return next();
  else{res.redirect('/login/twitter');}
}

var port = process.env.PORT || 8080;

app.listen(port,function(){
  console.log('App running on ' + port);
});
