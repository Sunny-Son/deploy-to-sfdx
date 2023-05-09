var jsforce = require("jsforce");
var path = require("path");
var configpath = path.normalize("./");
//var config = require(configpath+"config.js");
const logger = require('heroku-logger');
var conn = new jsforce.Connection();
//var conn;

var loggedIn = false;

//Sign up for a free Developer Edition at https://developer.salesforce.com/signup

//For username / password flow
/*
var username = process.env.username || config.username || null;
var password = process.env.password || config.password || null;
var varinstanceUrl = process.env.instanceUrl || config.instanceUrl || null;
var varaccesstoken = process.env.accesstoken || config.accesstoken || null;


var production = process.env.production || config.production || false; //for sandbox and scratch orgs, set to false
if(production === "true" || production === "false") { production = (production === "true"); }

var deployToWeb = process.env.deployToWeb || config.deployToWeb ||true;
if(deployToWeb === "true" || deployToWeb === "false") { deployToWeb = (deployToWeb === "true"); }

console.log('production : ' + production);
/*

Commented code below can be used to set up a web based oauth flow instead
of username and password.  Doing so will require a connected app and a user
with the correct IP permissions.

Learn more here:
https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/intro_understanding_authentication.htm

*/


var response_good  = {
    status:200,
    ok: true,
    redirected: false,
  };
  
  var response_bad  = {
    status:200,
    ok: false,
    redirected: false,
    errormsg: null,
  };

  
//Log in using username and password, set loggedIn to true and handle a callback
//
function login(varusername, varpassword) {
    conn.loginUrl = 'https://test.salesforce.com';
    //conn.loginUrl = varinstanceurl;
    var callback = null;
    if(varusername && varpassword) {
        console.log('loginurl = ' + conn.loginUrl);
        conn.login(varusername, varpassword, function(err, res) {
            if (err) { return console.error(err); }
            else {
                loggedIn = true;
                console.log("Succcessfully logged into Salesforce.");
                console.log(res);
                return;
            }
          });
    }
    else {
        console.log("Username and password not setup.")
    }

}


function trailhead(callbackstring) {
    try {
        console.log('callbackstring : [' + callbackstring + ']');
        //if(callbackstring == 'checkTravelApprovalRecord') callback=checkTravelApprovalRecord;
        if(callbackstring == 'checkTravelApprovalRecord') {
            console.log('trailhead.js : checkTravelApprovalRecord');
            var _return_value = checkTravelApprovalRecord();
            console.log(_return_value);
            return _return_value;
        }
        //if(callbackstring == 'checkDashboards') callback=checkDashboards;
        if(callbackstring == 'checkDashboards') {
            console.log('trailhead.js : checkDashboards');
            return checkDashboards();
        }
        if(callbackstring == 'checkReports') {
            console.log('trailhead.js : checkReports');
            return checkReports();
            //   callback=checkReports;
        }
    } catch(err) {
        console.error(err);
    }
    
    return response_bad;

}

function displayTravelApprovalRecord() {
    conn.query("SELECT Department__c, Destination_State__c, Purpose_of_Trip__c, Total_Expenses__c FROM Travel_Approval__c", function(err, result) {
        if (err) { return console.error(err); }
        console.log("total : " + result.totalSize);
        for (var i=0; i<result.records.length; i++) {
            var record = result.records[i];
            console.log("Department: " + record.Department__c);
            console.log("Destination State: " + record.Destination_State__c);
            console.log("Purpose of Trip: " + record.Purpose_of_Trip__c);
            console.log("Total Expenses: " + record.Total_Expenses__c);
        }
      });
}

function checkTravelApprovalRecord() {
    var query_string = 'SELECT Department__c, Destination_State__c, Purpose_of_Trip__c, Total_Expenses__c';
    query_string += ' FROM Travel_Approval__c';
    query_string += ' WHERE Destination_State__c = \'KR\'';
    query_string += ' AND Purpose_of_Trip__c = \'Salesforce Live\'';
    console.log('checkTravelApprovalRecord : ready to query');
    conn.query(query_string)
        .then (function(err, result) {
            console.log("total : " + result.totalSize);
            if(result.totalSize > 0) {
                for (var i=0; i<result.records.length; i++) {
                    var record = result.records[i];
                    console.log("Department: " + record.Department__c);
                    console.log("Destination State: " + record.Destination_State__c);
                    console.log("Purpose of Trip: " + record.Purpose_of_Trip__c);
                    console.log("Total Expenses: " + record.Total_Expenses__c);
                }
                console.log("success :" + JSON.stringify(response_good));
                    return JSON.stringify(response_good);
                } else {
                    console.log("Task #1 isn't achived yet");
                    response_bad.errormsg = 'There is no data yet!! please input!!';
                    console.log("fail :" + JSON.stringify(response_bad));
                    return JSON.stringify(response_bad);
                }
        }, function(err) {
            return JSON.stringify(response_bad);
        });
}

