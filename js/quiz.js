$(function() {
  /*
  * TEMP - TODO: REMOVE ME
  <div class="col-xs-12">
    <div class="panel panel-default">
      <div class="panel-heading">
        <h2 class="panel-title question" id="1">Question?</h2>
      </div>
      <div class="panel-body">
        <ul class="nav nav-pills nav-justified answers">
          <li role="presentation" class="answer"><a href="#">Dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. </a></li>
          <li role="presentation" class="answer"><a href="#">Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.</a></li>
          <li role="presentation" class="answer"><a href="#">Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</a></li>
          <li role="presentation" class="answer"><a href="#">Ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</a></li>
        </ul>
      </div>
    </div>
  </div>
  */

  /*
  * SETUP
  */
  var questions;
  var answers;

  fetchQuestions();
  showQuestions();

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

  /*
  * BACKEND
  */

  /* TODO: Fetch questions from data source */
  function fetchQuestions() {
    questions = [createQuestionFromArrayData(''), createQuestionFromArrayData(''), createQuestionFromArrayData(''),];
  }

  function createQuestionFromArrayData(data) {
    var question = new Object();

    question.number = 1;
    question.question = "Question?"; //TODO: Question from data
    var answers = ['1', '2', '3', '4']; //TODO: Replace with answers from data
    question.answers = answers;
    question.correctAnswer = 1;

    return question;
  }

  function showQuestions() {
    questions.forEach(function(q) {
      showQuestion(q);
    });
  }

  function showQuestion(question) {
    var htmlQuestion = '<!-- Question START --><div class="row" id="' + question.number + '"><div class="col-xs-12"><div class="panel panel-default"><div class="panel-heading"><h2 class="panel-title question">' + question.question + '</h2></div><div class="panel-body"><ul class="nav nav-pills nav-justified answers"><li role="presentation" class="answer"><a href="#">' + question.answers[0] + '</a></li><li role="presentation" class="answer"><a href="#">' + question.answers[1] + '</a></li><li role="presentation" class="answer"><a href="#">' + question.answers[2] + '</a></li><li role="presentation" class="answer"><a href="#">' + question.answers[3] + '</a></li></ul></div></div></div></div><!-- Question END -->';

    $('#questions').append(htmlQuestion);
  }

  function didSelectAnswer(answer, questionID) {

  }
});
