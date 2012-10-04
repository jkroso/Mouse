require.config({
    baseUrl: '../src',
    shim : {
        mocha : {
            exports : 'mocha'
        },
        chai : {
            exports : 'chai'
        }
    },
    paths : {
        mocha : '../tests/mocha',
        chai : '../tests/chai',
        Observer: '../../Observer/dist/Observer',
        Adept: '../../adept.js/adept',
        Dom411: '../../Dom411/src/Dom411' 
    }
})

require(['require', 'mocha', 'chai'], function (require, mocha, chai) {
    window.should = chai.Should()
    window.expect = chai.expect

    mocha.setup('bdd')
    
    require(['../tests/Mouse_test'], function () {
        mocha.run()
    })
})
