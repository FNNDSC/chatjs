require.config({
  baseUrl: '../bower_components',
  paths: {
    jquery: ['https://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min', 'jquery/dist/jquery.min'],
    jquery_ui: ['https://ajax.googleapis.com/ajax/libs/jqueryui/1.11.2/jquery-ui.min', 'jquery-ui/jquery-ui.min']
  },

  // use packages to be able to use relative path in the package
  packages:[

    // bower packages
    {
      name: 'gcjs', // used for mapping...
      location: 'gcjs/src',   // relative to base url
      main: 'js/gcjs'
    },

    // local packages
    {
      name: 'chatjs', // used for mapping...
      location: './',   // relative to base url
      main: 'chatjs/src/js/chatjs'
    }
  ]
});
