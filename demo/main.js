require(['./config'], function() {

  require(['gcjs', 'chatjs'], function(cjs, chat) {
    // Entry point

    // Create a collaboration object
    var CLIENT_ID = '1050768372633-ap5v43nedv10gagid9l70a2vae8p9nah.apps.googleusercontent.com';
    var collab = new cjs.GDriveCollab(CLIENT_ID);

    // Create a floating chat.
    var myChat = new chat.Chat(collab);
    myChat.init();

  });
});
