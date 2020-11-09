import * as Discord from 'discord.js';
import { RoleTimerMessage, RoleTimerMessageConfig } from './RoleTimerMessage';
import AnonymousMessagePromptHandler from './AnonymousMessage/AnonymousMessagePromptHandler';
import { AnonymousMessageServerConfiguration } from './AnonymousMessage/AnonymousMessageServerConfiguration';

class Bot {
  readonly client: Discord.Client;

  private trackedMessage: Map<string, RoleTimerMessage>;

  private anonMsgPHandler: AnonymousMessagePromptHandler;

  constructor(token: string) {
    this.anonMsgPHandler = new AnonymousMessagePromptHandler();
    this.trackedMessage = new Map();
    this.client = new Discord.Client();
    this.client.on('ready', this.loginHandler);
    this.client.on('message', this.messageHandler);
    this.client.on('messageReactionAdd', this.reactionHandler);
    this.client.on('messageReactionRemove', this.reactionRemovalHandler);
    this.client.login(token);
  }

  // eslint-disable-next-line class-methods-use-this
  private loginHandler = () => {
    this.client.user.setActivity({
      name: 'USED FOR TESTING ATM',
    });
    // * creating a test case for the anonymous messages.
    this.anonMsgPHandler.serverConfigurations.set('518116162320728075', new AnonymousMessageServerConfiguration());
    this.anonMsgPHandler.serverConfigurations.get('518116162320728075').secretChannelID = '774536860374401025';
    this.anonMsgPHandler.serverConfigurations.get('518116162320728075').channelConfigurations = [
      {
        channelID: '772100662360014868',
        description: 'Example channel',
        emoji: '❗',
      },
    ];
    this.anonMsgPHandler.serverConfigurations.get('518116162320728075').roleConfigurations = [
      {
        roleID: '616833308592046121',
        channels: [
          {
            emoji: '♿',
            description: 'Channel for Ralsei',
            channelID: '774531326203527178',
          },
        ],
      },
    ];
  }

  private messageHandler = (msg: Discord.Message) => {
    if (msg.author.id !== this.client.user.id) {
      // TODO: Make command only available to people with correct permissions
      if (msg.content.substr(0, 1) === '>') {
        const config: RoleTimerMessageConfig = JSON.parse(msg.content.substr(1));
        this.trackedMessage.set(
          config.messageID,
          new RoleTimerMessage(config, msg),
        );
      } else if (msg.channel.type === 'dm') {
        this.anonMsgPHandler.generatePrompt(msg);
      }
    }
  }

  private reactionHandler = (
    rct: Discord.MessageReaction,
    user: Discord.User,
  ) => {
    if (this.trackedMessage.has(rct.message.id)) {
      if (user.id !== this.client.user.id) {
        rct.message.guild.members.fetch(user)
          .then((mmbr) => {
            this.trackedMessage
              .get(rct.message.id)
              .spawnTimer(rct, mmbr);
          });
      }
    } else if (this.anonMsgPHandler.promptMap.has(user.id)) {
      this.anonMsgPHandler.promptMap.get(user.id).reactionHandler(rct);
    }
  }

  private reactionRemovalHandler = (
    rct: Discord.MessageReaction,
    user: Discord.User,
  ) => {
    if (this.trackedMessage.has(rct.message.id)) {
      if (user !== this.client.user) {
        rct.message.guild.members.fetch(user)
          .then((member) => {
            this.trackedMessage.get(rct.message.id).removeRole(member);
          });
      } else {
        // we want to flush this from the collection if it is no longer attached
        // by the bot
        this.trackedMessage.delete(rct.message.id);
      }
    }
  }
}

export { Bot as default };
