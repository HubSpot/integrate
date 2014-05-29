integrate
=========

library and internal app for integration testing at the UI level.

"It's like your computer is haunted by a helpful ghost!"

Watch Integrate in action here:

http://backbone-todos.divshot.io/integrate_test

Test Methods
-------------

### test.click(selector)

Locates the selector on the page, tests whether an element with that selector is
visible, and simulates a click event on it.

### test.click(someFunc)

```
test.click(($page) ->
    $page.find("#some-selector").closest(".wrapper")
)
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
test.assert(($page) ->
    $page.find("#some-selector").hasClass("foo")
)
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
test.do (window) ->
    myUrl = $(window.document).find('a.some-link').attr("href")
    test.visit (myUrl)
```

It can also be used to implement `if` branching in your test:
```
test.do (window)->
    if $(window.document).find("#not-found-error").length > 0
        test.click("#create-button")
    else
        test.click(".details-link")
```

Your `test.do` function can call any `TestBuilder` method, including further
calls to `test.do`. These enqueued TestBuilder steps will execute in an intuitive top-down manner
by simulating synchronous execution.

For example, this test will log its messages in ABC order:

```
hubspot.require(["hubspot.integrate.TestBuilder"], (TestBuilder) ->
    test = new TestBuilder()
    test.do ->
        console.log 'a'
    test.do ->
        console.log 'b'
        test.do ->
            console.log 'c'
            test.do ->
                console.log 'd'
    test.do ->
        console.log 'e'
    test.run()
)
```

Cleanup
-------

To perform additional test steps after your test passes or fails, typcally to
delete entities created during your test, nest those steps inside of a
`test.cleanup()` block:

```
test.cleanup ->
    test.click '#delete-entity'
```
