# Course Quiz
Originally an assignment for multimedia course at Uppsala University but have now been expanded and includes support for different courses and other nifty features.

## Adding questions
- Fork and clone project
- Look at syntax in questions.xml
- Add new questions following the syntax
- Commit and create pull request

## ToDo
+ Test with more browsers.
  + Works with Safari.
  + Works with Firefox.
  + Does not work with Chrome: `XMLHttpRequest cannot load file:///redacted/questions.xml. Cross origin requests are only supported for protocol schemes: http, data, chrome, chrome-extension, https, chrome-extension-resource.`.
+ Add settings for shuffling questions etc
+ Add a question submitter
+ Fix inline code support
+ Fix statistics
+ ~~Host on GH Pages~~
  + There seems to be an issue with GitHub Pages and JQuerys `$.get()`. Could possible be fixed by switching to `$.getJSON()` instead but that would require quite some rewrite.
