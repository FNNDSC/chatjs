/**
 * This module implements the realtime chat interface
 */

// define a new module
define(
  [
  // html templates (requires the 'text' bower component)
  '../../../text/text!../templates/chatwin.html',
  '../../../text/text!../templates/mailwin.html',
  '../../../text/text!../templates/preferenceswin.html',

  // relative paths to local non-AMD modules
  './lib/jquery.dialogextend',

  // jquery is special because it is AMD but doesn't return an object
  'jquery_ui'

  ], function(chatwin, mailwin, prefwin) {

    /**
     * Provide a namespace for the chat module
     *
     * @namespace
     */
    var chatjs = chatjs || {};

    /**
     * Class implementing the the realtime chat
     *
     * @constructor
     * @param {Object} realtime collaborator object.
     */
    chatjs.Chat = function(collab) {

      this.version = 0.0;

      // chat's container (chat window content)
      this.container = null;

      // jQuery object for the preferences' dialog window
      this.jqPreferences = null;

      // jQuery object for the mail's dialog window
      this.jqMail = null;

      // collaborator object
      this.collab = collab;
    };

    /**
     * Initialize the chat.
     */
    chatjs.Chat.prototype.init = function() {

      this.initChatWindow();
      this.initPreferencesWindow();
      this.initMailWindow();
      this.collab.sendChatMsg('I have connected!');
      this.updateCollaboratorList();
    };

    /**
     * Initilize Chat window's HTML and event handlers.
     */
    chatjs.Chat.prototype.initChatWindow = function() {
      var self = this;

      var container = $('<div></div>');
      self.container = container;

      // convert the previous div into a floating window with minimize, collapse and expand buttons
      container.dialog({
        title: 'Chat',
        closeOnEscape: false,
        minHeight: 400,
        height: 500,
        minWidth: 700,
        width: 800
      }).dialogExtend({
       'closable': false,
       'maximizable': true,
       'minimizable': true,
       'collapsable': true,
       'dblclick': 'collapse',
       'icons': {
         'maximize': 'ui-icon-arrow-4-diag'
       }
     });

      // add the preferences button to the floating window's title bar
      $('.ui-dialog-titlebar-buttonpane', container.parent()).append(
        '<a class="ui-dialog-titlebar-preferences ui-corner-all ui-state-default" href="#" role="button">' +
        '<span class="ui-icon ui-icon-gear" title="preferences">preferences</span></a>'
      );

      // add contents to the floating window from its HTML template
      container.append($(chatwin).filter('.view-chat'));

      // set the room id
      var jqRoomId = $('.view-chat-msgarea-header span', container);
      jqRoomId.text(jqRoomId.text() + ' ' + self.collab.realtimeFileId);

      // hide the mail button for non-scene owners
      var jqButtonMail = $('.view-chat-msgarea-header .view-chat-msgarea-button', container);

      if (!self.collab.collabOwner) { jqButtonMail.css('display', 'none'); }

      $(self.container.parent()).css('borderColor', $('.ui-dialog-titlebar', self.container).css('color'));

      // lay out elements
      self.layoutChatWindow();

      //
      // UI event handlers
      //
      var jqButtonPreferences = $('.ui-dialog-titlebar-preferences', container.parent());
      var jqButtonSend = $('.view-chat-msgarea-input-button', container);
      var jqInput = $('.view-chat-msgarea-input-input', container);

      // Title bar's Preferences (gear) button click
      jqButtonPreferences.mouseover(function() {

        return $(this).addClass('ui-state-hover');

      }).mouseout(function() {

        return $(this).removeClass('ui-state-hover');

      }).focus(function() {

        return $(this).addClass('ui-state-focus');

      }).blur(function() {

        return $(this).removeClass('ui-state-focus');

      }).click(function() {

        self.jqPreferences.dialog('open');
      });

      // Send msg button click
      jqButtonSend.click(function() {

        var text = jqInput[0].value;

        if (text) {

          jqInput[0].value = '';

          // create a chat message object
          var msgObj = {user: self.collab.collaboratorInfo.name, msg: text};
          self.updateTextArea(msgObj);
          self.collab.sendChatMsg(text);
        }
      });

      // Send msg button click
      jqButtonMail.click(function() {

        var mailTextarea = $('.view-chat-mail-text', self.jqMail)[0];
        mailTextarea.value = 'Enter a collaborator\'s email address per line:\n\n';

        self.jqMail.dialog('open');
      });

      // Enter key press
      jqInput.keyup(function(evt) {

        if (evt.keyCode === 13) {
          jqButtonSend.click();
        }
      });

    };

    /**
     * Lay out the chat window.
     */
    chatjs.Chat.prototype.layoutChatWindow = function() {

      var msgArea = $('.view-chat-msgarea', this.container);
      var headerHeight = parseInt($('.view-chat-msgarea-header', msgArea).css('height'));
      var inputAreaHeight = parseInt($('.view-chat-msgarea-input', msgArea).css('height'));

      $('.view-chat-msgarea-text', msgArea).css({
        top: headerHeight + 'px',
        height: 'calc(100% - ' + (inputAreaHeight + headerHeight) + 'px)'
      });
    };

    /**
     * Initilize Preferences window's HTML and event handlers.
     */
    chatjs.Chat.prototype.initPreferencesWindow = function() {
      var self = this;

      var jqPreferences = $('<div></div>');

      self.jqPreferences = jqPreferences;

      // convert the previous div into a floating window with a close button
      jqPreferences.dialog({
        title: 'Preferences',
        modal: true,
        autoOpen: false,
        minHeight: 400,
        height: 450,
        minWidth: 400,
        width: 450
      });

      // add contents to the floating window from its HTML template
      jqPreferences.append($(prefwin).filter('.view-chat-preferences'));

      jqPreferences.data('preferences', {
        msgStyle: 'headerbefore',
        msgHeaderInfo: 'name',
        fontSize: $('.view-chat-msgarea-text', self.container).css('fontSize'),
        fontFamily: {standard: 'sans-serif', fixedwidth: 'monospace'},
        currentTheme: 'darkbackground',
        themes: {
          'darkbackground': {
            generalTheme: 'view-chat-theme1',
            headerAreaTheme: 'view-chat-msgarea-header-theme1',
            userAreaTheme: 'view-chat-usersarea-theme1',
            buttonTheme: 'view-chat-msgarea-button-theme1'
          },
          'lightbackground': {
            generalTheme: 'view-chat-theme2',
            headerAreaTheme: 'view-chat-msgarea-header-theme2',
            userAreaTheme: 'view-chat-usersarea-theme2',
            buttonTheme: 'view-chat-msgarea-button-theme2'
          }
        }
      });

      //
      // UI event handlers
      //

      // change msg style or msg header
      $('.view-chat-preferences-msgstyle', jqPreferences).click(function() {

        var preferences = jqPreferences.data('preferences');
        var name = $(this).attr('name');
        var value = $(this).attr('value');

        if (name === 'msgstyle') {

          preferences.msgStyle = value;

        } else {

          preferences.msgHeaderInfo = value;
        }

        jqPreferences.data('preferences', preferences);
      });

      // change font size
      $('.view-chat-preferences-fontsize', jqPreferences).click(function() {

        var preferences = jqPreferences.data('preferences');
        var title = $(this).attr('title');
        var fontSize = preferences.fontSize;
        var size = parseInt(preferences.fontSize);
        var measUnit = fontSize.slice(-2);
        var delta = 0;

        if (title === 'increase') {

          if (measUnit === 'px' && size < 22) {
            delta = 1;
          } else if (measUnit === 'em' && size < 1.5) {
            delta = 0.1;
          }

        } else {

          if (measUnit === 'px' && size > 10) {
            delta = -1;
          } else if (measUnit === 'em' && size > 0.8) {
            delta = -0.1;
          }
        }

        preferences.fontSize = (size + delta) + measUnit;
        jqPreferences.data('preferences', preferences);
        $('.view-chat-msgarea-text', self.container).css({fontSize: preferences.fontSize});
        $('.view-chat-msgarea-input-input', self.container).css({fontSize: preferences.fontSize});
        self.layoutChatWindow();
      });

      // change font family
      $('.view-chat-preferences-fontfamily', jqPreferences).click(function() {

        var preferences = jqPreferences.data('preferences');
        var value = $(this).attr('value');

        $('.view-chat-msgarea-text', self.container).css('fontFamily', preferences.fontFamily[value]);
        $('.view-chat-msgarea-input-input', self.container).css('fontFamily', preferences.fontFamily[value]);
        self.layoutChatWindow();
      });

      // change theme
      $('.view-chat-preferences-theme', jqPreferences).click(function() {

        var preferences = jqPreferences.data('preferences');
        var value = $(this).attr('value');
        var prevTheme = preferences.themes[preferences.currentTheme];
        var newTheme = preferences.themes[value];

        preferences.currentTheme = value;

        $('.view-chat-usersarea', self.container).removeClass(prevTheme.userAreaTheme).addClass(newTheme.userAreaTheme);
        $('.view-chat-msgarea', self.container).removeClass(prevTheme.generalTheme).addClass(newTheme.generalTheme);
        $('.view-chat-msgarea-header', self.container).removeClass(prevTheme.headerAreaTheme).addClass(newTheme.headerAreaTheme);
        $('.view-chat-msgarea-text', self.container).removeClass(prevTheme.generalTheme).addClass(newTheme.generalTheme);
        $('.view-chat-msgarea-input', self.container).removeClass(prevTheme.generalTheme).addClass(newTheme.generalTheme);
        $('.view-chat-msgarea-input-input', self.container).removeClass(prevTheme.generalTheme).addClass(newTheme.generalTheme);
        $('.view-chat-msgarea-button', self.container).removeClass(prevTheme.buttonTheme).addClass(newTheme.buttonTheme);

        $(self.container.parent()).css('borderColor', $('.view-chat-msgarea', self.container).css('borderColor'));
      });
    };

    /**
     * Initilize Mail window's HTML and event handlers.
     */
    chatjs.Chat.prototype.initMailWindow = function() {
    var self = this;

    var jqMail = $('<div></div>');

    self.jqMail = jqMail;

    // convert the previous div into a floating window with a close button
    jqMail.dialog({
         title: 'Mail room id to collaborators',
         modal: true,
         autoOpen: false,
         minHeight: 400,
         height: 450,
         minWidth: 400,
         width: 450
       });

    // add contents to the floating window from its HTML template
    jqMail.append($(mailwin).filter('.view-chat-mail'));

    //
    // UI event handlers
    //
    $('button', jqMail).click(function() {

      function validateEmail(email) {
           var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

           return re.test(email);
         }

      var mailTextarea = $('.view-chat-mail-text', jqMail)[0];
      var mailArr = [];

      var lines = mailTextarea.value.split('\n');

      for (var i = 0; i < lines.length; i++) {

        if (validateEmail(lines[i])) {
          mailArr.push(lines[i]);
        }
      }

      // send email with room id to collaborators
      self.collab.sendRealtimeFileId(mailArr, function(resp) {

        if (resp.error) {

          mailTextarea.value += '\n\nCould not send mail!';

        } else {

          mailTextarea.value += '\n\nMail has been sent!';
        }
      });
    });
  };

    /**
     * Update the chat text area with new text.
     *
     * @param {Obj} chat message object.
     */
    chatjs.Chat.prototype.updateTextArea = function(msgObj) {

      var chatTextarea = $('.view-chat-msgarea-text', this.container)[0];
      var preferences = this.jqPreferences.data('preferences');
      var time = '';

      if (preferences.msgHeaderInfo === 'timename') {
        // add timestamp to msg header
        var d = new Date();
        var h = (d.getHours() < 10 ? '0' : '') + d.getHours();
        var m = (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();

        time = '[' + h + ':' + m + '] ';
      }

      if (preferences.msgStyle === 'headerbefore') {

        chatTextarea.innerHTML += '&#xA;' + time + msgObj.user + ': ' + msgObj.msg;

      } else {

        // header above msg
        chatTextarea.innerHTML += '&#xA;' + time + msgObj.user + ':' + '&#xA;' + msgObj.msg;
      }

      // scroll down to show last msg
      chatTextarea.scrollTop = chatTextarea.scrollHeight;
    };

    /**
     * Update the list of collaborators in the UI.
     */
    chatjs.Chat.prototype.updateCollaboratorList = function() {

      var collaborators = this.collab.getCollaboratorList();
      if (typeof(collaborators) !== 'undefined') {
        var jqUsersArea = $('.view-chat-usersarea', this.container);
        var ul = $('ul', jqUsersArea).empty();

        for (var i = 0; i < collaborators.length; i++) {

          if (collaborators[i].id === this.collab.collaboratorInfo.id) {

            ul.prepend('<li>' + this.collab.collaboratorInfo.name + ' (me)</li>');

          } else {

            ul.append('<li>' + collaborators[i].name + '</li>');
          }
        }

      }
    };

    /**
     * Hide chat window.
     */
    chatjs.Chat.prototype.close = function() {

      this.container.dialog('close');
    };

    /**
     * Show chat window.
     */
    chatjs.Chat.prototype.open = function() {

      this.container.dialog('open');
    };

    /**
     * Whether the chat is currently open.
     */
    chatjs.Chat.prototype.isOpen = function() {

      return this.container.dialog('isOpen');
    };

    /**
     * Destroy all objects and remove html interface
     */
    chatjs.Chat.prototype.destroy = function() {

      this.container.dialogExtend('restore');
      this.container.dialog('destroy');
      this.jqPreferences.dialog('destroy');
      this.container.empty();
    };

    return chatjs;
  });
