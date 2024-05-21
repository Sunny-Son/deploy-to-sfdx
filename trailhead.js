var jsforce = require("jsforce");
var path = require("path");
var configpath = path.normalize("./");
//var config = require(configpath+"config.js");
const logger = require('heroku-logger');
//var conn = new jsforce.Connection();
var dashboard_meta = require('./meta/dashboard.json');
var report_meta = require('./meta/report.json');
var flexipage_meta = require('./meta/flexipage.json');
var flexipage_verifiy_meta = require('./meta/flexipage_verify.json');
const deepEqual = require('deep-equal');

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
            //    console.log(res);
            //    console.log("user id => CreatedById : [" + res.id + "]");
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
                console.log("Succcessfully logged into Salesforce.");
            }
          });
    }
    else {
        console.log("Username and password not setup.")
    }

    var record;
    await conn.query("SELECT username, alias, id FROM User WHERE alias='UUser'", function(err, result) {
        if (err) { return console.error(err); }
        //console.log('++ checkReports : Query Vehicle__c');
        if(result.records.length == 0) {
          response_bad.errormsg = '++ [trailhead_resetOrg] Data 가 존재하지 않습니다';
          console.log("++ [trailhead_resetOrg]Delete data fail :" + JSON.stringify(response_bad));
          _tmp1 = response_bad;
          //return response_bad;
        } else record = result.records[0];
        console.log('++ [trailhead_resetOrg] Data record ID : ' + record.Id);
    });

    if(_tmp1 != null) return _tmp1;

    //conn = await login(_chk_username, _chk_password);
    var query_string = 'SELECT Id';
    query_string += ' FROM Vehicle__c';
    query_string += ' WHERE createdbyid = \'' + record.Id + '\'';

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
                response_good.successmsg = '설명서에 표시된 데이터를 정확하게 입력하셨습니다! 축하합니다!!';
                console.log("success :" + JSON.stringify(response_good));
                _tmp1 = response_good;
                //return JSON.stringify(response_good);
            } else {
                //console.log("Task #1 isn't achived yet");
                response_bad.errormsg = '데이터를 입력하지 않으셨습니다. 다시 확인 부탁드립니다.';
                console.log("fail :" + JSON.stringify(response_bad));
                _tmp1 = response_bad;
                //return JSON.stringify(response_bad);
            }
        }
      });
      return _tmp1;
}

// May 10th 2023 Insun - #2 -> 화면 레이아웃 변경
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
                //console.log(res);
                //console.log("user id => CreatedById : [" + res.id + "]");
                //return res.id;
                //return conn;
            }
          });
    }
    else {
        console.log("Username and password not setup.")
    }
    
    /*
    ** Dynamic Forms 검증
    */

    var _request_url = conn.instanceUrl + '/services/data/v60.0/sobjects/Vehicle__c/describe/layouts';



    var metadata = await conn.metadata.describe('60.0')
    console.log(`organizationNamespace: ${metadata.organizationNamespace}`);
    console.log(`partialSaveAllowed: ${metadata.partialSaveAllowed}`);
    console.log(`testRequired: ${metadata.testRequired}`);
    console.log(`metadataObjects count: ${metadata.metadataObjects.length}`);

    const fullNames = [ 'Vehicle_Record_Page' ];
    var metadata = await conn.metadata.read('FlexiPage', fullNames);
    console.log('metadata = ' + metadata);
