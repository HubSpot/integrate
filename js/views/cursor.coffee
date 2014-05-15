
class CursorView extends Backbone.View
    initialize: ->
        @listenTo(@collection, "change:selected", @resetMood)
        @listenTo(@collection, "change:targetElement", @render)
        @listenTo(@collection, "change:numFailures", @render)
        @listenTo(@collection, "change:speed", @updateTransitionSpeed)

    render: ->
        @updateTransitionSpeed()
        @resetMood()
        unless @collection.selected instanceof Backbone.Model
            return this

        mood = @collection.selected.mood

        # Show a special cursor while loading a new page
        if mood is "visit"
            @showVisit()
            return this

        # If this step is not targeted, do nothing with the cursor
        unless @collection.selected.getTarget?
            return this

        # For cursoring purposes, only visible elements are relevant
        $target = @collection.selected.get('targetElement')?.filter(':visible') ? $()

        # If a step is failing to find its target, show confusion
        if $target.length is 0
            if @collection.selected.get("numFailures") >= 5
                @showConfused()

            return this

        # Apply the best type of cursor animation for this step
        switch mood
            when "locate"
                @showLocate($target)
            when "click"
                @showClick($target)
            when "look"
                @showAssert($target)
        this

    updateTransitionSpeed: ->
        isSlow = @collection.speed is @collection.INTERVAL_SPEEDS.SLOW
        @$el.toggleClass 'slow', isSlow

    showConfused: ->
        fails = @collection.selected.get("numFailures")
        top = ["20%", "80%"][Math.floor(fails / 40) % 2]
        left = ["20%", "80%"][Math.floor((fails + 20) / 40) % 2]
        @$el.addClass("confused")
        @$el.css(
            "top": top
            "left": left
        )

    showVisit: ->
        @$el.show()
        @$el.css(
            top: "49%"
            left: "49%"
        )
        @$el.addClass("visiting")
        if (Math.floor(@collection.selected?.get("numFailures")) % 2) is 0
            @$el.addClass("flip")
        else
            @$el.removeClass("flip")

    showLocate: ($item) ->
        unless $item.length is 1
            return  # it would be misleading to cursor to one of multiple targets

        currentIframe = @collection.workspace.get("$iframe")
        verticalAdjust = 115
        horizontalAdjust = 5

        if currentIframe.get(0) isnt $("iframe").get(0)
            nestedOffset = currentIframe.offset()
            verticalAdjust += nestedOffset.top
            horizontalAdjust += nestedOffset.left

        offset = $item.offset()
        @$el.show().css(
            top: offset.top + verticalAdjust + ($item.outerHeight() / 2)
            left: offset.left + horizontalAdjust + ($item.outerWidth() / 2)
        )

    showClick: ($item) ->
        @showLocate($item)
        @$el.addClass("click-viz-before-mouse-down")
        setTimeout( =>
            @$el.removeClass("click-viz-before-mouse-down").addClass("click-viz-mouse-down")
        , @collection.speed - 150)

    showAssert: ($item) ->
        @$el.addClass("looking")
        @showLocate($item)

    resetMood: ->
        @$el.removeClass("click-viz-mouse-down")
            .removeClass("looking")
            .removeClass("confused")
            .removeClass("visiting")

module.exports = CursorView