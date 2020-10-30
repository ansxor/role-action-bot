import * as Discord from 'discord.js';
import RoleTimerMessage from './RoleTimerMessage';

class Bot {
  readonly client: Discord.Client;

  trackedMessage: RoleTimerMessage[];

  constructor(token: string) {
    // this is because discord.js is written in JavaScript so =this= is overwritten,
    // so this allows us to access the TypeScript object inside of the handlers
    const b = this;

    this.trackedMessage = [];
    this.client = new Discord.Client();
    this.client.on('ready', () => {
      b.loginHandler();
    });
    this.client.on('message', (msg: Discord.Message) => {
      b.messageHandler(msg);
    });
    this.client.on('messageReactionAdd', (r: Discord.MessageReaction, u: Discord.User) => {
      b.reactionHandler(r, r.message.guild.member(u));
    });
    this.client.on('messageReactionRemove', (r: Discord.MessageReaction, u: Discord.User) => {
      b.reactionRemovalHandler(r, r.message.guild.member(u));
    });
    this.client.login(token);
  }

  // eslint-disable-next-line class-methods-use-this
  private loginHandler() {
    // eslint-disable-next-line no-console
    console.log('Hello, World!');
  }

  private messageHandler(msg: Discord.Message) {
    if (msg.content.substr(0, 1) === '>') {
      const id: string = msg.content.substr(1);
      msg.channel.messages.fetch(id).then((m) => {
        this.trackedMessage[id] = (new RoleTimerMessage(m));
      });
    }
  }

  private reactionHandler(rct: Discord.MessageReaction, member: Discord.GuildMember) {
    if (member.user !== this.client.user) {
      if (this.trackedMessage[rct.message.id] !== null) {
        this.trackedMessage[rct.message.id].spawnTimer(rct, member);
      }
    }
  }

  private reactionRemovalHandler(rct: Discord.MessageReaction, member: Discord.GuildMember) {
    if (member.user !== this.client.user) {
      if (this.trackedMessage[rct.message.id] !== null) {
        this.trackedMessage[rct.message.id].removeRole(member);
      }
    } else {
      // we want to flush this from the collection if it is no longer attached
      // by the bot
      this.trackedMessage[rct.message.id] = null;
    }
  }
}

export { Bot as default };
