'use strict';
var mongoose=require('mongoose');
var bankDocuments=require('../models/bankdocuments').BankDocuments;
var users=require('../models/user').Users
 

exports.getDocument= function (req,res) {
    bankDocuments.find({},function (err,result) {
        if(err){
            res.status(500).json({
                success:false,
                message: 'sorry! No result avaiable'
            });
        }
        else
        {   res.status(200).json({
            success: true,
            data :result
        });}
    });
};


exports.addDocument= function (req,res) {
   // console.log(req.file);
    var emaill =req.userData.email;
  //  console.log("email"+email);
    var bankid;
    users.findOne({email:emaill},function(err,bank){
        bankid=bank._id;
        var docs='';
        req.files.forEach(element => {
            docs = docs + element.path + ',';
        });
        var document= new bankDocuments({
            _id: new mongoose.Types.ObjectId(),
            bank : bankid,
            documents : docs
        });
        document.save(function (err,result) {
            if(err){
                res.status(500).json({
                    success:false,
                    message: 'sorry! something happened, please try again'
                });
            }
            else
            {res.status(200).json({
                success: true,
                message: 'documents  added'
            });}
        });
    });
};


exports.getone= function (req,res) {
    var id=req.params.id;
    bankDocuments.findById(id,function (err,result) {
        if(err){
            res.status(500).json({
                success:false,
                message: 'No data corresponding to the id was found'
            });
        }
        else
        {res.status(200).json({
            success: true,
            data: result
        });}
    });
};