/*
function checkTravelApprovalRecord() {
    var query_string = 'SELECT Department__c, Destination_State__c, Purpose_of_Trip__c, Total_Expenses__c';
    query_string += ' FROM Travel_Approval__c';
    query_string += ' WHERE Destination_State__c = \'KR\'';
    query_string += ' AND Purpose_of_Trip__c = \'Salesforce Live\'';
    console.log('checkTravelApprovalRecord : ready to query');
    conn.query(query_string, function(err, result) {
        if (err) { 
            esponse_bad.errormsg = 'Unknown Error';
            console.log("fail :" + JSON.stringify(response_bad));
            return response_bad;
        }
        console.log("total : " + result.totalSize);
        if(result.totalSize > 0) {
          for (var i=0; i<result.records.length; i++) {
            var record = result.records[i];
            console.log("Department: " + record.Department__c);
            console.log("Destination State: " + record.Destination_State__c);
            console.log("Purpose of Trip: " + record.Purpose_of_Trip__c);
            console.log("Total Expenses: " + record.Total_Expenses__c);
          }
          console.log("success :" + JSON.stringify(response_good));
            return JSON.stringify(response_good);
        } else {
          console.log("Task #1 isn't achived yet");
          response_bad.errormsg = 'There is no data yet!! please input!!';
          console.log("fail :" + JSON.stringify(response_bad));
            return JSON.stringify(response_bad);
        }
      });
}
*/
function displayReports() {
    conn.query("SELECT Id, DeveloperName, FolderName, Name FROM Report", function(err, result) {
        if (err) { return console.error(err); }
        console.log("total : " + result.totalSize);
        for (var i=0; i<result.records.length; i++) {
            var record = result.records[i];
            //console.log("Id: " + record.Id);
            //console.log("DeveloperName State: " + record.DeveloperName);
            //console.log("Report Name: " + record.Name);
            //console.log("Report Name: " + record.FolderName);

            //var report = conn.analytics.report(record.Id);
            conn.analytics.report(record.Id).describe(function(err, meta) {
            //report.execute(function(err, result) {
                if (err) { return console.error(err); }
                var varreportname = meta.reportMetadata.name;
                var vardetailcolumns = meta.reportMetadata.detailColumns;
                var vargroupingColumnInfo = JSON.stringify(meta.reportExtendedMetadata.groupingColumnInfo);
                  console.log('---------------------');
                  console.log(meta.reportMetadata);
                  console.log('---------------------');
                  console.log(meta.reportTypeMetadata);
                  console.log('---------------------');
                  console.log(meta.reportExtendedMetadata);
            });
        }
      });
}

function checkReports() {
  conn.query("SELECT Id, DeveloperName, FolderName, Name FROM Report", function(err, result) {
      if (err) { return console.error(err); }
      //console.log("total : " + result.totalSize);
      var _report_exist = false;
      console.log('++ checkReports : Travel Requests by Department');
      for (var i=0; i<result.records.length; i++) {
          var record = result.records[i];
          //console.log("Id: " + record.Id);
          //console.log("DeveloperName State: " + record.DeveloperName);
          //console.log("Report Name: " + record.Name);
          //console.log("Report Name: " + record.FolderName);

          //var report = conn.analytics.report(record.Id);
          conn.analytics.report(record.Id).describe(function(err, meta) {
          //report.execute(function(err, result) {
              if (err) { return console.error(err); }
              var varreportname = meta.reportMetadata.name;
              var vardetailcolumns = meta.reportMetadata.detailColumns;
              var vargroupingColumnInfo = JSON.stringify(meta.reportExtendedMetadata.groupingColumnInfo);
              if (varreportname == 'Travel Requests by Department') {
                var string_meta = meta.reportMetadata.toString();
                console.log('Passed #1 - Report Name');
                _report_exist = true;
                //var varreportname = meta.reportMetadata.name;
                //console.log(varreportname);

                if(vardetailcolumns.includes('Travel_Approval__c.Out_of_State__c')
                && vardetailcolumns.includes('Travel_Approval__c.Purpose_of_Trip__c')
                && vardetailcolumns.includes('Travel_Approval__c.Status__c')
                && vardetailcolumns.includes('Travel_Approval__c.Trip_Start_Date__c')
                && vardetailcolumns.includes('Travel_Approval__c.Trip_End_Date__c')
                )
                {
                  console.log('Passed #2 - Columns');
                  //console.log(vardetailcolumns);
                } else {
                  console.error('need detailcolumns exactly');
                  response_bad.errormsg = 'need detailcolumns exactly';
                  console.log("fail :" + JSON.stringify(response_bad));
                  return response_bad;
                }

                if(vargroupingColumnInfo.includes('Travel_Approval__c.Department__c')) {
                  console.log('Passed #3 - Grouping');
                  //console.log(vargroupingColumnInfo);
                } else {
                  console.error('need Grouping exactly');
                  response_bad.errormsg = 'need Grouping exactly';
                  console.log("fail :" + JSON.stringify(response_bad));
                  return response_bad;
                }
                console.log("success :" + JSON.stringify(response_good));
                return JSON.stringify(response_good);
              } else {
                //console.log('FAIL : You should create report!!!');
              }
          });
      }
    });
    if(_report_exist == false) {
        esponse_bad.errormsg = 'Create Report Please';
    } else response_bad.errormsg = 'Unknown Error';

    console.log("fail :" + JSON.stringify(response_bad));
    return JSON.stringify(response_bad);
}


