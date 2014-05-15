
class Workspace extends Backbone.Model
    initialize: ->
        @on("change:url", @updateFrame, @)

    defaults:
        $iframe: undefined
        $page: undefined
        url: ""

    updateFrame: ->
        window.$page = @getPage()
        window.$p = (args...) ->
            window.$page.find(args...)

    getPage: ->
        @getIframe().contents()

    getIframe: ->
        if not @get("$iframe")?
            @set("$iframe", @_createIframe())

        @get("$iframe")

    getIframeURL: ->
        @get('url')

    _createIframe: ->
        $iframe = @_getRootIframe()

        that = this
        $iframe.load ->
            # Looking at the iframe src property doesn't necessarily work,
            # so getting the URL from contentWindow
            iframeURL = this.contentWindow.location.pathname

            that.set 'url', iframeURL, { silent: true }
            that.updateFrame()

    _getRootIframe: ->
        $("iframe#integrate-workspace")

    focusIframe: ($iframe) ->
        if not $iframe?
            @set("$iframe", @_getRootIframe())
        else 
            @set("$iframe", $iframe)
        @updateFrame()
        console.log("Set the iframe")

module.exports = Workspace
