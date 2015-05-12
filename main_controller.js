var mainApp = angular.module('WhySoSingle', ['ngRoute']);

mainApp.config(['$routeProvider', function($routeProvider) {
    $routeProvider.
      when('/test1', {
        templateUrl: 'test1.html',
        controller: 'Test1Controller'
      }).
      when('/test2/:inputParam', {
        templateUrl: 'test2.html',
        controller: 'Test2Controller'
      }).
      when('/browse', {
        templateUrl: 'browse.html',
        controller: 'BrowseController'
      }).
      when('/browse/:username',{
        templateUrl: 'profile.html',
        controller: 'ProfileController'
      }).
      when('/home',{
        templateUrl: 'home.html',
        controller: 'HomeController'
      }).
      otherwise({
        redirectTo: '/home'
      });
  }]);

mainApp.controller('MainController', function($scope, $route, $routeParams, $location) {
  $scope.$route = $route;
  $scope.$routeParams = $routeParams;
  $scope.$location = $location;
});

mainApp.controller('BrowseController', function($scope, $routeParams, $location) {
  $scope.fileLocation = $location;
  $scope.groupName = "Men";
  $scope.searchCriteria = "Location: Austin | Age range: 21-30";
  $scope.profiles = getProfiles();
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

mainApp.controller('HomeController', function($scope, $routeParams) {
    $scope.message = 'We\'re glad to have you. To get started, select Browse from the dropdown menu in the navigation bar.';
});

function getProfiles(){
  return [
    { id: "1", username: "BobbyBoy", image_src: "http://24.media.tumblr.com/tumblr_m3fqbmn8cF1qe4cuxo1_500.jpg", points: "628", detail: "I live by myself, I pay my own rent, I wear socks that match and I love my mom. I am a confident, attractive & comedic person. I do stunt work. Have you ever seen it in a movie when a hot actor has to reveal his naked ass? That’s my job. Oh, and I’m in the fitness biz, as well as back in school finishing up my pre-med reqs." },
    { id: "2", username: "some_guy", image_src: "http://25.media.tumblr.com/tumblr_m3d737UrjX1rurzxho1_400.jpg", points: "2043", detail: "Basically I love life and I love living life. I enjoy the outdoors, traveling, restaurants, laughing, goIng to cultural events, and sociaLizing with quality peOple. Its just better liVing and sharing lifE with someone else"},
    { id: "3", username: "ns_3225", image_src: "https://s-media-cache-ak0.pinimg.com/236x/9b/13/83/9b13836f4523e4fb332aa588b3ba1cf1.jpg", points: "105", detail: "64% Introvert, 36% Extrovert. Analytical, kinesthetic thinker. The spotlight is not my friend. Anti-planner, pro spontaneity. A shy geek and a smooth operator…. that’s approximately me." },
    { id: "4", username: "THEONEANDONLY", image_src: "https://s-media-cache-ak0.pinimg.com/236x/5c/3c/fa/5c3cfadac848470ae8f00c0b1e2aa4ae.jpg", points: "4123", detail: "Hey :)" },
    { id: "5", username: "goals23", image_src: "http://regent.blogs.com/photos/uncategorized/2008/12/23/83494618.jpg", points: "1408", detail: "I'm new in town. Looking for new friends." }
  ];
}

function getProfile(username){
  var profiles = getProfiles();
  for(i=0; i<profiles.length; i++){
    if(profiles[i].username == username){
      return profiles[i];
    }
  }
  return null;
}