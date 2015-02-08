$(function() {
  /*
  * BACKEND
  */

  /* TODO: Fetch questions from data source */

  /* TODO: Insert questions to DOM */

  function

  /*
  * UI
  */
  $('.answer').click(function() {
    var parent = $(this).parent();

    parent.children().each(function(a) {
      $(this).removeClass('active');
    });

    $(this).addClass('active');

    /* TODO: Save selected answer to answers */
  });
});
