$(function(){
  
  loginTemplate = Handlebars.compile($('#login-template').html());
  userTemplate = Handlebars.compile($('#user-template').html());
  createUserTemplate = Handlebars.compile($('#create-user-template').html());
  $("#start").on("click", startGame);
  $('body').on('click', '#create-button', createUser);
  $('body').on('click', '#login-button', login);
   $('body').on('click', '#logout-button', logout);
  
  renderStart()
});

function renderStart() {
  var Currentuser = $.ajax({
    url:"/current_user",
    method: "GET"
  }).done(function(Obj){
    if(!Obj.currentUser){
  $('#user-accounts').empty();
  $('#user-access').empty();
  $('#user-access').append(loginTemplate);
  $('#user-access').append(createUserTemplate);
    } else{
   var currentId = Obj.currentUser
   var user = $.ajax({
    url: "/users/" + currentId,
    method: "GET"
   }).done(function(user){
  if(!Currentuser.id){
    renderUserAccounts(user)
  } else {
  $('#user-accounts').empty();
  $('#user-access').empty();
  $('#user-access').append(loginTemplate);
  $('#user-access').append(createUserTemplate);
    };
  });
 }
});
}


function createUser() {
  var username = $('#create-username').val();
  var password = $('#create-password').val();
  $.post('/users', {
    username: username,
    password: password
  })
  .done(function() {
      alert('Success!');
      $('#create-username').val('');
      $('#create-password').val('');
  })
  .fail(function() {
      alert('Fail!');
  });
};

function login() {
  var username = $('#login-username').val();
  var password = $('#login-password').val();

  $.post('/sessions', {
    username: username,
    password: password
  })
  .done(renderUserAccounts)
  .fail(function(response) {
    var err = response.responseJSON;
    alert(err.err + ' - ' + err.msg);
  });
};



function renderUserAccounts(user) {
  var userId;
  isNaN(user) ? userId = user.id : userId = user;
  $.get('/users/' + userId)
    .done(function (fullUser) {
      $('#user-access').html(userTemplate(fullUser));
      $('#user-accounts').empty();
      fullUser.accounts.forEach(function(account) {
        $('#user-accounts').append(accountTemplate(account));
      });
    });
};

function logout() {
  $.ajax({
    method: 'DELETE',
    url: '/sessions'
  })
  .done(renderStart);
};

function sendScore(score){
  var userId = $('#current-user')
    .attr('data-userId');
  var current = $("#current-user")
  .attr("data-high");
  if(score >= current){
    $.ajax({
      method: "PUT",
      url:"/users/" + userId,
      data: {
        high_score: score
      }
    });
  };
  var scores = $("<div>")
  scores.html("your score is " + score)
  var died =  $("<div>").html("you died")
  $("#container").append(died)
  $("#container").append(scores);
  renderStart();
};

function sendWinScore(score){
  var userId = $('#current-user')
    .attr('data-userId');
  var current = $("#current-user")
  .attr("data-high");
  if(score >= current){
    $.ajax({
      method: "PUT",
      url:"/users/" + userId,
      data: {
        high_score: score
      }
    });
  };
  var scores = $("<div>")
  scores.html("your score is " + score)
  var won =  $("<div>").html("you won!")
  $("#container").append(won)
  $("#container").append(scores);
  renderStart();
};

