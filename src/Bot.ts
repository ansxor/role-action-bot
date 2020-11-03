import * as Discord from 'discord.js';
import RoleTimerMessage from './RoleTimerMessage';
import RoleTimerMessageConfig from './RoleTimerMessageConfig';

class Bot {
  readonly client: Discord.Client;

  trackedMessage: Map<string, RoleTimerMessage>;

  constructor(token: string) {
    // this is because discord.js is written in JavaScript so =this= is overwritten,
    // so this allows us to access the TypeScript object inside of the handlers
    const b = this;

    this.trackedMessage = new Map();
    this.client = new Discord.Client();
    this.client.on('ready', () => {
      b.loginHandler();
    });
    this.client.on('message', (msg: Discord.Message) => {
      b.messageHandler(msg);
    });
    this.client.on(
      'messageReactionAdd',
      (r: Discord.MessageReaction, u: Discord.User) => {
        b.reactionHandler(r, r.message.guild.member(u));
      },
    );
    this.client.on(
      'messageReactionRemove',
      (r: Discord.MessageReaction, u: Discord.User) => {
        b.reactionRemovalHandler(r, r.message.guild.member(u));
      },
    );
    // this.client.on(
    //   "voiceStateUpdate",
    //   (o: Discord.VoiceState, n: Discord.VoiceState) => {
    //     if (o.channel !== n.channel) {
    //       b.voiceUserMovedHandler(n.member);
    //     }
    //   }
    // );
    this.client.login(token);
  }

  // eslint-disable-next-line class-methods-use-this
  private loginHandler() {
    // eslint-disable-next-line no-console
    console.log('Hello, World!');
    const testConfig: RoleTimerMessageConfig = {
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
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(testConfig));
  }

  private messageHandler(msg: Discord.Message) {
    if (msg.content.substr(0, 1) === '>') {
      const config: RoleTimerMessageConfig = JSON.parse(msg.content.substr(1));
      this.trackedMessage.set(
        config.messageID,
        new RoleTimerMessage(config, msg),
      );
    }
  }

  private reactionHandler(
    rct: Discord.MessageReaction,
    member: Discord.GuildMember,
  ) {
    if (member.user !== this.client.user) {
      if (this.trackedMessage.get(rct.message.id) !== null) {
        this.trackedMessage.get(rct.message.id).spawnTimer(rct, member);
      }
    }
  }

  private reactionRemovalHandler(
    rct: Discord.MessageReaction,
    member: Discord.GuildMember,
  ) {
    if (member.user !== this.client.user) {
      if (this.trackedMessage.get(rct.message.id) !== null) {
        this.trackedMessage.get(rct.message.id).removeRole(member);
      }
    } else {
      // we want to flush this from the collection if it is no longer attached
      // by the bot
      this.trackedMessage.delete(rct.message.id);
    }
  }

  // private voiceUserMovedHandler(member: Discord.GuildMember) {
  //   // FIXME: This also makes the reaction added by the bot get removed
  //   // for some reason.
  //   // this.trackedMessage.forEach((m: RoleTimerMessage) => {
  //   //   m.actions.forEach((a: RoleTimerMessageAction) => {
  //   //     member.roles.remove(a.role);
  //   //   });
  //   //   m.removeReaction(member);
  //   // });
  // }
}

export { Bot as default };
