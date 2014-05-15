Workspace = require "../models/workspace.coffee"
PauseStep = require "../steps/pause.coffee"

class Steps extends Backbone.Collection
    initialize: (models, options = {}) ->
        super
        _.defaults @, options,
            stepInsertionIndex: 0
            pendingSteps: []
            selected: null
            workspace: new Workspace()
            errorMessage: undefined
            speed: @INTERVAL_SPEEDS.FAST

    END: "STEPS_END"
    ERROR: "STEPS_ERROR"

    INTERVAL_SPEEDS:
        FAST: 400
        SLOW: 1000

    run: ->
        @select(@first()) unless @selected

        @stop()  # prevent multiple run() calls from causing parallel runs
        @interval = setInterval( =>
            try
                allDone = @performCurrentStep()
                if allDone
                    @select(@END)
                    @stop()
                    @trigger 'success'
                else
                    @selected.getTarget?(@workspace)
            catch error
                @errorMessage = error.message
                @select(@ERROR)
                @stop()
                @trigger 'failure'
                throw error
        , @speed)

    stop: ->
        clearInterval(@interval)

    pause: ->
        @stop()
        currentIndex = @indexOf(@selected)
        pause = new PauseStep()
        pause.manual = true
        @add(pause, {at: currentIndex})
        @select(pause)
        @run()

    add: (steps) ->
        if @performing  # insert after the selected step passes
            @pendingSteps = @pendingSteps.concat(steps)
            return
        else
            result = super steps, {at: @stepInsertionIndex}
            @stepInsertionIndex += 1
            return result

    changeIntervalSpeed: (speed) ->
        @stop()
        @speed = speed
        @trigger("change:speed")

        unless @selected is @END or @selected is @ERROR
            @run()

    performCurrentStep: ->
        allDone = true
        unless @selected
            return allDone

        @performing = true
        outcome = @selected.perform(@workspace)
        @performing = false

        if outcome  # the step passed
            @add(@pendingSteps)
            @pendingSteps = []
        else
            @incrementFailures()
            @pendingSteps = []
            return (not allDone)

        next = @at(@indexOf(@selected) + 1)

        if next?
            @select(next)
            return (not allDone)
        else
            return allDone

    incrementFailures: ->
        if @selected.constructor.isPause
            return
        currentNumFailures = @selected.get("numFailures") or 0
        @selected.set("numFailures", currentNumFailures + 1)

    select: (@selected) ->
        @stepInsertionIndex = @indexOf(@selected) + 1
        @trigger("change:selected", @selected)
        if @selected?.on?
            @listenTo(@selected, "warning", (args) ->
                @trigger("warning", args)
            , this)

module.exports = Steps
