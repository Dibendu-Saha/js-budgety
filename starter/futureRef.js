var budgetController = (function () {
    var x = 10;
    function add(a) {
        return a + x;
    }

    return {
        globalAdd: function (n) {
            return add(n);
        }
    }
})();

var uiController = (function () {

    // Do something here

})();

var controller = (function (budgetCtrl, uiCtrl) {

    var sum = budgetCtrl.globalAdd(7)
    
    return {
        displayResult: function () {
            console.log(sum);
        }
    }

})(budgetController, uiController);













