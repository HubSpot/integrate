AnnouncementView = require "./announcement.coffee"
URLView = require "./url.coffee"
ProgressView = require "./progress.coffee"
RetriesView = require "./retries.coffee"
GradeView = require "./grade.coffee"
CursorView = require "./cursor.coffee"
ControlsView = require "./controls.coffee"

class MainView extends Backbone.View
    template: -> "<div>The template</div>"
    
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
