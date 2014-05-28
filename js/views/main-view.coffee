AnnouncementView = require "./announcement.coffee"
URLView = require "./url.coffee"
ProgressView = require "./progress.coffee"
RetriesView = require "./retries.coffee"
GradeView = require "./grade.coffee"
CursorView = require "./cursor.coffee"
ControlsView = require "./controls.coffee"

class MainView extends Backbone.View
    template: -> """
    <iframe id="integrate-workspace"></iframe>
    <div id="integrate-announce">
        <div id="integrate-status" style=""></div>
        <div id="integrate-current-step">
            <div class="current-announcement">
            </div>
            <div class="warning"></div>
        </div>
        <div id="integrate-countdown">
            <span class="num"></span><span> retries until failure</span>
        </div>
        <div id="integrate-progress-outer">
            <div id="integrate-progress-inner"></div>
        </div>
        <div id="integrate-url"></div>
        <div id="integrate-controls"><ul>
            <li class="mode integrate-control">
                <a href="#slow" class="slow" title="Switch to slow mode" data-mode="slow">Slow</a>
                <a href="#fast" class="fast active" title="Switch to fast mode" data-mode="fast">Fast</a>
            </li>
            <li class="playback integrate-control">
                <a href="#pause" class="pause active" title="Pause test" data-playback="pause">
                    <span>Pause</span>
                </a>
                <a href="#play" class="play" title="Resume test" data-playback="play">
                    <span>Play</span>
                </a>
            </li>
        </ul></div>
    </div>
    <div id="integrate-click-viz" class="confused" style="display: block; top: 20%; left: 80%;">?</div>
    """
    
    render: ->
        @$el.prepend(@template())

        passer = @model
        steps = passer.collection
        new AnnouncementView(
            collection: steps
            el: @$("#integrate-current-step")
        )
        new URLView(
            model: steps.workspace
            el: @$("#integrate-url")
        )
        new ProgressView(
            collection: steps
            el: @$("#integrate-progress-inner")
        )
        new RetriesView(
            model: passer
            el: @$("#integrate-countdown")
        )
        new GradeView(
            model: passer
            el: @$("#integrate-status")
        )
        new CursorView(
            collection: steps
            el: @$("#integrate-click-viz")
        )
        new ControlsView(
            model: passer
            el: @$("#integrate-controls")
        )
        this

    startCleanup: (cleanupSteps) ->
        new CursorView(
            collection: cleanupSteps
            el: @$("#integrate-click-viz")
        )
        @$('#integrate-announce').append(
            "<div id='integrate-test-cleanup'>Performing cleanup&hellip;</div>"
        )
        cleanupSteps.once 'success failure', =>
            $('#integrate-test-cleanup').remove()

module.exports = MainView
