const Student = require("../models/student.js")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken");
const { validateFields } = require("../utils/validate.js")
const { UnauthorizedError,BadRequestError, UnprocessableEntityError } = require("../utils/errors.js")
jest.mock('bcrypt')
jest.mock('../utils/validate.js')
jest.mock('jsonwebtoken')







// TEST FOR THE FETCHBYEMAIL FUNCTION
describe("fetch by Email", () => {
    test('fetch by email should return user if email is valid', async  () => {
        const validEmail = 'test-email@test.com'
        const result =  await Student.fetchStudentByEmail(validEmail)
        expect(result).toStrictEqual({
            id: 0,
            email: 'test-email@test.com',
            first_name: 'test-first_name',
            last_name: 'test-last_name',
            parent_phone: '3476640645',
            zipcode: '93117',
            password: 'test-password',
            sat_score: 1440,
            act_score: 31,
            enrollment: 350,
            school_type: 'test-school_type'
            
        })
    })
    test('fetch by email should return undefined if email isnt valid', async  () => {
        const invalidEmail = 'invalidEmail'
        const result =  await Student.fetchStudentByEmail(invalidEmail)
        expect(result).toBeUndefined()
    })
    
})




// TEST FOR THE AUTHENTICATE FUNCTION
describe("the authenticate/ login", () => {
    const expectedPassword = 'test-password';
    // Mock bcrypt.hash
    bcrypt.hash.mockImplementation(async (password) => password);
    // Mock bcrypt.compare
    bcrypt.compare.mockImplementation(async (plainTextPassword, hashedPassword) => plainTextPassword === expectedPassword);


    
    test('authenticate should return the user if email and password exists and match in the db', async () => {
        const result = await Student.authenticate({email:'test-email@test.com', password: 'test-password' })
        expect(result).toStrictEqual({
            id: 0,
            email: 'test-email@test.com',
            firstName: 'test-first_name',
            lastName: 'test-last_name',
            parentPhone: '3476640645',
            zipcode: '93117',
            satScore: 1440,
            actScore: 31,
            enrollment: 350,
            schoolType: 'test-school_type'
        })    
    })    
    
    test("if user hasn't registered yet", async function () {
        try {
            await Student.authenticate({ email: "somebody@else.io", password: "password" })
        } catch (err) {
            expect(err instanceof UnauthorizedError).toBeTruthy()
        }    
    })    
    
    
    test("send unauthorized if wrong password", async function () { 
        try {
            await Student.authenticate({ email: "test-email@test.com", password: "wrong" })
        } catch (err) {
            expect(err instanceof UnauthorizedError).toBeTruthy()
        }  
    })
})    




//TEST FOR THE REGISTER FUNCTION

describe("the register function test",  () =>  {
    const newStudent = {
        email: 'register-email@test.com',
        firstName: 'register-first_name',
        lastName: 'register-last_name',
        parentPhone: '9293469542',
        zipcode: '49104',
        examScores: {
            satScore: 1400,
            actScore: 30
        },    
        enrollment: 500,
        schoolType: 'register-school_type',
        password: 'register-test_password'
    }  
    // Mock the database query to return the new student data
    const mockInsertResult = {
        rows: [{
            id: 1,
            email: newStudent.email,
            first_name: newStudent.firstName.toLowerCase(),
            last_name: newStudent.lastName.toLowerCase(),
            parent_phone: newStudent.parentPhone,
            zipcode: newStudent.zipcode,
            sat_score: newStudent.examScores.satScore,
            act_score: newStudent.examScores.actScore,
            enrollment: newStudent.enrollment,
            school_type: newStudent.schoolType,
            password: newStudent.password
        }]    
    }; 
    beforeAll(() => {       
         const db = require('../db.js')      
    db.query = jest.fn().mockReturnValue(mockInsertResult)
    Student.fetchStudentByEmail = jest.fn().mockReturnValue(undefined);
}) 

    
    
    afterAll(()=> {
        jest.clearAllMocks()
    })    
    
    
    test('test to see if a new student will be able to register', async function () { 
        const result = await Student.register(newStudent);
        expect(result).toStrictEqual({
            id: 1,
            email: newStudent.email,
            first_name: newStudent.firstName.toLowerCase(),
            last_name: newStudent.lastName.toLowerCase(),
            parent_phone: newStudent.parentPhone,
            zipcode: newStudent.zipcode,
            sat_score: newStudent.examScores.satScore,
            act_score: newStudent.examScores.actScore,
            enrollment: newStudent.enrollment,
            school_type: newStudent.schoolType,
            password: newStudent.password
        });    
    });    
    
    
    
    test('test to see if the email has already been used to register', async function () {
        const invalidCreds = {
            email: 'alreadyused@test.com',
            firstName: 'already-Fname_test',
            lastName: 'already-Lname_test',
            parentPhone: '4563342112',
            zipcode: '67901',
            password: 'already-test_password',
            examScores: {
                satScore: 1240,
                actScore: 28
            },    
            enrollment: 680,
            schoolType: 'already-school_type'
        };   
        Student.fetchStudentByEmail = jest.fn().mockReturnValue({
            email: 'alreadyused@test.com',
            first_name: 'already-Fname_test',
            last_name: 'already-Lname_test',
            parent_phone: '4563342112',
            zipcode: '67901',
            password: 'already-test_password',
            sat_score: 1240,
            act_score: 28,
            enrollment: 680,
            school_type: 'already-school_type'
        })    
        bcrypt.hash.mockImplementation(async (password) => password);
        try {
            await Student.register(invalidCreds)
        } catch (error) {
            expect(error instanceof BadRequestError).toBeTruthy()
        }                     
    })    
    
    

    test('test to throw the BadRequestError if there isnt an email or a password', async function () {
        const emptyEmailCreds = {
            email: null,
            firstName: 'already-Fname_test',
            lastName: 'already-Lname_test',
            parentPhone: '4563342112',
            zipcode: '67901',
            password: 'already-test_password',
            examScores: {
                satScore: 1240,
                actScore: 28
            },    
            enrollment: 680,
            schoolType: 'already-school_type'
        };    
        validateFields.mockImplementation(() => {})
        try {
            await Student.register(emptyEmailCreds)
        } catch (error) {
            expect(error instanceof BadRequestError).toBeTruthy()
        }    
    })    
})    




