'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var validUrl = require('valid-url');
const { Schema } = require('mongoose');
const { nanoid } = require('nanoid');
var bodyParser = require('body-parser');

var cors = require('cors');
require('dotenv').config();

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true, 
  useUnifiedTopology: true
});

const urlShortenerSchema = new Schema({
  url: {
    type : String,
    required : true
  },
  identifier: {
    type: String,
    required: true
  }
});

const UrlShortener = mongoose.model("UrlShortener", urlShortenerSchema);

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser.urlencoded({
  extended: false
}));

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

app.post("/api/shorturl/new", (req, res) => {
  if (!validUrl.isUri(req.body.url)) {
    res.json({
      error: "invalid URL"
    });
  } else {
    let uniqueIdentifier = nanoid(4);
    let newUrl = new UrlShortener({
      url: req.body.url,
      identifier: uniqueIdentifier
    });
    newUrl.save((err, newUrlShortnerObject) => {
      if (err) {
        return console.error(err);
      }
      res.json({
        originalUrl: newUrlShortnerObject.url,
        shortUrl: newUrlShortnerObject.identifier
      });
    });
  }
});

app.get("/api/shorturl/:identifier", (req, res) => {
  UrlShortener.findOne({
    identifier: req.params.identifier
  }, (err, newUrlShortnerObject) => {
    if (err) {
      return res.json({
        error: "invalid URL"
      });
    } else {
      console.log(newUrlShortnerObject);
      res.redirect(newUrlShortnerObject.url);
    }
  });
});

app.listen(port, function () {
  console.log('Node.js listening ...');
});