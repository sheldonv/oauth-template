import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors'
import session from 'express-session'
import passport from 'passport'
import User from './User';
import { IMongoDBUser, IUser } from './types'
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const GitHubStrategy = require('passport-github').Strategy;

dotenv.config();
const app = express();
mongoose.connect(`mongodb://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0-shard-00-00.pjqpy.mongodb.net:27017,cluster0-shard-00-01.pjqpy.mongodb.net:27017,cluster0-shard-00-02.pjqpy.mongodb.net:27017/oauth?ssl=true&replicaSet=atlas-xe6iz2-shard-0&authSource=admin&retryWrites=true&w=majority`, {
  useNewUrlParser: true,
  useUnifiedTopology: true 
}, () => {
  console.log("Connected to mongoose successfully")
});

//Middleware
app.use(express.json());
app.use(cors({origin: "https://boring-stonebraker-dd5342.netlify.app", credentials: true}))

app.set("trust proxy", 1)
app.use(
    session({
        secret: "secretcode",
        resave: true,
        saveUninitialized: true, 
        cookie: {
          sameSite: "none",
          secure: true,
          maxAge: 1000 * 60 * 60 * 24 * 7 // One Week
        } 
    })
)
app.use(passport.initialize());
app.use(passport.session())

passport.serializeUser((user: any, done: any) => {
    return done(null, user.id);
})

passport.deserializeUser((id: string, done) => {
    User.findById(id, (err: Error, doc: IMongoDBUser) => {
      return done(null, doc)
    }) 
})

// Google Strategy
passport.use(new GoogleStrategy({
    clientID: `${process.env.GOOGLE_CLIENT_ID}`,
    clientSecret: `${process.env.GOOGLE_CLIENT_SECRET}`,
    callbackURL: "/auth/google/callback"
  },
  function(accessToken: any, refreshToken: any, profile: any, cb: any) {
    User.findOne({ googleId: profile.id }).then(
      (response) => {
        if (!response) {
          const newUser = new User({
            googleId: profile.id,
            username: profile.name.givenName,
            imageUrl: profile.photos[0].value
          });
          newUser.save();
          cb(null, newUser);
        }else{
          console.log(response)
          cb(null, response)
        }
         
      })
    }
  ));

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('https://boring-stonebraker-dd5342.netlify.app');
  });

// Twitter Strategy

/*passport.use(new TwitterStrategy({
  consumerKey: "",
  consumerSecret: "",
  callbackURL: "http://localhost:4000/auth/twitter/callback"
},
  function (token: any, tokenSecret: any, profile: any, cb: any) {
    console.log(profile);
    cb(null, profile);
  }
));

app.get('/auth/twitter',
  passport.authenticate('twitter'));

app.get('/auth/twitter/callback', 
  passport.authenticate('twitter', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('http://localhost:3000');
  }); */

// GitHub Strategy

passport.use(new GitHubStrategy({
  clientID: `${process.env.GITHUB_CLIENT_ID}`,
  clientSecret: `${process.env.GITHUB_CLIENT_SECRET}`,
  callbackURL: "/auth/github/callback"
},
function(accessToken: any, refreshToken: any, profile: any, cb: any) {
  User.findOne({ githubId: profile.id }).then(
    (response) => {
      if (!response) {
        const newUser = new User({
          githubId: profile.id,
          username: profile.username,
          imageUrl: profile.photos[0].value
        });
        newUser.save();
        cb(null, newUser);
      }else{
        console.log(response)
        cb(null, response)
      }
       
    })
  }
));

app.get('/auth/github',
  passport.authenticate('github'));

app.get('/auth/github/callback', 
  passport.authenticate('github', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('https://boring-stonebraker-dd5342.netlify.app');
  });

// End of Strategies

app.get("/getUser", (req, res) => {
  res.send(req.user)
})

app.get("/", (req, res, next) => {
    res.send("Hello World")
})

app.get('/auth/logout', (req, res, next) => {
    if(req.user){
      req.logout();
      res.send("done")
    }
})

app.listen(process.env.PORT || 4000, () => {
    console.log("Server Started")
})