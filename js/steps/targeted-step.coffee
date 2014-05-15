utils = require "../utils.coffee"

class TargetedStep extends Backbone.Model
    constructor: (@sel) ->
        super()

    getTarget: (workspace) ->
        @$target = utils.extractSelector(workspace, @sel)
        @set 'targetElement', @$target
        return @$target


module.exports = TargetedStep