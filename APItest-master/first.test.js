const axios = require('./axios');
const expect = require('chai').expect;
const Chance = require('chance');
const chance = new Chance();
// Use Chance here.
const validate = require('./validate');
describe('test', () => {
  const login = chance.first();
  const password = chance.string();
  it('login error', async () => {
    let data = {
      login,
      password
    };
    let res = await axios.post('api/auth/login', data);
    console.log('POST');
    console.log(res.data);
    let valid = validate('./schemas/auth/schemaLoginErr.json', res.data);
    expect(valid).to.be.true;
  });

  it('register', async () => {
    let data = {
      login,
      password,
      passwordConfirm: password,
    };
    let res = await axios.post('api/auth/register', data);
    console.log(res.data);
    let valid = validate('./schemas/auth/schemaRegister.json', res.data);
    expect(valid).to.be.true;
  });

  it('login success', async () => {
    let data = {
      login,
      password
    };
    let res = await axios.post('api/auth/login', data);
    expect(res.data.ok).to.be.true;
  });

});


