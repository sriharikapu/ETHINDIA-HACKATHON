var express = require('express');
var router = express.Router();

var Users= require('../controllers/user');
var checkAuth=require('../middlewares/check-auth');
var file_upload=require('../middlewares/file_upload');

// routes dealing with user collection

router.post('/register',Users.register);
router.delete('/delete/:id',Users.deleteuser);
router.post('/login',Users.login);
router.post('/senddocs',checkAuth,file_upload.upload.array('documents',1),Users.uploadToIPFS);


module.exports = router;
