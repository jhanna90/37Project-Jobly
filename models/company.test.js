"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Company = require("./company.js");
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
  const newCompany = {
    handle: "new",
    name: "New",
    description: "New Description",
    numEmployees: 1,
    logoUrl: "http://new.img",
  };

  test("works", async function () {
    let company = await Company.create(newCompany);
    expect(company).toEqual(newCompany);

    // Checking if the new company has been inserted into the database
    const result = await db.query(
      `SELECT handle, name, description, num_employees, logo_url
           FROM companies
           WHERE handle = 'new'`);
    expect(result.rows).toEqual([
      {
        handle: "new",
        name: "New",
        description: "New Description",
        num_employees: 1,
        logo_url: "http://new.img",
      },
    ]);
  });

  // Test case: should throw BadRequestError when attempting to create a company with duplicate handle
  test("bad request with dupe", async function () {
    try {
      await Company.create(newCompany);
      await Company.create(newCompany);
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

// /************************************** findAll */

// Test suite for the findAll method of the Company class
describe("findAll", function () {
  // Test case: should retrieve all companies successfully
  test("works", async function () {
    let companies = await Company.findAll();
    expect(companies).toEqual([
      {
        handle: "c1",
        name: "Comp1",
        description: "Desc1",
        numEmployees: 1,
        logoUrl: "http://c1.img",
      },
      {
        handle: "c2",
        name: "Comp2",
        description: "Desc2",
        numEmployees: 2,
        logoUrl: "http://c2.img",
      },
      {
        handle: "c3",
        name: "Comp3",
        description: "Desc3",
        numEmployees: 3,
        logoUrl: "http://c3.img",
      },
    ]);
  });
});

/************************************** get */

// Test suite for the get method of the Company class
describe("get", function () {
  // Test case: should filter companies by name successfully
  test("works: filter by name", async function () {
    let query = { name: "Comp1" };
    let companies = await Company.get(query);
    expect(companies).toEqual([
      {
        handle: "c1",
        name: "Comp1",
        description: "Desc1",
        numEmployees: 1,
        logoUrl: "http://c1.img",
        jobs: expect.anything()
      },
    ]);
  });

  // Test case: should filter companies by minimum employees successfully
  test("works: filter by min employees", async function () {
    let query = { minEmployees: 2 };
    let companies = await Company.get(query);
    expect(companies).toEqual([
      {
        handle: "c2",
        name: "Comp2",
        description: "Desc2",
        numEmployees: 2,
        logoUrl: "http://c2.img",
        jobs: ['Engineer', 'Technician'],
      },
      {
        handle: "c3",
        name: "Comp3",
        description: "Desc3",
        numEmployees: 3,
        logoUrl: "http://c3.img",
        jobs: expect.anything(),
      },
    ]);
  });

  // Test case: should filter companies by maximum employees successfully
  test("works: filter by max employees", async function () {
    let query = { maxEmployees: 2 };
    let companies = await Company.get(query);
    expect(companies).toEqual([
      {
        handle: "c1",
        name: "Comp1",
        description: "Desc1",
        numEmployees: 1,
        logoUrl: "http://c1.img",
        jobs: expect.anything(),
      },
      {
        handle: "c2",
        name: "Comp2",
        description: "Desc2",
        numEmployees: 2,
        logoUrl: "http://c2.img",
        jobs: expect.anything(),
      },
    ]);
  });

  // Test case: should filter companies by both minimum and maximum employees successfully
  test("works: filter by max & min employees", async function () {
    let query = { minEmployees: 2, maxEmployees: 3 };
    let companies = await Company.get(query);
    expect(companies).toEqual([
      {
        handle: "c2",
        name: "Comp2",
        description: "Desc2",
        numEmployees: 2,
        logoUrl: "http://c2.img",
        jobs: expect.anything(),
      },
      {
        handle: "c3",
        name: "Comp3",
        description: "Desc3",
        numEmployees: 3,
        logoUrl: "http://c3.img",
        jobs: expect.anything(),
      },
    ]);
  });

  // Test case: should throw NotFoundError when filtering with non-existing parameters
  test("does not work: non-existant parameters", async function () {
    try {
      let query = { maxEmployees: "3", minEmployees: "2" };
      await Company.get(query);
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  // Test case: should throw NotFoundError when filtering with non-existing parameters
  test("does not work: non-existant parameters", async function () {
    try {
      let query = { username: "not-a-company" };
      await Company.get(query);
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

// Test suite for the update method of the Company class
describe("update", function () {
  // Test data for updating company details
  const updateData = {
    name: "New",
    description: "New Description",
    numEmployees: 10,
    logoUrl: "http://new.img",
  };

  // Test case: should update company details successfully
  test("works", async function () {
    let company = await Company.update("c1", updateData);
    expect(company).toEqual({
      handle: "c1",
      ...updateData,
    });

    // Checking if the company details have been updated in the database
    const result = await db.query(
      `SELECT handle, name, description, num_employees, logo_url
           FROM companies
           WHERE handle = 'c1'`);
    expect(result.rows).toEqual([{
      handle: "c1",
      name: "New",
      description: "New Description",
      num_employees: 10,
      logo_url: "http://new.img",
    }]);
  });

  // Test case: should update company details with null fields successfully
  test("works: null fields", async function () {
    const updateDataSetNulls = {
      name: "New",
      description: "New Description",
      numEmployees: null,
      logoUrl: null,
    };

    let company = await Company.update("c1", updateDataSetNulls);
    expect(company).toEqual({
      handle: "c1",
      ...updateDataSetNulls,
    });

    // Checking if the company details with null fields have been updated in the database
    const result = await db.query(
      `SELECT handle, name, description, num_employees, logo_url
           FROM companies
           WHERE handle = 'c1'`);
    expect(result.rows).toEqual([{
      handle: "c1",
      name: "New",
      description: "New Description",
      num_employees: null,
      logo_url: null,
    }]);
  });

  // Test case: should throw NotFoundError when updating details of non-existing company
  test("not found if no such company", async function () {
    try {
      await Company.update("nope", updateData);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  }, 60000);

  // Test case: should throw BadRequestError when updating with no data
  test("bad request with no data", async function () {
    try {
      await Company.update("c1", {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

// Test suite for the remove method of the Company class
describe("remove", function () {
  // Test case: should remove company successfully
  test("works", async function () {
    await Company.remove("c1");
    const res = await db.query(
      "SELECT handle FROM companies WHERE handle='c1'");
    expect(res.rows.length).toEqual(0);
  });

  // Test case: should throw NotFoundError when attempting to remove non-existing company
  test("not found if no such company", async function () {
    try {
      await Company.remove("nope");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
