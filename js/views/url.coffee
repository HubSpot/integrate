
class URLView extends Backbone.View
    initialize: ->
        @render()
        @listenTo(@model, "change:url", =>
            @render()
        )
        

    render: ->
        @$el.html("""
            <a href="#{@model.get("url")}" target="_blank">#{@model.get("url")}</a>
        """)
        return this

module.exports = URLView