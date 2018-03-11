var HTTPlogger = require('mongo-morgan');
var rid = require('rid');
var RID = rid();

function StructuredLogging() {
    return function(tokens, req, res) {
        var JSONLine = JSON.stringify({
            'RequestID': tokens['id'](req, res),
            'status': tokens.status(req, res), //1
            'method': tokens.method(req, res), //2
            'Remote-user': tokens['remote-user'](req, res), //3
            'Remote-address': tokens['remote-addr'](req, res), //4
            'URL': tokens.url(req, res), //5
            'HTTPversion': 'HTTP/' + tokens['http-version'](req, res), //6
            'Response-time': tokens['response-time'](req, res, 'digits'), //7
            'date': tokens.date(req, res, 'web'), //8
            'Referrer': tokens.referrer(req, res), //9
            'REQUEST': { //10
                'Accept': tokens['req'](req, res, 'Accept'), //10:01
                'Accept-Charset': tokens['req'](req, res, 'Accept-Charset'), //10:02
                'Accept-Encoding': tokens['req'](req, res, 'Accept-Encoding'), //10:03
                'Accept-Language': tokens['req'](req, res, 'Accept-Language'), //10:04
                'Authorization': tokens['req'](req, res, 'Authorization'), //10:05
                'Cache-Control': tokens['req'](req, res, 'Cache-Control'), //10:06
                'Connection': tokens['req'](req, res, 'Connection'), //10:07
                'Cookie': tokens['req'](req, res, 'Cookie'), //10:08
                'Content-Length': tokens['req'](req, res, 'Content-Length'), //10:09
                'Content-MD5': tokens['req'](req, res, 'Content-MD5'), //10:10
                'Content-Type': tokens['req'](req, res, 'Content-Type'), //10:11
                'Expect': tokens['req'](req, res, 'Expect'), //10:12
                'Forwarded': tokens['req'](req, res, 'Forwarded'), //10:13
                'From': tokens['req'](req, res, 'From'), //10:14
                'Host': tokens['req'](req, res, 'Host'), //10:15
                'Max-Forwards': tokens['req'](req, res, 'Max-Forwards'), //10:16
                'Origin': tokens['req'](req, res, 'Origin'), //10:17
                'Pragma': tokens['req'](req, res, 'Pragma'), //10:18
                'Proxy-Authorization': tokens['req'](req, res, 'Proxy-Authorization'), //10:19
                'Range': tokens['req'](req, res, 'Range'), //10:20
                'TE': tokens['req'](req, res, 'TE'), //10:21
                'User-Agent': tokens['req'](req, res, 'User-Agent'), //10:22
                'Via': tokens['req'](req, res, 'Via'), //10:23
                'Warning': tokens['req'](req, res, 'Warning'), //10:24
                'Upgrade': tokens['req'](req, res, 'Upgrade'), //10:25
                'Referer': tokens['req'](req, res, 'Referer'), //10:26
                'Date': tokens['req'](req, res, 'Date'), //10:27
                'X-requested-with': tokens['req'](req, res, 'X-requested-with'), //10:28
                'X-Csrf-Token': tokens['req'](req, res, 'X-Csrf-Token'), //10:29
                'X-UIDH': tokens['req'](req, res, 'X-UIDH'), //10:30
                'Proxy-Connection': tokens['req'](req, res, 'Proxy-Connection'), //10:31
                'X-Wap-Profile': tokens['req'](req, res, 'X-Wap-Profile'), //10:32
                'X-ATT-DeviceId': tokens['req'](req, res, 'X-ATT-DeviceId'), //10:33
                'X-Http-Method-Override': tokens['req'](req, res, 'X-Http-Method-Override'), //10:34
                'Front-End-Https': tokens['req'](req, res, 'Front-End-Https'), //10:35
                'X-Forwarded-Proto': tokens['req'](req, res, 'X-Forwarded-Proto'), //10:36
                'X-Forwarded-Host': tokens['req'](req, res, 'X-Forwarded-Host'), //10:37
                'X-Forwarded-For': tokens['req'](req, res, 'X-Forwarded-For'), //10:38
                'DNT': tokens['req'](req, res, 'DNT'), //10:39
                'Accept-Datetime': tokens['req'](req, res, 'Accept-Datetime'), //10:40
                'If-Match': tokens['req'](req, res, 'If-Match'), //10:41
                'If-Modified-Since': tokens['req'](req, res, 'If-Modified-Since'), //10:42
                'If-None-Match': tokens['req'](req, res, 'If-None-Match'), //10:43
                'If-Range': tokens['req'](req, res, 'If-Range'), //10:44
                'If-Unmodified-Since': tokens['req'](req, res, 'If-Unmodified-Since') //10:45
            },
            'RESPONSE': { //11
                'Status': tokens['res'](req, res, 'Status'), //11:01
                'Content-MD5': tokens['res'](req, res, 'Content-MD5'), //11:02
                'X-Frame-Options': tokens['res'](req, res, 'X-Frame-Options'), //11:03
                'Accept-Ranges': tokens['res'](req, res, 'Accept-Ranges'), //11:04
                'Age': tokens['res'](req, res, 'Age'), //11:05
                'Allow': tokens['res'](req, res, 'Allow'), //11:06
                'Cache-Control': tokens['res'](req, res, 'Cache-Control'), //11:07
                'Connection': tokens['res'](req, res, 'Connection'), //11:08
                'Content-Disposition': tokens['res'](req, res, 'Content-Disposition'), //11:09
                'Content-Encoding': tokens['res'](req, res, 'Content-Encoding'), //11:10
                'Content-Language': tokens['res'](req, res, 'Content-Language'), //11:11
                'Content-Length': tokens['res'](req, res, 'Content-Length'), //11:12
                'Content-Location': tokens['res'](req, res, 'Content-Location'), //11:13
                'Content-Range': tokens['res'](req, res, 'Content-Range'), //11:14
                'Content-Type': tokens['res'](req, res, 'Content-Type'), //11:15
                'Date': tokens['res'](req, res, 'Date'), //11:16
                'Last-Modified': tokens['res'](req, res, 'Last-Modified'), //11:17
                'Link': tokens['res'](req, res, 'Link'), //11:18
                'Location': tokens['res'](req, res, 'Location'), //11:19
                'P3P': tokens['res'](req, res, 'P3P'), //11:20
                'Pragma': tokens['res'](req, res, 'Pragma'), //11:21
                'Proxy-Authenticate': tokens['res'](req, res, 'Proxy-Authenticate'), //11:22
                'Public-Key-Pins': tokens['res'](req, res, 'Public-Key-Pins'), //11:23
                'Retry-After': tokens['res'](req, res, 'Retry-After'), //11:24
                'Server': tokens['res'](req, res, 'Server'), //11:25
                'Trailer': tokens['res'](req, res, 'Trailer'), //11:26
                'Transfer-Encoding': tokens['res'](req, res, 'Transfer-Encoding'), //11:27
                'TSV': tokens['res'](req, res, 'TSV'), //11:28
                'Upgrade': tokens['res'](req, res, 'Upgrade'), //11:29
                'Vary': tokens['res'](req, res, 'Vary'), //11:30
                'Via': tokens['res'](req, res, 'Via'), //11:31
                'Warning': tokens['res'](req, res, 'Warning'), //11:32
                'WWW-Authenticate': tokens['res'](req, res, 'WWW-Authenticate'), //11:33
                'Expires': tokens['res'](req, res, 'Expires'), //11:34
                'Set-Cookie': tokens['res'](req, res, 'Set-Cookie'), //11:35
                'Strict-Transport-Security': tokens['res'](req, res, 'Strict-Transport-Security'), //11:36
                'Refresh': tokens['res'](req, res, 'Refresh'), //11:37
                'Access-Control-Allow-Origin': tokens['res'](req, res, 'Access-Control-Allow-Origin'), //11:38
                'X-XSS-Protection': tokens['res'](req, res, 'X-XSS-Protection'), //11:39
                'X-WebKit-CSP': tokens['res'](req, res, 'X-WebKit-CSP'), //11:40
                'X-Content-Security-Policy': tokens['res'](req, res, 'X-Content-Security-Policy'), //11:41
                'Content-Security-Policy': tokens['res'](req, res, 'Content-Security-Policy'), //11:42
                'X-Content-Type-Options': tokens['res'](req, res, 'X-Content-Type-Options'), //11:43
                'X-Powered-By': tokens['res'](req, res, 'X-Powered-By'), //11:44
                'X-UA-Compatible': tokens['res'](req, res, 'X-UA-Compatible'), //11:45
                'X-Content-Duration': tokens['res'](req, res, 'X-Content-Duration'), //11:46
                'Upgrade-Insecure-Requests': tokens['res'](req, res, 'Upgrade-Insecure-Requests'), //11:47
                'X-Request-ID': tokens['res'](req, res, 'X-Request-ID'), //11:48
                'ETag': tokens['res'](req, res, 'ETag'), //11:49
                'Accept-Patch': tokens['res'](req, res, 'Accept-Patch') //11:50
            }
        });
        return JSONLine;

    }
}

HTTPlogger.token('id', function getId(req) {
    return RID;
});

function mongoMorganExtendedFormat(db,collectionname,skipfunction) {
return HTTPlogger(db, StructuredLogging(), {
    skip: skipfunction,
    collection: collectionname
})
}

module.exports = mongoMorganExtendedFormat;




