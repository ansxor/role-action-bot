import * as Discord from 'discord.js';
import AnonymousMessagePromptHandler from './AnonymousMessagePromptHandler';

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

  /** the user being being prompted */
  private user: Discord.GuildMember;

  /** the current prompt state to check how to handle reactions on the anonymous message */
  private currentState: AnonymousMessagePromptState;

  /** the prompt state to check against when considering whether to timeout or not */
  private oldState: AnonymousMessagePromptState;

  /** the manager that the prompt belongs to */
  private parentHandler: AnonymousMessagePromptHandler;

  constructor(handler: AnonymousMessagePromptHandler) {
    this.parentHandler = handler;
    this.parentHandler.promptMap.set(this.user.id, this);
    this.sendChannelSelectionMessage();
    setTimeout(this.timeoutHandler, AnonymousMessagePrompt.timeoutTime);
    console.log('Hello, World!');
  }

  sendChannelSelectionMessage() {
    this.currentState = AnonymousMessagePromptState.ChannelSelection;
  }

  reactionHandler() {
    console.log(this.currentState);
  }

  timeoutHandler() {
    if (this.currentState === this.oldState) {
      this.parentHandler.promptMap.delete(this.user.id);
    } else {
      this.oldState = this.currentState;
      setTimeout(this.timeoutHandler, AnonymousMessagePrompt.timeoutTime);
    }
  }
}

export { AnonymousMessagePrompt as default };
