function writeStatus(rule, healthy) {
    // TODO
    console.log(`[DB] [${rule.parent}::${rule['display-name']}] ${healthy ? '\x1b[32mOK' : '\x1b[31mNOT OK'}\x1b[0m`);
}

module.exports = {
    writeStatus: writeStatus
};
