var jsforce = require("jsforce");
var path = require("path");
var configpath = path.normalize("./");
//var config = require(configpath+"config.js");
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
var deployToWeb = false;

if(deployToWeb) {
    var port = process.env.PORT || 8675;
    var express = require('express');
    var app = express();

    var oauth2 = null;
    var publicKey =  process.env.publicKey || config.publicKey || null;
    var privateKey =  process.env.privateKey || config.privateKey || null;


    if(publicKey && privateKey) {
        var oauth2 = new jsforce.OAuth2({
            // you can change loginUrl to connect to sandbox or prerelease env.
            // loginUrl : 'https://test.salesforce.com',
            clientId : publicKey,
            clientSecret : privateKey,
            redirectUri : '/oauth2/auth'
        });

                //
        // Get authorization url and redirect to it.
        //

        app.get('/oauth2/auth', function(req, res) {
            res.redirect(oauth2.getAuthorizationUrl({ scope : 'api id web' }));
        });
    }

    app.get('/', function(req, res) {
        res.json({"status":"online"});
    });

    app.get('/contacts/', function(req, res) {
        conn.query("SELECT Id, Name, CreatedDate FROM Contact", function(err, result) {
            if (err) { res.json(err); }
            console.log("total : " + result.totalSize);
            res.json(result);
          });
    });

    //setup actual server
    var server = app.listen(port, function () {

        console.log('jsforce sample running on '+port);
    });
}

//Log in using username and password, set loggedIn to true and handle a callback
//
function login(varusername, varpassword, varinstanceurl, callbackstring) {
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
                console.log('action = ' + callback);
                if(callbackstring == 'checkTravelApprovalRecord') callback=checkTravelApprovalRecord;
                if(callback){callback();}
            }
          });
    }
    else {
        console.log("Username and password not setup.")
    }

    /*
    if(varinstanceUrl && varaccesstoken) {
        console.log('varinstanceUrl = ' + varinstanceUrl);
        console.log('varaccesstoken = ' + varaccesstoken);

        conn = new jsforce.Connection({
            instanceUrl: varinstancelUrl,
            accessToken: varaccesstoken
        });
        /*
        conn.login(username, password, function(err, res) {
            if (err) { return console.error(err); }
            else {
                loggedIn = true;
                console.log("Succcessfully logged into Salesforce.");
                console.log(res);
                if(callback){callback();}
            }
          });

    }
    else {
        console.log("instanceUrl and accesstoken not setup.")
    }*/
}

/*

Below are three different styles of querying records that jsforce supports
For more on data modeling in Salesforce: https://trailhead.salesforce.com/en/content/learn/modules/data_modeling

*/

//find contacts using plain SOQL
//More on SOQL here: https://trailhead.salesforce.com/en/content/learn/modules/apex_database
function displayContactsSOQL() {
    conn.query("SELECT Id, Name, CreatedDate FROM Contact", function(err, result) {
        if (err) { return console.error(err); }
        console.log("total : " + result.totalSize);
        for (var i=0; i<result.records.length; i++) {
            var record = result.records[i];
            console.log("Name: " + record.Name);
            console.log("Created Date: " + record.CreatedDate);
        }
      });
}


//find contacts by listening to events
function displayContactsEventMethod() {
    console.log('event');

    var records = [];
    var query = conn.query("SELECT Id, Name FROM Contact")
    .on("record", function(record) {
        records.push(record);
        console.log(record);
    })
    .on("end", function() {
        console.log("total fetched : " + query.totalFetched);
    })
    .on("error", function(err) {
        console.error(err);
    })
    .run({ autoFetch : true }); // synonym of Query#execute();
}

//find contacts by constructing the query in a method chain
function displayContactsMethodChain() {
    //
    // Following query is equivalent to this SOQL
    //
    // "SELECT Id, Name, CreatedDate FROM Contact
    //  WHERE LastName LIKE 'A%'
    //  ORDER BY CreatedDate DESC, Name ASC
    //  LIMIT 5"
    //
    console.log('method');
    conn.sobject("Contact")
        .find({
        FirstName : { $like : 'Demo%' }
        },
        'Id, Name, CreatedDate' // fields can be string of comma-separated field names
                                // or array of field names (e.g. [ 'Id', 'Name', 'CreatedDate' ])
        )
        .sort('-CreatedDate Name') // if "-" is prefixed to field name, considered as descending.
        .limit(5)
        .execute(function(err, records) {
        if (err) { return console.error(err); }
        console.log("record length = " + records.length);
        for (var i=0; i<records.length; i++) {
            var record = records[i];
            console.log("Name: " + record.Name);
            console.log("Created Date: " + record.CreatedDate);
        }
    });
}

function createContact() {
    console.log('create');
    conn.sobject("Contact").create({FirstName: 'APIDemo', LastName: 'User'}, function(err, ret) {
        if (err || !ret.success) { return console.error(err, ret); }
        else {
            console.log("Created record id : " + ret.id);
        }
      });
}

function updateContact() {
    // Single record update.  For multiple records, provide update() with an array
    // Always include record id in fields for update
    // You can also update and insert from the same array.
    conn.query("SELECT Id, Name FROM Contact WHERE FirstName = 'APIDemo'")
    .on("record", function(record) {
        conn.sobject("Contact").update({Id: record.Id, LastName: 'Smith'}, function(err, ret) {
            if (err || !ret.success) { return console.error(err, ret); }
            console.log('Updated Successfully : ' + ret.id);
        });
    });

}

function deleteContact() {
    conn.query("SELECT Id, Name FROM Contact WHERE FirstName = 'APIDemo'")
    .on("record", function(record) {
        conn.sobject("Contact").delete(record.Id, function(err, ret) {
            if (err || !ret.success) { return console.error(err, ret); }
            console.log('Deleted Successfully : ' + ret.id);
          });
    });
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
    conn.query(query_string, function(err, result) {
        if (err) { return console.error(err); }
        console.log("total : " + result.totalSize);
        if(result.totalSize > 0) {
          for (var i=0; i<result.records.length; i++) {
            var record = result.records[i];
            console.log("Department: " + record.Department__c);
            console.log("Destination State: " + record.Destination_State__c);
            console.log("Purpose of Trip: " + record.Purpose_of_Trip__c);
            console.log("Total Expenses: " + record.Total_Expenses__c);
          }
        } else {
          console.log("Task #1 isn't achived yet");
        }
      });
}

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
                  return false;
                }

                if(vargroupingColumnInfo.includes('Travel_Approval__c.Department__c')) {
                  console.log('Passed #3 - Grouping');
                  //console.log(vargroupingColumnInfo);
                } else {
                  console.error('need Grouping exactly');
                  return false;
                }
                return true;
              } else {
                //console.log('FAIL : You should create report!!!');
              }
          });
      }
    });
    return false;
}


function checkDashboards() {

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
            console.log("success");
            return true;
          }
        });
    }
    });

    return false;

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
module.exports = { login };

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
