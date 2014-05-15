Steps = require("../collections/steps.coffee")

class ProgressView extends Backbone.View
    initialize: ->
        @render()
        @listenTo(@collection, "change:selected", =>
            @render()
        )

    render: ->
        if not @collection.selected?
            @$el.css('width', '0%')
            return this

        if @collection.selected is Steps::END
            width = 100
        else
            index = @collection.indexOf(@collection.selected)
            width = (index / @collection.size()) * 100

        @$el.css('width', "#{width}%")
        @$el.data('percent_done', width)
        return this

module.exports = ProgressView