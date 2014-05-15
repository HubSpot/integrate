utils = require "../utils.coffee"
PauseStep = require "../steps/pause.coffee"
Steps = require "../collections/steps.coffee"

class Passer extends Backbone.Model
    defaults:
        retriesRemaining: 40
        status: undefined
        mode: "fast"

    STATUSES:
        FAIL: "FAIL_STATUS"
        WARN: "WARN_STATUS"
        PASS: "PASS_STATUS"
        RUNNING: "RUNNING_STATUS"
        PAUSED: "PAUSED_STATUS"

    initialize: (options) ->
        @collection = options.collection
        if sessionStorage?.integrateSpeed?
            @set("mode", sessionStorage.integrateSpeed)
            @_updateIntervalSpeed()
            
        @collection.on("change:selected", =>
            @selected = @collection.selected
            if @selected.on?
                @listenTo(@selected, "change:numFailures", @grade, @)
            @grade(@selected)
        )
        @listenTo(@, "change:mode", =>
            mode = @get("mode")
            sessionStorage.integrateSpeed = mode
            @_updateIntervalSpeed()
        )

    _updateIntervalSpeed: ->
        mode = @get("mode")
        speed = Steps::INTERVAL_SPEEDS[mode.toUpperCase()]
        @collection.changeIntervalSpeed(speed)

    grade: ->
        if @selected == Steps::END
            @set("status", @STATUSES.PASS)
            @collection.stop()
            return
        if @selected == Steps::ERROR
            @set("status", @STATUSES.FAIL)
            return
        maxRetries = @selected.maxRetries or 100
        remaining = maxRetries - (@selected.get("numFailures") or 0)

        @set("retriesRemaining", remaining)
        if remaining <= 0
            @set("status", @STATUSES.FAIL)
            @collection.stop()
        else if remaining <= (maxRetries / 2)
            @set("status", @STATUSES.WARN)
        else if @collection.selected instanceof PauseStep
            @set("status", @STATUSES.PAUSED)
        else
            @set("status", @STATUSES.RUNNING)

module.exports = Passer
