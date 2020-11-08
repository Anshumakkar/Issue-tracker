/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);
var savedObjectId=''
suite('Functional Tests', function() {
  
    suite('POST /api/issues/{project} => object with issue data', function() {
      
      test('Every field filled in', function(done) {
        this.timeout(10000)
       chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Every field filled in',
          assigned_to: 'Chai and Mocha',
          status_text: 'In QA'
        })
        .end(function(err, res){
          console.log('body is '+ JSON.stringify(res.body))
          console.log('status is ' + res.status)
          assert.equal(res.status, 200);
          assert.deepEqual(res.body.issue_title,"Title")
          assert.deepEqual(res.body.issue_text,"text")
          assert.deepEqual(res.body.created_by,"Functional Test - Every field filled in")
          assert.deepEqual(res.body.assigned_to,"Chai and Mocha")
          assert.deepEqual(res.body.status_text,"In QA")
          assert.isNotNull(res.body._id,"Id should also be filled")
          assert.isNotNull(res.body.created_on,"Createdon should also be filled")
          assert.isNotNull(res.body.updated_on,"Updated should also be filled")
          done();
        });
      });
      
      test('Required fields filled in', function(done) {
                this.timeout(10000)
       chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'TitleNew',
          issue_text: 'text',
          created_by: 'Functional Test - Every field filled in',
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.deepEqual(res.body.issue_title,"TitleNew")
          assert.deepEqual(res.body.issue_text,"text")
          assert.deepEqual(res.body.created_by,"Functional Test - Every field filled in")
          assert.isNotNull(res.body._id,"Id should also be filled")
          assert.isNotNull(res.body.created_on,"Createdon should also be filled")
          assert.isNotNull(res.body.updated_on,"Updated should also be filled")
          savedObjectId= res.body._id
          console.log(savedObjectId)
          done();
        });
      });
      
      test('Missing required fields', function(done) {
       this.timeout(10000)
       chai.request(server)
        .post('/api/issues/test')
        .send({
          assigned_to: 'Chai and Mocha',
          status_text: 'In QA'
        })
        .end(function(err, res){
          console.log('status is ' + res.status)
          assert.equal(res.status, 400);
          done();
        });
      });
      
    });
    
    suite('PUT /api/issues/{project} => text', function() {
      
      test('No body', function(done) {
               this.timeout(10000)
       chai.request(server)
        .put('/api/issues/test')
        .send()
        .end(function(err, res){
          console.log('status is ' + res.status)
          assert.equal(res.status, 400);
          console.log(res.text)
          assert.equal(res.text,"could not update ")
          done();
        });
      });
    
      
      test('One field to update', function(done) {
        chai.request(server)
        .put('/api/issues/test')
        .send({
          _id:savedObjectId,
          open:"false"
        })
        .end(function(err, res){
          console.log('status is ' + res.status)
          assert.equal(res.text,"succesfully updated")
          done();
        });
      });
      
      test('Multiple fields to update', function(done) {
        chai.request(server)
        .put('/api/issues/test')
        .send({
          _id:savedObjectId,
          issue_text:"Changing the issue_text",
          issue_title:"TitleNew",
          created_by:"fafk"
        })
        .end(function(err, res){
          console.log('status is ' + res.status)
          assert.equal(res.text,"succesfully updated")
          done();
        });        
      });
      
    });
    
    suite('GET /api/issues/{project} => Array of objects with issue data', function() {
      
      test('No filter', function(done) {
        chai.request(server)
        .get('/api/issues/test')
        .query({})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], '_id');
          done();
        });
      });
      
      test('One filter', function(done) {
        chai.request(server)
        .get('/api/issues/test')
        .query({issue_title:"TitleNew"})
        .end(function(err, res){
          assert.equal(res.status, 200);
          console.log(res.body)
          assert.isArray(res.body);
          // assert.deepEqual(res.body.length,1)
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], '_id');
          // assert.deepEqual(res.body[0]._id,savedObjectId)
          done();
        });
      });
      
      test('Multiple filters (test for multiple fields you know will be in the db for a return)', function(done) {
                chai.request(server)
        .get('/api/issues/test')
        .query({issue_title:"TitleNew",
        issue_text:"Changing the issue_text"})
        .end(function(err, res){
          assert.equal(res.status, 200);
          console.log(res.body)
          assert.isArray(res.body);
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], '_id');
          // assert.deepEqual(res.body[0]._id,savedObjectId)
          done();
        });
      });
      
    });
    
    suite('DELETE /api/issues/{project} => text', function() {
      
      test('No _id', function(done) {
         chai.request(server)
         .delete('/api/issues/test')
         .send()
         .end((req,res)=>{
           assert.equal(res.status,200)
           assert.deepEqual(res.text,"id should not be empty")
           done()
         })
      });
      
      test('Valid _id', function(done) {
         chai.request(server)
         .delete('/api/issues/test')
         .send({
           _id:savedObjectId
         })
         .end((req,res)=>{
           assert.equal(res.status,200)
           assert.deepEqual(res.text,'deleted '+savedObjectId)
           done()
         })
      });
      
    });

});
