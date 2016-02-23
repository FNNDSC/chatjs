/**
 * This module implements the realtime chat's specification (tests).
 *
 */

define(['gcjs', 'chatjs'], function(cjs, chatjs) {

  describe('chatjs', function() {

    var chat;
    var CLIENT_ID = '1050768372633-ap5v43nedv10gagid9l70a2vae8p9nah.apps.googleusercontent.com';
    var collab = new cjs.GDriveCollab(CLIENT_ID);

    // mock some collab object functions
    collab.getCollaboratorList = function() {return [];};

    beforeEach(function() {

      chat = new chatjs.Chat(collab);
      chat.init();
    });

    afterEach(function() {

      chat.destroy();
    });

    it('chatjs.Chat.prototype.updateTextArea({user: chat.collab.collaboratorInfo.name, msg: "Hello"})' +
      ' should update text area with message: Hello',

      function() {

        var chatTextarea = document.getElementsByClassName('view-chat-msgarea-text')[0];

        chat.updateTextArea({
          user: chat.collab.collaboratorInfo.name,
          msg: 'Hello'
        });

        expect(chatTextarea.innerHTML).toContain('Hello');
      }
    );

  });
});