describe('LikedFunctions', () => {
    const db = require('../db.js')
    beforeEach(() => {
        db.query.mockReset();
      });
    test('test for LikeCollege to return user', async function () {
        db.query.mockResolvedValue({
            rows: [
              {
                id: 1,
                user_id: 0,
                name: 'test-college_name',
              },
            ],
          });
        const validId = 0
        const validCollege = 'test-college_name'
        const result = await Student.likeCollege(validId, validCollege)
        expect(result).toEqual({
            id: 1,
            user_id: 0,
            name: 'test-college_name'
        })
        
    })
})



describe('getLikedColleges', () => {
    const db = require('../db.js')
    beforeEach(() => {
        db.query.mockReset();
      });
      test('test for getLikedColleges to return', async function (){
        db.query.mockResolvedValue({
            rows:{
                id: 2,
                user_id: 1,
                name: 'test-collegeLiked_name',
              }
          });
          const validId = 1;
          const result = await Student.getLikedColleges(validId)
          expect(result).toEqual({
              id: 2,
              user_id: 1,
              name: 'test-collegeLiked_name'
          })
      })

      test('should throw an error if the database query fails', async () => {
        const student_id = 3; // Replace with the desired student_id for testing
        // Mock the query function to throw an error
        db.query.mockRejectedValue(new Error('Database query failed'));
        try {
          await Student.getLikedColleges(student_id);
        } catch (error) {
          // Expect that an error is thrown
          expect(error).toBeInstanceOf(Error);
          expect(error.message).toBe('Database query failed');
        }
      });
    
})



describe("getCollegeFeed", () => {
    const db = require('../db.js')
    beforeEach(() => {
        db.query.mockReset();
      });
    test("should return colleges for users depending on sats", async function () {
        const validSatScore = 1450;
        const mockData = {
            rows: [
               { name: 'Test University', sat_score: 1360},
               { name: 'Test College', sat_score: 1400}
            ]}
        db.query.mockResolvedValue(mockData);
        const result = await Student.getCollegeFeed(validSatScore);
    expect(result).toEqual(mockData.rows);
    })

    // test('should throw BadRequestError if sat_score is not provided', async () => {
    //     const invalidSatScore = undefined; // No sat_score provided
    //     // Call the function and expect it to throw a BadRequestError
    //     await expect(Student.getCollegeFeed(invalidSatScore)).rejects.toThrow(BadRequestError);
    //   });

      test('should return an empty array if no colleges are found within the specified range', async () => {
        const validSatScore = 1500; 
        // Mock db.query to return an empty result
        const mockData = { rows: [] };
        db.query.mockResolvedValue(mockData);
        // Call the function and expect an empty array
        const result = await Student.getCollegeFeed(validSatScore);
        expect(result).toEqual([]);
      });

})




describe('getCollege', ()=> {
    const db = require('../db.js')
    test('should return colleges liked by user in the past', async function () {
        const validCollegeName = 'Testing University'
        const mockInfo = {rows: [
            {name: 'Testing University', sat_score: 1450},
        ]}
        db.query.mockResolvedValue(mockInfo);
            // Call the function and expect the result
    const result = await Student.getCollege(validCollegeName);
    expect(result).toEqual(mockInfo.rows[0]);
    })

    test('should return empty if college isnt found', async function () {
        const collegeName ='Test University'
        const mockInfo = { rows: []}
        db.query.mockResolvedValue(mockInfo)
        const result = Student.getCollege(collegeName)
        expect(result).toBeUndefined
    })


})





describe('GenerateAuthTokens', () => {
    test('should return the users token', async function () {
        const testPayloadInfo = {
            id: 0,
            firstName: 'test-first_name',
            lastName: 'test-last_name',
            email: 'test-email@test.com',
        }
        const testSecretKey = 'test-secret_key'

        jwt.sign = jest.fn((payload, secret, options) => {
            // Return a dummy token
            return 'dummy-token';
          });
          const token = await Student.generateAuthToken(testPayloadInfo, testSecretKey);
          expect(token).toBe('dummy-token');
    }) 
})




describe('VerifyTokens', () => {

    jest.mock('jsonwebtoken');
    jwt.verify = jest.fn((token, secretKey) => {
    if (token === 'valid-token') {
    return { id: 0, firstName: 'test-first_name', lastName: 'test-last_name', email: 'test-email@test.com' };
    } else {
    throw new Error('Invalid token');
    }
});
    test('should verify if the token is expired/valid or not', async function () {
        const validToken = 'valid-token'
        const result = await Student.verifyAuthToken(validToken)
        expect(result).toEqual({
            id: 0,
            firstName: 'test-first_name',
            lastName: 'test-last_name',
            email: 'test-email@test.com'
        })
    })

    test('should return null for an invalid token', async () => {
        const invalidToken = 'invalid-token';
        // Call the verifyAuthToken function with the invalid token
        const decodedToken = await Student.verifyAuthToken(invalidToken);
        // Assertion
        // Verify that jwt.verify() was called with the invalid token and secret key
        expect(jwt.verify).toHaveBeenCalledWith(invalidToken, expect.any(String));
        // Verify that the function returns null for an invalid token
        expect(decodedToken).toBeNull();
      });
})