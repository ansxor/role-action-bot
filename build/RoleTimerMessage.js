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
        msg.react('😄');
    }
    RoleTimerMessage.prototype.spawnTimer = function (rct, user) {
        var _this = this;
        var timeOffset = 0;
        this.actions
            .forEach(function (action) {
            setTimeout(function () {
                user.roles.add(action.role)
                    .then(function () { })
                    .catch(function (e) {
                    _this.msg.channel.send('This bot can\'t set roles for some reason???\n'
                        + '(pstt, dev check the console)');
                    console.log(e);
                });
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
                .catch(function (e) {
                _this.msg.channel.send('This bot can\'t set roles for some reason???\n'
                    + '(pstt, dev check the console)');
                console.log(e);
            });
        });
    };
    return RoleTimerMessage;
}());
exports.default = RoleTimerMessage;
//# sourceMappingURL=RoleTimerMessage.js.map