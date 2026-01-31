let currentValue = '0';
let previousValue = null;
let operation = null;
let shouldResetDisplay = false;

const display = document.getElementById('display');

function updateDisplay(value) {
    display.value = value;
}

function handleNumberClick(number) {
    if (shouldResetDisplay) {
        currentValue = '';
        shouldResetDisplay = false;
    }
    
    if (number === '.' && currentValue.includes('.')) {
        return;
    }
    
    if (currentValue === '0' && number !== '.') {
        currentValue = number;
    } else {
        currentValue += number;
    }
    
    updateDisplay(currentValue);
}

function handleOperatorClick(op) {
    if (operation !== null && !shouldResetDisplay) {
        calculate();
    }
    
    previousValue = parseFloat(currentValue);
    operation = op;
    shouldResetDisplay = true;
}

function calculate() {
    if (operation === null || previousValue === null) {
        return;
    }
    
    const current = parseFloat(currentValue);
    let result;
    
    switch (operation) {
        case '+':
            result = previousValue + current;
            break;
        case '−':
            result = previousValue - current;
            break;
        case '×':
            result = previousValue * current;
            break;
        case '÷':
            if (current === 0) {
                result = 'Error';
            } else {
                result = previousValue / current;
            }
            break;
        default:
            return;
    }
    
    if (result === 'Error') {
        currentValue = '0';
        previousValue = null;
        operation = null;
        updateDisplay('Error');
        shouldResetDisplay = true;
    } else {
        currentValue = result.toString();
        previousValue = null;
        operation = null;
        updateDisplay(currentValue);
        shouldResetDisplay = true;
    }
}

function clear() {
    currentValue = '0';
    previousValue = null;
    operation = null;
    shouldResetDisplay = false;
    updateDisplay(currentValue);
}

document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('button');
    
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            const action = this.getAttribute('data-action');
            const buttonText = this.textContent;
            
            switch (action) {
                case 'number':
                    handleNumberClick(buttonText);
                    break;
                case 'operator':
                    handleOperatorClick(buttonText);
                    break;
                case 'equals':
                    calculate();
                    break;
                case 'clear':
                    clear();
                    break;
            }
        });
    });
    
    updateDisplay(currentValue);
});

window.updateDisplay = updateDisplay;