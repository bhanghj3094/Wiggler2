var express = require('express');
var router = express.Router();

// ====================================================== //
/* ==================== GET Home Page =================== */
// ====================================================== //
router.get('/', function(req, res, next) {
  res.send('home page here');
  // res.render('index', { title: 'Express' });
});

module.exports = router;
