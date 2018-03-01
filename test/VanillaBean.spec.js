// Node Packages
let path = global.imports.path

// Imported Packages
let { print, info, debug, warn, error, supressConsole, restoreConsole } = global.imports.ConsoleUtils

let { isArray, isObject, isFunction } = global.imports.TypeUtils

let { assert, expect } = global.imports.Chai

import { VanillaBean, Test, TestSet, MochaCompat } from '../dist'
const { makeDescribeClass, makeDescribeFunc } = VanillaBean
const { Runners, Validators } = MochaCompat 


MochaCompat.init({ testMethods: { describe, it, expect }})

let addThree = (num) => num + 3

let addThreeCb = (num, callback) => callback(num + 3)

let addThreeObject = (object) => Object.entries(object)
    .reduce((object, [key, value]) => ({...object, [key]: addThree(value)}), {})

let vanillaBean = new VanillaBean({
    autoRun: true
})

vanillaBean.createTestSuite({
    description: 'class|VanillaBean',
    sets: [{
        description: 'method|#addThree',
        sets: [{
            description: 'Should return value plus three',
            runner: Runners.testFunction(addThree),
            tests: [
                [`if value is '0'`, 0, 3],
                [`if value is an integer number`, 3, 6],
                [`if value is a float`, 0.25, 3.25],
            ]
        }]
    }]
})

// vanillaBean.createTestSuite([{
//     name: 'ADD_THREE_VALID_NUMBER',
//     description: `Should equal number + 3`,
//     runner: Runners.testFunction(addThree),
//     tests: [
//         [`if value is '0'`, 0, 3],
//         [`if value is an integer number`, 3, 6],
//         [`if value is a float`, 0.25, 3.25],
//     ]
// }, {
//     name: 'ADD_THREE_VALID_STRING',
//     description: `Should be concatenated`, 
//     runner: Runners.testFunction(addThree),
//     tests: [
//         [`if value is a string`, 'Test', 'Test3']
//     ]
// }, {
//     name: 'ADD_THREE_INVALID_NAN',
//     description: `Should throw equal NaN`,
//     runner: Runners.testFunction(addThree),
//     validator: (result, expected) => expect(isNaN(result)).equals(isNaN(expected)),
//     tests: [
//         [`if value is 'undefined'`, undefined, NaN],
//         [`if value is 'NaN'`, NaN, NaN]
//     ]
// }, {
//     name: 'ADD_THREE_VALID_OBJECT_NUMBERS',
//     description: `returns object with all values increased by 3`,
//     runner: Runners.testFunction(addThreeObject),
//     validator: Validators.isDeepEqual,
//     tests: [
//         [`is an object with integer or float values`, 
//             [
//                 { a: 1, b: 2, c: 5 },
//                 { a: 4, b: 1, c: 3 },
//                 { a: 0.7, b: 0.2, c: 2.25 }
//             ], 
//             [
//                 { a: 4, b: 5, c: 8 }, 
//                 { a: 7, b: 4, c: 6 },
//                 { a: 3.7, b: 3.2, c: 5.25 }
//             ],
//         ]
//     ]
// }])

// vanillaBean.createTestSuite({
//     name: 'ADD_THREE',
//     description: '#addThree',
//     sets: [{
//         name: 'VALID_NUMBER',
//         description: `Should equal number + 3`,
//         runner: Runners.testFunction(addThree),
//         tests: [
//             [`if value is '0'`, 0, 3],
//             [`if value is an integer number`, 3, 6],
//             [`if value is a float`, 0.25, 3.25],
//         ]
//     }]
// })

// describeClass('VanillaBean', () => {
//     describeFunc('#addThree', () => {
//         vanillaBean.runTestSet('ADD_THREE_VALID_NUMBER')
//         vanillaBean.runTestSet('ADD_THREE_VALID_STRING')
//         vanillaBean.runTestSet('ADD_THREE_INVALID_NAN')
//         vanillaBean.runTestSet('ADD_THREE_VALID_OBJECT_NUMBERS')
//     })
// })

