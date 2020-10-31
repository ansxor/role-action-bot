import * as Discord from 'discord.js';
import RoleTimerMessageAction from './RoleTimerMessageAction';

class RoleTimerMessage {
  msg: Discord.Message;

  emoji: string;

  actions: RoleTimerMessageAction[];

  constructor(msg: Discord.Message) {
    this.msg = msg;
    this.actions = [];
    this.msg.guild.roles.fetch('616833308592046121')
      .then((r: Discord.Role) => {
        this.actions.push({
          role: r,
          offset: 1000,
        });
      });
    this.msg.guild.roles.fetch('771827876235313183')
      .then((r: Discord.Role) => {
        this.actions.push({
          role: r,
          offset: 1000,
        });
      });
    this.msg.guild.roles.fetch('771880832309788693')
      .then((r: Discord.Role) => {
        this.actions.push({
          role: r,
          offset: 1000,
        });
      });
    this.emoji = '😄';
    msg.react(this.emoji);
  }

  spawnTimer(rct: Discord.MessageReaction, user: Discord.GuildMember) {
    let timeOffset: number = 0;
    let cancelAction = false;

    this.actions
      .forEach((action: RoleTimerMessageAction) => {
        setTimeout(() => {
          // eslint-disable-next-line max-len
          const skipAction = cancelAction || (this.msg.reactions.cache.filter((reaction) => reaction.users.cache.has(user.id)).get(this.emoji) === undefined);
          cancelAction = skipAction;

          if (!skipAction) {
            user.roles.add(action.role)
              .then(() => {})
              .catch(() => {
                this.msg.channel.send('This bot can\'t set roles for some reason???\n'
                + '(pstt, dev check the console)');
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
            this.msg.channel.send('This bot can\'t set roles for some reason???\n'
            + '(pstt, dev check the console)');
          });
      });
  }
}

export { RoleTimerMessage as default };
