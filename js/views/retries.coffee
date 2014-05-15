Passer = require "../models/passer.coffee"

class RetriesView extends Backbone.View
    initialize: ->
        @render()
        @listenTo(@model, "change", =>
            @render()
        )

    render: ->
        status = Passer::STATUSES
        if _([status.FAIL, status.PASS]).contains(@model.get('status'))
            @$el.slideUp()
            return
        @$(".num").text(@model.get("retriesRemaining"))
        return this

module.exports = RetriesView