/*
    await conn.request(_request_url, function(err, resp) {
        //console.log(JSON.stringify(resp));
        var vardashboardcheck = JSON.stringify(resp);
        //console.log('++ [trailhead_resetOrg] Dashboard reset result : '  + vardashboardcheck);
        if (err) { 
            response_bad.errormsg = '++ [trailhead_resetOrg] Record page reset 장애. 부스 담당자에게 문의 바랍니다.';
            console.log("++ [trailhead_resetOrg]Flexipage fail :" + JSON.stringify(response_bad));
            _tmp1 = response_bad;
            //return console.error(err); 
        } else {
            // it should be 5
            console.log('++ [Check Dynamic Form] Length1: ' + resp.length);
            console.log('++ [Check Dynamic Form] Length2: ' + resp.layouts.length);
            console.log('++ [Check Dynamic Form] Length3: ' + resp.layouts[0].id); 
            console.log('++ [Check Dynamic Form] Length: ' + resp.layouts[0].detailLayoutSections.length); 
            for (var i=0; i < resp.layouts[0].detailLayoutSections.length; i++) {
                var record = resp.layouts[0].detailLayoutSections[i];
                console.log('++ [Check Dynamic Form] heading: ' + record.heading);
                if(record.heading == 'Customization') {
                    if(record.layoutRows[0].layoutItems[0].label == '페인트 코드' &&
                        record.layoutRows[0].layoutItems[1].label == '자동 운전 기능' &&
                        record.layoutRows[1].layoutItems[0].label == '바퀴' &&
                        record.layoutRows[1].layoutItems[1].label == '자동 운전' &&
                        record.layoutRows[2].layoutItems[0].label == '배터리' &&
                        record.layoutRows[2].layoutItems[1].label == '썬루프' &&
                        record.layoutRows[3].layoutItems[0].label == '실내' &&
                        record.layoutRows[3].layoutItems[1].label == '탄소 섬유 스포일러' &&
                        record.layoutRows[4].layoutItems[0].label == '유압 장치' &&
                        record.layoutRows[4].layoutItems[1].label == '뒷 좌석') {
                            response_good.errormsg = '설명서에 표시된 레이아웃을 변경하지 않았습니다. 변경해 주세요!!';
                            console.log("Fail :" + JSON.stringify(response_good));
                            _tmp1 = response_bad;
                            break;
                        } else {
                            response_good.successmsg = '설명서에 표시된 레이아웃을 변경 하셨습니다! 축하합니다!!';
                            console.log("success :" + JSON.stringify(response_good));
                            _tmp1 = response_good;
                            break;
                        }
                    
                }
                //console.log('++ [trailhead_resetOrg]Flexipage Id: ' + JSON.stringify(record));
                //console.log('++ [trailhead_resetOrg]Flexipage meta: ' + JSON.stringify(record.Metadata));
                //console.log('++ [trailhead_resetOrg]Flexipage Id: ' + record.Id);
                //console.log('++ [trailhead_resetOrg]Flexipage Name: ' + record.MasterLabel);
                //flexipage_id = record.Id;
                /*
                if(deepEqual(flexipage_verifiy_meta, record.Metadata)) {
                    response_good.successmsg = '설명서에 표시된 데이터를 정확하게 입력하셨습니다! 축하합니다!!';
                    console.log("success :" + JSON.stringify(response_good));
                    _tmp1 = response_good;
                    break;
                }
                */
               /*
            }
        }
        return _tmp1;
    });
    */
}
   /*
    var flexipage_id;
    await conn.tooling.sobject('FlexiPage')
        .find({ DeveloperName: "Vehicle_Record_Page" })
        .execute(function(err, records) {
            if (err) { 
                response_bad.errormsg = '++ [trailhead_resetOrg]Flexipage query 에 문제 발생';
                console.log("fail :" + JSON.stringify(response_bad));
                _tmp1 = response_bad;
                return console.error(err); 
            }
            else {
                console.log("++ [trailhead_resetOrg]Flexipage fetched : " + records.length);
                response_bad.errormsg = '데이터를 입력하지 않으셨습니다. 다시 확인 부탁드립니다.';
                //console.log("fail :" + JSON.stringify(response_bad));
                _tmp1 = response_bad;
                for (var i=0; i < records.length; i++) {
                    var record = records[i];
                    //console.log('++ [trailhead_resetOrg]Flexipage Id: ' + JSON.stringify(record));
                    //console.log('++ [trailhead_resetOrg]Flexipage meta: ' + JSON.stringify(record.Metadata));
                    //console.log('++ [trailhead_resetOrg]Flexipage Id: ' + record.Id);
                    //console.log('++ [trailhead_resetOrg]Flexipage Name: ' + record.MasterLabel);
                    flexipage_id = record.Id;
                    if(deepEqual(flexipage_verifiy_meta, record.Metadata)) {
                        response_good.successmsg = '설명서에 표시된 데이터를 정확하게 입력하셨습니다! 축하합니다!!';
                        console.log("success :" + JSON.stringify(response_good));
                        _tmp1 = response_good;
                        break;
                    }
                }
            }
    });
  
    return _tmp1;
  }*/


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

