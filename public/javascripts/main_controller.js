  var mainApp = angular.module('WhySoSingle', ['ngRoute', 'btford.socket-io', 'xeditable', 'ngSanitize']);

//$locationProvider.html5Mode(true);

mainApp.directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;
            
            element.bind('change', function(){
                scope.$apply(function(){
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}]);

mainApp.service('fileUpload', ['$http', function ($http) 
{
    this.uploadFileToUrl = function(file, uploadUrl, callback)
    {
        var fd = new FormData();
        fd.append('profilePic', file);
        $http.post(uploadUrl, fd, 
        {
            transformRequest: angular.identity,
            // headers: {'Content-Type': "multipart/form-data; boundary=----WebKitFormBoundaryffRA1BAOM5nKTmR1",
            //           'Content-Disposition': "form-data; name=profilePic"}
            headers: {'Content-Type': undefined}
        })
        .success(function(){
          callback();
        })
        .error(function(){
        });
    }
}]);

mainApp.config(['$routeProvider', function($routeProvider) {
    $routeProvider.
      when('/browse', {
        templateUrl: 'browse',
        controller: 'BrowseController'
      }).
      // when('/profile/:username',{
      //   templateUrl: 'profile/' + username,
      //   controller: 'ProfileController'
      // }).      
      when('/profile/:username',{
        templateUrl: function(parameters){
          return '/profile/' + parameters.username;
        },
        controller: 'ProfileController'
      }).
      when('/home',{
        templateUrl: 'home',
        controller: 'HomeController'
      }).
      when('/about',{
        templateUrl: 'about',
        controller: 'AboutController'
      }).
      when('/createProfile',{
        templateUrl: 'createProfile',
        controller: 'CreateProfileController'
      }).
      when('/search',{
        templateUrl: 'search',
        controller: 'SearchController'
      }).
      when('/search/:searchParams',{
        templateUrl: 'browse',
        controller: 'BrowseController'
      }).
      when('/login',{
        templateUrl: 'login',
        controller: 'LoginController'
      }).
      when('/blog', {
        templateUrl: 'blog'
      }).
      when('/messages', {
        templateUrl: 'messages',
        controller: 'MessagesController'
      }).
      when('/messages/:conversationID', {
        templateUrl: 'messages',
        controller: 'LoadMessagesController'
      }).
      otherwise({
        redirectTo: '/login'
      });
  }]);

mainApp.run(function(editableOptions) {
  editableOptions.theme = 'bs3';
});

mainApp.factory('socket', function ($rootScope) {
  var socket = io.connect();
  return {
    on: function (eventName, callback) {
      socket.on(eventName, function () {  
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      })
    }
  };
});

mainApp.factory('focus', function($timeout, $window) {
  return function(id) {
    // timeout makes sure that is invoked after any other event has been triggered.
    // e.g. click events that need to run before the focus or
    // inputs elements that are in a disabled state but are enabled when those events
    // are triggered.
    $timeout(function() {
      var element = $window.document.getElementById(id);
      if(element)
        element.focus();
    });
  };
});

mainApp.factory('userSessionService', function(){
  var defaultSession = {};
  var userSession = defaultSession;
  

  var resetUserSession = function() {
    userSession = defaultSession;
  }

  var setUserSession = function(newObj) {
    userSession = newObj;
  };

  var getUserSession = function(){
    return userSession;
  };

  var isLoggedIn = function(){
    return userSession.hasOwnProperty('username');
  };

  return {
    setUserSession: setUserSession,
    getUserSession: getUserSession,
    resetUserSession: resetUserSession,
    isLoggedIn: isLoggedIn
  };
});

mainApp.factory('authHttpResponseInterceptor',['$q','$location', function($q,$location){
    return {
        response: function(response){
            if (response.status === 401) {
                console.log("Response 401");
            }
            return response || $q.when(response);
        },
        responseError: function(rejection) {
            if (rejection.status === 401) {
                console.log("Response Error 401",rejection);
                $location.path('/login'); // how does this work?? -> .search('returnTo', $location.path());
            }
            return $q.reject(rejection);
        }
    }
}]);

mainApp.config(['$httpProvider',function($httpProvider) {
    //Http Intercpetor to check auth failures for xhr requests
    $httpProvider.interceptors.push('authHttpResponseInterceptor');
}]);

mainApp.service('searchService', function() {
  var searchResults = [];
  var searchQuery = [];

  var setSearch = function(newObj) {
    searchQuery = newObj;
  };

  var getSearch = function(){
    return searchQuery;
  };

  var setResults = function(newObj) {
      searchResults = newObj;
  };

  var getResults = function(){
      return searchResults;
  };

  return {
    setResults: setResults,
    getResults: getResults,
    setSearch: setSearch,
    getSearch: getSearch
  };
});

mainApp.controller('MainController', function($scope, $window, $route, $routeParams, $location, $http, userSessionService) {
  //console.log(userSessionService.isLoggedIn());
  $scope.$route = $route;
  $scope.$routeParams = $routeParams;
  $scope.$location = $location;
  $http({
      url: '/auth/loggedIn', 
      method: "GET"
    })
    .success(function(response) {
      //console.log(response);
      if(response.notLoggedIn){
        userSessionService.resetUserSession();
      } else {
        userSessionService.setUserSession(response);

      }
    });
  $scope.userSession = userSessionService;
  $scope.logout = function() {
    $http({
      url: '/auth/signout', 
      method: "GET"
    })
    .success(function(response) {
      $location.path('/');
      $window.location.reload();
    });
  };
  $scope.goToHome = function() {
    if(userSessionService.isLoggedIn()){
      $location.path('/home');
    }
    else {
      $location.path('/about');
    }
  };
});

mainApp.controller('BrowseController', function($scope, $routeParams, $location, $http, searchService, userSessionService) {
  var results = searchService.getResults();
  var search = searchService.getSearch();

  $scope.fileLocation = $location;
  $scope.groupName = "Men";
  $scope.searchCriteria = "Location: " + search.location + "|Radius: " + search.radius;
  $scope.profiles = results;
  $scope.thislikelist = [];

  console.log("BrowseController");

  //Retrieve for each other user:
  //list of its user likes, and calculate whether has been liked by this user


  $scope.sendLike = function (profile) {

    var likedusername = profile.username;
    var thisusername = userSessionService.getUserSession().username;
    var userlikes;
     $http({
        url: '/like/' + likedusername + '/' + thisusername, 
        method: "POST"
      })
      .then(function successCallback(response) {
        //TODO: Update number of likes in views ONLY for the user being liked
        userlikes = response.data;

        //Iterate scope profiles array:
        //Update user likes for user that has been liked, 
        //Only if this user has not been liked by same user before.
        //ENHANCEMENT: Use Binary Search
        for (var i = 0; i < $scope.profiles.length; i++) 
        {
          if ($scope.profiles[i].username == likedusername)
          {
            if($scope.profiles[i].like.indexOf(thisusername)==-1)
            { 
              $scope.profiles[i].like.push(thisusername);
            }  
          }
        };
        //Update this profile's likes array.

      }, function errorCallback(response) {
      // called asynchronously if an error occurs
      // or server returns response with an error status.

        if (response.data.error == "male forbidden to initiate likes")
        {
          //TODO: Give warning prompts in view
          alert("male forbidden to initiate likes!");
        }
        
     });
    
  };

});

mainApp.controller('MessagesController', function($scope, $http, userSessionService, socket, focus){
  console.log("MessagesController running");
  $scope.messageDisplay = '';
  $scope.username = userSessionService.getUserSession().username;

  var convList= [];
  var respDataLen;

  $http({
      url: '/loadConversations', 
      method: "GET"
    })
    .then(function successCallback(response) {
      respDataLen = response.data.length;
      console.log("success with loadConversations: ", response);

      var i;
      for (i = 0; i< respDataLen; i++)
      {
        convList.push({
            contactUsername:   response.data[i].contactUsername,
            lastMessage: response.data[i].lastMessage,
            dateOfMessage: response.data[i].dateOfMessage,
            convID: response.data[i].convID
        });
      }
     
    },  function errorCallback(response) {
    // called asynchronously if an error occurs
    // or server returns response with an error status.
      console.log("error: ", response.error);
   });


  socket.on('joined_server', function(data){
    if(data.message) 
    {
      $scope.messageDisplay += (data.username ? data.username : 'Server') + ': ' + data.message + '\n';
      socket.emit('join', {username: $scope.username});

      var i;
      $scope.convList = convList;
    } else {
      console.log("No msg: ", data.message);
    }
  });

  socket.on('new_message', function(data){
    if(data.message) 
    {
      $scope.messageDisplay += (data.username ? data.username : 'Server') + ': ' + data.message + '\n';
    } else {
      console.log("No msg: ", data.message);
    }
  });


  $scope.showMessages = function (conv)
  {
    var msgList = [];
    console.log("showMessages()", conv.convID);
    var intConvId = conv.convID.toString();
    $http({
        url: '/messages/' + intConvId, 
        // url: '/about', 
        method: "GET"
      })
      .then(function successCallback(response) {
        respDataLen = response.data.length;
        console.log("messages length: ", respDataLen);
         for (i = 0; i< respDataLen; i++)
        {
            msgList.push({
            senderUsername: response.data[i].senderUsername, 
            receiverUsername: response.data[i].receiverUsername, 
            content: response.data[i].content,
            date: response.data[i].data 
          });

        }
        $scope.msgList = msgList;
        $scope.convList = [];
      },  function errorCallback(response) {
      // called asynchronously if an error occurs
      // or server returns response with an error status.
        console.log("error: ", response.error);
     });
  };
  $scope.sendMessage = function () {
    socket.emit('send', { content: $scope.messageContent, senderUsername: $scope.username, receiverUsername: $scope.receiverUsername, date: (new Date()).toJSON()});

    // add the message to our model locally
    //$scope.messageDisplay += 'You: ' + $scope.messageContent + '\n';
    console.log("hello inside sendMessage");
    // clear message box
    $scope.messageContent = '';

    focus('field');

  };

});

mainApp.controller('CreateProfileController', function($scope, $location, $http) {
  $scope.questions = [{}];
  $scope.profile = {
    email: "abc@gmail.com",
    password: "ab",
    username: "abc",
    location: "Austin",
    age: 24,
    gender: "female"
  };
  $http({
      url: '/getSurvey', 
      method: "GET"
    })
    .success(function(response) {
      //console.log(response);
      $scope.profile.survey = response;
    });
  $scope.fileLocation = $location;
  $scope.reset = function() {
    $scope.profile = {};
  };
  $scope.createProfile = function() {
    $http.post('/auth/signup', $scope.profile)
    .success(function(data, status, headers, config){
      // $http({
      //   url: '/auth/success', 
      //   method: "GET"
      // })
      //.success(function(response) {
        console.log(data);
        // console.log(status);
        // console.log(headers);
        // console.log(config);

        $location.path('/login');
      //});
    })
    .error(function(data, status, headers, config){
      /*handle non 200 statuses*/
      console.log('error posting');
    });
  };
});

mainApp.controller('SearchController', function($scope, $routeParams, $location, $http, searchService) {
  $scope.master = {};
  $scope.search = {
                        location: "Austin",
                        radius: 5,
                        agemin: 24,
                        agemax: 28,
                        gender: "male"
              };
  $scope.fileLocation = $location;
  $scope.reset = function() {
    $scope.search = {};
  };
  $scope.doSearch = function() {
    searchService.setSearch($scope.search);
    $http({
      url: '/search', 
      method: "GET",
      params: $scope.search
    })
    .success(function(response) {
      searchService.setResults(response);
      $location.path('/browse');
    });

    // $http.post('/search', $scope.search)
    // .success(function(data, status, headers, config){
    //     /*called for result & error because 200 status*/
    //     if (data.result){
    //         //handle success here
            
            
    //         alert("Added", data, status, headers);
    //         console.log('data success');
    //         console.log(data);
    //     } else if (data.error) {
    //         //handle error here
            
    //         alert("Added", data, status, headers);
    //         console.log('data error');
    //         console.log(data);
    // }})
    // .error(function(data, status, headers, config){
    //     /*handle non 200 statuses*/
    //     alert("Added");
    //     console.log('error');
    // });
    //searchProfiles($scope.search);
    //$location.path('/browse');
    
    //$scope.$apply();
    
    //$location.path('/browse');
    //openDialog($scope.baseUrl + '/poop');
  };
});

mainApp.controller('ProfileController', function($scope, $window, $templateCache, $route, $routeParams, $http, $filter, $location, fileUpload) { 
  $http({
      url: '/getprofileinfo/' + $routeParams.username, 
      method: "GET"
    })
    .success(function(response) {
      $scope.userProfile = response;
      $scope.userProfileOriginal = response;
      $scope.showStatus = function(options, value) {
        var selected = $filter('filter')(options, {value: value});
        return (value && selected.length) ? selected[0].text : 'Not set';
      };
      $scope.updateProfile = function(){
        $http.post('/profile/update', $scope.userProfile)
        .success(function(data, status, headers, config){
            $window.location.reload();
        })
        .error(function(data, status, headers, config){
          /*handle non 200 statuses*/
          console.log('error posting: /profile/update'); 
        });
      };
      $scope.dataChanged = function(){
        return $scope.userProfileOriginal != $scope.userProfile;
      };
    }); 
  // TO DO: put this in its own file. Note: these lists define how the data gets saved to the server
  $scope.genders = [{value: "male", text: "Guy"}, {value: "female", text: "Girl"}];
  $scope.smokerOptions = [{value: "smoker", text: "Smoker"}, {value: "nonSmoker", text: "Non-smoker"}];
  $scope.drinksOptions = [{value: "somedrinks", text: "Moderate Drinker"}, {value: "nodrinks", text: "Doesn't Drink"}];
  $scope.drugsOptions = [{value: "yes", text: "Does Drugs"}, {value: "no", text: "Doesn't do drugs"}];
  $scope.dietOptions = [{value: "omnivore", text: "Eats Anything"}, {value: "herbivore", text: "Vegetarian"}];
  $scope.religionOptions = [{value: "notreligious", text: "Not Religious"}, {value: "other", text: "Other Religion"}];
  $scope.occupationOptions = [{value: "engineer", text: "Engineer"}, {value: "notEngineer", text: "Not an engineer :("}];
  $scope.uploadFile = function(){
    var file = $scope.myFile;
    console.log('file is ' );
    console.dir(file);
    var uploadUrl = "/upload/photo";
    fileUpload.uploadFileToUrl(file, uploadUrl, function(){
      $window.location.reload();
    });
      // $location.path('/home');

    // var currentPageTemplate = $route.current.templateUrl;
    // $templateCache.remove(currentPageTemplate);
    // $route.reload();
  };
  // $scope.submitPic = function(){
  //     $http.post('/upload/photo', $scope.user)
  //     .success(function(data, status, headers, config){
  //         $location.path('/home');
  //     })
  //     .error(function(data, status, headers, config){
  //       /*handle non 200 statuses*/
  //       console.log('error posting');
  //     });
  //   };
  // $http({
  //     url: '/profileimg/' + '561496dc3a9300ad150218f1', 
  //     method: "GET"
  //   })
  //   .success(function(response) {
  //     $scope.userImg = 'data:image/jpeg;base64,' + hexToBase64(response); //'data:image/jpeg;base64,' + 
  //     //$scope.userImg2 = 'data:image/jpeg;base64,' + hexToBase64(response2);
  //     $scope.userImg3 = 'data:image/jpeg;base64,' + btoa(response); //'data:image/jpeg;base64,' + 
  //     $scope.userImg4 = 'data:image/jpeg;base64,' + btoa(response2);
  //     //
  //     //console.log($scope.userImg);
  //   });
});

function hexToBase64(str) {
    return btoa(String.fromCharCode.apply(null, str.replace(/\r|\n/g, "").replace(/([\da-fA-F]{2}) ?/g, "0x$1 ").replace(/ +$/, "").split(" ")));
}

mainApp.controller('HomeController', function($scope) {
    $scope.message = 'This is the Home screen.';
});

mainApp.controller('AboutController', function($scope, $location, $http, userSessionService) {
    $http({
      url: '/auth/loggedIn', 
      method: "GET"
    })
    .success(function(response) {
      //console.log(response);
      if(response.notLoggedIn){
        userSessionService.resetUserSession();
      } else {
        userSessionService.setUserSession(response);
        $location.path('/home');
      }
    });
});

mainApp.controller('LoginController', function($scope, $routeParams, $http, $location, userSessionService) {
    $http({
      url: '/auth/loggedIn', 
      method: "GET"
    })
    .success(function(response) {
      //console.log(response);
      if(response.notLoggedIn){
        userSessionService.resetUserSession();
      } else {
        userSessionService.setUserSession(response);
      }
    });
    $scope.message = '';
    $scope.user = { username: "mu@gmail.com",
                    password: "mp"};
    
    $scope.login = function()
    {
      $http.post('/auth/login', $scope.user)
      .success(function(data, status, headers, config){
          userSessionService.setUserSession(data.user);
          $location.path('/home');
      })
      .error(function(data, status, headers, config){
        /*handle non 200 statuses*/
        console.log('error posting: /auth/login');
      });
    };
});


var jumboHeight = $('.jumbotron').outerHeight();
function parallax(){
    var scrolled = $(window).scrollTop();
    $('.bg').css('height', (jumboHeight-scrolled) + 'px');
}

$(window).scroll(function(e){
    // parallax();
});

//turn to inline mode
// $(function() {
//   $.fn.editable.defaults.mode = 'inline';
//   $('#username').editable();
// });
//$(document).ready(function() {
    
//});