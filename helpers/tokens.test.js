const jwt = require("jsonwebtoken");
const { createToken } = require("./tokens");
const { SECRET_KEY } = require("../config");

describe("createToken", function () {
  test("works: not admin", function () {
    // Generating token for a non-admin user
    const token = createToken({ username: "test", is_admin: false });
    // Verifying the token payload
    const payload = jwt.verify(token, SECRET_KEY);
    // Asserting the payload structure
    expect(payload).toEqual({
      iat: expect.any(Number),
      username: "test",
      isAdmin: false,
    });
  });

  test("works: admin", function () {
    // Generating token for an admin user
    const token = createToken({ username: "test", isAdmin: true });
    // Verifying the token payload
    const payload = jwt.verify(token, SECRET_KEY);
    // Asserting the payload structure
    expect(payload).toEqual({
      iat: expect.any(Number),
      username: "test",
      isAdmin: true,
    });
  });

  test("works: default no admin", function () {
    // Generating token for a user with no admin status explicitly provided
    // This test specifically checks if the default behavior (isAdmin: false) works as expected
    const token = createToken({ username: "test" });
    // Verifying the token payload
    const payload = jwt.verify(token, SECRET_KEY);
    // Asserting the payload structure
    expect(payload).toEqual({
      iat: expect.any(Number),
      username: "test",
      isAdmin: false,
    });
  });
});
