
class AnnouncementView extends Backbone.View
    initialize: ->
        @render()
        @listenTo(@collection, "change:selected", =>
            @render()
        )
        @listenTo(@collection, "warning", (arg) =>
            @showWarning(arg)
        )

    template: (ctx) -> """
        <div class='current-announcement'>
            #{ctx.currentAnnouncement}
        </div>
        <div class='warning'></div>
        """

    render: ->
        if not @collection.selected?
            return this
        if not @collection.selected.announcement?
            @$el.empty()
            return this
        if _.isFunction(@collection.selected.announcement)
            currentAnnouncement = @collection.selected.announcement()
        else
            currentAnnouncement = @collection.selected.announcement
        @$el.html(@template(
            currentAnnouncement: currentAnnouncement
        ))
        return this

    showWarning: (arg) ->
        @$el.find(".warning").html(arg)

module.exports = AnnouncementView
