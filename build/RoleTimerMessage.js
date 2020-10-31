"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = void 0;
class RoleTimerMessage {
    constructor(conf, msg) {
        msg.channel.messages.fetch(conf.messageID)
            .then((m) => {
            this.msg = m;
            this.actions = [];
            conf.actions.forEach((ac) => {
                this.msg.guild.roles.fetch(ac.roleID)
                    .then((r) => {
                    this.actions.push({
                        role: r,
                        offset: ac.offset,
                    });
                });
            });
            this.emoji = conf.emoji;
            this.msg.react(this.emoji);
        });
    }
    spawnTimer(rct, user) {
        let timeOffset = 0;
        let cancelAction = false;
        this.actions
            .forEach((action) => {
            setTimeout(() => {
                // eslint-disable-next-line max-len
                const skipAction = cancelAction || (this.msg.reactions.cache.filter((reaction) => reaction.users.cache.has(user.id)).get(this.emoji) === undefined);
                cancelAction = skipAction;
                if (!skipAction) {
                    user.roles.add(action.role)
                        .then(() => { })
                        .catch(() => {
                        this.msg.channel.send('This bot can\'t set roles for some reason???\n'
                            + '(pstt, dev check the console)');
                    });
                }
            }, timeOffset);
            timeOffset += action.offset;
        });
    }
    removeRole(user) {
        this.actions
            .forEach((action) => {
            user.roles.remove(action.role)
                .then(() => { })
                .catch(() => {
                this.msg.channel.send('This bot can\'t set roles for some reason???\n'
                    + '(pstt, dev check the console)');
            });
        });
    }
    removeReaction(user) {
        // eslint-disable-next-line max-len
        this.msg.reactions.cache.filter((reaction) => reaction.users.cache.has(user.id))
            .get(this.emoji)
            .remove();
    }
}
exports.default = RoleTimerMessage;
//# sourceMappingURL=RoleTimerMessage.js.map