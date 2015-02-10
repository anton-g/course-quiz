$(function() {
  /*
  * SETUP
  */
  var questions = new Array();
  var numCorrectAnswers = 0;

  fetchQuestions(function() {
    showQuestions();

    $('.answer').click(function(e) {
      e.preventDefault();

      if ($(this).hasClass('disabled')) {
        return;
      }
      var parent = $(this).parent();

      parent.children().each(function(a) {
        $(this).removeClass('active');
      });

      $(this).addClass('active');

      didSelectAnswer($(this).closest('.question').attr('data-questionID'), $(this).attr('data-answerID'));
    });
  });

  $('#answerBtn').click(function(e) {
    e.preventDefault();

    correctAnswers();

    $("html, body").animate({
      scrollTop:0
    },"slow");
  });

  function showQuestions() {
    questions.forEach(function(q) {
      showQuestion(q);
    });
  }

  //TODO: Add support for images and videos in XML
  function showQuestion(question) {
    var justified = question.images ? '' : 'nav-justified';
    var htmlQuestion = '<!-- Question START --><div class="row question" data-questionID="' + question.number + '"><div class="col-xs-12"><div class="panel panel-default"><div class="panel-heading"><h2 class="panel-title">' + question.question + '</h2></div><div class="panel-body"><ul class="nav nav-pills ' + justified + ' answers">';


    $(question.answers).each(function(index) {
      var htmlAnswer = question.answers[index];
      htmlQuestion = htmlQuestion + '<li role="presentation" class="answer " data-answerID="' + (index + 1) + '"><a href="#">' + htmlAnswer + '</a></li>';
    });

    htmlQuestion = htmlQuestion + '</ul></div></div></div></div><!-- Question END -->';

    $('#questions').append(htmlQuestion);
  }

  /*
  * BACKEND
  */

  function fetchQuestions(complete) {
    $.get('questions.xml', function(data) {
      $(data).find('question').each(function() {
        questions.push(createQuestionWith($(this)));
      });

      complete();
    });
  }

  function createQuestionWith(data) {
    var question = new Object();

    question.number = data.attr('id');
    question.question = data.attr('text');
    var answerData = $(data).find('answer');

    var answers = new Array();

    $(answerData).each(function(index) {
      if ($(this).attr('correct') == 'YES') {
        question.correctAnswer = index + 1;
      }

      var answer;
      var answerType = $(this).attr('data-type');
      if (answerType == 'image') {
        question.images = true;
        answer = '<img class="img-responsive answer-img" src="img/' + $(this).text() + '" />'
      }
      else if (answerType == 'video') {
        //TODO: Support för videos
      }
      else if (answerType == 'text') {
        answer = $(this).text();
      }

      answers.push(answer);
    });
    question.answers = answers;

    return question;
  }

  function didSelectAnswer(questionID, answerID) {
    var question = questionFromID(questionID);
    question.userAnswer = answerID;
  }

  //TODO: Är lite lång alltså, refaktorera
  function correctAnswers() {
    var questions = $('#questions').find('.question');

    //TODO: Kontrollera att alla frågor är besvarade

    $(questions).each(function() {
      var questionID = $(this).attr('data-questionID');
      var question = questionFromID(questionID);

      var selectedAnswerButton = $(this).find('.active');
      var selectedAnswer = $(selectedAnswerButton).attr('data-answerid');

      correctQuestion(question);

      if (question.correct) {
        numCorrectAnswers++;

        $(this).find('.panel').removeClass('panel-default').addClass('panel-success');
        //TODO: Important css? ;<
        $(selectedAnswerButton).addClass('green');

        $(selectedAnswerButton).find('a').html('<span class="glyphicon glyphicon-ok pull-left" aria-hidden="true"></span>' + $(selectedAnswerButton).find('a').html());
      }
      else {
        $(this).find('.panel').removeClass('panel-default').addClass('panel-danger');
        //TODO: Important css? ;<
        $(selectedAnswerButton).addClass('red');

        $(selectedAnswerButton).find('a').html('<span class="glyphicon glyphicon-remove pull-left" aria-hidden="true"></span>' + $(selectedAnswerButton).find('a').html());

        //Show correct answer
        var incorrectAnswer = $(this).find('li[data-answerid=' + question.correctAnswer + '] a');
        incorrectAnswer.html('<span class="glyphicon glyphicon-ok" aria-hidden="true"></span>  ' + incorrectAnswer.html());
      }

      //Disable stuff
      $('.answer').addClass('disabled');
      $('#answerBtn').attr('disabled', 'disabled');
    });

    showResults();
  }

  function showResults() {
    var numCorrect = numCorrectAnswers + '/' + questions.length;
    var percent = ((numCorrectAnswers / questions.length) * 100);

    var htmlStart = '<div class="row result"><div class="col-xs-12"><div class="panel panel-primary"><div class="panel-heading"><h2 class="panel-title">Resultat</h2></div><div class="panel-body">'
    var htmlBody = '<div class="row"><div class="col-xs-9">Antal rätt: ' + numCorrect + ' (' + percent +'%)</div><div class="col-xs-3"><button class="btn btn-large btn-primary pull-right" id="resetBtn">Try again!</button></div></div>';
    var htmlEnd = '</div></div></div></div>';

    var htmlResult = htmlStart + htmlBody + htmlEnd;

    $('#questions').prepend(htmlResult);

    $('#resetBtn').click(function(e) {
      e.preventDefault();

      location.reload();
    });
  }

  function questionFromID(id) {
    var q = new Object();
    questions.forEach(function(question) {
      if (question.number == id) {
        q = question;
      }
    });
    return q;
  }

  function correctQuestion(question) {
    if (question.correctAnswer == question.userAnswer) {
      question.correct = true;
    }
    else question.correct = false;
  }
});
