utils = require "../utils.coffee"

class AssertURLStep extends Backbone.Model
    constructor: (@stringOrRegex) ->
        super()

    announcement: ->
        return "Expecting the iframe URL to match: <pre>#{@stringOrRegex}</pre>"

    perform: (workspace) ->
        currentIframeURL = workspace.getIframeURL()

        if typeof @stringOrRegex is 'string'
            return @stringOrRegex is currentIframeURL
        else if typeof @stringOrRegex is 'object' and @stringOrRegex.test?
            return @stringOrRegex.test currentIframeURL
        else
            throw new Error "Invalid argument #{@stringOrRegex} passed to assertURL. A string or regular expression is required."

module.exports = AssertURLStep