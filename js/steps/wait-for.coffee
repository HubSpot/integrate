AssertStep = require "./assert.coffee"

class WaitForStep extends AssertStep
    constructor: (@sel, @expected, @seconds) ->
        super

        # Allow the same arguments as AssertStep, plus the # of seconds to wait
        if typeof @expected is 'number'
            @seconds = @expected
            @expected = undefined
        @seconds ?= 10

        # Only time matters for this step, not the number of failures
        @on 'change:numFailures', =>
            @set 'numFailures', 0

    timeExpired: =>
        @timeHasExpired = true

    announcement: ->
        if _(@sel).isFunction()
            return "Waiting up to #{@seconds}s for: <pre class='function'>#{@sel}</pre>"
        else if @expected?
            return "Waiting up to #{@seconds}s for \"#{@expected}\" to match contents of: <pre>#{@sel}</pre>"
        else
            return "Waiting up to #{@seconds}s for element to exist: <pre>#{@sel}</pre>"

    perform: (workspace) ->
        @startTime ?= +new Date
        if (+new Date) - @startTime > @seconds * 1e3
            throw new Error("Timeout. #{@announcement()}")
        else
            super

module.exports = WaitForStep