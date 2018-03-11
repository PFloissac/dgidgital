# mongo-morgan-ext
This npm module allows you to log to your mongoDB with more details. It is based on [mongo-morgan](https://github.com/emech-en/mongo-morgan)

<p align="left">
<a href="https://david-dm.org/serganus/mongo-morgan-ext"><img src="https://david-dm.org/serganus/mongo-morgan-ext.svg" alt="Dependency Status"></a>
</p>

[![NPM](https://nodei.co/npm/mongo-morgan-ext.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/mongo-morgan-ext/)

## Why this exists?

- Morgan is awesome at logging but with mongo-morgan its now logged into mongo database. Useful if you are looking to use morgan instead of [winston] (https://www.npmjs.com/package/winston) or [bunyan] (https://www.npmjs.com/package/bunyan).
- This module uses mongo-morgan and extends to format to log all HTTP request and response objects.

## Installation in your project

- `npm install mongo-morgan-ext --save`

## Usage

```
var logger = require('mongo-morgan-ext');
var db = 'mongodb://localhost:27017/MyDB';
var collection = 'Logs'
var skipfunction = function(req, res) {
return res.statusCode > 399;
} //Thiw would skip if HTTP request response is less than 399 i.e no errors.

app.use(logger(db,collection,skipfunction)); //In your express-application

```

## Expected Output on every request

```
{
    "RequestID": "",
    "status": "",
    "method": "",
    "Remote-user": "",
    "Remote-address": "",
    "URL": "",
    "HTTPversion": "",
    "Response-time": "",
    "date":"",
    "Referrer": "",
    "REQUEST": { //10
        "Accept": "",
        "Accept-Charset": "",
        "Accept-Encoding": "",
        "Accept-Language": "",
        "Authorization": "",
        "Cache-Control": "",
        "Connection": "",
        "Cookie": "",
        "Content-Length": "",
        "Content-MD5": "",
        "Content-Type": "",
        "Expect": "",
        "Forwarded": "",
        "From": "",
        "Host": "",
        "Max-Forwards": "",
        "Origin": "",
        "Pragma": "",
        "Proxy-Authorization": "",
        "Range": "",
        "TE": "",
        "User-Agent": "",
        "Via": "",
        "Warning": "",
        "Upgrade": "",
        "Referer": "",
        "Date": "",
        "X-requested-with": "",
        "X-Csrf-Token": "",
        "X-UIDH": "",
        "Proxy-Connection": "",
        "X-Wap-Profile": "",
        "X-ATT-DeviceId": "",
        "X-Http-Method-Override":"",
        "Front-End-Https": "",
        "X-Forwarded-Proto": "",
        "X-Forwarded-Host": "",
        "X-Forwarded-For": "",
        "DNT": "",
        "Accept-Datetime": "",
        "If-Match": "",
        "If-Modified-Since": "",
        "If-None-Match": "",
        "If-Range": "",
        "If-Unmodified-Since": ""
    },
    "RESPONSE": {
        "Status": "",
        "Content-MD5":"",
        "X-Frame-Options": "",
        "Accept-Ranges": "",
        "Age": "",
        "Allow": "",
        "Cache-Control": "",
        "Connection": "",
        "Content-Disposition": "",
        "Content-Encoding": "",
        "Content-Language": "",
        "Content-Length": "",
        "Content-Location": "",
        "Content-Range": "",
        "Content-Type":"",
        "Date":"",
        "Last-Modified": "",
        "Link": "",
        "Location": "",
        "P3P": "",
        "Pragma": "",
        "Proxy-Authenticate": "",
        "Public-Key-Pins": "",
        "Retry-After": "",
        "Server": "",
        "Trailer": "",
        "Transfer-Encoding": "",
        "TSV": "",
        "Upgrade": "",
        "Vary": "",
        "Via": "",
        "Warning": "",
        "WWW-Authenticate": "",
        "Expires": "",
        "Set-Cookie": "",
        "Strict-Transport-Security": "",
        "Refresh":"",
        "Access-Control-Allow-Origin": "",
        "X-XSS-Protection": "",
        "X-WebKit-CSP":"",
        "X-Content-Security-Policy": "",
        "Content-Security-Policy": "",
        "X-Content-Type-Options": "",
        "X-Powered-By": "",
        "X-UA-Compatible": "",
        "X-Content-Duration": "",
        "Upgrade-Insecure-Requests": "",
        "X-Request-ID": "",
        "ETag": "",
        "Accept-Patch": ""
    }

}


```