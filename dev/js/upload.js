/* eslint-disable no-undef */

$('#file').on('change', function () {
  //e.preventDefault();

  var formData = new FormData();
  formData.append('postId', $('#post-id').val());
  formData.append('file', $('#file')[0].files[0]);

  $.ajax({
    type: 'POST',
    url: '/upload/image',
    data: formData,
    processData: false,
    contentType: false,
    success: function (data) {
      console.log(data);
      if (data.ok)
        $('#fileInfo').prepend('<div class="img-container" id="' + data.uploadDB.id + '"><img src="/uploads' + data.uploadDB.path + '" alt=""></div>').on('click', function () {
          console.log('click img');
          var imageId = $(this).children().attr('id');
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
      else $('.post-form h2').after('<p class="error">' + data.error + '</p>');
    },
    error: function (e) {
      console.log(e);
    }
  })
});
