import { Test } from '../../test/Test'
import { TestSet } from '../../test/TestSet'
import { VanillaBean } from '../../VanillaBean'

export class MochaCompat {
    static describe = () => { throw new Error(`Mocha's 'describe' function must be statically set to 'MochaCompat'. Try 'MochaCompat.describe = describe'.`) }
    static it = () => { throw new Error(`Mocha's 'it' function must be statically set to 'MochaCompat'. Try 'MochaCompat.it = it'.`) }
    static expect = () => { throw new Error(`Mocha's 'expect' function must be statically set to 'MochaCompat'. Try 'MochaCompat.expect = expect'.`) }

    static ID = 1000

    static Runners = {
        testPassThrough: (test) => test,
        testFunction: (func) => (...test) => func(...test),
        testCallback: (func) => (test, callback) => func(test, callback)
    }

    static Validators = {
        isEqual: (initial, expected) => MochaCompat.expect(initial).equals(expected),
        isNotEqual: (initial, expected) => MochaCompat.expect(initial).not.equal(expected),
        isDeepEqual: (initial, expected) => MochaCompat.expect(initial).deep.equals(expected),
        isNaN: (initial, expected) => MochaCompat.expect(isNaN(result)).equals(isNaN(expected))
    }

    static init = (options) => {
        let { testMethods } = options
        MochaCompat.setTestMethods(testMethods)

        MochaCompat.applyDefaults(Test)
        MochaCompat.applyDefaults(TestSet)

        MochaCompat.applyTestMethods(TestSet, testMethods)
        MochaCompat.applyTestMethods(Test, testMethods)
    }

    static applyDefaults = (clazz) => {
        clazz.defaultOptions = Object.assign({}, {
            runner: MochaCompat.Runners.testPassThrough,
            validator: MochaCompat.Validators.isEqual
        }, clazz.defaultOptions)
    }

    static applyTestMethods = (clazz, { describe, it, expect }) => {
        clazz.describe = describe
        clazz.it = it
        clazz.expect = expect

        clazz.describeClass = VanillaBean.makeDescribeClass(describe)
        clazz.describeFunc = VanillaBean.makeDescribeFunc(describe)
        clazz.describeNamespace = VanillaBean.makeDescribeNamespace(describe)
    }

    static setTestMethods = ({ describe, it, expect }) => {
        MochaCompat.describe = describe
        MochaCompat.it = it
        MochaCompat.expect = expect
    }
}