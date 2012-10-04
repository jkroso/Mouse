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
    // This causes just a single dom event listener
    $('#list1').delegate('.item', 'drag.left', move)
    
    // This causes one listener to be bound to each list item
    $('#list2 > .item').on('drag.left', move)

    function move (e) {
        $(this).css({
            top: (parseInt(this.style.top, 10) || 0) + e.movementY + 'px',
            left: (parseInt(this.style.left, 10) || 0) + e.movementX + 'px'
        })
    }
})