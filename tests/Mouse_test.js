define(['Mouse', 'chai'], function ($, chai) {
    describe('Mouse', function () {
        it('Should augment all built in mouse events at the earliest possible stage', function () {
            document.body.addEventListener('mousedown', function (e) {
                e.types.should.be.an('Array')
            }, false)
            var event = new Event('mousedown', {
                bubbles:true, 
                cancelable:true
            })
            event.which = 0
            event.button = 0
            document.body.dispatchEvent(event)
        })
    })
})