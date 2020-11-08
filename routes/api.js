/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
var ObjectId = require('mongodb').ObjectID;
var bodyParser = require('body-parser')
var mongoose = require('mongoose')
var _ = require('underscore')


var mongo_url = process.env.DB
mongoose.connect(mongo_url, {
	useNewUrlParser: true,
	useUnifiedTopology: true
}).catch(error => console.log(error));

var projectSchema = new mongoose.Schema({
	project_title: {
		type: String,
		required: true,
		select: false
	},
	issue_title: {
		type: String,
		required: true
	},
	issue_text: {
		type: String,
		required: true
	},
	created_by: {
		type: String,
		required: true
	},
	assigned_to: {
		type: String,
		required: false
	},
	status_text: {
		type: String,
		required: false
	},
	created_on: {
		type: Date
	},
	updated_on: {
		type: Date
	},
	open: {
		type: Boolean
	}
});

var Project = mongoose.model('project', projectSchema);


module.exports = function (app) {

	app.route('/api/issues/:project')

		.get(function (req, res) {
			var project = req.params.project;
			var issue_title = req.query.issue_title||''
			var issue_text = req.query.issue_text||''
			var created_by = req.query.created_by||''
			var assigned_to = req.query.assigned_to || ''
			var status_text = req.query.status_text || ''
			var dateNow = new Date().toISOString()
	var stateFromRequest = req.query.open
			var incomingState = null;
			if (stateFromRequest != undefined) {
        if(stateFromRequest.toLowerCase() == 'false'){
          incomingState = false
        }else if(stateFromRequest.toLowerCase() == 'true'){
          incomingState = true
        }else{
          res.status(400).send("Invalid query param for open")
          return
        }
			}

      var findObject = {}
      findObject.project_title = project

            if (issue_title.length  !=0){
              findObject.issue_title = issue_title
            }
            if (issue_text.length  !=0){
              findObject.issue_text = issue_text
            }
            if (created_by.length  !=0){
              findObject.created_by = created_by
            }

            if (assigned_to.length  !=0){
              findObject.assigned_to = assigned_to
            }
            if (status_text.length  !=0){
              findObject.status_text = status_text
            }
if(incomingState!=null){
  findObject.open=incomingState
}
console.log(findObject)
			Project.find(findObject).select('-__v').exec(function (err, data) {
				if (err) {
					console.log(err)
					res.status(500).send("INTERNAL ERROR")
					done(err, null)
				} else {
					res.json(data)
				}
			})
		})

		.post(function (req, res) {
			var project = req.params.project;
			var issue_title = req.body.issue_title||""
			var issue_text = req.body.issue_text||""
			var created_by = req.body.created_by||""
			var assigned_to = req.body.assigned_to || ''
			var status_text = req.body.status_text || ''
			var dateNow = new Date().toISOString()
			if (issue_title == "" || issue_text == "" || created_by == "") {
				res.status(400).send("Input parameters are missing")

			} else {
				//  Project.findone({"project_title":project},(err,data)=>)
				// console.log(req.body)
				// console.log(req.params)
				var newIssue = new Project({
					project_title: project,
					issue_title: issue_title,
					issue_text: issue_text,
					created_by: created_by,
					assigned_to: assigned_to,
					status_text: status_text,
					created_on: dateNow,
					updated_on: dateNow,
					open: true
				})

				// console.log(newIssue)
				newIssue.save(function (err, data) {
					if (err) {
						console.log(err)
						res.status(500).send("Internal Server Error")
					} else {
						var result = _.omit(data.toJSON(), '__v', 'project_title')
						res.json(result)
					}
				})
			}
		})

		.put(function (req, res) {
			var project = req.params.project;
			var stateFromRequest = req.body.open
			var incomingState = true;
			if (stateFromRequest != undefined) {
        if(stateFromRequest.toLowerCase() == 'false'){
          incomingState = false
        }else if(stateFromRequest.toLowerCase() == 'true'){
          incomingState = true
        }
			}

      console.log('Type of State:  '+ typeof(incomingState))
			var issue_title = req.body.issue_title||''
			var issue_text = req.body.issue_text||''
			var created_by = req.body.created_by||''
			var assigned_to = req.body.assigned_to || ''
			var status_text = req.body.status_text || ''
			var dateNow = new Date().toISOString()
			var issue_id = req.body._id||''

			var dateNow = new Date().toISOString()

			Project.findById({
				"_id": issue_id
			}, function (err, data) {
        //data is the saved object already in db

        //check if there is any error while processing db request 
        // or no data exists with this id, data will be undefined. 
        
        if(err || !data){
            res.status(400).send("could not update " + issue_id)
            return
        }
        data.updated_on = dateNow

				if ((issue_title == "") && (issue_text == "") && (created_by == "") && (assigned_to == "") && (status_text == "")) {
            console.log('coming into all empty condition')
					if (data.open === incomingState) {
                        console.log('coming into all empty condition with no state change')
              res.status(200).send("no updated field sent")
              return;
					} else {
             console.log('coming into all empty condition with  state change')
                data.open = incomingState
					}
				} else {
             console.log('coming into not all empty condition w/o  state change')
					if (data.open != incomingState) {
              data.open = incomingState
					}
            if (issue_title.length  !=0){
              data.issue_title = issue_title
            }
            if (issue_text.length  !=0){
              data.issue_text = issue_text
            }
            if (created_by.length  !=0){
              data.created_by = created_by
            }

            if (assigned_to.length  !=0){
              data.assigned_to = assigned_to
            }
            if (status_text.length  !=0){
              data.status_text = status_text
            }
				}
      // console.log('Updated Object : ' + JSON.stringify(data.toJSON()))
        data.save().then(result=>{
            res.send("succesfully updated")
        }).catch(err=>{
            res.send("could not update " + issue_id)
        })
			})
		})

		.delete(function (req, res) {
			var project = req.params.project;
      var issue_id = req.body._id
      if(!issue_id){
        res.send("id should not be empty") 
        return       
      }
      Project.findByIdAndRemove({
				"_id": issue_id
        },{useFindAndModify:false}, function(err,data){
            if (err) {
                res.send('could not delete '+issue_id)
            }
            else {
              if(!data){
                res.send('could not delete '+issue_id)                
              }else{
                res.send('deleted '+issue_id);
              }
            }
        });

});

	};