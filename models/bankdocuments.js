var mongoose=require('mongoose');
var users = require('./user');

var bankDocumentSchema= mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    bank: {type:mongoose.Schema.Types.ObjectId , ref : users.Users},
    documents : { type : Array }  
});

var bankdocuments=mongoose.model('bankdocuments',bankDocumentSchema);

module.exports={
    BankDocuments:bankdocuments
}
// module.exports=mongoose.model('Product',productSchema);