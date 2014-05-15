utils = require "../utils.coffee"
TargetedStep = require "../steps/targeted-step.coffee"

class AssertStep extends TargetedStep
    constructor: (@sel, @expected) ->
        super

    mood: "look"

    announcement: ->
        if @expected?
            selClass = if _(@sel).isFunction() then 'function' else ''
            return "Expecting \"#{@expected}\" to match contents of: <pre class='#{selClass}''>#{@sel}</pre>"
        else if _(@sel).isFunction()
            return "Performing assertion: <pre class='function'>#{@sel}</pre>"
        else
            return "Expecting element to exist: <pre>#{@sel}</pre>"

    getTarget: (workspace) ->
        # We can't use utils.extractSelector() here because @sel() can be arbitrary
        if _(@sel).isFunction()
            $page = workspace.getPage()
            @functionResult = @sel($page)
            @$target = if @functionResult instanceof jQuery
                @functionResult
            else
                $()
        else
            super

    perform: (workspace) ->
        if @$target.length is 0
            if @functionResult not instanceof jQuery
                return !!@functionResult
            else
                return false

        # Only check for expected text content if a string was passed
        if @expected?
            if @$target.length > 1
                return false

            if @$target.is('input')
                value = @$target.val()
            else
                value = @$target.text()

            matched = value.trim().toLowerCase().indexOf(@expected.toLowerCase()) > -1

            if matched
                return @$target
            else
                return false

        else
            return true

module.exports = AssertStep