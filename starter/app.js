// BUDGET CONTROLLER
var budgetController = (function () {
    // 1. Create function constructors
    var Expense = function (id, description, value, percentage) {
        this.id = id;
        this.decription = description;
        this.value = value;
        this.percentage = -1;
    }

    Expense.prototype.calcPercentage = function () {
        if (data.totals.inc > 0) {
            this.percentage = Math.round((this.value / data.totals.inc) * 100);
        } else {
            this.percentage = -1;
        }
    }

    Expense.prototype.getPercentage = function () {
        return this.percentage;
    }

    var Income = function (id, description, value) {
        this.id = id;
        this.decription = description;
        this.value = value;
    }

    // 2. Create Data Structure (to save income/expense details)
    var data = {
        allTxn: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    var calcBudget = function (type) {
        var sum = 0;

        // 1. Calculate totals
        data.allTxn[type].forEach(function (curr) {
            sum += curr.value;
        });
        data.totals[type] = sum;

        // 2. Calculate budget
        data.budget = data.totals.inc - data.totals.exp

        // 3. Calculate the percentage
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);

        return data;
    }

    return {
        addItems: function (input) {
            var item, Id;

            if (data.allTxn[input.type].length === 0)
                Id = 1;
            else
                Id = data.allTxn[input.type][data.allTxn[input.type].length - 1].id + 1;


            if (input.type === 'inc') {
                item = new Income(Id, input.description, input.value);
            } else if (input.type === 'exp') {
                item = new Expense(Id, input.description, input.value);
            }

            data.allTxn[input.type].push(item);

            return Id;
        },

        deleteItem: function (type, id) {
            var pos;

            // 1. Delete the data with the type and the id
            data.allTxn[type].forEach(function (curr) {
                if (curr.id === id) {
                    pos = data.allTxn[type].indexOf(curr);
                }
            });
            data.allTxn[type].splice(pos, 1);
        },

        calculatePercentage: function () {
            data.allTxn.exp.forEach(function (el) {
                el.calcPercentage();
            });
        },

        getPercentages: function () {
            var allPerc;
            allPerc = data.allTxn.exp.map(function (curr) {
                return curr.getPercentage();
            });

            return allPerc;
        },

        getBudget: function (txn) {
            calcBudget(txn);
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        }
    };
})();



// UI CONTROLLER
var uiController = (function () {
    /* 
       Declare all html elements by their class names here. This is kind of a central 
       place for all our html elements. So that, in the future, if we change any element 
       name, we just have to change it here and not in the whole code. 
    */
    var DOMstring = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        btnAdd: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        percentLabel: '.item__percentage',
        monthLabel: '.budget__title--month'
    }

    var formatNumber = function (type, number) {
        var int, dec, splitNumber;

        // 1. Decimal to 2 places
        number = parseFloat(number).toFixed(2);


        // 2. Comma seperator
        splitNumber = number.split('.');
        int = splitNumber[0];
        dec = splitNumber[1];

        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
            number = int + '.' + dec;
        }


        // 3. '+' Income, '-' Expense
        return (type === 'inc' ? '+ ' : '- ') + number;
    }


    // Get '+/-', description and value from html elements
    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMstring.inputType).value,
                description: document.querySelector(DOMstring.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstring.inputValue).value)
            };
        },

        addItemsToHtml: function (obj, id) {
            var html, newHtml, element;
            // 1. Add html with placeholder
            if (obj.type === 'inc') {
                element = DOMstring.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (obj.type === 'exp') {
                element = DOMstring.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">%percent%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // 2. Replace html with data
            newHtml = html.replace('%id%', id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.type, obj.value));


            // 3. Put the html in the page (DOM)
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },

        displayPercentages: function (percentages) {
            var fields = document.querySelectorAll(DOMstring.percentLabel);

            /*
                1. fields is the nodeList (collection) of all fields with the class 'DOMstring.percentLabel'.
                2. Looping over fields, and for each field assigning the percentage to that field.
                3. The percentage is calculated in the Budget Controller for each addition/deletion of items.
            */
            fields.forEach(function (cur, index) {
                if (percentages[index] > 0) {
                    cur.textContent = percentages[index] + '%';
                } else {
                    cur.textContent = '---';
                }

            });

            // var fields2 = document.getElementsByClassName(DOMstring.percentLabel);
        },

        displayBudget: function (data) {
            document.querySelector(DOMstring.budgetLabel).textContent = formatNumber('inc', data.budget);
            document.querySelector(DOMstring.incomeLabel).textContent = formatNumber('inc', data.totalInc);
            document.querySelector(DOMstring.expenseLabel).textContent = formatNumber('exp', data.totalExp);

            if (data.percentage > 0) {
                document.querySelector(DOMstring.percentageLabel).textContent = data.percentage + '%';
            } else {
                document.querySelector(DOMstring.percentageLabel).textContent = '';
            }

        },

        clearFields: function () {
            var inputFields = [document.querySelector(DOMstring.inputDescription), document.querySelector(DOMstring.inputValue)];
            inputFields.forEach(function (current, index, array) {
                current.value = '';
            });

            inputFields[0].focus();
        },

        deleteItem: function (element) {
            element = element.parentNode.removeChild(element);
        },

        getMonthYear: function () {
            var months, month, year;

            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'Novermber', 'December'];
            month = new Date().getMonth();
            year = new Date().getFullYear();

            document.querySelector(DOMstring.monthLabel).textContent = months[month] + ', ' + year;
        },

        getDOMstrings: function () {
            return DOMstring;
        }
    };

})();



