const express = require('express');
const router = express.Router();
const chatServer = require('../lib/chatServer');

router.get('/', function(req, res){
    chatServer.openAgentForm(res);
});

module.exports = router;