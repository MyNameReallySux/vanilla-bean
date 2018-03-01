import { isArray, isObject, isFunction } from '@beautiful-code/type-utils'
import { clean, exclude, extend } from '@beautiful-code/object-utils'

export class Test {
    static setMochaFunctions = (it, expect) => {
        Test.it = it
        Test.expect = expect
    }

    static defaultOptions = {
        description: '',
        noLogging: false
    }

    constructor(options = {}){
        let description, initial, expected, runner, validator
        ({ description, initial, expected, runner, validator, ...options } = this._handleOptions(options))
        this.description = description
        this.initial = initial
        this.expected = expected
        this.runner = runner
        this.validator = validator
        this.options = options
    }

    _handleOptions = (options) => {
        options = clean(options)
        let { runner, validator } = options

        let computedOptions = {
            usingCustomRunner: isFunction(runner),
            usingCustomValidator: isFunction(validator),
        }

        return Object.assign({}, Test.defaultOptions, computedOptions, options)
    }

    runTest = () => {
        let { initial, expected, runner, options } = this
        let { noLogging } = options

        let hideConsole = noLogging ? suppressConsole() : () => {}
        let showConsole = noLogging ? restoreConsole() : () => {}

        if(isFunction(runner)){
            let expectedParameters = runner.length
            if(expectedParameters == 1){
                // Handle Synchronous Test
                let result
                try {
                    result = isArray(initial) && isArray(expected)
                        ? initial.map((value) => runner(value))
                        : runner(initial)
                    this.validateTest(result, expected)
                } catch(err){
                    error(err)
                    this.validateTest(err, expected)
                }
            } else if(expectedParameters == 2){
                // Handle Callback Based Test
                runner(initial, (result) => {
                    this.validateTest(result, expected)
                }, (err) => {
                    error(err)
                    this.validateTest(err, expected)
                })
            }
        }
    }

    validateTest = (result, expected) => {
        let { description, validator } = this
        Test.it(description, () => {
            validator(result, expected)
        })
        
    }
}