// GLOBAL APP CONTROLLER
var controller = (function (budgetCtrl, uiCtrl) {
    var DOM = uiCtrl.getDOMstrings();

    // Event Listeners
    var setupEventListeners = function () {
        document.querySelector(DOM.btnAdd).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', function () {
            var type, elements;

            type = document.querySelector(DOM.inputType).value;

            elements = document.querySelectorAll(
                DOM.inputType + ',' +
                DOM.inputDescription + ',' +
                DOM.inputValue
            );

            if (type === 'inc') {
                elements.forEach(function(current) {
                    current.classList.toggle('red-focus');
                    document.querySelector(DOM.btnAdd).classList.toggle('red');
                });

            } else if (type === 'exp') {
                elements.forEach(function(current) {
                    current.classList.toggle('red-focus');
                    document.querySelector(DOM.btnAdd).classList.toggle('red');
                });
            }
        });
    }

    var ctrlAddItem = function () {
        var input, id;

        // 1.  Get the field input data
        input = uiController.getInput();

        if (input.description !== '' && !isNaN(input.value) && input.value > 0) {

            // 2. Add the item to the budget controller
            id = budgetCtrl.addItems(input);

            // 3. Add the item to the UI
            uiCtrl.addItemsToHtml(input, id);

            // 4. Clear the fields
            uiCtrl.clearFields();

            // 5. Calculate the budget
            budgetData = budgetCtrl.getBudget(input.type);

            // 6. Display the budget on the UI
            uiCtrl.displayBudget(budgetData);

            // 7. Update expense percentage
            updatePercentage();
        }
    }

    var ctrlDeleteItem = function (event) {
        var element, elementId, id, type;

        element = event.target.parentNode.parentNode.parentNode.parentNode;
        elementId = element.id.split('-');
        type = elementId[0];
        id = parseInt(elementId[1]);

        // 1. Delete item from budget data.
        budgetCtrl.deleteItem(type, id);

        // 2. Delete item from UI.
        uiCtrl.deleteItem(element);

        // 3. Update expense percentage
        updatePercentage();
    }

    var updatePercentage = function () {
        var allPercentages;

        // 1. Calculate item percentage
        budgetCtrl.calculatePercentage();

        // 2. Get percentages
        allPercentages = budgetCtrl.getPercentages();

        // 3. Display percentages on the UI
        uiCtrl.displayPercentages(allPercentages);

    }

    return {
        init: function () {
            console.log('App started.');
            uiCtrl.getMonthYear();
            setupEventListeners();
        }
    }

})(budgetController, uiController);

controller.init();











