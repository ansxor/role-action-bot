import * as Discord from 'discord.js';

class RoleTimerMessage {
  msg: Discord.Message;

  emoji: string;

  role: Discord.Role[];

  constructor(msg: Discord.Message) {
    this.msg = msg;
    this.msg.guild.roles.fetch('616833308592046121')
      .then((r: Discord.Role) => {
        this.role.push(r);
      });
    this.msg.guild.roles.fetch('771827876235313183')
      .then((r: Discord.Role) => {
        this.role.push(r);
      });
    msg.react('😄');
  }

  spawnTimer(rct: Discord.MessageReaction, user: Discord.GuildMember) {
    user.roles.add(this.role[0])
      .then(() => {
        this.msg.channel.send('THE TIMER HAS BEGUN!!!');
        setTimeout(() => {
          this.msg.channel.send('TEST SUCCESS');
          // check if the user isn't reacted to the message anymore
          // FIXME: This doesn't correctly check if the reaction does exist.
          const ind = this.msg.reactions.cache.array().indexOf(rct);
          console.log(ind);
          if (ind === -1) {
            this.msg.channel.send('WOW TIME OwO');
          } else {
            user.roles.add(this.role[1]);
          }
        }, 1000);
      })
      .catch((e) => {
        this.msg.channel.send('This bot can\'t set roles for some reason???\n'
                              + '(pstt, dev check the console)');
        console.log(e);
      });
  }

  removeRole(user: Discord.GuildMember) {
    this.role.forEach((r: Discord.Role) => {
      user.roles.remove(r)
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
