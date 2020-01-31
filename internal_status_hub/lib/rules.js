let RULES = require('./rules.json')

for (let parent of Object.keys(RULES)) {
    for (let rule of RULES[parent].services) {
        rule.parent = parent;
    }
}

function getPollingRuleByURL(url) {
    for (let parent of Object.keys(RULES)) {
        for (let rule of RULES[parent].services) {
            if (rule.type === 'POLLING' && rule.url === url) {
                return rule;
            }
        }
    }
};

function getReportingRuleByID(id) {
    for (let parent of Object.keys(RULES)) {
        for (let rule of RULES[parent].services) {
            if (rule.id === id) {
                return rule;
            }
        }
    }
};

function getAllPollingRules() {
    let matchedRules = []
    for (let parent of Object.keys(RULES)) {
        for (let rule of RULES[parent].services) {
            if (rule.type === 'POLLING') {
                matchedRules.push(rule)
            }
        }
    }
    return matchedRules;
};

function getRule(type, response) {
    let rule;
    switch (type) {
        case 'REPORTING':
            rule = getReportingRuleByID(response.id);
            break;
        case 'POLLING':
            rule = getPollingRuleByURL(response.url);
            break;
    }
    return rule;
};

function getCategoryDisplayNames() {
    let displayMapping = {};
    for (let parent of Object.keys(RULES)) {
        displayMapping[parent] = RULES[parent]['display-name'];
    }
    return displayMapping;
}


module.exports = {
    getRule: getRule,
    getAllPollingRules: getAllPollingRules,
    getRuleByID: getReportingRuleByID,
    getCategoryDisplayNames: getCategoryDisplayNames
};
