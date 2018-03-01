import { toSnakeCase } from '@beautiful-code/string-utils'
import { isArray, isObject, isFunction } from '@beautiful-code/type-utils'
import { clean, exclude, extend } from '@beautiful-code/object-utils'

import { Test } from './Test'

export class TestSet {
    static defaultOptions = {
        name: undefined,
        description: '',
        tests: [],
        sets: [],
        noLogging: false
    }

    constructor(options = {}){
        let name, type, description, sets, tests, runner, validator;
        ({ name, type, description, sets, tests, runner, validator, ...options } = this._handleOptions(options))
        
        this.name = name
        this.type = type
        this.description = description
        this.runner = runner
        this.validator = validator
        this.options = options

        this.sets = this._validateSets(name, sets, {
            runner, validator, ...options
        })

        this.tests = this._validateTests(tests, {
            runner, validator, ...options
        })

    }

    _handleOptions = (options) => {
        options = clean(options)
        let { name, type, description, runner, validator } = options;

        ({description, type} = this.formatDescription(description, type))
        if(!name) name = this.generateName(description)
        name = name.replace(/[^a-z\_]/gi, '')

        let computedOptions = {
            name, type, description,
            usingCustomRunner: isFunction(runner),
            usingCustomValidator: isFunction(validator),
        }

        return  Object.assign({}, TestSet.defaultOptions, options, computedOptions)
    }

    getName = () => {
        return this.name
    }

    formatDescription = (description, type) => {
        if(description && description.indexOf('|') > -1){
            if(!type){
                ([type, description] = description.split('|'))
            } else {
                description = description.split('|')[1]
            }
        }

        return { description, type }
    }

    generateName = (description) => {
        return toSnakeCase(description)
    }

    runTests = () => {
        let { description, type, tests, sets, options } = this
        let localDescribe = TestSet.describe

        if(type == 'class' && TestSet.hasOwnProperty('describeClass')) 
            localDescribe = TestSet.describeClass
        if(type == 'func' || type == 'method' && TestSet.hasOwnProperty('describeFunc')) 
            localDescribe = TestSet.describeFunc
        if(type == 'namespace'  && TestSet.hasOwnProperty('describeNamespace')) 
            localDescribe = TestSet.describeNamespace

        localDescribe(description, () => {
            tests.forEach((test) => {
                test.runTest()
            })

            sets.forEach((set) => {
                set.runTests()
            })
        })
    }

    _validateSets = (parentName, sets, options) => {
        let { runner: parentRunner, validator: parentValidator } = options
        if(!isArray(sets)) throw new TypeError(`'TestSet' expects 'sets' property to be an array.`)
        return sets.reduce((collection, definition) => {
            if(!isObject(definition)) throw new TypeError(`'TestSet' expects all set elements to be objects.`)
            
            let { description, name, type, runner, validator, ...properties } = definition;

            ({description, type} = this.formatDescription(description))
            if(!name) name = this.generateName(description)

            name = toSnakeCase([parentName, name].join())
            
            let set = new TestSet({
                name, description, type,
                runner: runner || parentRunner,
                validator: validator || parentValidator,
                ...properties,
            })
            collection.push(set)
            return collection
        }, [])
    }

    _validateTests = (tests, options) => {
        let { runner, validator } = options
        if(!isArray(tests)) throw new TypeError(`'TestSet' expects 'tests' property to be an array.`)
        return tests.reduce((collection, definition) => {
            if(!isArray(definition)) throw new TypeError(`'TestSet' expects all test elements to be arrays.`)            
            let [
                description, initial, expected,
                localRunner, localValidator
            ] = definition

            let test = new Test({
                description, 
                initial, 
                expected, 
                runner: localRunner || runner, 
                validator: localValidator || validator
            })
            collection.push(test)
            return collection
        }, [])
    }
}