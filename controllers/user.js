'use strict';
var mongoose=require('mongoose');

var Users=require('../models/user').Users;
var bcrypt=require('bcrypt');
var jwt=require('jsonwebtoken');
const ipfsAPI = require('ipfs-api');
//const fs = require('fs');
const EthCrypto = require('eth-crypto');
var crypto = require('crypto'),algorithm = 'aes-256-ctr';
var encryptionkey = Math.random().toString(36).replace('0.', '');
var PromiseA = require('bluebird').Promise;
var fs = PromiseA.promisifyAll(require('fs'));
var path = require('path');
var ursa = require('ursa');
var mkdirpAsync = PromiseA.promisify(require('mkdirp'));

const ipfs = ipfsAPI('ipfs.infura.io', '5001', {protocol: 'https'})

function keypair(pathname) {
    var key = ursa.generatePrivateKey(1024, 65537);
    var privpem = key.toPrivatePem();
    var pubpem = key.toPublicPem();
    var privkey = path.join(pathname, 'privkey.pem');
    var pubkey = path.join(pathname, 'pubkey.pem');
  
    return mkdirpAsync(pathname).then(function () {
      return PromiseA.all([
          
        fs.writeFileAsync(privkey, privpem, 'ascii')
      , fs.writeFileAsync(pubkey, pubpem, 'ascii')
      ]);
    }).then(function () {
        //res.download('./keys/privkey.pem');
      return key;
    });
  }
  


exports.register= function (req,res) {
    Users.find({email: req.body.email},function(err,data){
        if(data.length>=1){
            return res.status(409).json({
                success:false,
                message: 'user already exists'
            });
        }else{
            bcrypt.hash(req.body.password, 10, function (err, hash) {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        message: 'sorry! something happened, please try again'
                    });
                } else {
                    var user = new Users({
                        _id: new mongoose.Types.ObjectId(),
                        email: req.body.email,
                        password: hash,
                        role : req.body.role,
                        ethaddress : req.body.ethaddress
                    });
                    user.save(function (err, result) {
                        if (err) {
                            res.status(500).json({
                                success: false,
                                message: 'sorryyyy! something happened, please try again'
                            });
                        }else{
                            PromiseA.all([
                                keypair('keys')
                              ]).then(function (keys) {
                                console.log('generated %d keypairs', keys.length);
                              });
                            res.status(200).json({
                                success: true,
                                message: 'sucessfully registered'
                            });
                        }
                    });
                }
            });
        }
    });

};

exports.deleteuser= function (req,res) {
    var id=req.params.id;
    Users.remove({_id:id},function (err,result) {
        if(err){
            res.status(500).json({
                sucess:false,
                message: 'invalid user'
            });
        }else{
            res.status(200).json({
                success:true,
                message: 'user deleted'
            });

        }
    });
};


exports.login= function (req,res) {
    Users.find({email: req.body.email},function (err,data) {
       if(data.length<1 || err){
           return res.status(401).json({
               success: false,
               message: 'invalid user'
           });
       }else{
           bcrypt.compare(req.body.password,data[0].password,function (err,result) {
               if(err){
                   return res.status(401).json({
                       success: false,
                       message: 'invalid user'
                   });
               }
               if(result){
                   var token= jwt.sign({
                      email: data[0].email,
                       userId: data[0]._id
                   },
                       'secret',
                       {expiresIn:"1h"}
                       );
                       res.cookie('token',token);
                   return res.status(200).json({
                       success: 'successfully logged in',
                       token: token
                   });
               }else {
                   return res.status(401).json({
                       success: false,
                       message: 'invalid user'
                   });
               }
           });
       }
    });
};


exports.bankprofile = function(req,res){
   res.render('bankprofile.ejs');
}

exports.uploadToIPFS = function(req,res){
    // var emaill =req.userData.email;
    // var role = req.userData.role;
    // console.log("email"+emaill);
    // //console.log(req.files);
    //   Users.findOne({email:emaill},function(err,user){
         var uploadedfile, testbuffer;
         console.log(req.files[0].path);
          req.files.forEach(element => {
              console.log(element);
              uploadedfile=fs.readFileSync(element.path);
              testbuffer=new Buffer(uploadedfile);
              ipfs.files.add(testbuffer,function(err,filehash){
                  if(err){
                      console.log("error"+err);
                  }
                  else{
                      console.log("ipfshash"+filehash[0].hash);
                      var cipher = crypto.createCipher(algorithm,encryptionkey);
                        var crypted = cipher.update(filehash[0].hash,'utf8','hex')
                        crypted += cipher.final('hex');
                        console.log("encrypted document hash : "+crypted);
                    //    // return crypted;
                    //    var decipher = crypto.createDecipher(algorithm,password)
                    //     var dec = decipher.update(crypted,'hex','utf8')
                    //     dec += decipher.final('utf8');
                    //     console.log("decrypted hash "+dec);
                    console.log("encryptionkey " + encryptionkey);
                    var pubkey = ursa.createPublicKey(fs.readFileSync('./keys/pubkey.pem'));
                    var privkey = ursa.createPrivateKey(fs.readFileSync('./keys/privkey.pem'));    
                    console.log("encrypt with public key and sign with private key");
                    var enc = pubkey.encrypt(encryptionkey, 'utf8', 'base64');
                    var sig = privkey.hashAndSign('sha256', encryptionkey, 'utf8', 'base64');
                    //res.download(privkey);
                    
                    console.log('encrypted', enc, '\n');
                    console.log('signed', sig, '\n')
                    return {
                        enc : enc,
                        sig : sig
                    };
                    var rcv = privkey.decrypt(enc, 'base64', 'utf8');
                    if(encryptionkey!=rcv)
                    {
                        console.log("not same");

                    }
                    else{
                        console.log("same");
                    }
                    return {
                        enc : enc,
                        sig : sig
                    };
                }
              });
          });
     
   //   });
}