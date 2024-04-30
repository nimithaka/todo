export const customValidation = {
    rules: {
        required: {
            validate: function(input) {
                return input.value.trim() !== ''
            },
            message: function(fieldName) {
                return `${fieldName} is required`;
            }
        },
        email: {
            validate: function(input) {
                let emailParts = input.value.split('@')
                let emailRegrex =  /^[a-z0-9]+@[a-z]+\.[a-z]{2,3}$/; 
                return emailRegrex.test(input.value)
            },
            message: function(fieldName) {
                return "Invalid Email"
            }
        },
        password: {
            validate: function(input) {
                return input.value.length >= 8
            },
            message: function(fieldName) {
                return "Password should have atleast 8 characters"
            }
        },
    },
    validate: function(input, rules) {
        const isValid = rules.every(rule => {
        if(!this.rules[rule].validate(input)) {
            showError(input, this.rules[rule].message(input?.name))
                return false
            }
        return true
        })
        if(isValid) {
            clearError(input)
        }
        return isValid
    }
}

function showError(input, message) {
    const errorElementId = input.dataset.error
    const errorElement = document.getElementById(errorElementId)
    if(errorElement) {
        errorElement.textContent = message
        input.classList.add('error')
        }
}

function clearError(input) {
    const errorElementId = input.dataset.error
    const errorElement = document.getElementById(errorElementId)
    if(errorElement) {
        errorElement.textContent = ''
        input.classList.remove('error')
        }
}

export function validateInput(event) {
    const inputElement = event.target
    const rule = JSON.parse(inputElement.dataset.rule.replace(/'/g, '"'))
    customValidation.validate(inputElement, rule)
}



