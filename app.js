var BB = angular.module("BB", []);

BB.controller("PostsCtrl", ["$scope", "PostService", "CommentService",
  function($scope, PostService, CommentService){
    $scope.init = function(){
      $scope.getComments();
      $scope.getPosts();
    }
    $scope.getPosts = function(){
      PostService.all().then(function(posts){
        $scope.posts = posts;
      });
    }
    $scope.getComments = function(){
      CommentService.all().then(function(comments){
        $scope.comments = comments;
      })
    }
}]);

BB.controller("RecentCommentsCtrl", ['$scope', 'CommentService',
  function($scope, CommentService){
    $scope.init = function(){
      $scope.getComments();
    }
    $scope.getComments = function(){
      CommentService.all().then(function(comments){
        $scope.comments = comments;
      })
    }
}]);

BB.service("_", ["$window", function($window){
  return $window._
}]);

BB.service("PostService", ['$http', '_', 'CommentService', 
  function($http, _, CommentService){
    var _posts;
    var _extendPost = function(post){
      _comments = [];
      post.commentIds.forEach(function(id){
        _comment = CommentService.getCommentById(id);
        _comments.push(_comment);
      })
      post.comments = _comments;
    }
    var _extendPosts = function(posts){
      _.each(posts, function(post){
        _extendPost(post);
      })
    }
    this.all = function(){
      var endpoint = "data/posts.json";
      _extendPosts();
      return $http.get(endpoint)
      .then(function(response){
        _posts = response.data;
        _extendPosts(_posts);
        return _posts
      })
    }
}]);

BB.service("CommentService", ['$http', '_',
  function($http, _){
    var _comments;
    this.all = function(){
      var endpoint = "data/comments.json";
      return $http.get(endpoint)
      .then(function(response){
        _comments = _.map(response.data, function(comment){
          return comment
        })
        return _comments
      })
    }
    this.getCommentById = function(id){
      return _comments[id-1]
    }
}]);

BB.directive("comment", function(){
  return {
    templateUrl: "comment.html",
    restrict: "E",
    scope: {
      comment: "="
    }
  }
});