import { Router } from 'express';
const CryptoJS = require("crypto-js");
const param = require('jquery-param');
const fetch = require("node-fetch");
const passgen = require('generate-password');
const emailvalidator = require("email-validator");

const Datastore = require('nedb');
const db = new Datastore({ filename: 'users.db' });
db.loadDatabase(function (err) {
  console.log("Database loaded.");
});

require('dotenv').config();
if (process.env.ENV_OK !== "yes") {
  throw new Error('The .env file is not included.');
}

const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
      user: process.env.EMAIL_AUTH_USER,
      pass: process.env.EMAIL_AUTH_PASSWORD
  }
});

export default () => {
  const router = Router();

  // GET  /getlocationdata/:location
  router.get('/getlocationdata/:location', async (req, res) => {
    const url = 'https://weather-ydn-yql.media.yahoo.com/forecastrss';
    const method = 'GET';
    const app_id = process.env.YAHOO_APPID;
    const consumer_key = process.env.YAHOO_CONSUMER_KEY;
    const consumer_secret = process.env.YAHOO_CONSUMER_SECRET;
    const concat = '&';
    const query = {
      'location': req.params.location,
      'format': 'json'
    };
    const oauth = {
      'oauth_consumer_key': consumer_key,
      'oauth_nonce': Math.random().toString(36).substring(2),
      'oauth_signature_method': 'HMAC-SHA1',
      'oauth_timestamp': parseInt(new Date().getTime() / 1000).toString(),
      'oauth_version': '1.0'
    };
  
    const merged = {...query, ...oauth};
    const merged_arr = Object.keys(merged).sort().map(function(k) {
      return [k + '=' + encodeURIComponent(merged[k])];
    });
    const signature_base_str = method
    + concat + encodeURIComponent(url)
    + concat + encodeURIComponent(merged_arr.join(concat));
  
    const composite_key = encodeURIComponent(consumer_secret) + concat;
    const hash = CryptoJS.HmacSHA1(signature_base_str, composite_key);
    const signature = hash.toString(CryptoJS.enc.Base64);
  
    oauth['oauth_signature'] = signature;
    const auth_header = 'OAuth ' + Object.keys(oauth).map(function(k) {
      return [k + '="' + oauth[k] + '"'];
    }).join(',');
  
    const response = await fetch(url+'?'+param(query), {
      headers: {
        'Authorization': auth_header,
        'X-Yahoo-App-Id': app_id 
      },
      method: 'GET',
    });
    const data = await response.json();
  
    res.json({ data });
  });

  // GET /auth/checklogin
  router.get('/auth/checklogin', (req, res) => {
    if (typeof req.session.email !== 'undefined') {
      res.json({ loggedin: true, email: req.session.email });
    }
    else {
      res.json({ loggedin: false });
    }
  });

  // POST /auth/login
  router.post('/auth/login', (req, res) => {
    db.findOne({email: req.body.login}, (err, doc) => {
      if (doc !== null) {
        if (doc.password === req.body.password) {
          // Success login.
          req.session.email = doc.email;
          req.session.isadmin = doc.isadmin;
          res.json({ status: "success" });
        }
        else {
          // Wrong password.
          res.json({ status: "fail" });
        }
      }
      else {
        // No such login.
        res.json({ status: "fail" });
      }
    });
  });

  // GET /getuserlist
  router.get('/getuserlist', (req, res) => {
    if (req.session.isadmin !== true) {
      res.json({
        status: "nopermission"
      });
      return;
    }

    db.find({}, (err, doc) => {
      const userList = [];
      for (let i = 0; i < doc.length; i++) {
        const element = doc[i];
        userList.push({
          firstname: element.firstname,
          surname: element.surname,
          city: element.city,
          country: element.country,
          email: element.email
        });
      }
      res.json({ userlist: userList });
    });
  });

  // GET /getuserinfo
  router.get('/getuserinfo/:email', (req, res) => {
    if (req.session.email !== req.params.email) {
      if (req.session.isadmin !== true) {
        res.json({
          status: "nopermission"
        });
        return;
      }
    }

    db.findOne({email: req.params.email}, (err, doc) => {
      res.json({
        firstname: doc.firstname,
        surname: doc.surname,
        city: doc.city,
        country: doc.country,
      });
    });
  });

  // POST /addnewuser
  router.post('/addnewuser', (req, res) => {
    if (req.session.isadmin !== true) {
      res.json({
        status: "nopermission"
      });
      return;
    }
    else if (emailvalidator.validate(req.body.userinfo.email) === false) {
      res.json({
        status: "wrongemail"
      });
      return;
    }

    db.findOne({email: req.body.userinfo.email}, (err, doc) => {
      if (doc === null) {
        const password = passgen.generate({
          length: 8,
          numbers: true
        });
        req.body.userinfo.password = password;
        req.body.userinfo.isadmin = false;
        db.insert(req.body.userinfo, (err, newDoc) => {
          const message = {
            from: 'florencio67@ethereal.email',
            to: req.body.userinfo.email,
            subject: 'users-simple-forecast password',
            text: 'Here is your password for users-simple-forecast <b>'+password+'</b>'
          };
          transporter.sendMail(message, function(err, info) {
              if (err) {
                console.log(err)
              } else {
                console.log(info);
              }
          });

          res.json({ status: "success" });
        });
      }
    });
  });

  // POST /removeuser
  router.post('/removeuser', (req, res) => {
    if (req.session.isadmin !== true) {
      res.json({
        status: "nopermission"
      });
      return;
    }

    db.remove({email: req.body.email}, (err, numRemoved) => {
      res.json({ status: "success" });
    });
  });

  return router;
}