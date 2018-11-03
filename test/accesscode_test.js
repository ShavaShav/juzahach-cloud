process.env.NODE_ENV = 'test'

var should  = require('chai').should();
var expect  = require('chai').expect;
var request = require('supertest');
var { app, edgeApp } = require('../app');
var models = require('../models');

const jwtRegex = /[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+/;

const testUser = {
    username: 'TestUser',
    email: 'test_user@fakemail.com',
    password: 'my_pass_2345'
}

describe('Access Code', () => {

  beforeEach(done => {
    // Clear DB before each test
    Promise.all([
      models.sequelize.query('SET FOREIGN_KEY_CHECKS = 0', { raw: true }),
      models.sequelize.sync({ force: true, match: /_test$/ })
    ]).then(res => {
      done();
    });
  });

  it('should produce access code for a valid user', done => {
    let token = null;
    // Create a test user, login with it
    models.User.create(testUser).then(user => {
      user.setPassword(testUser.password); // generate hash/salt
      token = user.generateJWT();
      return user.save();
    }).then(() => {
      // Make API call under test to make access code
      request(app)
        .post('/device/register')
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + token)
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          expect(res.body).to.have.property('accessCode');
          done();
        });
    });
  });

  it('should register device for valid access code', done => {
    let token = null;
    let accessCode = 'A1B2C3'; // fake access code
    // Create a test user
    models.User.create(testUser).then(user => {
      user.setPassword(testUser.password); // generate hash/salt
      return user.save();
    }).then(user => {
      // Add to database with user id
      return models.AccessCode.create({
        accessCode: accessCode, 
        userId: user.id
      });
    }).then(() => {
      // Make API call under test to register device
      request(edgeApp)
      .post('/register')
      .set('Accept', 'application/json')
      .send({
        device: {
          accessCode: accessCode,
          macAddress: 'XXX-YYY-ZZZ'
        }
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        expect(res.body).to.have.property('token');
        expect(res.body.token).to.match(jwtRegex);
        done();
      });
    });
  });

});