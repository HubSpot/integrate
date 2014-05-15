Passer = require "../models/passer.coffee"

class ControlsView extends Backbone.View
    initialize: ->
        @render()
        @listenTo @model, "change:mode", @render
        @listenTo @model, "change:status", @render

    events:
        "click .mode a": "_handleModeChange"
        "click .playback a": "_handlePlaybackChange"

    template: -> """
        <ul>
            <li class="mode integrate-control">
                <a href="#slow" class="slow" title="Switch to slow mode" data-mode="slow">Slow</a>
                <a href="#fast" class="fast" title="Switch to fast mode" data-mode="fast">Fast</a>
            </li>
            <li class="playback integrate-control">
                <a href="#pause" class="pause" title="Pause test" data-playback="pause">
                    <span>Pause</span>
                </a>
                <a href="#play" class="play" title="Resume test" data-playback="play">
                    <span>Play</span>
                </a>
            </li>
        </ul>
    """

    render: ->
        @$el.html @template

        mode = @model.get("mode")
        status = @model.get("status")

        @$(".#{ mode }").addClass "active"

        if status is Passer::STATUSES.RUNNING
            @$(".pause").addClass "active"
        else
            @$(".play").addClass "active"

        if status is Passer::STATUSES.FAIL or status is Passer::STATUSES.PASS
            @$(".play")
                .removeClass("play")
                .addClass("restart")
                .attr("title", "Restart test")
                .data("playback", "restart")
                .find("span")
                    .text("Restart")
                    .end()

        @

    _handleModeChange: (e) ->
        e.preventDefault()
        e.stopPropagation()

        $control = $ e.target
        mode = $control.data("mode")
        @model.set "mode", mode

    _handlePlaybackChange: (e) ->
        e.preventDefault()
        e.stopPropagation()

        $control = $ e.target
        playback = $control.data("playback")

        if playback is "pause"
            @model.collection.pause()
        else if playback is "play"
            window.resume()
        else if playback is "restart"
            window.location.reload()

module.exports = ControlsView