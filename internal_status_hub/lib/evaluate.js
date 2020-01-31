module.exports = function(evaluationParameters, data, response) {
    switch(evaluationParameters.type) {
        case 'HTTP_CODE':
            return response.statusCode === evaluationParameters.code;
        case 'JSON_KEY':
            if (typeof data === 'string') {
                try {
                    data = JSON.parse(data);
                } catch (e) {
                    return false;
                }
            }

            try {
                for (let key of evaluationParameters.key.split('.')) {
                    data = data[key];
                }
            } catch (e) {
                // key not found
                return false;
            }

            return data === evaluationParameters.value;
        case 'REGEX':
            return (new RegExp(evaluationParameters.regex, evaluationParameters.flags)).test(data.toString());
    }

    throw new Error(`Unknown evaluation type: ${evaluationParameters.type}`);
}
