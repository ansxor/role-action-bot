import * as Discord from 'discord.js';
import RoleTimerMessageAction from './RoleTimerMessageAction';
import RoleTimerMessageConfig from './RoleTimerMessageConfig';
import RoleTimerMessageActionConfig from './RoleTimerMessageActionConfig';

class RoleTimerMessage {
  msg: Discord.Message;

  emoji: string;

  actions: RoleTimerMessageAction[];

  constructor(conf: RoleTimerMessageConfig, msg: Discord.Message) {
    msg.channel.messages.fetch(conf.messageID)
      .then((m: Discord.Message) => {
        this.msg = m;
        this.actions = [];
        conf.actions.forEach((ac: RoleTimerMessageActionConfig) => {
          this.msg.guild.roles.fetch(ac.roleID)
            .then((r: Discord.Role) => {
              this.actions.push({
                role: r,
                offset: ac.offset,
              });
            });
        });
        this.emoji = conf.emoji;
        this.msg.react(this.emoji);
        msg.delete();
      });
  }

  spawnTimer(rct: Discord.MessageReaction, user: Discord.GuildMember) {
    let timeOffset: number = 0;
    let cancelAction = false;

    this.actions
      .forEach((action: RoleTimerMessageAction) => {
        setTimeout(() => {
          const skipAction = cancelAction || (this.msg.reactions.cache
            .filter((reaction) => reaction.users.cache.has(user.id))
            .get(this.emoji) === undefined);
          cancelAction = skipAction;

          if (!skipAction) {
            user.roles.add(action.role)
              .then(() => {})
              .catch(() => {
                this.msg.channel.send('This bot can\'t set roles for some reason???\n');
              });
          }
        }, timeOffset);
        timeOffset += action.offset;
      });
  }

  removeRole(user: Discord.GuildMember) {
    this.actions
      .forEach((action: RoleTimerMessageAction) => {
        user.roles.remove(action.role)
          .then(() => {})
          .catch(() => {
            this.msg.channel.send('This bot can\'t set roles for some reason???\n');
          });
      });
  }

  removeReaction(user: Discord.GuildMember) {
    this.msg.reactions.cache
      .filter((reaction) => reaction.users.cache.has(user.id))
      .get(this.emoji)
      .remove();
  }
}

export { RoleTimerMessage as default };
