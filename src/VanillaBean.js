import colors from 'colors/safe'
import { isArray, isObject, isFunction } from '@beautiful-code/type-utils'

import { print, debug, error } from './lib/ConsoleUtils'

import { TestSet } from './test/TestSet'
import { Test } from './test/Test'

colors.setTheme({
    namespace: 'violet',
    className: 'green',
    functionName: 'cyan',
    description: 'white'
})

export default class VanillaBean {
    static ID = 1000

    static defaultOptions = {
        noLogging: false,
        autoRun: true,
    }

    constructor(options){
        this.tests = []
        this.options = Object.assign({}, VanillaBean.defaultOptions, options)
    }

    createTestSuite = (definitions) => {
        if(!isArray(definitions)) definitions = [definitions]
        let testSets = definitions.map((definition) => {
            this.processDefinition(definition)
        })
    }

    processDefinition = (definition) => {
        let { autoRun } = this.options
        let testSet = new TestSet(definition)
        let name = testSet.getName() || VanillaBean.ID++
        
        if(name){
            let key = this.getKey(name)

            if(this.tests.hasOwnProperty(key)) 
                throw new Error(`VanillaBean test set key must be unique. The key ${key}' has already been used.`)
            this.tests[key] = testSet

            if(autoRun){
                this.runTest(key)
            }
        }
        return testSet
    }

    getKey = (string) => string

    runTest = (key) => {
        if(!key) return
        this.tests[key].runTests()
    }

    runTestSet = (name) => {
        if(!name) return
        let key = this.getKey(name)
        if(this.tests.hasOwnProperty(key)){
            this.tests[key].runTests()
        }
        
    }

    runTests = () => {
        Object.entries(this.tests).forEach(([name, testSet]) => {
            testSet.runTests()
        })
    }

    setOption = (key, value) => {
        this.options[key] = value
    }

    getOption = (key) => {
        return this.options[key]
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

export { VanillaBean }