MainView = require "./views/main-view.coffee"
Steps = require "./collections/steps.coffee"
Passer = require "./models/passer.coffee"
VisitStep = require "./steps/visit.coffee"
ClickStep = require "./steps/click.coffee"
TypeStep = require "./steps/type.coffee"
AssertStep = require "./steps/assert.coffee"
WaitForStep = require "./steps/wait-for.coffee"
AssertValueStep = require "./steps/assert-value.coffee"
AssertURLStep = require "./steps/assert-url.coffee"
PressEnterStep = require "./steps/press-enter.coffee"
CustomFunctionStep = require "./steps/custom-function.coffee"
PauseStep = require "./steps/pause.coffee"
FocusIframeStep = require "./steps/focus-iframe.coffee"


class TestBuilder
    constructor: (mixins={}) ->
        @steps = new Steps()
        @cleanupSteps = new Steps([], workspace: @steps.workspace)
        @passer = new Passer(collection: @steps)

    visit: (url) ->
        @steps.add new VisitStep(url)

    click: (sel) ->
        @steps.add new ClickStep(sel)

    locate: (sel) ->
        @assert(sel)  # backward compatibility

    type: (sel, text) ->
        @click(sel)
        @steps.add new TypeStep(sel, text)

    assert: (sel, expected) ->
        @steps.add new AssertStep(sel, expected)

    waitFor: (sel, expected) ->
        @steps.add new WaitForStep(sel, expected)

    assertValue: (sel, expected) ->
        unless expected?
            throw new Error('assertValue requires an "expected" argument')
        @steps.add new AssertValueStep(sel, expected)

    assertURL: (stringOrRegex) ->
        @steps.add new AssertURLStep(stringOrRegex)

    ok: ->
        @click("#hs-fancybox-ok")

    pressEnter: (sel) ->
        @steps.add new PressEnterStep(sel)

    pause: (delay) ->
        @steps.add new PauseStep(delay)

    do: (inFunc) ->
        @steps.add new CustomFunctionStep(inFunc)

    cleanup: (inFunc) ->
        @cleanupSteps.add new CustomFunctionStep(inFunc)

    run: (mode) ->
        mode ?= sessionStorage.integrateSpeed ?
                localStorage.integrateSpeed ?
                'fast'
        @passer.set({mode})
        view = new MainView(el: $("body"), model: @passer).render()
        @steps.run()
        @steps.once 'success failure', =>
            view.startCleanup(@cleanupSteps)
            @steps = @cleanupSteps  # any new steps will be added to cleanupSteps
            @cleanupSteps.run()

    focusIframe: (sel) ->
        @steps.add new FocusIframeStep(sel)

    defocusIframe: ->
        @focusIframe()

console.log 'hey'
window.TestBuilder = TestBuilder
exports = TestBuilder
