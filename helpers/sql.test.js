const { BadRequestError } = require('../expressError');
const {
    sqlForPartialUpdate,
    sqlCompWhereQuery,
    sqlJobGetQuery
} = require('./sql');

describe('sqlForPartialUpdate function', () => {
    it('should return setCols and values for SQL query', () => {
        // Input data and mapping
        const dataToUpdate = {
            firstName: 'John',
            age: 30
        };
        const jsToSql = {
            firstName: 'first_name'
        };

        // Calling the function and asserting the result
        const result = sqlForPartialUpdate(dataToUpdate, jsToSql);
        expect(result).toEqual({
            setCols: '"first_name"=$1, "age"=$2',
            values: ['John', 30]
        });
    });

    it('should throw BadRequestError if dataToUpdate is empty', () => {
        // Asserting that the function throws a BadRequestError
        expect(() => {
            sqlForPartialUpdate({}, {});
        }).toThrowError(BadRequestError);
    });
});

describe('sqlCompWhereQuery function', () => {
    it('should return WHERE clause string based on query parameters', () => {
        // Input query parameters
        const query = {
            name: 'ABC Inc',
            minEmployees: 100,
            maxEmployees: 500
        };

        // Calling the function and asserting the result
        const result = sqlCompWhereQuery(query);
        expect(result).toEqual(" WHERE UPPER(name) LIKE UPPER('%ABC Inc%') AND num_employees >= 100 AND num_employees <= 500");
    });

    it('should return empty string if no query parameters are passed', () => {
        // Calling the function with an empty query and asserting the result
        const result = sqlCompWhereQuery({});
        expect(result).toEqual('');
    });
});

describe('sqlJobGetQuery function', () => {
    it('should return WHERE clause string based on query parameters', () => {
        // Input query parameters
        const query = {
            title: 'Software Engineer',
            minSalary: 80000,
            hasEquity: true
        };

        // Calling the function and asserting the result
        const result = sqlJobGetQuery(query);
        expect(result).toEqual(" WHERE UPPER(title) LIKE UPPER('%Software Engineer%') AND salary >= 80000 AND equity > 0");
    });

    it('should return empty string if no query parameters are passed', () => {
        // Calling the function with an empty query and asserting the result
        const result = sqlJobGetQuery({});
        expect(result).toEqual('');
    });
});
