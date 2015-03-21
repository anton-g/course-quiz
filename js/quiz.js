$(function() {
  /*
  * SETUP
  */
  var filteredQuestions = new Array();
  var questions = new Array();
  var categories = new Array();
  var courses = new Array();
  var currentCourse;
  var numCorrectAnswers = 0;
  var maxQuestions;
  var shuffleQuestions = true;
  var shuffleAnswers = true;
  var dataSource = 'questions.xml';
  var currentCategory = 'Alla kategorier';

  setup();

  $('#answerBtn').click(function(e) {
    e.preventDefault();

    correctAnswers();

    $("html, body").animate({
      scrollTop:0
    },"slow");
  });

  $('#changeCourseBtn').click(function(e) {
    location.reload();
  });

  function setupUI() {
    showQuestions(questions);
    showCategories();

    bindAnswerClickEvents();
  }

  function showQuestions(q) {
    if (shuffleQuestions) {
      shuffleArray(q);
    }

    q.forEach(function(q, index) {
      if (maxQuestions && index > maxQuestions-1) {
        return false;
      }
      showQuestion(q);
    });
  }

  //TODO: Add support for videos in XML
  function showQuestion(question) {
    var justified = 'nav-justified';
    var code = '';

    if (question.images) {
      justified = '';
    }
    if (question.code) {
      justified = '';
      code = 'nav-stacked';
    }

    //If question contains an image we want to show it
    var image = '';
    if (typeof question.image !== typeof undefined && question.image !== false) {
      image = '<img src="img/' + question.image + '" class="img-responsive question-image" />';
    }

    //If question contains an sound we want to show it
    var sound = '';
    if (typeof question.sound !== typeof undefined && question.sound !== false) {
      sound = '<audio controls><source src="sound/' + question.sound + '" type="audio/mpeg">Kan inte spela upp ljud.</audio>';
    }

    var htmlQuestion = '<!-- Question START --><div class="row question" data-questionID="' + question.number + '"><div class="col-xs-12"><div class="panel panel-default"><div class="panel-heading"><h2 class="panel-title">' + question.question + '<span class="pull-right categoryName">' + question.category + '</span>' + image + sound +'</h2></div><div class="panel-body"><ul class="nav nav-pills ' + justified + code + ' answers">';

    var htmlAnswers = new Array();
    $(question.answers).each(function(index) {
      var htmlAnswer = question.answers[index];
      htmlAnswers.push('<li role="presentation" class="answer " data-answerID="' + (index + 1) + '"><a href="#">' + htmlAnswer + '</a></li>')
    });

    shuffleArray(htmlAnswers);
    $(htmlAnswers).each(function() {
      htmlQuestion = htmlQuestion + this;
    });

    htmlQuestion = htmlQuestion + '</ul></div></div></div></div><!-- Question END -->';

    $('#questions').append(htmlQuestion);
  }

  function showCategories() {
    $(categories).each(function(index, category) {
      var htmlCategory = '<li role="presentation" class="category ctg-dyn"><a href="#">' + category + '</a></li>';
      $('.categories').append(htmlCategory);
    });
  }

  function showResults() {
    var numQuestions = $('.question').length;

    var numCorrect = numCorrectAnswers + '/' + numQuestions;
    var percent = ((numCorrectAnswers / numQuestions) * 100);

    var htmlStart = '<div class="row result"><div class="col-xs-12"><div class="panel panel-primary"><div class="panel-heading"><h2 class="panel-title">Resultat</h2></div><div class="panel-body">'
    var htmlBody = '<div class="row"><div class="col-xs-9">Antal rätt: ' + numCorrect + ' (' + percent +'%)</div><div class="col-xs-3"><button class="btn btn-large btn-primary pull-right" id="resetBtn">Try again!</button></div></div>';
    var htmlEnd = '</div></div></div></div>';

    var htmlResult = htmlStart + htmlBody + htmlEnd;

    $('#questions').prepend(htmlResult);

    $('#resetBtn').click(function(e) {
      e.preventDefault();

      removeContent();
      reloadQuestions();
    });
  }

  function showCourse(course) {
    var htmlCourseButton = '<a class="btn btn-primary btn-lg btn-block selectCourseBtn">' + course + '</a>';
    $('#selectCourseModalBody').append(htmlCourseButton);
  }

  function removeContent() {
    $('.result').remove();
    $('.question').remove();
  }

  function removeCategories() {
    $('.ctg-dyn').remove();
  }

  /*
  * BACKEND
  */

  function setup() {
    getUserSettings();

    $.get(dataSource, function(data) {
      $(data).find('course').each(function() {
        var courseName = $(this).attr('name');
        courses.push(courseName);
      });

      $(courses).each(function() {
        showCourse(this);
      });

      $('.selectCourseBtn').click(function() {
        var selectedCourse = $(this).html();
        setCourse(selectedCourse);
      });

      bindSettingsClickEvents();

      $('#selectCourseModal').modal({
        keyboard: false,
        backdrop: 'static'
      })
    });
  }

  function setupQuestions(course, complete) {
    $.get(dataSource, function(data) {
      var courseData = ($(data).find('course[name=' + course + ']'));

      $(courseData).find('question').each(function() {
        questions.push(createQuestionWith($(this)));
      });

      complete();
    });
  }

  function setCourse(course) {
    currentCourse = course;

    $('#titleLabel').html('📋 Quiz: ' + currentCourse);

    setupQuestions(currentCourse, function() {
      setupUI();
      bindCategoryClickEvents();
    });

    $('#selectCourseModal').modal('hide');
  }

  function reloadQuestions() {
    currentQuestions = filterQuestionsByCategory(currentCategory);
    showQuestions(currentQuestions);
    $('#answerBtn').prop('disabled', false);
    bindAnswerClickEvents();
  }

  function createQuestionWith(data) {
    var question = new Object();

    question.number = data.attr('id');
    question.question = data.attr('text');
    question.image = data.attr('image');
    question.sound = data.attr('sound');

    question.category = data.attr('category');
    if ($.inArray(question.category, categories) == -1) {
      categories.push(question.category);
    }

    var answerData = $(data).find('answer');

    if (shuffleAnswers) {
      shuffleArray(answerData);
    }

    var answers = new Array();
    $(answerData).each(function(index, answer) {
      if ($(this).attr('correct')) {
        question.correctAnswer = index + 1;
      }

      var answer;
      var answerType = $(this).attr('data-type');
      if (answerType == 'image') {
        question.images = true;
        answer = '<img class="img-responsive answer-img" src="img/' + $(this).text() + '" />'
      }
      else if (answerType == 'sound') {
        answer = '<audio controls><source src="sound/' + $(this).text() + '" type="audio/mpeg">Kan inte spela upp ljud.</audio>';
      }
      else if (answerType == 'video') {
        //TODO: Support för videos
      }
      else if (answerType == 'text') {
        answer = $(this).text();
      }
      else if (answerType == 'code') {
        question.code = true;
        answer = '<code>' + $(answer).html() + '</code>';
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

  function didSelectCategory(category) {
    removeContent();
    resetAllQuestions();

    currentCategory = category;

    realQuestions = filterQuestionsByCategory(currentCategory);
    showQuestions(realQuestions);

    $('#answerBtn').prop('disabled', false);
    bindAnswerClickEvents();
  }

  function filterQuestionsByCategory(category) {
    if (category != 'Alla kategorier') {
      filteredQuestions = new Array();

      $(questions).each(function(index, question) {
        if (question.category == category) {
          filteredQuestions.push(question);
        }
      });
      return filteredQuestions;
    } else {
      return questions;
    }
  }

  //TODO: Är lite lång alltså, refaktorera
  function correctAnswers() {
    var questions = $('#questions').find('.question');

    $(questions).each(function() {
      var questionID = $(this).attr('data-questionID');
      var question = questionFromID(questionID);

      var selectedAnswerButton = $(this).find('.active');
      var selectedAnswer = $(selectedAnswerButton).attr('data-answerid');

      correctQuestion(question);

      if (question.correct) {
        numCorrectAnswers++;

        $(this).find('.panel').removeClass('panel-default').addClass('panel-success');
        $(selectedAnswerButton).addClass('green');

        correctAnswer = $(this).find('li[data-answerid=' + question.correctAnswer + '] a');
        correctAnswer.html('<span class="glyphicon glyphicon-ok icon" aria-hidden="true"></span>  ' + correctAnswer.html());
      }
      else {
        $(this).find('.panel').removeClass('panel-default').addClass('panel-danger');
        $(selectedAnswerButton).addClass('red');

        $(selectedAnswerButton).find('a').html('<span class="glyphicon glyphicon-remove icon" aria-hidden="true"></span>' + $(selectedAnswerButton).find('a').html());

        //Show correct answer
        var incorrectAnswer = $(this).find('li[data-answerid=' + question.correctAnswer + '] a');
        incorrectAnswer.html('<span class="glyphicon glyphicon-ok icon" aria-hidden="true"></span>  ' + incorrectAnswer.html());
      }

      //Disable stuff
      $('.answer').addClass('disabled');
      $('#answerBtn').attr('disabled', 'disabled');
    });

    showResults();
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

  function bindAnswerClickEvents() {
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
  }

  function bindCategoryClickEvents() {
    $('.category').click(function(e) {
      e.preventDefault();
      var answers = $('.question').find('.active');
      if (answers.length > 0) {
        if (!confirm('Vill du verkligen fortsätta? Dina svar kommer då försvinna.')) {
          return;
        }
        numCorrectAnswers = 0;
      }

      if ($(this).hasClass('disabled')) {
        return;
      }
      var parent = $(this).parent();

      parent.children().each(function(a) {
        $(this).removeClass('active');
      });

      $(this).addClass('active');

      var categoryName = $(this).find('a').html();

      didSelectCategory(categoryName);
    });
  }

  function bindSettingsClickEvents() {
    $('.shuffleButton').click(function() {
      var selectedSetting = this;
      var isChecked = $(selectedSetting).hasClass('active');

      var setting = $(selectedSetting).attr('setting');

      if (isChecked) {
        disableSetting(setting);
      } else {
        enableSetting(setting);
      }
    });
    $('.maxQuestionsButton').click(function() {
      maxQuestions = $(this).children()[0].value == 0 ? undefined : $(this).children()[0].value;
    });
  }

  function resetAllQuestions() {
    $(questions).each(function(index, question) {
      question.correct = false;
    });
    $(filteredQuestions).each(function(index, question) {
      question.correct = false;
    });
  }

  /* SETTINGS (everytime someone looks at this code a kitten dies) */
  function getUserSettings() {
    getShuffleQuestionsSetting();
    getShuffleAnswersSetting();
  }

  function getShuffleQuestionsSetting() {
    var shuffleQuestionsCookie = readCookie('shuffleQuestions');
    if (shuffleQuestionsCookie) {
      if (shuffleQuestionsCookie == 'YES') {
        shuffleQuestions = true;
      }
      else {
        shuffleQuestions = false;
        $('.settingsButton[setting=shuffleQuestions]').removeClass('active');
      }
    } else {
      createCookie('shuffleQuestions', 'YES', 99999);
    }
  }

  function getShuffleAnswersSetting() {
    var shuffleAnswersCookie = readCookie('shuffleAnswers');
    if (shuffleAnswersCookie) {
      if (shuffleAnswersCookie == 'YES') {
        shuffleAnswers = true;
      }
      else {
        shuffleAnswers = false;
        $('.settingsButton[setting=shuffleAnswers]').removeClass('active');
      }
    } else {
      createCookie('shuffleAnswers', 'YES', 99999);
    }
  }

  function disableSetting(setting) {
    switch(setting) {
      case 'shuffleQuestions':
        shuffleQuestions = false;
        createCookie('shuffleQuestions', 'NO', 99999);
        break;
      case 'shuffleAnswers':
        shuffleAnswers = false;
        createCookie('shuffleAnswers', 'NO', 99999);
        break;
      default:
        console.log ('Unkown setting?');
        break;
    }
  }

  function enableSetting(setting) {
    switch(setting) {
      case 'shuffleQuestions':
        shuffleQuestions = true;
        createCookie('shuffleQuestions', 'YES', 99999);
        break;
      case 'shuffleAnswers':
        shuffleAnswers = true;
        createCookie('shuffleAnswers', 'YES', 99999);
        break;
      default:
        console.log ('Unkown setting?');
        break;
    }
  }

  /* Helpers */
  function shuffleArray(arr) {
      for (var j, x, i = arr.length; i; j = Math.floor(Math.random() * i), x = arr[--i], arr[i] = arr[j], arr[j] = x);
      return arr;
  };

  /*
  Cookie handling
  From: http://www.quirksmode.org/js/cookies.html
  */

  function createCookie(name, value, days) {
    var expires;

    if (days) {
      var date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = "; expires=" + date.toGMTString();
    } else {
      expires = "";
    }
    document.cookie = encodeURIComponent(name) + "=" + encodeURIComponent(value) + expires + "; path=/";
  }

  function readCookie(name) {
    var nameEQ = encodeURIComponent(name) + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
    return null;
  }

  function eraseCookie(name) {
    createCookie(name, "", -1);
  }

});
