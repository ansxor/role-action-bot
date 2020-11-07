import * as Discord from 'discord.js';
import AnonymousMessagePromptHandler from './AnonymousMessagePromptHandler';
import Bot from '../Bot';

enum AnonymousMessagePromptState {
  ChannelSelection,
  Confirmation
}

/**
 * A prompt that asks questions to the user about where they would like
 * to send their anonymous questions.
 *
 * This would be initiated usually by DMing the bot with the questions of
 * the message, then the bot would prompt the user about where to send their
 * message - considering their roles.
 *
 * If the bot is in multiple of the user's servers, then the bot should prompt
 * about which server to send the message to, although I will omit that functionality
 * for now since that is a whole other can of worms to consider.
 */
class AnonymousMessagePrompt {
  /** the amount of time to wait before timing out the user from making any more actions */
  private static readonly timeoutTime: number = 60 * 1000;

  /** the user being prompted */
  private member: Discord.GuildMember;

  /** the current prompt state to check how to handle reactions on the anonymous message */
  private currentState: AnonymousMessagePromptState;

  /** the prompt state to check against when considering whether to timeout or not */
  private oldState: AnonymousMessagePromptState;

  /** the manager that the prompt belongs to */
  private parentHandler: AnonymousMessagePromptHandler;

  /** contains the timeout event, used to refresh it whenever an event happens */
  private timeoutEvent: NodeJS.Timeout;

  /** contains the message that requested the prompt */
  private requestMsg: Discord.Message;

  constructor(msg: Discord.Message, handler: AnonymousMessagePromptHandler, bot: Bot) {
    if (msg.channel.type === 'dm') {
      this.requestMsg = msg;
      const user = msg.author;
      // try to get the member from a server automatically
      const servers = Array.from(handler.serverConfigurations.keys()).filter((k) => {
        const server = bot.client.guilds.cache.get(k);
        return server.members.fetch(msg.author.id) !== null;
      });
      // TODO: If the bot is in several servers of the user, there should
      // be a server prompt selection screen and it should always default to that
      // server if they ever attempt to send a message again.
      if (servers.length > 0) {
        const serverKey = servers[0];
        if (bot.client.guilds.cache.has(serverKey)) {
          const server = bot.client.guilds.cache.get(serverKey);
          server.members.fetch(user.id).then((member) => {
            this.member = member;
            this.parentHandler = handler;
            this.sendChannelSelectionMessage();
          });
        }
      }
    }
  }

  private sendChannelSelectionMessage(): void {
    this.currentState = AnonymousMessagePromptState.ChannelSelection;
    const server = this.parentHandler.serverConfigurations.get(this.member.guild.id);
    const channelList = server.generateChannelList(this.member);
    const messageEmbed = new Discord.MessageEmbed()
      .setTitle('Select channel to send to...')
      .setDescription(this.requestMsg.content.trim());
    channelList.forEach((c) => {
      messageEmbed.addField(c.emoji, c.description, true);
    });
    this.member.user.dmChannel.send(messageEmbed)
      .then((m) => {
        this.spawnTimeout();
        channelList.forEach((c) => { m.react(c.emoji); });
      });
  }

  reactionHandler(): void {
    this.member.user.dmChannel.send(this.currentState);
  }

  private spawnTimeout(): void {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const t = this;
    clearTimeout(this.timeoutEvent);
    this.timeoutEvent = setTimeout(() => {
      if (t.currentState === t.oldState) {
        t.requestMsg.channel.send('Sorry, your message has expired.')
          .then(() => {
            t.parentHandler.promptMap.delete(t.member.id);
          });
      } else {
        t.oldState = t.currentState;
        t.spawnTimeout();
      }
    }, AnonymousMessagePrompt.timeoutTime);
  }
}

export { AnonymousMessagePrompt as default };
