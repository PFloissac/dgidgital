function bytesToSize(bytes) {
   var sizes = ['octets', 'Ko', 'Mo', 'Go', 'To'];
   if (bytes == 0) return '0 octets';
   var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
   return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
};


function sendComment(event, postId) {
  var comment = $("#CommentForm_content_" + postId).val();
  event.preventDefault();

  var posting = $.post( "/posts/" + postId + "/comment", { comment: comment } );

  posting.done(function(data) {
    $('#comments-container-inner-' + postId).empty().append(data);
    var c = $('#youGuys-hashtags-replacement-' + postId).children();
    if (c) {
      $('#youGuys-hashtags-container-' + postId).empty().append(c);
    }
  });
}
