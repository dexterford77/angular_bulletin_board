var BB = angular.module("BB", []);

BB.controller("PostsCtrl", ["$scope", "PostService", "CommentService",
  function($scope, PostService, CommentService){
    $scope.newComment = {};
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
    $scope.createComment = function(post){
      $scope.newComment.post_id = post.id;
      CommentService.create($scope.newComment)
      .then(function(comment){
        PostService.addComment(post, comment);
        $scope.init();
        $scope.newComment = {};
      });
    }
}]);

BB.controller("RecentCommentsCtrl", ['$scope', '$interval', 'CommentService',
  function($scope, $interval, CommentService){
    $scope.init = function(){
      $scope.getComments();
    }
    $scope.getComments = function(){
      CommentService.all().then(function(comments){
        $scope.comments = comments;
      })
    }
    $interval($scope.init, 2000);
}]);

BB.service("_", ["$window", function($window){
  return $window._
}]);

BB.service("PostService", ['$http', '_', 'CommentService', 
  function($http, _, CommentService){
    var _posts;
    var _extendPost = function(post){
      _comments = [];
      post.comment_ids.forEach(function(id){
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
      if(!_posts){
        var endpoint = "data/posts.json";
        _extendPosts();
        return $http.get(endpoint)
        .then(function(response){
          _posts = response.data;
          _extendPosts(_posts);
          _posts = _.map(_posts, function(post){
            return post
          })
          return _posts
        })
      } else {
        return new Promise(function(resolve){ resolve(_posts) })
      }
    }
    this.addComment = function(post, comment){
      var index = _.indexOf(_posts, post);
      _post = _posts[index];
      _post.comment_ids.push(comment.id);
      _post.comments.push(comment);
      console.log(_posts);
    }
}]);

BB.service("CommentService", ['$http', '_',
  function($http, _){
    var _comments;
    var _id;
    var _nextId = function(){
      if(!_id){
        if(_.isEmpty(_comments)){
          return _id = 1;
        }
        var ids = _.map(Object.keys(_comments), function(id){
          return parseInt(id) + 1
        })
        _id = _.max(ids);
        return _id + 1
      }
      return _id + 1
    }
    this.all = function(){
      if(!_comments){
        var endpoint = "data/comments.json";
        return $http.get(endpoint)
        .then(function(response){
          _comments = _.map(response.data, function(comment){
            return comment
          })
          return _comments
        })
      } else {
        return new Promise(function(resolve){ resolve(_comments) })
      }
    }
    this.getCommentById = function(id){
      return _comments[id-1]
    }
    this.create = function(params){
      var comment = angular.copy(params);
      comment.created_at = "2017-06-04";
      comment.vote_score = 0;
      var nextId = _nextId();
      comment.id = nextId;
      _id += 1;
      _comments.push(comment);
      return new Promise(function(resolve){ resolve(comment) })
    }
}]);

BB.directive("comment", function(){
  return {
    templateUrl: "comment.html",
    restrict: "E",
    scope: true
  }
});

BB.directive("commentForm", function(){
  return {
    templateUrl: "comment_form.html",
    restrict: "E",
    scope: true
  }
});