var express = require('express');
var router = express.Router();

var bankDocuments= require('../controllers/bankDocs');
var checkAuth=require('../middlewares/check-auth');
var file_upload=require('../middlewares/file_upload');
// routes dealing with product collection

// router.get('/product',checkAuth,Products.getProduct);
// router.post('/product',Products.addProduct);
// router.get('/product/:id',Products.getone);
// router.patch('/product/:id',Products.updateProduct);
// router.delete('/product/:id',Products.deleteProduct);
// router.get('/order',Products.getOrder);
// router.post('/order',Products.addOrder);
router.get('/getdocs',checkAuth,bankDocuments.getDocument);
router.post('/verification',checkAuth,file_upload.upload.array('documents',1),bankDocuments.addDocument);
module.exports = router;

