window.onload = function() {
 
    console.log("loaded");
    var messages = [];
    var socket = io.connect('http://localhost:1337');
    var field = document.getElementById("field");
    var sendButton = document.getElementById("send");
    var content = document.getElementById("content");
    var name = document.getElementById("name");
 
    //on custom event: "my_message"
    socket.on('my_message', function (data) {
        if(data.message) 
        {
            // console.log('msg: ', data.message);
            // console.log('username: ', data.username);
            messages.push(data);
            var html = '';

            //Each time a new msg: messages[i] is printed
            //All previous messages are re-printed
            for(var i=0; i<messages.length; i++) 
            {
                console.log('username: ' + messages[i].username);
                html += '<b>' + (messages[i].username ? messages[i].username : 'Server') + ': </b>';
                html += messages[i].message + '<br />';
            }
            content.innerHTML = html;
        } else {
            console.log("No msg:", data.message);
        }
    });
 
    sendButton.onclick = function() 
    {
        // alert("clicked send button");
        // alert("text: " + text);
        if(name.value == "") {
            alert("Please type your name!");
        } else {
            var text = field.value;
            socket.emit('send', { message: text, username: name.value });
        }
        var text = "";
        text += field.value;
        
        //Send to 
    };
 
}