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
    conversations: [{conversationID: String}],
    about: String,
    lastOnline: String,
    additionalInfo: {
        smoker: String,
        drinks: String,
        drugs: String, 
        diet: String, 
        religion: String, 
        occupation: String,
        personalityType: String,
        school: String}, 
    photos: [{photoID: String}]
});

var conversationSchema = new mongoose.Schema({
    initiatorUsername: String,
    responderUsername: String,
    messages: [{ type: String, ref: 'Message' }]
});

var messageSchema = new mongoose.Schema({
    senderUsername: String, 
    receiverUsername:String, 
    content: String
});

//Model declaration: "User", "Conversation"
mongoose.model("User", userSchema);
mongoose.model("Conversation", conversationSchema);
mongoose.model("Message", messageSchema);

module.exports = {
	userSchema: userSchema,
    conversationSchema: conversationSchema,
    messageSchema: messageSchema
};
