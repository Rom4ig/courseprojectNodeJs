/* eslint-disable no-undef */
$(function () {
  var commentForm;
  var parentId;
  var socket = new WebSocket("ws://localhost:3001");

  // remove errors
  function removeErrors() {
    $('form.comment p.error').remove();
  }

  // clear
  $('form.comment textarea').on('focus', function () {
    removeErrors();
  });

  function form(isNew, comment, isEdit) {
    $('.reply').show();
    $('.edit').show();

    if (commentForm) {
      commentForm.remove();
    }
    parentId = null;

    commentForm = $('.comment').clone(true, true);

    if (isNew) {
      commentForm.find('.cancel').hide();
      commentForm.appendTo('.comment-list');
    } else {
      var parentComment = $(comment).parent().parent();
      parentId = parentComment.attr('id');
      $(comment).parent().after(commentForm);
    }

    if (isEdit) {
      commentForm.find('.send').hide();
      commentForm.find('.edit-send').show();
    } else {
      commentForm.find('.edit-send').hide();

    }
    commentForm.css({display: 'flex'});
  }

  // load
  if ($('#user-id').val()) {
    form(true);
  }


  // add form
  $('.reply').on('click', function () {
    form(false, this);
    $(this).hide();
  });

  $('.edit').on('click', function () {
    form(false, this, true);

    $(this).hide();
  });

  // add form
  $('form.comment .cancel').on('click', function (e) {
    e.preventDefault();
    commentForm.remove();
    // load
    form(true);
  });

  // publish
  $('form.comment .send').on('click', function (e) {
    e.preventDefault();
    // removeErrors();

    var data = {
      post: $('.comments').attr('id'),
      body: commentForm.find('textarea').val(),
      parent: parentId,
      userId: commentForm.find('#user-id').val(),
    };
    console.log(data);
    socket.send(JSON.stringify(data));

    //$(commentForm).after(newComment);
    //form(true);
  });

  $('.delete').on('click', function (e) {
    e.preventDefault();
    var data = {
      commentId: $(this).parent().parent().attr('id'),
    };
    console.log(data);
    $.ajax({
      type: 'DELETE',
      data: JSON.stringify(data),
      contentType: 'application/json',
      url: '/comment'
    }).done(function (data) {
      console.log(data);
      if (!data.ok) {
        if (!data.error) {
          data.error = 'Неизвестная ошибка!';
        }
        $(commentForm).prepend('<p class="error">' + data.error + '</p>');
      } else {
        location.reload();
      }
    })
  });

  $('.edit-send').on('click', function (e) {
    e.preventDefault();
    var data = {
      commentId: $(this).parent().parent().parent().attr('id'),
      body: commentForm.find('textarea').val(),
    };
    console.log(data);
    $.ajax({
      type: 'PUT',
      data: JSON.stringify(data),
      contentType: 'application/json',
      url: '/comment'
    }).done(function (data) {
      console.log(data);
      if (!data.ok) {
        if (!data.error) {
          data.error = 'Неизвестная ошибка!';
        }
        $(commentForm).prepend('<p class="error">' + data.error + '</p>');
      } else {
        location.reload();
      }
    })
  });

  socket.onmessage = function (event) {
    var comment = event.data;
    comment = JSON.parse(comment);
    console.log(comment);
    if(comment.ok)
    showComment(comment);
    else $(commentForm).prepend('<p class="error">' + comment.error + '</p>');
  };

  function showComment(comment) {
    var newComment =
      '<ul><li style="background-color:#ffffe0;"><div class="head"><a href="/users/' +
      comment.login +
      '">' +
      comment.login +
      '</a><spam class="date">Только что</spam></div>' +
      comment.body +
      '</li></ul>';
    $(commentForm).after(newComment);
    form(true);
  }
});
