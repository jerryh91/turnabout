var mainApp = angular.module('WhySoSingle', ['ngRoute']);

//$locationProvider.html5Mode(true);

mainApp.config(['$routeProvider', function($routeProvider) {
    $routeProvider.
      when('/browse', {
        templateUrl: 'browse',
        controller: 'BrowseController'
      }).
      when('/profiles/:username',{
        templateUrl: 'profiles',
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
      otherwise({
        redirectTo: '/about'
      });
  }]);

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

mainApp.controller('MainController', function($scope, $route, $routeParams, $location, $http, userSessionService) {
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

mainApp.controller('BrowseController', function($scope, $routeParams, $location, searchService) {
  var results = searchService.getResults();
  var search = searchService.getSearch();
  $scope.fileLocation = $location;
  $scope.groupName = "Men";
  $scope.searchCriteria = "Location: " + search.location + "|Radius: " + search.radius;
  $scope.profiles = results;
});

mainApp.controller('MessagesController', function($scope, $http, userSessionService){
  $scope.username = userSessionService.getUserSession().username;
  $http({
      url: '/loadMessages/' + $scope.username, 
      method: "GET"
    })
    .success(function(response) {
      console.log(response);
    });
});

mainApp.controller('CreateProfileController', function($scope, $location, $http) {
  $scope.profile = {
    email: "marcus.a.bennett@gmail.com",
    password: "asdf",
    username: "goals23",
    location: "Austin",
    age: 24,
    gender: "male"
  };
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

mainApp.controller('ProfileController', function($scope, $routeParams, $http) { 
  $http({
      url: '/profiles/' + $routeParams.username, 
      method: "GET"
    })
    .success(function(response) {
      $scope.userProfile = response;
    });
});

mainApp.controller('HomeController', function($scope) {
    $scope.message = 'This is the Home screen.';
});

mainApp.controller('AboutController', function($scope, $location, $http, userSessionService) {
    $scope.message = 'We\'re glad to have you. To get started, signup or login below.';
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
    $scope.message = 'We\'re glad to have you. To get started, select Browse Profiles from the dropdown menu in the navigation bar.';
    $scope.user = { username: "marcus.a.bennett@gmail.com",
                    password: "asdf"};
    
    $scope.login = function(){
      $http.post('/auth/login', $scope.user)
      .success(function(data, status, headers, config){
          userSessionService.setUserSession(data.user);
          $location.path('/home');
      })
      .error(function(data, status, headers, config){
        /*handle non 200 statuses*/
        console.log('error posting');
      });
    };
});