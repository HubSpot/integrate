extractSelector = (workspace, sel) ->
    $page = workspace.getPage()
    if _(sel).isFunction()
        result = sel($page)
        if result instanceof jQuery
            return result
        else
            throw new Error('Expected function to return jQuery object:', sel)
    else
        return $page.find(sel).filter(":visible")

eventFire = (workspace, $el, eventName, opts={}) ->
    eventType = translateEventNameToType eventName
    el = $el.get(0)
    $page = workspace.getPage()

    if el.dispatchEvent?
        evObj = $page.get(0).createEvent(eventType)
        evObj.initEvent eventName, true, true
        for key, val of opts
            evObj[key] = val
        el.dispatchEvent evObj
    else
        el.fireEvent "on" + eventName

translateEventNameToType = (eventName) ->
    if _(["mouseenter", "mouseover", "mousedown", "mouseup", "click"]).contains(eventName)
        return "MouseEvents"
    return "Events"

simulateClickOn = (workspace, $target) ->

    @eventFire(workspace, $target, "mouseenter")
    @eventFire(workspace, $target, "mouseover")
    @eventFire(workspace, $target, "click")
    @eventFire(workspace, $target, "mousedown")
    @eventFire(workspace, $target, "mouseup")

module.exports = {
    extractSelector: extractSelector
    eventFire: eventFire
    simulateClickOn: simulateClickOn
}
