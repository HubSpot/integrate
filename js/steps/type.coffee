utils = require "../utils.coffee"
TargetedStep = require "../steps/targeted-step.coffee"

class TypeStep extends TargetedStep
    constructor: (@sel, @text) ->
        super

    mood: "locate"

    announcement: -> "Typing: <pre>#{@text}</pre>"

    perform: (workspace) ->
        if @$target.length isnt 1
            return false

        @$target.focus()
        if @$target.val().length > 0
            @$target.select()
            @$target.val("")
        for char in @text
            opts = {which: char.charCodeAt(0)}
            utils.eventFire(workspace, @$target, "keydown", opts)
            @$target.val("#{@$target.val()}#{char}")
            utils.eventFire(workspace, @$target, "keyup", opts)
            utils.eventFire(workspace, @$target, "keypress", opts)
        utils.eventFire(workspace, @$target, "change", opts)
        return @$target

module.exports = TypeStep