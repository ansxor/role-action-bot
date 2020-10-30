"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = void 0;
var RoleTimerMessage = /** @class */ (function () {
    function RoleTimerMessage(msg) {
        var _this = this;
        this.msg = msg;
        this.msg.guild.roles.fetch('616833308592046121')
            .then(function (r) {
            _this.role = r;
        });
        this.msg.guild.roles.fetch('771827876235313183')
            .then(function (r) {
            _this.role2 = r;
        });
        msg.react('😄');
    }
    RoleTimerMessage.prototype.spawnTimer = function (rct, user) {
        var _this = this;
        user.roles.add(this.role)
            .then(function () {
            _this.msg.channel.send('THE TIMER HAS BEGUN!!!');
            setTimeout(function () {
                _this.msg.channel.send('TEST SUCCESS');
                // check if the user isn't reacted to the message anymore
                // if (this.msg.reactions.cache.array().indexOf(rct) === -1) {
                var ind = _this.msg.reactions.cache.array().indexOf(rct);
                console.log(ind);
                if (ind === -1) {
                    _this.msg.channel.send('WOW TIME OwO');
                }
                else {
                    user.roles.add(_this.role2);
                }
            }, 1000);
        })
            .catch(function (e) {
            _this.msg.channel.send('This bot can\'t set roles for some reason???\n'
                + '(pstt, dev check the console)');
            console.log(e);
        });
    };
    RoleTimerMessage.prototype.removeRole = function (user) {
        var _this = this;
        user.roles.remove(this.role)
            .then(function () {
            user.roles.remove(_this.role2);
        })
            .catch(function (e) {
            _this.msg.channel.send('This bot can\'t set roles for some reason???\n'
                + '(pstt, dev check the console)');
            console.log(e);
        });
    };
    return RoleTimerMessage;
}());
exports.default = RoleTimerMessage;
//# sourceMappingURL=RoleTimerMessage.js.map