// server.js

// required packages
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request-promise');

// define app using express
const app = express();

// configure app to use bodyParser()
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


// Wikipedia API Functions ===========================================
function searchApi(action, options) {
  const qs = Object.assign({ action, format: 'json' }, options);
  const opts = { uri: 'https://www.wikidata.org/w/api.php', qs, json: true };
  return request(opts);
}

function searchWikipedia(search) {
  const options = { search, language: 'en', limit: 10 };
  return searchApi('wbsearchentities', options).then((result) => {
    const ids = result.search.map(r => r.id).join('|');
    const entityOptions = { ids, props: 'info' };
    return searchApi('wbgetentities', entityOptions).then((results) => {
      return result.search.map((s) => {
        return {
          title: s.label,
          description: s.description,
          modifiedDate: results.entities[s.id].modified,
        };
      });
    });
  });
}

// =================================================================

// ROUTES FOR API // ====================================================================
const router = express.Router();

// test route
router.get('/', (req, res) => {
  res.json({ message: 'API is working!' });
});

// prefix all routes with api
app.use('/api', router);

router.get('/search/:query', (req, res) => {
  console.log('request query', req.query.search);
  searchWikipedia(req.query.search).then(result => res.json(result));
});

//=================================================================


// start the server
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log('Pizzas are served on port', port);
});

