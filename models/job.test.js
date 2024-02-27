"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
    // Test data for creating a new job
    const newJob = {
        title: "newJob",
        salary: 30000,
        equity: 0,
        companyHandle: "c3"
    };

    // Test case: should create a new job successfully
    test("works", async function () {
        let job = await Job.create(newJob);
        expect(job).toEqual({
            title: "newJob",
            salary: 30000,
            equity: "0",
            companyHandle: "c3",
        });

        // Checking if the new job has been inserted into the database
        const result = await db.query(
            `SELECT title, salary, equity, company_handle
           FROM jobs
           WHERE title = 'newJob'`
        );
        expect(result.rows).toEqual([
            {
                title: "newJob",
                salary: 30000,
                equity: "0",
                company_handle: "c3",
            },
        ]);
    });

    // Test case: should throw BadRequestError when attempting to create a job with duplicate title
    test("bad request with dupe", async function () {
        try {
            await Job.create(newJob);
            await Job.create(newJob);
            fail();
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });
});

/************************************** get */

describe("get", function () {
    // Test case: should retrieve all jobs successfully without any filters
    test("works: no filter", async function () {
        let jobs = await Job.get();
        expect(jobs).toEqual([
            {
                title: "Farmer",
                salary: 50000,
                equity: "0",
                company_handle: "c1",
            },
            {
                title: "Engineer",
                salary: 75000,
                equity: "0",
                company_handle: "c2",
            },
            {
                title: "Technician",
                salary: 40000,
                equity: "0",
                company_handle: "c2",
            },
        ]);
    });

    // Test case: should filter jobs by title successfully
    test("works: filter by job title", async function () {
        let query = { title: "engineer" };
        let jobs = await Job.get(query);
        expect(jobs).toEqual([
            {
                title: "Engineer",
                salary: 75000,
                equity: "0",
                company_handle: "c2",
            }
        ]);
    });

    // Test case: should filter jobs by minimum salary successfully
    test("works: filter by salary minimum", async function () {
        let query = { minSalary: 50000 };
        let jobs = await Job.get(query);
        expect(jobs).toEqual([
            {
                title: "Farmer",
                salary: 50000,
                equity: "0",
                company_handle: "c1",
            },
            {
                title: "Engineer",
                salary: 75000,
                equity: "0",
                company_handle: "c2",
            },
        ]);
    });

    // Test case: should filter jobs by equity successfully
    test("works: filter by equity", async function () {
        const newJob = {
            title: "entrepreneur",
            salary: 2000000,
            equity: .5,
            companyHandle: "c3",
        };
        await Job.create(newJob);
        let query = { hasEquity: true };
        let jobs = await Job.get(query);
        expect(jobs).toEqual([
            {
                title: "entrepreneur",
                salary: 2000000,
                equity: "0.5",
                company_handle: "c3",
            },
        ]);
    });

    // Test case: should filter jobs by absence of equity successfully
    test("works: filter by equity", async function () {
        let query = { hasEquity: false };
        let jobs = await Job.get(query);
        expect(jobs).toEqual([
            {
                title: "Farmer",
                salary: 50000,
                equity: "0",
                company_handle: "c1",
            },
            {
                title: "Engineer",
                salary: 75000,
                equity: "0",
                company_handle: "c2",
            },
            {
                title: "Technician",
                salary: 40000,
                equity: "0",
                company_handle: "c2",
            },
        ]);
    });

    // Test case: should throw NotFoundError when filtering with non-existing parameters
    test("does not work: non-existant parameters", async function () {
        try {
            let query = { title: "Chef" };
            await Job.get(query);
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});

/************************************** update */

describe("update", function () {
    // Update data for testing
    const updateData = {
        salary: 42500,
        equity: "0",
        company_handle: "c2",
    };

    // Test case: should update job details successfully
    test("works", async function () {
        let job = await Job.update("Technician", updateData);
        expect(job).toEqual({
            title: "Technician",
            ...updateData,
        });

        // Checking if the job details have been updated in the database
        const result = await db.query(
            `SELECT title, salary, equity, company_handle
          FROM jobs
          WHERE company_handle = 'c2'`);

        expect(result.rows).toEqual([
            {
                title: "Engineer",
                salary: 75000,
                equity: "0",
                company_handle: "c2",
            },
            {
                title: "Technician",
                salary: 42500,
                equity: "0",
                company_handle: "c2",
            },
        ]);
    });

    // Test case: should update job details with null fields successfully
    test("works: null fields", async function () {
        const updateDataSetNulls = {
            salary: null,
            equity: null,
            company_handle: "c3",
        };

        let job = await Job.update("Engineer", updateDataSetNulls);
        expect(job).toEqual({
            title: "Engineer",
            ...updateDataSetNulls,
        });

        // Checking if the job details with null fields have been updated in the database
        const result = await db.query(
            `SELECT title, salary, equity, company_handle
           FROM jobs
           WHERE title = 'Engineer'`
        );
        expect(result.rows).toEqual([
            {
                title: "Engineer",
                salary: null,
                equity: null,
                company_handle: "c3",
            },
        ]);
    });

    // Test case: should throw NotFoundError when updating details of non-existing job
    test("not found if no such job", async function () {
        try {
            await Job.update("nope", updateData);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });

    // Test case: should throw BadRequestError when updating with no data
    test("bad request with no data", async function () {
        try {
            await Job.update("Farmer", {});
            fail();
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });
});

/************************************** remove */

describe("remove", function () {
    // Test case: should remove job successfully
    test("works", async function () {
        await Job.remove("Technician");
        const res = await db.query(
            "SELECT title FROM jobs WHERE title='Technician'");
        expect(res.rows.length).toEqual(0);
    });

    // Test case: should throw NotFoundError when attempting to remove non-existing job
    test("not found if no such job", async function () {
        try {
            await Job.remove("nope");
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});
