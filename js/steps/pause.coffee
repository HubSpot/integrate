
class PauseStep extends Backbone.Model
    @isPause: true

    constructor: (@delay) ->
        super()

    initialized: ->
        @resumed = false
        @bound = false

    announcement: ->
        if @delay
            announcement = "Test Paused for #{ @delay }ms."
        else
            announcement = "Test Paused."

        announcement += " Run window.resume() to continue."
        announcement

    perform: ->
        if not @bound
            window.resume = =>
                @resumed = true

            if @delay
                setTimeout(window.resume, @delay)

            @bound = true

        return @resumed

module.exports = PauseStep