import { get } from 'https';
import { format, parse } from 'url';
// tslint:disable:no-var-requires
var registry = require('../package.json').publishConfig.registry;
export default function getLatestVersion(packageName) {
    var url = parse(registry);
    url.pathname = "/" + packageName;
    return new Promise(function (resolve, reject) {
        get(format(url), function (response) {
            var body = '';
            response.setEncoding('utf8');
            response.on('data', function (chunk) { return (body += chunk); });
            response.on('end', function () {
                if (response.statusCode !== 200) {
                    reject(new Error("unable to get latest version (code=" + response.statusCode + "): " + body));
                }
                var packageInfo = JSON.parse(body);
                resolve(packageInfo['dist-tags']['latest']);
            });
        }).on('error', reject);
    });
}
