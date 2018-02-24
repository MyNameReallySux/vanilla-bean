// Node Packages
let path = global.imports.path

// Imported Packages
let { print, info, debug, warn, error, supressConsole, restoreConsole } = global.imports.ConsoleUtils
let { VanillaMocha, Test, TestSet } = global.imports.VanillaMocha

let { isArray, isObject, isFunction } = global.imports.TypeUtils

let { assert, expect } = global.imports.Chai

const { makeDescribeClass, makeDescribeFunc } = VanillaMocha
const { Runners } = VanillaMocha 

const describeClass = makeDescribeClass(describe)
const describeFunc = makeDescribeFunc(describe)

TestSet.setMochaFunctions(describe, it)
Test.setMochaFunctions(it, expect)

let addThree = (num) => num + 3

let addThreeCb = (num, callback) => callback(num + 3)

describeClass('VanillaMocha', () => {
    describeFunc('#addThree', () => {
        let executeTestValidSpec = new TestSet(`Should equal number + 3`, [
            [`if value is '0'`, 0, 3],
            [`if value is an integer number`, 3, 6],
            [`if value is a float`, 0.25, 3.25],
        ], {
            runner: Runners.testFunction(addThree)
        })
        executeTestValidSpec.runTests()

        let executeTestStrangeSpec = new TestSet(`Should be concatenated`, [
            [`if value is a string`, 'Test', 'Test3'],
        ], {
            runner: Runners.testFunction(addThree)
        })
        executeTestStrangeSpec.runTests()

        let executeTestInvalidSpec = new TestSet(`Should throw an error`, [
            [`if value is 'undefined'`, undefined, NaN],
            [`if value is 'NaN'`, NaN, NaN]
        ], {
            runner: Runners.testFunction(addThree),
            validator: (result, expected) => expect(isNaN(result)).equals(isNaN(expected))
        })
        executeTestInvalidSpec.runTests()

        let executeTestCallbackSpec = new TestSet(`Should pass number + 3 to callback`, [
            [`if value is 3 'integer'`, 3, 6],
        ], {
            runner: Runners.testCallback(addThreeCb)
        })

        executeTestCallbackSpec.runTests()


        // let executeTestSpec = new Test({
        //     description: `if value is false`,
        //     initial: false,
        //     expected: true,
        //     runner: (test) => !test, 
        //     validator: (result, expected) => expect(result).equals(expected)
        // })

        // executeTestSpec.executeTest()

    })
})
