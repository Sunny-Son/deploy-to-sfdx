var jsforce = require("jsforce");
var path = require("path");
var configpath = path.normalize("./");
//var config = require(configpath+"config.js");
const logger = require('heroku-logger');
//var conn = new jsforce.Connection();
var dashboard_meta = require('./meta/dashboard.json');


var loggedIn = false;

var response_good  = {
    status:200,
    ok: true,
    redirected: false,
    successmsg: null,
  };
  
  var response_bad  = {
    status:200,
    ok: false,
    redirected: false,
    errormsg: null,
  };

  
//Log in using username and password, set loggedIn to true and handle a callback
//
async function login(varusername, varpassword) {

    var conn = new jsforce.Connection();
    conn.loginUrl = 'https://test.salesforce.com';
    //conn.loginUrl = varinstanceurl;
    var callback = null;
    if(varusername && varpassword) {
        console.log('loginurl = ' + conn.loginUrl);
        await conn.login(varusername, varpassword, function(err, res) {
            if (err) { return console.error(err); }
            else {
                loggedIn = true;
                console.log("Succcessfully logged into Salesforce.");
                console.log(res);
                console.log("user id => CreatedById : [" + res.id + "]");
                //return res.id;
                return conn;
            }
          });
    }
    else {
        console.log("Username and password not setup.")
    }

}


