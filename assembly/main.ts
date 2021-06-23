import { context, PersistentMap, u128 } from 'near-sdk-as';
import { PostedMessage, messages } from './model';

// --- contract code goes below

// The maximum number of latest messages the contract returns.
const MESSAGE_LIMIT = 10;

const donationSum = new PersistentMap<string, u128>('donation')

/**
 * Adds a new message under the name of the sender's account id.\
 * NOTE: This is a change method. Which means it will modify the state.\
 * But right now we don't distinguish them with annotations yet.
 */
export function addMessage(text: string): void {
  // Creating a new message and populating fields with our data
  const message = new PostedMessage(text);
  // Adding the message to end of the the persistent collection
  messages.push(message);
  // Add donation to donationSum
  let existingDonations = new u128(0) 
  const sender = context.predecessor
  if (donationSum.contains(sender)) {
    existingDonations = donationSum.getSome(sender)
  }
  donationSum.set(sender, u128.add(existingDonations, context.attachedDeposit))
}

/**
 * Returns an array of last N messages.\
 * NOTE: This is a view method. Which means it should NOT modify the state.
 */
export function getMessages(): PostedMessage[] {
  const numMessages = min(MESSAGE_LIMIT, messages.length);
  const startIndex = messages.length - numMessages;
  const result = new Array<PostedMessage>(numMessages);
  for(let i = 0; i < numMessages; i++) {
    result[i] = messages[i + startIndex];
  }
  return result;
}

export function getDonation(accountId: string): u128 {
  let result = new u128(0)
  if (donationSum.contains(accountId)) {
    result = donationSum.getSome(accountId)
  }
  return result
}
