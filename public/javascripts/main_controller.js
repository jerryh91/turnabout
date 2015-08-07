var mainApp = angular.module('WhySoSingle', ['ngRoute']);

mainApp.config(['$routeProvider', function($routeProvider) {
    $routeProvider.
      when('/test1', {
        templateUrl: 'test1',
        controller: 'Test1Controller'
      }).
      when('/test2/:inputParam', {
        templateUrl: 'test2',
        controller: 'Test2Controller'
      }).
      when('/browse', {
        templateUrl: 'browse',
        controller: 'BrowseController'
      }).
      when('/browse/:username',{
        templateUrl: 'profile',
        controller: 'ProfileController'
      }).
      when('/home',{
        templateUrl: 'home',
        controller: 'HomeController'
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
      when('/signout',{
        templateUrl: 'auth/signout',
        controller: 'HomeController'
      }).
      otherwise({
        redirectTo: '/home'
      });
  }]);

mainApp.service('searchService', function() {
  var searchResults = [];
  var searchQuery = [];

  var setSearch = function(newObj) {
    searchQuery = newObj;
  }

  var getSearch = function(){
    return searchQuery;
  }

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

mainApp.controller('MainController', function($scope, $route, $routeParams, $location) {
  $scope.$route = $route;
  $scope.$routeParams = $routeParams;
  $scope.$location = $location;
});

mainApp.controller('BrowseController', function($scope, $routeParams, $location, searchService) {
  var results = searchService.getResults();
  var search = searchService.getSearch();
  $scope.fileLocation = $location;
  $scope.groupName = "Men";
  $scope.searchCriteria = "Location: " + search.location + "|Radius: " + search.radius;
  $scope.profiles = results;
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

        $location.path('/home');
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

mainApp.controller('ProfileController', function($scope, $routeParams) { 
  $scope.username = $routeParams.username;
  $scope.groupName = "Men";
  $scope.searchCriteria = "Location: Austin | Age range: 21-30";
  $scope.userProfile = getProfile($routeParams.username);
});

mainApp.controller('Test1Controller', function($scope, $routeParams) {
    $scope.message = 'This message came from the Test1Controller.';
});

mainApp.controller('Test2Controller', function($scope, $routeParams) {
    $scope.params = $routeParams;
    $scope.message = 'This message came from the Test2Controller and had parameters.';
});

mainApp.controller('HomeController', function($scope, $routeParams, $http, $location) {
    $scope.message = 'We\'re glad to have you. To get started, select Browse Profiles from the dropdown menu in the navigation bar.';
    $scope.user = { username: "marcus.a.bennett@gmail.com",
                    password: "asdf"};
    
    $scope.login = function(){
      $http.post('/auth/login', $scope.user)
      .success(function(data, status, headers, config){
          console.log(data);
          $location.path('/home');
      })
      .error(function(data, status, headers, config){
        /*handle non 200 statuses*/
        console.log('error posting');
      });
    };
});

// function searchProfiles(json){
//   //console.log("JSON was " + json);
//   searchCrit = json;
//   filteredProfiles = [
//     { id: "1", username: "BobbyBoy", image_src: "http://24.media.tumblr.com/tumblr_m3fqbmn8cF1qe4cuxo1_500.jpg", points: "628", detail: "I live by myself, I pay my own rent, I wear socks that match and I love my mom. I am a confident, attractive & comedic person. I do stunt work. Have you ever seen it in a movie when a hot actor has to reveal his naked ass? That’s my job. Oh, and I’m in the fitness biz, as well as back in school finishing up my pre-med reqs." },
//     { id: "2", username: "some_guy", image_src: "http://25.media.tumblr.com/tumblr_m3d737UrjX1rurzxho1_400.jpg", points: "2043", detail: "Basically I love life and I love living life. I enjoy the outdoors, traveling, restaurants, laughing, goIng to cultural events, and sociaLizing with quality peOple. Its just better liVing and sharing lifE with someone else"},
//     { id: "3", username: "ns_3225", image_src: "https://s-media-cache-ak0.pinimg.com/236x/9b/13/83/9b13836f4523e4fb332aa588b3ba1cf1.jpg", points: "105", detail: "64% Introvert, 36% Extrovert. Analytical, kinesthetic thinker. The spotlight is not my friend. Anti-planner, pro spontaneity. A shy geek and a smooth operator…. that’s approximately me." },
//     { id: "4", username: "THEONEANDONLY", image_src: "https://s-media-cache-ak0.pinimg.com/236x/5c/3c/fa/5c3cfadac848470ae8f00c0b1e2aa4ae.jpg", points: "4123", detail: "Hey :)" },
//     { id: "5", username: "goals23", image_src: "http://regent.blogs.com/photos/uncategorized/2008/12/23/83494618.jpg", points: "1408", detail: "I'm new in town. Looking for new friends." }
//   ];
// }

// function getProfiles(){
//   return [
//     { id: "1", username: "BobbyBoy", image_src: "http://24.media.tumblr.com/tumblr_m3fqbmn8cF1qe4cuxo1_500.jpg", points: "628", detail: "I live by myself, I pay my own rent, I wear socks that match and I love my mom. I am a confident, attractive & comedic person. I do stunt work. Have you ever seen it in a movie when a hot actor has to reveal his naked ass? That’s my job. Oh, and I’m in the fitness biz, as well as back in school finishing up my pre-med reqs." },
//     { id: "2", username: "some_guy", image_src: "http://25.media.tumblr.com/tumblr_m3d737UrjX1rurzxho1_400.jpg", points: "2043", detail: "Basically I love life and I love living life. I enjoy the outdoors, traveling, restaurants, laughing, goIng to cultural events, and sociaLizing with quality peOple. Its just better liVing and sharing lifE with someone else"},
//     { id: "3", username: "ns_3225", image_src: "https://s-media-cache-ak0.pinimg.com/236x/9b/13/83/9b13836f4523e4fb332aa588b3ba1cf1.jpg", points: "105", detail: "64% Introvert, 36% Extrovert. Analytical, kinesthetic thinker. The spotlight is not my friend. Anti-planner, pro spontaneity. A shy geek and a smooth operator…. that’s approximately me." },
//     { id: "4", username: "THEONEANDONLY", image_src: "https://s-media-cache-ak0.pinimg.com/236x/5c/3c/fa/5c3cfadac848470ae8f00c0b1e2aa4ae.jpg", points: "4123", detail: "Hey :)" },
//     { id: "5", username: "goals23", image_src: "http://regent.blogs.com/photos/uncategorized/2008/12/23/83494618.jpg", points: "1408", detail: "I'm new in town. Looking for new friends." }
//   ];
// }

// function getProfiles(filters){
//   return [
//     { id: "1", username: "BobbyBoy", image_src: "http://24.media.tumblr.com/tumblr_m3fqbmn8cF1qe4cuxo1_500.jpg", points: "628", detail: "I live by myself, I pay my own rent, I wear socks that match and I love my mom. I am a confident, attractive & comedic person. I do stunt work. Have you ever seen it in a movie when a hot actor has to reveal his naked ass? That’s my job. Oh, and I’m in the fitness biz, as well as back in school finishing up my pre-med reqs." },
//     { id: "2", username: "some_guy", image_src: "http://25.media.tumblr.com/tumblr_m3d737UrjX1rurzxho1_400.jpg", points: "2043", detail: "Basically I love life and I love living life. I enjoy the outdoors, traveling, restaurants, laughing, goIng to cultural events, and sociaLizing with quality peOple. Its just better liVing and sharing lifE with someone else"},
//     { id: "3", username: "ns_3225", image_src: "https://s-media-cache-ak0.pinimg.com/236x/9b/13/83/9b13836f4523e4fb332aa588b3ba1cf1.jpg", points: "105", detail: "64% Introvert, 36% Extrovert. Analytical, kinesthetic thinker. The spotlight is not my friend. Anti-planner, pro spontaneity. A shy geek and a smooth operator…. that’s approximately me." },
//     { id: "4", username: "THEONEANDONLY", image_src: "https://s-media-cache-ak0.pinimg.com/236x/5c/3c/fa/5c3cfadac848470ae8f00c0b1e2aa4ae.jpg", points: "4123", detail: "Hey :)" },
//     { id: "5", username: "goals23", image_src: "http://regent.blogs.com/photos/uncategorized/2008/12/23/83494618.jpg", points: "1408", detail: "I'm new in town. Looking for new friends." }
//   ];
// }

// function getProfile(username){
//   var profiles = getProfiles();
//   for(i=0; i<profiles.length; i++){
//     if(profiles[i].username == username){
//       return profiles[i];
//     }
//   }
//   return null;
// }