"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = void 0;
var Discord = require("discord.js");
var RoleTimerMessage_1 = require("./RoleTimerMessage");
var Bot = /** @class */ (function () {
    function Bot(token) {
        // this is because discord.js is written in JavaScript so =this= is overwritten,
        // so this allows us to access the TypeScript object inside of the handlers
        var b = this;
        this.trackedMessage = [];
        this.client = new Discord.Client();
        this.client.on('ready', function () {
            b.loginHandler();
        });
        this.client.on('message', function (msg) {
            b.messageHandler(msg);
        });
        this.client.on('messageReactionAdd', function (r, u) {
            b.reactionHandler(r, r.message.guild.member(u));
        });
        this.client.on('messageReactionRemove', function (r, u) {
            b.reactionRemovalHandler(r, r.message.guild.member(u));
        });
        this.client.login(token);
    }
    // eslint-disable-next-line class-methods-use-this
    Bot.prototype.loginHandler = function () {
        // eslint-disable-next-line no-console
        console.log('Hello, World!');
    };
    Bot.prototype.messageHandler = function (msg) {
        var _this = this;
        if (msg.content.substr(0, 1) === '>') {
            var id_1 = msg.content.substr(1);
            msg.channel.messages.fetch(id_1).then(function (m) {
                _this.trackedMessage[id_1] = (new RoleTimerMessage_1.default(m));
            });
        }
    };
    Bot.prototype.reactionHandler = function (rct, member) {
        if (member.user !== this.client.user) {
            if (this.trackedMessage[rct.message.id] !== null) {
                this.trackedMessage[rct.message.id].spawnTimer(rct, member);
            }
        }
    };
    Bot.prototype.reactionRemovalHandler = function (rct, member) {
        if (member.user !== this.client.user) {
            if (this.trackedMessage[rct.message.id] !== null) {
                this.trackedMessage[rct.message.id].removeRole(member);
            }
        }
        else {
            // we want to flush this from the collection if it is no longer attached
            // by the bot
            this.trackedMessage[rct.message.id] = null;
        }
    };
    return Bot;
}());
exports.default = Bot;
//# sourceMappingURL=Bot.js.map