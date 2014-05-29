Integrate
=========

Library and application for integration testing at the UI level.

"It's like your computer is haunted by a helpful ghost!"

![](https://raw.github.com/HubSpot/integrate/master/docs/integrate.gif)

Watch Integrate in action here:

<a href="http://backbone-todos.divshot.io/integrate_test" target="_blank">Integrate test example</a>

What makes Integrate different
------------

* Integrate is designed to help you easily run and debug tests in your browser.
* Its visual cursor makes developing new tests fast and fun.
* Integrate's full-stack approach does not require writing testable code.
* Its JavaScript API allows most tests to be written without callbacks.
* It features a timing model which runs tests as fast as possible while still handling a reasonable threshold of unexpected application slowness.

Quick Start
-----------

You can write your first Integrate test by creating a new HTML file hosted from your app's server like this:

```html
<html>
    <head>
        <title>My Integrate Test</title>
        <link href="//rawgit.com/HubSpot/integrate/master/stylesheets/style.css" rel='stylesheet' type='text/css'>
    </head>
    <body>
        <script src="//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js" type="text/javascript"></script>
        <script src="//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.5.2/underscore-min.js" type="text/javascript"></script>
        <script src="//cdnjs.cloudflare.com/ajax/libs/backbone.js/1.0.0/backbone-min.js" type="text/javascript"></script>
        <script src="//rawgit.com/HubSpot/integrate/master/integrate.min.js" type="text/javascript"></script>
        <script>
            test = new window.TestBuilder();
            test.visit("/home");
            test.click("#foo");
            test.run();
        </script>
    </body>
</html>
```

The CDN links used above can of course be replaced with self-hosted versions.

Documentation
-------------

This documentation assumes that your TestBuilder instance is stored as a variable called `test`, just like in the Quick Start above.

### test.run()

Your Integrate test will do nothing until you call `test.run()` on it. When you call `test.run()`, all of the test steps you have queued up in your TestBuilder will execute, one at a time.

### test.click(selector)

Locates the selector on the page, tests whether an element with that selector is
visible, and simulates a click event on it.

### test.click(someFunc)

```
test.click(function($page) {
    $page.find("#some-selector").closest(".wrapper");
})
````

`click` also can take a function which returns the jQuery object to click. The
function is passed a jQuery object containing the entire page (but not the
integrate UI).

### test.assert(selector)

Locates the selector on the page and tests whether an element with that selector
is visible.

### test.assert(selector, substring)

Locates the selector on the page and tests whether `substring` is present inside
of its visible text (or, in the case of an `<input>` element, its `value`
attribute).

### test.assert(someFunc)

`assert` can also be passed a function which should return `true` if the
assertion passes and `false` if it fails:

```
test.assert(function($page) {
    $page.find("#some-selector").hasClass("foo");
})
```

The test will fail if the function returns `false` 40 times in a row, but
will continue immediately the first time the function returns true.

Note that unlike the other forms of `assert`, this method can match hidden
elements.

### test.waitFor(someFunc, maxSeconds = 10)

`waitFor` functions just like `assert`, except that instead of trying the
assertion a fixed number of times, it keeps trying until `maxSeconds` has
elapsed. **Use this only when your test depends on significant server-side
processing.** Most of the time, the fast failure that `assert` provides is more
desirable than a slow test.

`waitFor(selector, maxSeconds)` and `waitFor(selector, substring, maxSeconds)`
are also supported.

### test.assertValue(selector, substring)

Locates the selector on the page, tests whether it's visible, and checks whether
the first visible element's value matches the substring. This can be used for
`<input>`, `<select>`, and `<textarea>` elements.

### test.type(selector, text)

Simulates the user typing `text` into the input element indicated by
`selector`.

### test.pressEnter(selector)

Simulates the user pressing the enter key while focused on the input
element indicated by `selector`.

### test.pause()

Suspend the test indefinitely - used for local debugging. Calling window.resume() continues the test.

### test.do(someFunc)

Executes `someFunc` at the current "cursor" point in the step queue. This is useful for
pulling state from the DOM during the test, for example:

```
test.do(function(window) {
    myUrl = $(window.document).find('a.some-link').attr("href");
    test.visit(myUrl);
})
```

It can also be used to implement `if` branching in your test:
```
test.do(function(window) {
    if ($(window.document).find("#not-found-error").length > 0) {
        test.click("#create-button");
    } else {
        test.click(".details-link");
    }
})
```

Your `test.do` function can call any `TestBuilder` method, including further
calls to `test.do`. These enqueued TestBuilder steps will execute in an intuitive top-down manner
by simulating synchronous execution.

For example, this test will log its messages in ABC order:

```
    test = new TestBuilder();
    test.do(function() {
        console.log('a');
    });
    test.do(function() {
        console.log('b');
        test.do(function() {
            console.log('c');
            test.do(function() {
                console.log('d');
            });
        });
    });
    test.do(function() {
        console.log('e');
    })
    test.run();
)
```

### test.cleanup()

To perform additional test steps after your test passes or fails, typcally to
delete entities created during your test, nest those steps inside of a
`test.cleanup()` block:

```
test.cleanup ->
    test.click '#delete-entity'
```

Note that Integrate cannot always perform requested cleanup tasks - if the browser is closed during a test, the cleanup task will not occur.

Credits
-------
Integrate was created with love at HubSpot. The following individuals played
a huge role in the design and development of Integrate: 

* Trevor Burnham
* Matt Furtado
* Tim Finley

The following early adopters were crucial in submitting bugfixes and
improvements:

* Andy Aylward
* Matt Ball
* Jeff Dwyer
* Padraig Farrell
* Solomon Lutze
* Marc Neuwirth
* Ernie Park
* Jim Petr
* Talia Swartz
* Gus Vargas
