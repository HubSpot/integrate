utils = require "../utils.coffee"
TargetedStep = require "../steps/targeted-step.coffee"

class ClickStep extends TargetedStep
    mood: "click"

    announcement: ->
        if _(@sel).isFunction()
            return "Clicking on: <pre class='function'>#{@sel}</pre>"
        else
            return "Clicking on: <pre>$page.find(\"#{@sel}\")</pre>"

    perform: (workspace) ->
        if @$target.length == 0
            return false
        if @$target.length > 1
            @trigger("warning", "Warning: Can't click, multiple matches found for this selector.")
            return false

        $page = workspace.getPage()
        unless $page.find(@$target).length is 1
            return false  # target is no longer in the DOM

        utils.simulateClickOn(workspace, @$target)

        return @$target

module.exports = ClickStep