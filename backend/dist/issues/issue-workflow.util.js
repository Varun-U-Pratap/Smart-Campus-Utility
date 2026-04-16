"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.canTransitionIssue = void 0;
const client_1 = require("@prisma/client");
const allowedTransitions = {
    [client_1.IssueStatus.OPEN]: [client_1.IssueStatus.IN_PROGRESS, client_1.IssueStatus.RESOLVED],
    [client_1.IssueStatus.IN_PROGRESS]: [client_1.IssueStatus.RESOLVED, client_1.IssueStatus.OPEN],
    [client_1.IssueStatus.RESOLVED]: [client_1.IssueStatus.OPEN],
};
const canTransitionIssue = (from, to) => {
    if (from === to) {
        return true;
    }
    return allowedTransitions[from].includes(to);
};
exports.canTransitionIssue = canTransitionIssue;
//# sourceMappingURL=issue-workflow.util.js.map