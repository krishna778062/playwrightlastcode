import { CommonChatActionsHelper } from './chatActionsHelper';
import { DirectMessageActionsHelper } from './directMessageActionsHelper';

/**
 * A facade that provides a single entry point to all chat-related helper functions.
 */
export class ChatHelper {
  /**
   * Access to common chat actions (e.g., sending messages, verifying visibility).
   */
  public static common = CommonChatActionsHelper;

  /**
   * Access to actions specific to direct messages (e.g., opening a new DM).
   */
  public static directMessages = DirectMessageActionsHelper;
}
