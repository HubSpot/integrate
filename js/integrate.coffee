$( ->
    obliterateDOM()

    script = document.createElement('script')
    script.type = 'text/javascript'
    script.async = true
    script.src = getParameterByName("runIntegrateTestUrl")
    document.getElementsByTagName('head')[0].appendChild(script)
)

obliterateDOM = ->
    while document.firstChild
        document.removeChild document.firstChild

getParameterByName = (name) ->
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]")
    regex = new RegExp("[\\?&]" + name + "=([^&#]*)")
    results = regex.exec(location.search)
    (if not results? then "" else decodeURIComponent(results[1].replace(/\+/g, " ")))
