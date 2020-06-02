/* eslint-disable no-undef */
$(function () {

  // remove errors
  function removeErrors() {
    $('.post-form p.error').remove();
    $('.post-form input, #post-body').removeClass('error');
  }

  // clear
  $('.post-form input, #post-body').on('focus', function () {
    removeErrors();
  });

  // publish
  $('.publish-button, .save-button').on('click', function (e) {
    e.preventDefault();
    removeErrors();

    var isDraft = $(this).attr('class').split(' ')[0] === 'save-button';
    var data = {
      title: $('#post-title').val(),
      body: $('#post-body').val(),
      isDraft: isDraft,
      postId: $('#post-id').val(),
    };

    $.ajax({
      type: 'POST',
      data: JSON.stringify(data),
      contentType: 'application/json',
      url: '/post/add'
    }).done(function (data) {
      console.log(data);
      if (!data.ok) {
        $('.post-form h2').after('<p class="error">' + data.error + '</p>');
        if (data.fields) {
          data.fields.forEach(function (item) {
            $('#post-' + item).addClass('error');
          });
        }
      } else {
        // $('.register h2').after('<p class="success">Отлично!</p>');
        //$(location).attr('href', '/');
        if (isDraft) {
          $(location).attr('href', '/post/edit/' + data.post.id);
        } else {
          $(location).attr('href', '/posts/' + data.post.url);
        }
      }
    });
  });

  //add image
  $('.img-container').on('click', function () {
    console.log('click img');
    var imageId = $(this).attr('id');
    var txt = $('#post-body');
    var caretPos = txt[0].selectionStart;
    var textAreaTxt = txt.val();
    var txtToAdd = '![alt text](image' + imageId + ')';
    txt.val(
      textAreaTxt.substring(0, caretPos) +
      txtToAdd +
      textAreaTxt.substring(caretPos)
    );
  });

  $('.remove-button').on('click', function (e) {
    e.preventDefault();

    var data = {
      postId: $('#post-id').val(),
    };

    $.ajax({
      type: 'DELETE',
      data: JSON.stringify(data),
      contentType: 'application/json',
      url: '/post/remove'
    }).done(function (data) {
      console.log(data);
      if (!data.ok) {
        $('.post-form h2').after('<p class="error">' + data.error + '</p>');
        if (data.fields) {
          data.fields.forEach(function (item) {
            $('#post-' + item).addClass('error');
          });
        }
      } else {
        // $('.register h2').after('<p class="success">Отлично!</p>');
        $(location).attr('href', '/');
      }
    });
  });
});

/* eslint-enable no-undef */
