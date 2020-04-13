// Import libraries
const dotenv = require('dotenv');
const mysql = require('mysql2');
const express = require('express');
const bodyParser = require('body-parser')
const multer = require('multer')
const url = require('url');
const ejs = require("ejs");
const {PythonShell} = require('python-shell')
const fs = require('fs')
const app = express()
const AWS = require('aws-sdk');
// #Load the environment variables
dotenv.config();

// Telling express to use ejs view engine and files are stored in public and for parsing the request
app.use(express.static('public'))
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));


// Multer To decide the storage location
var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './uploads');
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});

var upload = multer({
  storage: storage
});

// Creating an SQL connection with a Database
var con = mysql.createConnection({
  host: process.env.host,
  user: process.env.user,
  password: process.env.password,
  database: 'dashboardDB'
});
// Creating connection and using the DashboardDB database when the server is run.
con.connect(function(err) {
  if (err) throw err;
  con.query('USE dashboardDB;', function() {
    console.log("Used dashboardDB")
  });
  console.log("Connected to RDS Database");
});
//   con.end();
// });


// FOr python file exection that returns accuracy
var options = {
  mode: 'text',
  // pythonPath: 'path/to/python',
  pythonOptions: ['-u'],
  // scriptPath: 'test.py',
};

// AWS configuration
AWS.config.update(
  {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.Region
  }
);
// Initiating S3 object
var s3 = new AWS.S3();


let messages=['Sorry we don\'t have any submissions for this assignment',
'Please find the submission for the assignment']
let mySubMessage=['You don\'t have any submissions for this assignment',
'Please find the submission for the assignment']



// Home directory path, It will render home content
app.get("/", function(req, res) {
  res.render('home')
})



// After submitting the submission form, we get a request with form details
app.post('/post', upload.single('file'), function(req, res, next) {

  // Getting all the parameters of the form
  var email = req.body.email;
  var name = req.body.name;
  var assignment = req.body.assignment;
  var filepath = req.file.path;
  var message= req.body.aboutSub;
  var metric;
  var ytest_filepath='./dataFiles/y_test.csv';
  var bucket_filepath;

  // Declared a async function to wait till the query returns the output
  async function main() {

    // Function to get metric for that particular assignment
    await con.promise().query("SELECT * from assignments where id=?", assignment)
      .then(([rows, fields]) => {
        metric = rows[0].metric;
        bucket_filepath= rows[0].filename;
      });

    // .then( () => con.end());
    // console.log("metirc is" + metric);

    bucket_filepath='Assignment_test_files/'+bucket_filepath
    var bucket_options = {
        Bucket    : 'aaic-classroom-dashboard',
        Key    : bucket_filepath,
    };

    await  s3.getObject(bucket_options).promise()
        .then(function(data){
          fs.writeFileSync(ytest_filepath, data.Body.toString());
          console.log('File has been written successfully');
        })
        .catch(function(get_objerr){
          console.log(get_objerr);
        })

    // Adding the metric, and file path as params to python file
    options.args = [filepath, metric]
    // Running the python file that will give me an accuracy_score
    PythonShell.run('test.py', options, function(err, results) {
      // Deleting the uploaded file after getting any error or results:
      try {
        fs.unlinkSync(filepath)
        fs.unlinkSync(ytest_filepath)
        //file removed
      } catch(file_err) {
        console.log(file_err)
      }

      if (err){
        // If any failure in calcuclating python code it will throw the error
        res.render('failure',{error:err})
        return;
        }
      // Results is an array consisting of messages collected during execution
      var r = results;
      // Query to update the Database with the content
      let q=`INSERT INTO user (username,email,score,assignment,message) VALUES ('${name}','${email}','${r}','${assignment}','${message}');`
      con.query(q, function(upd_error, upd_result, upd_fields) {
        if (upd_error) {
          throw upd_error
        } else {
          // If the result is success we are redirecting it to success route
          var url_s = url.format({pathname: "/success",
            query: {
                  "email": email,
                  "assignment": assignment,
                   }
            })

          res.redirect(url_s);
        }

      })

    })
  }
  main();
})


app.get('/success', function(req, res) {

  console.log(req.query)
  email = req.query.email;
  assignment = req.query.assignment;

  // SQL query to get the details of the submission along with the submission count
  let q=`select u.email,u.id,score,u.assignment,subcount from (select email,max(id) as id,count(*) as subcount,assignment
  from user where assignment=${assignment} and email='${email}' group by email,assignment) r
  INNER JOIN user u ON u.email = r.email AND u.id = r.id;`

  con.query(q, function(upd_error, upd_result, upd_fields) {
    if (upd_error) {
      console.log(upd_error)
      throw upd_error

    } else {
      // If the submission was succesful we are rendering success view with the details of the submission
      res.render('success', {
        name: email,
        assignment: assignment,
        score: upd_result[0].score,
        subcount:upd_result[0].subcount
      })
    }
  })

})

// Function that handles the get request of leaderboard page
app.get('/leaderboard', function(req, res) {

  res.render('leaderboard', {
    users: [],assignment:'',message:''
  })
})

// Route that handles post requests to leaderboard route
app.post('/leaderboard', function(req, res) {
  var assignment = req.body.assignment;

// Query that returns all the users rank wise of a particular assignment
  let q = `select username,u.email,score,u.assignment,RANK() OVER (ORDER BY score DESC) AS position, subcount
        from (select MAX(score) as r_score,count(*) as subcount,id from user where assignment=${assignment} group by email,assignment) r
        INNER JOIN user u
        ON u.id =r.id;`

  con.query(q, function(upd_error, upd_result, upd_fields) {
    if (upd_error) {
      console.log(upd_error)
      throw upd_error

    } else {
      if (upd_result.length > 0) {
        res.render('leaderboard', {  users: upd_result,assignment: assignment,message: messages[1]})
      } else {
        res.render('leaderboard', {users: upd_result,assignment: assignment,message: messages[0]})
      }

    }
  })

})

// route that handles the get request to my submission page
app.get('/mysubmission',function(req,res){
  res.render('mysubmission',{results:[],email:'',assignment:'none',mySubMessage:''})
})

// route that handles the post request to my submission page
app.post('/mysubmission',function(req,res){
  var assignment=req.body.assignment;
  var email =req.body.email;
// Query that returns all the submissions given an email and assignment
  let q=`select score,message from user where email='${email}' and assignment=${assignment};`
  con.query(q, function(upd_error, upd_result, upd_fields) {
    if(upd_error){

      throw upd_error
    }
    else
    {
      // console.log(upd_result);
      if(upd_result.length>0){
          res.render('mysubmission',{results:upd_result,email:email,assignment:assignment,mySubMessage:mySubMessage[1]})
      }
      else
      {
        res.render('mysubmission',{results:upd_result,email:email,assignment:assignment,mySubMessage:mySubMessage[0]})
      }
    }
  })

})


// Function for creating a server at a particular port
app.listen(8080, function() {
  console.log("Server has started at 8080")
})
