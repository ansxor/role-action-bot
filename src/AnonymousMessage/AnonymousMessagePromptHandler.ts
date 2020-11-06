import AnonymousMessagePrompt from './AnonymousMessagePrompt';

class AnonymousMessagePromptHandler {
  /** contains all of the current prompts, identified by the IDs
   * of the messages that requested the prompt */
  promptMap: Map<string, AnonymousMessagePrompt>;
}

export { AnonymousMessagePromptHandler as default };
