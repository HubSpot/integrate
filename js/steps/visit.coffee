utils = require "../utils.coffee"

class VisitStep extends Backbone.Model
    constructor: (@url) ->
        @started = false
        @loaded = false
        super

    mood: "visit"

    maxRetries: 250

    announcement: -> "Loading url <pre>#{@url}</pre>"

    perform: (workspace) ->
        if not @started
            return @openUrl(workspace)
        return @checkLoaded(workspace)

    checkLoaded: (workspace) ->
        if not @loaded
            return false
        workspace.set("url", @url)
        return true

    openUrl: (workspace) ->
        $iframe = workspace.getIframe()
        $iframe.attr("src", @url)
        @started = true
        $iframe.load =>
            @loaded = true
        return false

module.exports = VisitStep