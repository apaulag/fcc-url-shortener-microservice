require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser')
const dns = require('dns');
const cors = require('cors');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

// Keep track of shortened urls
// TODO: use DB where URL is unique and ID is auto-incremented
shortUrls = [
  'https://www.google.com',
  'https://www.freecodecamp.org/',
];

// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// Parse application/json
app.use(bodyParser.json());

// For remote testing
app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Endpoint to add new long url
app.post('/api/shorturl', function(req, res) {
  const url = req.body.url;

  // Use dns to validate url
  dns.resolve(url, function (err, address, family) {
    if (err) {
      res.status(400).json({'error': 'invalid url'});
    } else {
      let id;
      const index = shortUrls.indexOf(url);
      // Add url to shortUrls, if not already included
      if (index === -1) {
        shortUrls.push(url);
        id = shortUrls.length;
      } else {
        id = index + 1;
      }
      res.status(200).json({'original_url': url, 'short_url': id});
    }
  });
});

// Endpoint to redirect to original url based on short url/id value
app.get('/api/shorturl/:id', function(req, res) {
  const id = parseInt(req.params.id);

  if (isNaN(id) || id <= 0 || id > shortUrls.length) {
    res.status(400).json({'error': 'invalid url'});
  } else {
    res.status(301).redirect(shortUrls[id - 1]);
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
