const express = require('express');
const fs = require('fs');

const router = express.Router();

// Exporting all routes generally
fs.readdirSync(__dirname).forEach(function (file) {
  if (file !== 'index.js' && file.endsWith('.js')) {
    const routeName = file.replace('.js', '');
    router.use('/' + routeName, require('./' + routeName));
  }
});

router.route("/").get((req, res) => {
  return res.status(200).json({ message: "Welcome to Safetech" });
});

module.exports = router;