/* Report 검증하기
** sunroof field 추가하기
** x.reportMetadata.detailColumns
*/
async function trailhead_checkReports(_chk_username, _chk_password) {
    var _tmp1 = null;

    var conn = new jsforce.Connection();
    conn.loginUrl = 'https://test.salesforce.com';
    
    var callback = null;
    if(_chk_username && _chk_password) {
        console.log('loginurl = ' + conn.loginUrl);
        await conn.login(_chk_username, _chk_password, function(err, res) {
            if (err) {
                response_bad.errormsg = '++ [trailhead_dashboard check] Login 실패, 부스 담당자에게 문의 바랍니다.';
                console.log("++ [trailhead_dashboard check : " + JSON.stringify(response_bad));
                _tmp1 = response_bad;
                //return console.error(err); 
            }
            else {
                loggedIn = true;
                console.log("Succcessfully logged into Salesforce.");
            }
          });
    }
    else {
        console.log("Username and password not setup.")
    }
    
    //var conn = await login(_chk_username, _chk_password);
    var record;
    await conn.query("SELECT Id, DeveloperName, FolderName, Name FROM Report WHERE NAME = \'Vehicles with Model and Status\'", function(err, result) {
        if (err) { return console.error(err); }
        //console.log("total : " + result.totalSize);
        //console.log('++ checkReports : Travel Requests by Department');
        if(result.records.length == 0) {
          response_bad.errormsg = '++ [Report verification] Vehicles with Model and Status 리포트가 존재하지 않습니다';
          console.log("fail :" + JSON.stringify(response_bad));
          _tmp1 = response_bad;
          //return response_bad;
        } else record = result.records[0];
    });
    
    if(_tmp1 != null) return _tmp1;

    await conn.analytics.report(record.Id).describe(function(err, meta) {
        //report.execute(function(err, result) {
        if (err) { return console.error(err); }
        var vardetailcolumns = meta.reportMetadata.detailColumns;

        if(!vardetailcolumns.includes('Vehicle__c.Sunroof__c')) {
            response_bad.errormsg = '리포트에 sunroof 필드를 추가하세요!!';
            console.log("fail :" + JSON.stringify(response_bad));
            _tmp1 = response_bad;
        } else {
            response_good.successmsg = '리포트에 sunroof 필드를 정확하게 추가하셨습니다!!';
            //console.log("success :" + JSON.stringify(response_good));
            _tmp1 = response_good;
        } 
        
    });
    return _tmp1;
   
}

/* Dashboard 검증
**       "visualizationType" : "Donut" -> x.components[4].properties.visualizationType
**        "groupByType" : "stacked", -> x.components[4].properties.visualizationProperties.groupByType
*/

