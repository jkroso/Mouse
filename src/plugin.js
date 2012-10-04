define(['Adept', 'Observer'], function ($, observer) {
    
    // All of the mouse events which get exposed in the API require a certain DOM event in order to work properly. This table provides the conversion
    var translate = {
        down  : 'mousedown',
        up    : 'mouseup',
        move  : 'mousemove',
        over  : 'mouseover',
        out   : 'mouseout',
        click : 'mouseup',
        wheel : 'mousewheel',
        double: 'mouseup'
    }
    var Observer = observer.constructor,
        subscribe = Observer.prototype.on,
        unsubscribe = Observer.prototype.off,
        subjects = new WeakMap
    var dispatch = (function (invokeList, branchingCollect, subjects) {
        return function (e) {
            invokeList(branchingCollect(subjects.get(this), e.types), e)
        }
    }(Observer.invokeList, Observer.branchingCollect, subjects))

    // Keeps track of the number of events depending on DOM liseners and adds any that are not already bound
    function addDomListeners (topics, subject, node) {
        if ( typeof topics !== 'string' )
            return
        topics.split(' ').forEach(function (topic) {
            var firstDot = topic.indexOf('.'),
                eventType = firstDot >= 0 ? topic.slice(0, firstDot) : topic
            
            if ( eventType in translate )
                eventType = translate[eventType]
            
            if ( ! (eventType in subject._DOMListeners) ) {
                node.addEventListener(eventType, dispatch, true)
                subject._DOMListeners[eventType] = 0
            }
            subject._DOMListeners[eventType]++
        })
    }
    function removeDomListeners (topics, subject, node) {
        topics.split(' ').forEach(function (topic) {
            var firstDot = topic.indexOf('.'),
                eventType = firstDot >= 0 ? topic.slice(0, firstDot) : topic
            
            if ( eventType in translate )
                eventType = translate[eventType]

            if ( --subject._DOMListeners[eventType] <= 0 ) {
                delete subject._DOMListeners[eventType]
                node.removeEventListener(eventType, dispatch, true)
            }
        })
    }

    $.fn.on = function (topics, context, callback, priority) {
        var args = arguments
        this.each(function (node) {
            var subject = subjects.get(node)                    
            
            if ( ! subject ) {
                subject = new Observer
                Object.defineProperty(subject, '_DOMListeners', {
                    value : Object.create(null),
                    writable : true
                })
                subjects.set(node, subject)
            }

            addDomListeners(topics, subject, node)
            subscribe.apply(subject, args)
        })
        return this
    }
    
    $.fn.off = function (topics, callback) {
        var args = arguments
        this.each(function (node) {
            var subject = subjects.get(node)
            if ( ! subject ) {
                console.warn('Unable to find event tree for: ', node)
                return
            }
            removeDomListeners(topics, subject, node)
            unsubscribe.apply(subject, args)
        })
        return this
    }

    $.fn.transferListeners = function (target) {
        this.each(function (node) {
            if ( subjects.has(node) ) {
                var subject = subjects.get(node)
                subjects.delete(node)
            }

            if ( subjects.has(target) )
                throw 'the target already has it own listeners, overriding or merging these might be a bad idea'

            Object.keys(subject._DOMListeners).forEach(
                function (key) {
                    node.removeEventListener(key, dispatch, true)
                    target.addEventListener(key, dispatch, true)
                }
            )
            subjects.set(target, subject)
        })
    }

    return $
})