function checkDashboards() {
    console.log('trailhead.js : checkDashboard : begin');
    conn.query("SELECT Id, DeveloperName, FolderName, Title FROM Dashboard", function(err, result) {
        if (err) { return console.error(err); }
        console.log("total : " + result.totalSize);
        for (var i=0; i<result.records.length; i++) {
            var record = result.records[i];
            console.log(record);
            console.log("Id: " + record.Id);
            console.log("DeveloperName : " + record.DeveloperName);
            console.log("Report Folder Name: " + record.FolderName);
            console.log("Report Title: " + record.Title);

            if(record.Title != 'Travel Requests Dashboard') continue;
            else console.log('title passed');
            if(record.FolderName != 'Private Dashboards') continue;
            else console.log('FolderName passed');

            var _request = {
            url: '',
            method: 'get',
            body: '',
            headers : {
                    "Content-Type" : "application/json"
                }
            };

            _request.url = '/services/data/v57.0/analytics/dashboards/' + record.Id + '/describe';

            conn.request(_request, function(err, resp) {
            //console.log(JSON.stringify(resp));
            var vardashboardcheck = JSON.stringify(resp);
            if(vardashboardcheck.includes('\"header\":\"Travel Requests by Department\"')
                && vardashboardcheck.includes('\"name\":\"Travel_Approval__c.Department__c\"')
                && vardashboardcheck.includes('\"visualizationType\":\"Bar\"')
                && vardashboardcheck.includes('\"name\":\"RowCount\"')
                && vardashboardcheck.includes('\"header\":\"Travel Requests by Month\"')
                && vardashboardcheck.includes('\"name\":\"Travel_Approval__c.Trip_End_Date__c\"')
                && vardashboardcheck.includes('\"name\":\"Travel_Approval__c.Out_of_State__c\"')
                && vardashboardcheck.includes('\"visualizationType\":\"Column\"')
                && vardashboardcheck.includes('\"groupByType\":\"stacked\"')
                && vardashboardcheck.includes('\"visualizationType\":\"Column\"')
            ) {
                console.log("success :" + JSON.stringify(response_good));
                return response_good;
            }
            });
        }
    });

    console.log("fail :" + JSON.stringify(response_bad));
    return response_bad;

}

function displayDashboards2() {
    conn.query("SELECT Id, DeveloperName, FolderName, Title FROM Dashboard", function(err, result) {
        if (err) { return console.error(err); }
        console.log("total : " + result.totalSize);
        for (var i=0; i<result.records.length; i++) {
            var record = result.records[i];
            console.log("Id: " + record.Id);
            console.log("DeveloperName : " + record.DeveloperName);
            console.log("Report Folder Name: " + record.FolderName);
            console.log("Report Title: " + record.Title);

        }
      });
}

//to test out the above code on the command line:
//node index.js {command}
//
//where command is one of the case statements below
//module.exports = { login, checkTravelApprovalRecord, checkReports, checkDashboards};
module.exports = { login, trailhead };

var callback = null;
if (process.argv[2]) {
    console.log(process.argv[2]);
    switch(process.argv[2]) {
        case 'displayContactsSOQL':
            console.log('1');
            callback = displayContactsSOQL;
            break;
        case 'displayContactsEventMethod':
            console.log('2');
            callback = displayContactsEventMethod;
            break;
        case 'displayContactsMethodChain':
            console.log('3');
            callback = displayContactsMethodChain;
            break;
        case 'createContact':
            callback = createContact;
            break;
        case 'updateContact':
            callback = updateContact;
            break;
        case 'deleteContact':
            callback = deleteContact;
            break;
        // Inserted by Insun for test
        case 'displayTravelApprovalRecord':
            callback = displayTravelApprovalRecord;
            break;
        case 'checkTravelApprovalRecord':
            callback = checkTravelApprovalRecord;
            break;
        case 'displayReports':
            callback = displayReports;
            break;
        case 'checkReports':
            callback = checkReports;
            break;
        case 'checkDashboards':
            callback = checkDashboards;
            break;
    }
}
//login(callback);
