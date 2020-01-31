module.exports = function(evaluationParameters, data, response) {
    switch(evaluationParameters.type) {
        case 'HTTP_CODE':
            if (response.statusCode !== evaluationParameters.code) {
                throw new Error(`Expected HTTP ${evaluationParameters.code}, got ${response.statusCode}`);
            }
            break;
        case 'JSON_KEY':
            if (typeof data === 'string') {
                try {
                    data = JSON.parse(data);
                } catch (e) {
                    throw new Error(`Body was not JSON`);
                }
            }

            try {
                for (let key of evaluationParameters.key.split('.')) {
                    data = data[key];
                }
            } catch (e) {
                // key not found
                throw new Error(`JSON did not have key: ${evaluationParameters.key}`);
            }

            if (data !== evaluationParameters.value) {
                throw new Error(`Expected ${evaluationParameters.key} to be ${evaluationParameters.data}, got ${data}`);
            }
            break;
        case 'REGEX':
            if (!(new RegExp(evaluationParameters.regex, evaluationParameters.flags)).test(data.toString())) {
                throw new Error(`Regular Expression /${evaluationParameters.regex}/${evaluationParameters.flags} did not match`);
            }
        break;
        default:
            throw new Error(`Unknown evaluation type: ${evaluationParameters.type}`);
    }
}
