const express = require('express')
const {terms} = require("../controllers/termsController")

const router = express.Router()

router.route("/").get(terms)

module.exports = router