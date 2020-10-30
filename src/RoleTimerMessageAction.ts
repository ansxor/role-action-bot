import * as Discord from 'discord.js';

interface RoleTimerMessageAction {
   role: Discord.Role,
   offset: number
}

export { RoleTimerMessageAction as default };
