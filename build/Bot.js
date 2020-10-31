"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = void 0;
const Discord = require("discord.js");
const RoleTimerMessage_1 = require("./RoleTimerMessage");
class Bot {
    constructor(token) {
        // this is because discord.js is written in JavaScript so =this= is overwritten,
        // so this allows us to access the TypeScript object inside of the handlers
        const b = this;
        this.trackedMessage = new Map();
        this.client = new Discord.Client();
        this.client.on('ready', () => {
            b.loginHandler();
        });
        this.client.on('message', (msg) => {
            b.messageHandler(msg);
        });
        this.client.on('messageReactionAdd', (r, u) => {
            b.reactionHandler(r, r.message.guild.member(u));
        });
        this.client.on('messageReactionRemove', (r, u) => {
            b.reactionRemovalHandler(r, r.message.guild.member(u));
        });
        this.client.on('voiceStateUpdate', (o, n) => {
            if (o.channel !== n.channel) {
                b.voiceUserMovedHandler(n.member);
            }
        });
        this.client.login(token);
    }
    // eslint-disable-next-line class-methods-use-this
    loginHandler() {
        // eslint-disable-next-line no-console
        console.log('Hello, World!');
        const testConfig = {
            emoji: '❓',
            messageID: '',
            actions: [
                {
                    roleID: '616833308592046121',
                    offset: 1000,
                },
                {
                    roleID: '771827876235313183',
                    offset: 1000,
                },
                {
                    roleID: '771880832309788693',
                    offset: 1000,
                },
            ],
        };
        console.log(JSON.stringify(testConfig));
    }
    messageHandler(msg) {
        if (msg.content.substr(0, 1) === '>') {
            const config = JSON.parse(msg.content.substr(1));
            console.log(config);
            this.trackedMessage.set(config.messageID, new RoleTimerMessage_1.default(config, msg));
        }
    }
    reactionHandler(rct, member) {
        if (member.user !== this.client.user) {
            if (this.trackedMessage.get(rct.message.id) !== null) {
                console.log(this.trackedMessage.get(rct.message.id));
                this.trackedMessage.get(rct.message.id).spawnTimer(rct, member);
            }
        }
    }
    reactionRemovalHandler(rct, member) {
        if (member.user !== this.client.user) {
            if (this.trackedMessage.get(rct.message.id) !== null) {
                this.trackedMessage.get(rct.message.id).removeRole(member);
            }
        }
        else {
            // we want to flush this from the collection if it is no longer attached
            // by the bot
            this.trackedMessage.delete(rct.message.id);
        }
    }
    voiceUserMovedHandler(member) {
        this.trackedMessage.forEach((m) => {
            m.actions.forEach((a) => {
                member.roles.remove(a.role);
            });
            m.removeReaction(member);
        });
    }
}
exports.default = Bot;
//# sourceMappingURL=Bot.js.map