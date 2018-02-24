import colors from 'colors/safe'
import { isArray, isObject, isFunction } from '@beautiful-code/type-utils'

import { print, debug, error, supressConsole, restoreConsole } from './lib/ConsoleUtils'

colors.setTheme({
    namespace: 'violet',
    className: 'green',
    functionName: 'cyan',
    description: 'white'
})

const Externals = {
    filterObject: (object) => {
        const result = {}
        Object.keys(object)
            .filter((key) => object[key] !== undefined)
            .forEach((key) => result[key] = object[key])
        return result
    }
}

let { filterObject } = Externals

export class TestSet {
    static describe = () => { throw new Error(`Mocha's 'describe' function must be statically set to 'TestSet'. Try 'TestSet.describe = describe'.`) }
    static it = () => { throw new Error(`Mocha's 'it' function must be statically set to 'TestSet'. Try 'TestSet.it = it'.`) }

    static setMochaFunctions = (describe, it, expect) => {
        TestSet.describe = describe
        TestSet.it = it
        TestSet.expect = expect
    }

    static defaultOptions = {

    }

    constructor(description, tests = [], options = {}){
        this.description = description
        this.options = options
        this.tests = this._validateTests(tests)
    }

    runTests = () => {
        let { description, tests, options } = this
        TestSet.describe(description, () => {
            tests.forEach((test) => {
                test.runTest()
            })
        })
    }

    _validateTests = (tests) => {
        let { runner, validator } = this.options
        if(!isArray(tests)) throw new TypeError(`'TestSet' expects second argument to be an array.`)
        return tests.reduce((collection, definition) => {
            if(!isArray(definition)) throw new TypeError(`'TestSet' expects all test elements to be arrays.`)
            let [
                description, initial, expected,
                localRunner, localValidator
            ] = definition

            localRunner = localRunner || runner
            localValidator = validator || validator

            let test = new Test(description, initial, expected, localRunner, localValidator)
            collection.push(test)
            return collection
        }, [])
    }
}

export class Test {
    static it = () => { throw new Error(`Mocha's 'it' function must be statically set to 'TestSet'. Try 'TestSet.it = it'.`) }
    static expect = () => { throw new Error(`Mocha's 'expect' function must be statically set to 'Test'. Try 'TestSet.expect = expect'.`) }

    static setMochaFunctions = (it, expect) => {
        Test.it = it
        Test.expect = expect
    }

    static defaultArgs = {
        description: '',
        runner: (test) => test,
        validator: (result, expected) => Test.expect(result).equals(expected)
    }

    static defaultOptions = {
        noLogging: true
    }

    constructor(...args){
        let { description, initial, expected, runner, validator, ...options } = this._handleOptions(...args)
        this.description = description
        this.initial = initial
        this.expected = expected
        this.runner = runner
        this.validator = validator
        this.options = options
    }

    _handleOptions = (...args) => {
        let description, initial, expected, runner, validator
        let options = {}

        let size = args.length,
            isSingle = size == 1,
            isMultiple = size > 1

        if(size == 0) return { options }

        let lastItemIsObject = isObject(args[args.length - 1])

        if(lastItemIsObject){
            options = args.pop()
        }

        switch(args.length){
            case 1:  { ([description] = args) } break
            case 2:  { ([description, initial] = args) } break
            case 3:  { ([description, initial, expected] = args) } break
            case 4:  { ([description, initial, expected, runner] = args) } break
            case 5:  { ([description, initial, expected, runner, validator] = args) } break
        }

        description = description || Test.defaultArgs.description
        runner = runner           || Test.defaultArgs.runner
        validator = validator     || Test.defaultArgs.validator

        options = {
            usingCustomRunner: isFunction(runner),
            usingCustomValidator: isFunction(validator),
            ...options
        }

        options = Object.assign({}, Test.defaultOptions, filterObject(options))

        return { description, initial, expected, runner, validator, options }
    }

    runTest = () => {
        let { initial, expected, runner, options } = this
        let { noLogging } = options

        let hideConsole = noLogging ? suppressConsole() : () => {}
        let showConsole = noLogging ? restoreConsole() : () => {}

        if(isFunction(runner)){
            let expectedParameters = runner.length
            print(expectedParameters)
            if(expectedParameters == 1){
                // Handle Synchronous Test
                let result
                try {
                    result = runner(initial)
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

        // hideConsole()
        // try {
        //     result = isFunction(runner) ? runner(initial, (testResult) => {
        //         this.validateTest(testResult, expected)
        //     }, (error) => {
        //         showConsole()
        //         error(err)
        //         this.validateTest(undefined, expected, error)
        //     }) : undefined
        //     if(runner)
        //     this.validateTest(result, expected)
        // } catch(err){
        //     showConsole()
        //     error(err)
        //     this.validateTest(undefined, expected, err)
        // } finally {
        //     showConsole()
        // }   
    }

    validateTest = (result, expected) => {
        let { description, validator } = this
        Test.it(description, () => {
            validator(result, expected)
        })
        
    }
}

export class VanillaBean {
    static Runners = {
        testPassThrough: (test) => test,
        testFunction: (func) => (test) => func(test),
        testCallback: (func) => (test, callback) => func(test, callback)
    }

    constructor(options){

    }

    static describeWithColor = (describe, color = colors.description, prefix = '') => {
        if(!describe) throw new TypeError(`Must pass in mocha's 'describe' function`)
        return function(description, callback){
            describe(color(description), callback)
        }
    }

    static makeDescribeNamespace = (describe, color = colors.namespace, prefix = '') => {
        return VanillaBean.describeWithColor(describe, color)
    }

    static makeDescribeClass = (describe, color = colors.className, prefix = '') => {
        return VanillaBean.describeWithColor(describe, color)
    }

    static makeDescribeFunc = (describe, color = colors.functionName, prefix = '') => {
        return VanillaBean.describeWithColor(describe, color)
    }
}