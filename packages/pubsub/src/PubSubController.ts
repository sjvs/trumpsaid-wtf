// tslint:disable-next-line:variable-name
import PubSub, { Subscription, Topic } from "@google-cloud/pubsub";
import { logger } from "@trumpsaid/common";
import PubSubHandler from "./PubSubHandler";
import PubSubResponseHandler from "./PubSubResponseHandler";
import {
  IPubSubConsumerFailedResponse,
  IPubSubConsumerSuccessMessage,
  ITopicSubscriptionNames
} from "./PubSubTypes";

export default abstract class PubSubController {
  public pubsub: PubSub.PubSub;
  public consumerTopic: Topic;
  public consumerSubscription: Subscription;
  public responderTopic: Topic;
  public responderSubscription: Subscription;
  public topicSubcriptionNames: ITopicSubscriptionNames;
  public consumerHandler?: PubSubHandler;
  public responseHandler?: PubSubResponseHandler;
  protected constructor() {
    this.pubsub = PubSub({
      projectId: process.env.GOOGLE_PROJECT_ID
    });
  }

  public publishConsumerMessage = (obj: any) => {
    logger.silly(
      `Publishing to ${
        this.topicSubcriptionNames.consumerTopicName
      }: ${JSON.stringify(obj, null, 2)}`
    );
    this.consumerTopic
      .publisher()
      .publish(this.getBuffer(obj))
      .catch(err => {
        logger.silly(
          `Error publishing to ${
            this.topicSubcriptionNames.consumerTopicName
          } consumer topic \n ${JSON.stringify(err)}`
        );
      });
  };

  public publishResponseMessage = (obj: IPubSubConsumerSuccessMessage) => {
    logger.silly(
      `Published to ${
        this.topicSubcriptionNames.responderTopicName
      }: ${JSON.stringify(obj, null, 2)}`
    );
    this.responderTopic
      .publisher()
      .publish(this.getBuffer(obj))
      .catch(err => {
        logger.error(
          `Error publishing to topic ${
            this.topicSubcriptionNames.responderTopicName
          }]\n ${JSON.stringify(err)}`
        );
      });
  };

  public publishFailureMessage = (obj: IPubSubConsumerFailedResponse) => {
    logger.verbose(
      `Published failure to ${
        this.topicSubcriptionNames.responderTopicName
      }: ${JSON.stringify(obj, null, 2)}`
    );
    this.responderTopic
      .publisher()
      .publish(this.getBuffer(obj))
      .catch(err => {
        logger.error(
          `Error publishing failure to topic ${
            this.topicSubcriptionNames.responderTopicName
          }]\n ${JSON.stringify(err)}`
        );
      });
  };

  public getBuffer = (obj: any) => {
    return Buffer.from(JSON.stringify(obj));
  };

  public parseMessageData(message: any) {
    return JSON.parse(Buffer.from(message.data).toString());
  }

  protected setup() {
    this.consumerTopic = this.pubsub.topic(
      this.topicSubcriptionNames.consumerTopicName
    );
    this.consumerSubscription = this.pubsub.subscription(
      this.topicSubcriptionNames.consumerSubscriptionName
    );
    this.responderTopic = this.pubsub.topic(
      this.topicSubcriptionNames.responderTopicName
    );
    this.responderSubscription = this.pubsub.subscription(
      this.topicSubcriptionNames.responderSubscriptionName
    );
  }
  protected addConsumerListener() {
    if (process.env.SERVER_TYPE !== "WEB") {
      const topic = this.topicSubcriptionNames.consumerTopicName;
      this.consumerSubscription.on(
        "message",
        this.consumerHandler.requestHandler.bind(this.consumerHandler)
      );
      logger.debug(
        `PubSub worker listening to ${topic}/${
          this.topicSubcriptionNames.consumerSubscriptionName
        }`
      );
    }
  }
  protected addResponseListener() {
    if (process.env.SERVER_TYPE !== "WORKER") {
      const topic = this.topicSubcriptionNames.responderTopicName;
      this.responderSubscription.on(
        "message",
        this.responseHandler.responseHandler.bind(this.responseHandler)
      );
      logger.debug(
        `PubSub responder listening to ${topic}/${
          this.topicSubcriptionNames.consumerSubscriptionName
        }`
      );
    }
  }
}
