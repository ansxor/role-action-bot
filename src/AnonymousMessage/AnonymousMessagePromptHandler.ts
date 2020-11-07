import * as Discord from 'discord.js';
import AnonymousMessagePrompt from './AnonymousMessagePrompt';
import { AnonymousMessageServerConfiguration } from './AnonymousMessageServerConfiguration';

class AnonymousMessagePromptHandler {
  /** contains all of the current prompts, identified by the IDs
   * of the messages that requested the prompt */
  promptMap: Map<string, AnonymousMessagePrompt>;

  /** contains all of the server configurations */
  serverConfigurations: Map<string, AnonymousMessageServerConfiguration>;

  constructor() {
    this.promptMap = new Map();
    this.serverConfigurations = new Map();
  }

  generatePrompt(msg: Discord.Message): void {
    if (this.promptMap.has(msg.author.id)) {
      this.promptMap.get(msg.author.id).despawnTimeout();
    }
    this.promptMap.set(msg.author.id, new AnonymousMessagePrompt(msg, this));
  }
}

export { AnonymousMessagePromptHandler as default };
