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
    msg.react('😄');
  }

  spawnTimer(rct: Discord.MessageReaction, user: Discord.GuildMember) {
    let timeOffset: number = 0;
    this.actions
      .forEach((action: RoleTimerMessageAction) => {
        setTimeout(() => {
          user.roles.add(action.role)
            .then(() => {})
            .catch((e) => {
              this.msg.channel.send('This bot can\'t set roles for some reason???\n'
              + '(pstt, dev check the console)');
              console.log(e);
            });
        }, timeOffset);
        timeOffset += action.offset;
      });
  }

  removeRole(user: Discord.GuildMember) {
    this.actions
      .forEach((action: RoleTimerMessageAction) => {
        user.roles.remove(action.role)
          .then(() => {})
          .catch((e) => {
            this.msg.channel.send('This bot can\'t set roles for some reason???\n'
            + '(pstt, dev check the console)');
            console.log(e);
          });
      });
  }
}

export { RoleTimerMessage as default };
