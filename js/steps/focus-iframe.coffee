utils = require "../utils.coffee"
TargetedStep = require "../steps/targeted-step.coffee"

class FocusIframeStep extends TargetedStep
    mood: "locate"

    announcement: ->
        if _(@sel).isFunction()
            return "Looking for iframe: <pre class='function'>#{@sel}</pre>"
        else
            return "Looking for iframe: <pre>$page.find(\"#{@sel}\")</pre>"

    perform: (workspace) ->
        if not @sel?
            workspace.focusIframe()
            return true

        if @$target.length == 0
            return false

        if @$target.length > 1
            @trigger("warning", "Warning: Can't focus iframe, multiple matches found for this selector.")
            return false

        workspace.focusIframe(@$target)

        if @$target.contents().find('body')
            return @$target
        else
            return false

module.exports = FocusIframeStep