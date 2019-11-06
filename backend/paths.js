import { Router } from 'express';
import getForecast from './lib/getforecast';
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
    const data = await getForecast(req.params.location);
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

  // GET /auth/logout
  router.get('/auth/logout', (req, res) => {
    if (typeof req.session.email !== 'undefined') {
      req.session.destroy();
      res.json({ status: "success" });
    }
    else {
      res.json({ status: "fail" });
    }
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