async function trailhead_checkDashboards(_chk_username, _chk_password) {
    var _tmp1 = null;

    var conn = new jsforce.Connection();
    conn.loginUrl = 'https://test.salesforce.com';
    
    var callback = null;
    if(_chk_username && _chk_password) {
        console.log('loginurl = ' + conn.loginUrl);
        await conn.login(_chk_username, _chk_password, function(err, res) {
            if (err) {
                response_bad.errormsg = '++ [trailhead_dashboard check] Login 실패, 부스 담당자에게 문의 바랍니다.';
                console.log("++ [trailhead_dashboard check : " + JSON.stringify(response_bad));
                _tmp1 = response_bad;
                //return console.error(err); 
            }
            else {
                loggedIn = true;
                console.log("Succcessfully logged into Salesforce.");
            }
          });
    }
    else {
        console.log("Username and password not setup.")
    }
    
    if(_tmp1 != null) return _tmp1;

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
        //var vardashboardcheck = JSON.stringify(resp);
        response_bad.errormsg = '대시보드를 다시 확인하시기 바랍니다.';
        //console.log("fail :" + JSON.stringify(response_bad));
        _tmp1 = response_bad;
        for(var i = 0; i < resp.components.length;i++) {
            //"visualizationType" : "Donut" -> x.components[4].properties.visualizationType
            if(resp.components[i].properties.visualizationType == 'Bar' && resp.components[i].properties.visualizationProperties.groupByType == 'stacked') {
                console.log("Success : Bingo!!!");
                response_good.successmsg = '대시보드를 정확하게 생성하셨습니다. 축하합니다!!';
                //console.log("success :" + JSON.stringify(response_good));
                _tmp1 = response_good;
                break;
            }

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
            if (err) {
                response_bad.errormsg = '++ [trailhead_dashboard check] Login 실패, 부스 담당자에게 문의 바랍니다.';
                console.log("++ [trailhead_dashboard check : " + JSON.stringify(response_bad));
                _tmp1 = response_bad;
                //return console.error(err); 
            }
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
    if(_tmp1 != null) return _tmp1;

    /*
    ** Dynamic Forms reset
    */
    var flexipage_id;
    await conn.tooling.sobject('FlexiPage')
        .find({ DeveloperName: "Vehicle_Record_Page" })
        .execute(function(err, records) {
            if (err) { 
                response_bad.errormsg = '++ [trailhead_resetOrg]Flexipage query 에 문제 발생';
                console.log("fail :" + JSON.stringify(response_bad));
                _tmp1 = response_bad;
                return console.error(err); 
            }
            else {
                console.log("++ [trailhead_resetOrg]Flexipage fetched : " + records.length);
                for (var i=0; i < records.length; i++) {
                    var record = records[i];
                    console.log('++ [trailhead_resetOrg]Flexipage Id: ' + record.Id);
                    console.log('++ [trailhead_resetOrg]Flexipage Name: ' + record.MasterLabel);
                    flexipage_id = record.Id;
                }
            }
    });

    if(_tmp1 != null) return _tmp1;

    var _request_url = conn.instanceUrl + '/services/data/v60.0/tooling/sobjects/FlexiPage/' + flexipage_id;

    await conn.requestPatch(_request_url, flexipage_meta, function(err, resp) {
        //console.log(JSON.stringify(resp));
        var vardashboardcheck = JSON.stringify(resp);
        //console.log('++ [trailhead_resetOrg] Dashboard reset result : '  + vardashboardcheck);
        if (err) { 
            response_bad.errormsg = '++ [trailhead_resetOrg] Record page reset 장애. 부스 담당자에게 문의 바랍니다.';
            console.log("++ [trailhead_resetOrg]Flexipage fail :" + JSON.stringify(response_bad));
            _tmp1 = response_bad;
            //return console.error(err); 
        } 
    });
    if(_tmp1 != null) return _tmp1;

    console.log('++ [trailhead_resetOrg] Dynamic Form Recovered');
    /*
    ** Data 삭제
    */

    var record;
    await conn.query("SELECT username, alias, id FROM User WHERE alias='UUser'", function(err, result) {
        if (err) { return console.error(err); }
        //console.log('++ checkReports : Query Vehicle__c');
        if(result.records.length == 0) {
          response_bad.errormsg = '++ [trailhead_resetOrg] Data 가 존재하지 않습니다';
          console.log("++ [trailhead_resetOrg]Delete data fail :" + JSON.stringify(response_bad));
          _tmp1 = response_bad;
          //return response_bad;
        } else record = result.records[0];
        console.log('++ [trailhead_resetOrg] Data record ID : ' + record.Id);
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


    /*
    ** Dashboard 복구 => 삭제 후 추가 방식이 나을 듯
    ** Dashboard describe 하여, Metadata를 확보하고 
    **  report ID 를 읽어온 데이터에서 확보하여 3곳 수정
    **  owner, runningUser, developerName, folderId, id, 각 Component의 id => dashboard.json에서 삭제
    */
    
    var record;
    await conn.query("SELECT Id, DeveloperName, FolderName, Title FROM Dashboard WHERE Title = \'Vehicle Dashboard\' and FolderName = \'Public1\'", function(err, result) {
        if (err) { return console.error(err); }
        if(result.records.length == 0) {
          response_bad.errormsg = '[Vehicle Dashboard] 대시보드가 [Public folder] 에 존재하지 않습니다. 부스에 문의 부탁드립니다';
          console.log("fail :" + JSON.stringify(response_bad));
          _tmp1 = response_bad;
          //return response_bad;
        } else record = result.records[0];
    });
    
    if(_tmp1 != null) return _tmp1;

    console.log('++ [trailhead_resetOrg] Dashboard found, record id = ' + record.Id);

    console.log('++ [trailhead_resetOrg] Dashboard base url : '  + conn.instanceUrl);
    var _request_url = conn.instanceUrl + '/services/data/v60.0/analytics/dashboards/' + record.Id;
    var _request_report_id = null;

    await conn.request(_request_url, dashboard_meta, function(err, resp) {
        //console.log(JSON.stringify(resp));
        //var vardashboardcheck = JSON.stringify(resp);
        //console.log('++ [trailhead_resetOrg] Dashboard describe result : '  + vardashboardcheck);
        if (err) {
            response_bad.errormsg = '++ [trailhead_resetOrg] Dashboard Query 장애. 부스 담당자에게 문의 바랍니다.';
            console.log("fail :" + JSON.stringify(response_bad));
            _tmp1 = response_bad;
            return console.error(err);
        } else {
            //console.log('++ [trailhead_resetOrg] Dashboard - report ID resp.length = [ ' + resp.length + ']');
            //console.log('++ [trailhead_resetOrg] Dashboard - report ID resp.length = [ ' + resp.dashboardMetadata.length + ']');
            //console.log('++ [trailhead_resetOrg] Dashboard - report ID resp.length = [ ' + resp.dashboardMetadata.components.length + ']');
            for(var i = 0; i < resp.dashboardMetadata.components.length;i++) {
                //console.log('++ [trailhead_resetOrg] Dashboard - report ID set : ['  + i + '], id = [' + resp.dashboardMetadata.components[i].reportId + ']');
                if(resp.dashboardMetadata.components[i].reportId != null) {
                    console.log('++ [trailhead_resetOrg] Dashboard - report ID to be replaced [' + resp.dashboardMetadata.components[i].reportId + ']');
                    _request_report_id = resp.dashboardMetadata.components[i].reportId;
                    console.log('++ [trailhead_resetOrg] Dashboard metadata - report ID : '  + _request_report_id);
                    for(var j = 0; j < dashboard_meta.components.length;j++) {
                        //console.log('++ [trailhead_resetOrg] Dashboard - Meta file report ID value set : ['  + j + '], id = [' + dashboard_meta.components[j].reportId + ']');
                        if(dashboard_meta.components[j].reportId != null) {
                            dashboard_meta.components[j].reportId = _request_report_id;
                            console.log('++ [trailhead_resetOrg] Dashboard metadata - report ID update set ['  + j + '], id = [' + dashboard_meta.components[j].reportId + ']');
                        } 
                    }
                    break;
                }
            }
        }
    });
    if(_tmp1 != null) return _tmp1;

    await conn.requestPatch(_request_url, dashboard_meta, function(err, resp) {
        //console.log(JSON.stringify(resp));
        //var vardashboardcheck = JSON.stringify(resp);
        //console.log('++ [trailhead_resetOrg] Dashboard reset result : '  + vardashboardcheck);
        if (err) {
            response_bad.errormsg = '++ [trailhead_resetOrg] Dashboard Reset 장애. 부스 담당자에게 문의 바랍니다.';
            console.log("fail :" + JSON.stringify(response_bad));
            _tmp1 = response_bad;
            return console.error(err);
            
        }
    });
    if(_tmp1 != null) return _tmp1;
    console.log('++ [trailhead_resetOrg] Dashboard Recovered');
    /*
    ** Report 복구 => 삭제 후 추가 방식이 나을 듯
    */
    
    await conn.query("SELECT Id, DeveloperName, FolderName, Name FROM Report WHERE NAME = \'Vehicles with Model and Status\'", function(err, result) {
        if (err) { return console.error(err); }
        if(result.records.length == 0) {
          response_bad.errormsg = '[Vehicle Dashboard] Report가 존재하지 않습니다. 부스에 문의 부탁드립니다';
          console.log("fail :" + JSON.stringify(response_bad));
          _tmp1 = response_bad;
          return console.error(err);
          //return response_bad;
        } else record = result.records[0];
    });

    if(_tmp1 != null) return _tmp1;
    console.log('++ [trailhead_resetOrg] Report found : [' + record.Id + ']');
    
    var _request_url = conn.instanceUrl + '/services/data/v60.0/analytics/reports/' + record.Id;
    console.log('++ [trailhead_resetOrg] report requestPach url = ['  + _request_url + ']');

    await conn.requestPatch(_request_url, report_meta, function(err, resp) {
        //console.log(JSON.stringify(resp));
        //var vardashboardcheck = JSON.stringify(resp);
        //console.log('++ [trailhead_resetOrg] Report reset result : '  + vardashboardcheck);
        if (err) { 
            response_bad.errormsg = '++ [trailhead_resetOrg] Report Reset 장애. 부스 담당자에게 문의 바랍니다.';
            console.log("fail :" + JSON.stringify(response_bad));
            _tmp1 = response_bad;
            return console.error(err);
            //return console.error(err); 
        } 
    });
    if(_tmp1 != null) return _tmp1;
    
    response_good.successmsg = '실습 환경을 복구 하였습니다, 브라우져를 새로 고침 해 주세요';
    //console.log("success :" + JSON.stringify(response_good));
    _tmp1 = response_good;

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
