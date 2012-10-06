require.config({
    baseUrl: '../src',
    shim : {
        Adept: {
            exports: '$'
        }
    },
    paths : {
        Observer: '../../Observer/dist/Observer',
        Adept: '../vendor/jquery-1.8.2',
        Dom411: '../../Dom411/src/Dom411'
    }
})
// This example is working with jquery. Though the library was originally designed to work with adept.js. It would also work with Ender.js, Zepto and others
require(['Dom411', 'Mouse'], function ($) {
    var total, timer, top, left

    // This causes just a single dom event listener
    $('#list1')
        .forward('.item', 'grab.left', start)
        .forward('.item', 'drag.left', move)
        .forward('.item', 'drop.left', stop)
    
    // This causes one listener to be bound to each list item
    $('#list2 > .item')
        .subscribe('grab.left', start)
        .subscribe('drag.left', move)
        .subscribe('drop.left', stop)

    function start (e) {
        timer = e.timeStamp
        total = 0
        top = parseInt(this.style.top, 10) || 0
        left = parseInt(this.style.left, 10) || 0
    }
    function stop (e) {
        var duration = e.timeStamp - timer
        $('#count').html(Math.round(total / (duration / 1000)))
    }
    function move (e) {
        total++
        $(this).css({
            top: (top += e.movementY) + 'px',
            left: (left += e.movementX) + 'px'
        })
    }
})