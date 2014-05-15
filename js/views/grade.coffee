Passer = require "../models/passer.coffee"

class GradeView extends Backbone.View
    initialize: ->
        @render()
        @listenTo(@model, "change", =>
            @render()
        )

    render: ->
        if @model.get("status") is Passer::STATUSES.PASS
            @revealStatus("Test Passed.")
            @reportStatus("integrate-test-passed")
            @setColor("#00B968")

        if @model.get("status") is Passer::STATUSES.FAIL
            errorMessage = @model.collection?.errorMessage
            status = "Test Failed."
            if errorMessage?
                status = "Uncaught exception: #{errorMessage}"
            @revealStatus(status)
            @reportStatus("integrate-test-failed")
            @setColor("rgb(248, 22, 58)")

        if @model.get("status") is Passer::STATUSES.WARN
            @revealStatus("This step is taking a long time.")
            @setColor("rgb(204, 204, 0)")

        if @model.get("status") is Passer::STATUSES.RUNNING
            @$el.slideUp()
        return this

    reportStatus: (className) ->
        $("body").append(
            "<div id='integrate-test-result' class='#{className}' style='display: none'></div>"
        )

    revealStatus: (status) ->
        @$el.text(status).slideDown()

    clearStatus: (status) ->
        @$el.slideUp()

    setColor: (colorStr) ->
        $("body").css("background-color", colorStr)

module.exports = GradeView