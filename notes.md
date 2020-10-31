# Generating Messages
So basically, the user would have to send a message with the following input:

```
>genroletimer id :emoji: Role
```

Then it would append an emoji to the message specified by the ID and add that message to a list in the bot to be checked by whenever a reaction has been triggered and matches that emoji.

## Generated Message Class
| RoleTimerMessage                      |
| ------------------------------------- |
| -id: string                           |
| -emoji: string                        |
| -role: Discord.Role                   |
| +spawnTimer(user: Discord.User): void |

# Moved to room remove role feature
If moved to a room by another user, you should have this role removed as it will mean that someone will evaluate you.