async function trailhead(callbackstring) {
    try {
        console.log('trailhead.js : callbackstring : [' + callbackstring + ']');
        //if(callbackstring == 'checkTravelApprovalRecord') callback=checkTravelApprovalRecord;
        if(callbackstring == 'checkTravelApprovalRecord') {
            console.log('trailhead.js : checkTravelApprovalRecord');
            var _return_value = await checkTravelApprovalRecord();
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


// May 10th 2023 Insun - #1
async function trailhead_checkTravelApprovalRecord(_chk_username, _chk_password) {
    var _tmp1;

    var conn = new jsforce.Connection();
    conn.loginUrl = 'https://test.salesforce.com';
    
    var callback = null;
    if(_chk_username && _chk_password) {
        console.log('loginurl = ' + conn.loginUrl);
        await conn.login(_chk_username, _chk_password, function(err, res) {
            if (err) { return console.error(err); }
            else {
                loggedIn = true;
                //console.log("Succcessfully logged into Salesforce.");
                console.log(res);
                //console.log("user id => CreatedById : [" + res.id + "]");
                //return res.id;
                //return conn;
            }
          });
    }
    else {
        console.log("Username and password not setup.")
    }

    //conn = await login(_chk_username, _chk_password);
    var query_string = 'SELECT Department__c, Destination_State__c, Purpose_of_Trip__c, Total_Expenses__c';
    query_string += ' FROM Travel_Approval__c';
    query_string += ' WHERE Destination_State__c = \'KR\'';
    query_string += ' AND Purpose_of_Trip__c = \'Salesforce Live\'';
    query_string += ' AND Trip_Start_Date__c = 2023-05-23';
    query_string += ' AND Trip_End_Date__c = 2023-05-23';
    //query_string += ' AND CreatedById = \'' + _res_id + '\'';

    //SELECT Destination_State__c,Name,Purpose_of_Trip__c,Trip_End_Date__c,Trip_Start_Date__c FROM Travel_Approval__c WHERE Destination_State__c = 'KR' AND Purpose_of_Trip__c = 'Salesforce Live' AND Trip_Start_Date__c = 2023-05-23 AND Trip_End_Date__c = 2023-05-23
    //a008G000002OtzwQAC
    console.log('checkTravelApprovalRecord : ready to query');
    await conn.query(query_string, function(err, result) {
        if (err) { 
            response_bad.errormsg = 'Unknown Error';
            console.log("fail :" + JSON.stringify(response_bad));
            _tmp1 = response_bad;
            //return response_bad;
        } else {
            console.log("total : " + result.totalSize);
            if(result.totalSize > 0) {
                for (var i=0; i<result.records.length; i++) {
                    var record = result.records[i];
                    console.log("Department: " + record.Department__c);
                    console.log("Destination State: " + record.Destination_State__c);
                    console.log("Purpose of Trip: " + record.Purpose_of_Trip__c);
                    console.log("Total Expenses: " + record.Total_Expenses__c);
                }
                response_good.successmsg = '설명서에 표시된 데이터를 정확하게 입력하셨습니다! 축하합니다!!';
                console.log("success :" + JSON.stringify(response_good));
                _tmp1 = response_good;
                //return JSON.stringify(response_good);
            } else {
                //console.log("Task #1 isn't achived yet");
                response_bad.errormsg = '데이터가 정확하지 않습니다. 다시 확인 부탁드립니다.';
                console.log("fail :" + JSON.stringify(response_bad));
                _tmp1 = response_bad;
                //return JSON.stringify(response_bad);
            }
        }
      });
      return _tmp1;
}

// May 10th 2023 Insun - #2
async function trailhead_checkField(_chk_username, _chk_password) {
    var _tmp1;
  
    var conn = new jsforce.Connection();
    conn.loginUrl = 'https://test.salesforce.com';
    
    var callback = null;
    if(_chk_username && _chk_password) {
        console.log('loginurl = ' + conn.loginUrl);
        await conn.login(_chk_username, _chk_password, function(err, res) {
            if (err) { return console.error(err); }
            else {
                loggedIn = true;
                console.log("Succcessfully logged into Salesforce.");
                console.log(res);
                //console.log("user id => CreatedById : [" + res.id + "]");
                //return res.id;
                //return conn;
            }
          });
    }
    else {
        console.log("Username and password not setup.")
    }
    
    //var conn = await login(_chk_username, _chk_password);
    await conn.describe("Travel_Approval__c", function(err, meta) {
        if (err) { return console.error(err); }
        //console.log("total : " + meta.totalSize);
        //console.log('Label : ' + meta.label);
        //console.log('Num of Fields : ' + meta.fields.length);
        //console.log('Num of Fields : ' + JSON.stringify(meta));

        response_bad.errormsg = '설명서에 제시된 필드를 추가해 주세요.';
        _tmp1 = response_bad;

        for (var i=0; i<meta.fields.length; i++) {
            var record = meta.fields[i].name;
            //console.log("[" + i + "] field name : [" + record + "]");
            if(record == 'Transport_Type__c' &&  meta.fields[i].length == 255 && meta.fields[i].type == 'string') {
                response_good.successmsg = '필드를 정확하게 생성하였습니다. 축하합니다!!';
                _tmp1 = response_good;
            }
        }
    });
  
    return _tmp1;
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

// May 10th 2023 Insun - #3
async function trailhead_checkReports(_chk_username, _chk_password) {
    var _tmp1 = null;

    var conn = new jsforce.Connection();
    conn.loginUrl = 'https://test.salesforce.com';
    
    var callback = null;
    if(_chk_username && _chk_password) {
        console.log('loginurl = ' + conn.loginUrl);
        await conn.login(_chk_username, _chk_password, function(err, res) {
            if (err) { return console.error(err); }
            else {
                loggedIn = true;
                //console.log("Succcessfully logged into Salesforce.");
                console.log(res);
                //console.log("user id => CreatedById : [" + res.id + "]");
                //return res.id;
                //return conn;
            }
          });
    }
    else {
        console.log("Username and password not setup.")
    }
    
    //var conn = await login(_chk_username, _chk_password);
    var record;
    await conn.query("SELECT Id, DeveloperName, FolderName, Name FROM Report WHERE NAME = \'Travel Requests by Department\'", function(err, result) {
        if (err) { return console.error(err); }
        //console.log("total : " + result.totalSize);
        console.log('++ checkReports : Travel Requests by Department');
        if(result.records.length == 0) {
          response_bad.errormsg = '[Travel Requests by Department] 라는 리포트가 존재하지 않습니다';
          console.log("fail :" + JSON.stringify(response_bad));
          _tmp1 = response_bad;
          //return response_bad;
        } else record = result.records[0];
    });
    
    if(_tmp1 != null) return _tmp1;

    //console.log('Passed #1 - Report Name');
    //var record = result.records[0];
    await conn.analytics.report(record.Id).describe(function(err, meta) {
        //report.execute(function(err, result) {
        if (err) { return console.error(err); }
        var varreportname = meta.reportMetadata.name;
        var vardetailcolumns = meta.reportMetadata.detailColumns;
        var vargroupingColumnInfo = JSON.stringify(meta.reportExtendedMetadata.groupingColumnInfo);
        if(!vardetailcolumns.includes('Travel_Approval__c.Destination_State__c')) {
            response_bad.errormsg = 'Travel Request by Department에서 Destination State 컬럼이 선택되지 않았습니다.';
            console.log("fail :" + JSON.stringify(response_bad));
            _tmp1 = response_bad;
        } else if(!vardetailcolumns.includes('Travel_Approval__c.Status__c')) {
            response_bad.errormsg = 'Travel Request by Department에서 Status 컬럼이 선택되지 않았습니다.';
            console.log("fail :" + JSON.stringify(response_bad));
            _tmp1 = response_bad;
        } else if(!vardetailcolumns.includes('Travel_Approval__c.Trip_Start_Date__c')) {
            response_bad.errormsg = 'Travel Request by Department에서 Trip Start Date 컬럼이 선택되지 않았습니다.';
            console.log("fail :" + JSON.stringify(response_bad));
            _tmp1 = response_bad;
        } else if(!vardetailcolumns.includes('Travel_Approval__c.Trip_End_Date__c')) {
            response_bad.errormsg = 'Travel Request by Department에서 Trip End Date 컬럼이 선택되지 않았습니다.';
            console.log("fail :" + JSON.stringify(response_bad));
            _tmp1 = response_bad;
        } else {
            //console.log('Passed #2 - Columns');
            if(vargroupingColumnInfo.includes('Travel_Approval__c.Department__c')) {
                //console.log('Passed #3 - Grouping');
                //console.log(vargroupingColumnInfo);
                response_good.successmsg = 'Travel Request by Department 리포트를 정확하게 생성하셨습니다.';
                //console.log("success :" + JSON.stringify(response_good));
                _tmp1 = response_good;
            } else {
                response_bad.errormsg = 'Travel Request by Department 리포트에 Department 그룹 지정이 되지 않았습니다.';
                console.log("fail :" + JSON.stringify(response_bad));
                _tmp1 = response_bad;
                //return response_bad;
            }
        } 

       
    });
    if(_tmp1.ok == false) return _tmp1;

    // second report
    await conn.query("SELECT Id, DeveloperName, FolderName, Name FROM Report WHERE NAME = \'Travel Requests by Month\'", function(err, result) {
        if (err) { return console.error(err); }
        //console.log("total : " + result.totalSize);
        //console.log('++ checkReports : Travel Requests by Month');
        if(result.records.length == 0) {
          response_bad.errormsg = '[Travel Requests by Month] 라는 리포트가 존재하지 않습니다';
          console.log("fail :" + JSON.stringify(response_bad));
          _tmp1 = response_bad;
          //return response_bad;
        } else record = result.records[0];
    });
    
    if(_tmp1.ok == false) return _tmp1;

    console.log('Passed #1 - Report Name - Month');
    //var record = result.records[0];
    await conn.analytics.report(record.Id).describe(function(err, meta) {
        //report.execute(function(err, result) {
        if (err) { return console.error(err); }
        var varreportname = meta.reportMetadata.name;
        var vardetailcolumns = meta.reportMetadata.detailColumns;
        var vargroupingColumnInfo = JSON.stringify(meta.reportExtendedMetadata.groupingColumnInfo);

        if(!vardetailcolumns.includes('Travel_Approval__c.Destination_State__c')) {
            response_bad.errormsg = 'Travel Request by Month 에서 Destination State 컬럼이 선택되지 않았습니다.';
            console.log("fail :" + JSON.stringify(response_bad));
            _tmp1 = response_bad;
        } else if(!vardetailcolumns.includes('Travel_Approval__c.Department__c')) {
            response_bad.errormsg = 'Travel Request by Month 에서 Department 컬럼이 선택되지 않았습니다.';
            console.log("fail :" + JSON.stringify(response_bad));
            _tmp1 = response_bad;
        } else if(!vardetailcolumns.includes('Travel_Approval__c.Status__c')) {
            response_bad.errormsg = 'Travel Request by Month 에서 Status 컬럼이 선택되지 않았습니다.';
            console.log("fail :" + JSON.stringify(response_bad));
            _tmp1 = response_bad;
        } else if(!vardetailcolumns.includes('Travel_Approval__c.Trip_Start_Date__c')) {
            response_bad.errormsg = 'Travel Request by Month 에서 Start Date 컬럼이 선택되지 않았습니다.';
            console.log("fail :" + JSON.stringify(response_bad));
            _tmp1 = response_bad;
        } else {
            //console.log('Passed #2 - Columns');
            if(vargroupingColumnInfo.includes('Travel_Approval__c.Trip_End_Date__c') 
                && vargroupingColumnInfo.includes('Travel_Approval__c.Out_of_State__c') ) {
                //console.log('Passed #3 - Grouping');
                //console.log(vargroupingColumnInfo);
                response_good.successmsg = '2개의 리포트를 모두 정확하게 생성하셨습니다. 축하합니다!!';
                //console.log("success :" + JSON.stringify(response_good));
                _tmp1 = response_good;
            } else {
                response_bad.errormsg = 'Travel Request by Month에서 그룹 지정이 되지 않았습니다.';
                console.log("fail :" + JSON.stringify(response_bad));
                _tmp1 = response_bad;
                //return response_bad;
            }
        } 
        
    });
    return _tmp1;
   
}

// May 10th 2023 Insun - #4
async function trailhead_checkDashboards(_chk_username, _chk_password) {
    var _tmp1 = null;

    var conn = new jsforce.Connection();
    conn.loginUrl = 'https://test.salesforce.com';
    
    var callback = null;
    if(_chk_username && _chk_password) {
        console.log('loginurl = ' + conn.loginUrl);
        await conn.login(_chk_username, _chk_password, function(err, res) {
            if (err) { return console.error(err); }
            else {
                loggedIn = true;
                console.log("Succcessfully logged into Salesforce.");
                console.log(res);
                //console.log("user id => CreatedById : [" + res.id + "]");
                //return res.id;
                //return conn;
            }
          });
    }
    else {
        console.log("Username and password not setup.")
    }

    //var conn = await login(_chk_username, _chk_password);

    var record;
    await conn.query("SELECT Id, DeveloperName, FolderName, Title FROM Dashboard WHERE Title = \'Vehicle Dashboard\' and FolderName = \'Public1\'", function(err, result) {
        if (err) { return console.error(err); }
        //console.log('++ checkReports : Travel Requests Dashboard');
        if(result.records.length == 0) {
          response_bad.errormsg = '[Vehicle Dashboard] 대시보드가 [Public folder] 에 존재하지 않습니다. 부스에 문의 부탁드립니다';
          console.log("fail :" + JSON.stringify(response_bad));
          _tmp1 = response_bad;
          //return response_bad;
        } else record = result.records[0];
    });
    
    if(_tmp1 != null) return _tmp1;

    //console.log('Passed #1 - Dashboard Name');
    //var record = result.records[0];
    //console.log("total : " + result.totalSize);

    var _request = {
    url: '',
    method: 'get',
    body: '',
    headers : {
            "Content-Type" : "application/json"
        }
    };

    _request.url = '/services/data/v60.0/analytics/dashboards/' + record.Id + '/describe';

    await conn.request(_request, function(err, resp) {
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
            response_good.successmsg = '대시보드를 정확하게 생성하셨습니다. 축하합니다!!';
            //console.log("success :" + JSON.stringify(response_good));
            _tmp1 = response_good;
            //return response_good;
        } else {
            response_bad.errormsg = '대시보드를 다시 확인하시기 바랍니다.';
            console.log("fail :" + JSON.stringify(response_bad));
            _tmp1 = response_bad;
            //return response_bad;
        }
    });
    return _tmp1;
    
}

// May 10th 2023 Insun - #5
async function trailhead_resetOrg(_chk_username, _chk_password) {
    // 입력데이터 삭제
    // 수정 PATH등의 데이터 원위치
    // Dyanmic Form 원위치
    var _tmp1 = null;

    var conn = new jsforce.Connection();
    conn.loginUrl = 'https://test.salesforce.com';
    
    var callback = null;
    if(_chk_username && _chk_password) {
        console.log('loginurl = ' + conn.loginUrl);
        await conn.login(_chk_username, _chk_password, function(err, res) {
            if (err) { return console.error(err); }
            else {
                loggedIn = true;
                console.log("Succcessfully logged into Salesforce.");
                console.log(res);
                //console.log("user id => CreatedById : [" + res.id + "]");
                //return res.id;
                //return conn;
            }
          });
    }
    else {
        console.log("Username and password not setup.")
    }

    //var conn = await login(_chk_username, _chk_password);

    // Dynamic Forms reset

    /* 입력 데이터 삭제
    select username, alias, id from User where alias='UUser'
    
    conn.sobject('Vehicle__c')
    .find({ CreatedById : UUser ID })
    .destroy(function(err, rets) {
      if (err) { return console.error(err); }
      console.log(rets);
      // ...
    });
    */
    var record;
    await conn.query("SELECT username, alias, id FROM User WHERE alias='UUser'", function(err, result) {
        if (err) { return console.error(err); }
        //console.log('++ checkReports : Query Vehicle__c');
        if(result.records.length == 0) {
          response_bad.errormsg = '++ [trailhead_resetOrg] Data 가 존재하지 않습니다';
          console.log("fail :" + JSON.stringify(response_bad));
          _tmp1 = response_bad;
          //return response_bad;
        } else record = result.records[0];
        console.log('++ [trailhead_resetOrg] record ID : ' + record.Id);
    });

    if(_tmp1 != null) return _tmp1;

    await conn.sobject('Vehicle__c')
    .find({ CreatedById : record.Id})
    .destroy(function(err, result) {
        if (err) { 
          response_bad.errormsg = '++ [trailhead_resetOrg][Vehicle Data Delete] 삭제에 문제 발생';
          console.log("fail :" + JSON.stringify(response_bad));
          _tmp1 = response_bad;
        }
        console.log('++ [trailhead_resetOrg] Vehicle Data Deleted');
    });
    
    if(_tmp1 != null) return _tmp1;

    // Data Deletion Success Apr 18th --->

    /* Dashboard 복구

    */

    console.log('++ [trailhead_resetOrg] dashboard_meta : ' + dashboard_meta);
    console.log('++ [trailhead_resetOrg] dashboard_meta : ' + JSON.stringify(dashboard_meta));


     
    await conn.metadata.read('CustomObject', ['Vehicle__c', 'Account'], function(err, metadata) {
        if (err) { console.error(err); }
        for (var i=0; i < metadata.length; i++) {
            var meta = metadata[i];
            console.log("Full Name: " + meta.fullName);
            console.log("Fields count: " + meta.fields.length);
            console.log("Sharing Model: " + meta.sharingModel);
        }
        console.log('++ [trailhead_resetOrg] CustomObject : ');
    });
    
    await conn.metadata.update('Dashboard', dashboard_meta, function(err, results) {
        if (err) {
            response_bad.errormsg = '[trailhead_resetOrg][Dashboard Reset] 문제 발생';
            console.log("fail :" + JSON.stringify(response_bad));
            _tmp1 = response_bad;
          //  console.error(err); 
        } else {
        for (var i=0; i < results.length; i++) {
          var result = results[i];
          console.log('success ? : ' + result.success);
          console.log('fullName : ' + result.fullName);
        }}
      });


    response_good.successmsg = '실습 환경을 복구 하였습니다!!';
    //console.log("success :" + JSON.stringify(response_good));
    _tmp1 = response_good;

    /*
    //console.log('Passed #1 - Dashboard Name');
    //var record = result.records[0];
    //console.log("total : " + result.totalSize);

    var _request = {
    url: '',
    method: 'get',
    body: '',
    headers : {
            "Content-Type" : "application/json"
        }
    };

    _request.url = '/services/data/v60.0/analytics/dashboards/' + record.Id + '/describe';

    await conn.request(_request, function(err, resp) {
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
            response_good.successmsg = '대시보드를 정확하게 생성하셨습니다. 축하합니다!!';
            //console.log("success :" + JSON.stringify(response_good));
            _tmp1 = response_good;
            //return response_good;
        } else {
            response_bad.errormsg = '대시보드를 다시 확인하시기 바랍니다.';
            console.log("fail :" + JSON.stringify(response_bad));
            _tmp1 = response_bad;
            //return response_bad;
        }
    });

    */
    return _tmp1;
    
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

//module.exports = { login, checkTravelApprovalRecord, checkReports, checkDashboards};
module.exports = { login, trailhead_checkTravelApprovalRecord, trailhead_checkField, trailhead_checkDashboards, trailhead_checkReports, trailhead_resetOrg};

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
        case 'resetOrg':
            callback = resetOrg;
            break;
    }
}
//login(callback);
