"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = void 0;
var RoleTimerMessage = /** @class */ (function () {
    function RoleTimerMessage(msg) {
        var _this = this;
        this.msg = msg;
        this.actions = [];
        this.msg.guild.roles.fetch('616833308592046121')
            .then(function (r) {
            _this.actions.push({
                role: r,
                offset: 1000,
            });
        });
        this.msg.guild.roles.fetch('771827876235313183')
            .then(function (r) {
            _this.actions.push({
                role: r,
                offset: 1000,
            });
        });
        this.msg.guild.roles.fetch('771880832309788693')
            .then(function (r) {
            _this.actions.push({
                role: r,
                offset: 1000,
            });
        });
        this.emoji = '😄';
        msg.react(this.emoji);
    }
    RoleTimerMessage.prototype.spawnTimer = function (rct, user) {
        var _this = this;
        var timeOffset = 0;
        var cancelAction = false;
        this.actions
            .forEach(function (action) {
            setTimeout(function () {
                // eslint-disable-next-line max-len
                var skipAction = cancelAction || (_this.msg.reactions.cache.filter(function (reaction) { return reaction.users.cache.has(user.id); }).get(_this.emoji) === undefined);
                cancelAction = skipAction;
                if (!skipAction) {
                    user.roles.add(action.role)
                        .then(function () { })
                        .catch(function () {
                        _this.msg.channel.send('This bot can\'t set roles for some reason???\n'
                            + '(pstt, dev check the console)');
                    });
                }
            }, timeOffset);
            timeOffset += action.offset;
        });
    };
    RoleTimerMessage.prototype.removeRole = function (user) {
        var _this = this;
        this.actions
            .forEach(function (action) {
            user.roles.remove(action.role)
                .then(function () { })
                .catch(function () {
                _this.msg.channel.send('This bot can\'t set roles for some reason???\n'
                    + '(pstt, dev check the console)');
            });
        });
    };
    return RoleTimerMessage;
}());
exports.default = RoleTimerMessage;
//# sourceMappingURL=RoleTimerMessage.js.map