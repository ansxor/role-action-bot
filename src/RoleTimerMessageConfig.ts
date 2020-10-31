import RoleTimerMessageActionConfig from './RoleTimerMessageActionConfig';

interface RoleTimerMessageConfig {
   messageID: string,
   emoji: string,
   actions: RoleTimerMessageActionConfig[]
}

export { RoleTimerMessageConfig as default };
