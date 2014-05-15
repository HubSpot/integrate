utils = require "../utils.coffee"
TargetedStep = require "../steps/targeted-step.coffee"

class PressEnterStep extends TargetedStep
    mood: "locate"

    announcement: "Pressing enter."

    perform: (workspace) ->
        @$target = utils.extractSelector(workspace, @sel)
        if @$target.length isnt 1
            return false

        opts = {which: 13}
        utils.eventFire(workspace, @$target, "keydown", opts)
        utils.eventFire(workspace, @$target, "keyup", opts)
        utils.eventFire(workspace, @$target, "keypress", opts)
        return @$target

module.exports = PressEnterStep