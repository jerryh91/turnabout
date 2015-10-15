//A MongoDB deployment hosts a number of databases. 
//A database holds a set of collections 
//A collection holds a set of documents (RDBMS table)
//A document is a set of key-value pairs (a row in an RDBMS table) 

//Documents have dynamic schema:
//documents in the same collection do not need to have the same set of fields 
//or structure, and common fields in a collection’s documents may hold 
//different types of data

var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    username: String,
    password: String, //hash created from password
    created_at: {type: Date, default: Date.now},
    email: String,
    location: String,
    age: String,
    gender: String,
    conversations: [{conversationID: String}]
});

var conversationSchema = new mongoose.Schema({
    conversationID: String,
    initiator: String,
    responder: String,
    messages: [{author: String, message: String}]
});

// var messageSchema = new mongoose.Schema({
    
// });

//Model declaration: "User", "Conversation"
mongoose.model("User", userSchema);
mongoose.model("Conversation", conversationSchema);

module.exports = {
	userSchema: userSchema,
    conversationSchema: conversationSchema
};
